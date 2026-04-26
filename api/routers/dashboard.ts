import { sql, eq, desc, gte } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products, orders, activities } from "@db/schema";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const db = getDb();

    const totalItemsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    const totalValueResult = await db
      .select({ value: sql<string>`sum(quantity * unitPrice)` })
      .from(products);

    const lowStockResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.status, "low_stock"));

    const outOfStockResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.status, "out_of_stock"));

    const pendingOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const recentOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, sql`DATE_SUB(NOW(), INTERVAL 7 DAY)`));

    return {
      totalItems: totalItemsResult[0]?.count ?? 0,
      totalValue: Number(totalValueResult[0]?.value ?? 0),
      lowStockCount: lowStockResult[0]?.count ?? 0,
      outOfStockCount: outOfStockResult[0]?.count ?? 0,
      pendingOrders: pendingOrdersResult[0]?.count ?? 0,
      recentOrders: recentOrdersResult[0]?.count ?? 0,
    };
  }),

  lowStock: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(products)
      .where(eq(products.status, "low_stock"))
      .orderBy(products.quantity)
      .limit(10);
  }),

  recentActivity: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(20);
  }),
});
