import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, products } from "@db/schema";

export const orderRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        type: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { status, type, page, limit } = input;
      const offset = ((page ?? 1) - 1) * (limit ?? 20);

      const conditions = [];
      if (status) {
        conditions.push(eq(orders.status, status as "pending" | "approved" | "denied" | "completed"));
      }
      if (type) {
        conditions.push(eq(orders.type, type as "incoming" | "outgoing"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit ?? 20)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause);

      const total = countResult[0]?.count ?? 0;

      return {
        items,
        total,
        page: page ?? 1,
        limit: limit ?? 20,
        totalPages: Math.ceil(total / (limit ?? 20)),
      };
    }),

  create: publicQuery
    .input(
      z.object({
        type: z.enum(["incoming", "outgoing"]),
        productId: z.number(),
        quantity: z.number().int().min(1),
        supplier: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product[0]) throw new Error("Product not found");

      const unitPrice = Number(product[0].unitPrice);
      const totalPrice = (unitPrice * input.quantity).toFixed(2);
      const orderNumber = `ORD-${Date.now()}`;

      const result = await db.insert(orders).values({
        orderNumber,
        type: input.type,
        status: "pending",
        productId: input.productId,
        quantity: input.quantity,
        totalPrice,
        supplier: input.supplier,
        notes: input.notes,
      });

      return { id: Number(result[0].insertId), orderNumber, ...input, totalPrice };
    }),

  approve: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order[0]) throw new Error("Order not found");

      if (order[0].type === "incoming") {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, order[0].productId))
          .limit(1);

        if (product[0]) {
          const newQuantity = product[0].quantity + order[0].quantity;
          let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
          if (newQuantity === 0) status = "out_of_stock";
          else if (newQuantity <= product[0].threshold) status = "low_stock";

          await db
            .update(products)
            .set({ quantity: newQuantity, status, updatedAt: new Date() })
            .where(eq(products.id, order[0].productId));
        }
      } else {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, order[0].productId))
          .limit(1);

        if (product[0]) {
          const newQuantity = Math.max(0, product[0].quantity - order[0].quantity);
          let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
          if (newQuantity === 0) status = "out_of_stock";
          else if (newQuantity <= product[0].threshold) status = "low_stock";

          await db
            .update(products)
            .set({ quantity: newQuantity, status, updatedAt: new Date() })
            .where(eq(products.id, order[0].productId));
        }
      }

      await db
        .update(orders)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(orders.id, input.id));

      return { id: input.id, status: "approved" };
    }),

  deny: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ status: "denied", updatedAt: new Date() })
        .where(eq(orders.id, input.id));
      return { id: input.id, status: "denied" };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(orders).where(eq(orders.id, input.id));
      return { success: true };
    }),
});
