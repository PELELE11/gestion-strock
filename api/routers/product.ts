import { z } from "zod";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products } from "@db/schema";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        categoryId: z.number().optional(),
        status: z.string().optional(),
        sort: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { search, categoryId, status, sort, page, limit } = input;
      const offset = ((page ?? 1) - 1) * (limit ?? 20);

      const conditions = [];
      if (search) {
        conditions.push(like(products.name, `%${search}%`));
      }
      if (categoryId) {
        conditions.push(eq(products.categoryId, categoryId));
      }
      if (status) {
        conditions.push(eq(products.status, status as "in_stock" | "low_stock" | "out_of_stock"));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(sort === "name" ? products.name : desc(products.createdAt))
        .limit(limit ?? 20)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
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

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        sku: z.string().min(1),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        quantity: z.number().int().min(0).default(0),
        threshold: z.number().int().min(0).default(10),
        unitPrice: z.string().or(z.number()),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const unitPrice =
        typeof input.unitPrice === "string"
          ? input.unitPrice
          : input.unitPrice.toFixed(2);

      const quantity = input.quantity ?? 0;
      const threshold = input.threshold ?? 10;
      let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
      if (quantity === 0) status = "out_of_stock";
      else if (quantity <= threshold) status = "low_stock";

      const result = await db.insert(products).values({
        name: input.name,
        sku: input.sku,
        description: input.description,
        categoryId: input.categoryId,
        quantity,
        threshold,
        unitPrice,
        status,
        location: input.location,
      });

      return { id: Number(result[0].insertId), ...input, status };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        sku: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        quantity: z.number().int().min(0).optional(),
        threshold: z.number().int().min(0).optional(),
        unitPrice: z.string().or(z.number()).optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      const existing = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!existing[0]) throw new Error("Product not found");

      const current = existing[0];
      const newQuantity = updates.quantity ?? current.quantity;
      const newThreshold = updates.threshold ?? current.threshold;

      let status: "in_stock" | "low_stock" | "out_of_stock" = current.status;
      if (newQuantity === 0) status = "out_of_stock";
      else if (newQuantity <= newThreshold) status = "low_stock";
      else status = "in_stock";

      const unitPrice =
        updates.unitPrice !== undefined
          ? typeof updates.unitPrice === "string"
            ? updates.unitPrice
            : updates.unitPrice.toFixed(2)
          : current.unitPrice;

      await db
        .update(products)
        .set({
          ...updates,
          unitPrice,
          status,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));

      return { id, ...updates, status };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  updateStock: publicQuery
    .input(z.object({ id: z.number(), quantity: z.number().int().min(0) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      if (!existing[0]) throw new Error("Product not found");

      const product = existing[0];
      const newQuantity = input.quantity;
      let status: "in_stock" | "low_stock" | "out_of_stock" = product.status;
      if (newQuantity === 0) status = "out_of_stock";
      else if (newQuantity <= product.threshold) status = "low_stock";
      else status = "in_stock";

      await db
        .update(products)
        .set({
          quantity: newQuantity,
          status,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.id));

      return { id: input.id, quantity: newQuantity, status };
    }),
});
