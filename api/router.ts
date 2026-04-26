import { authRouter } from "./auth-router";
import { productRouter } from "./routers/product";
import { categoryRouter } from "./routers/category";
import { orderRouter } from "./routers/order";
import { dashboardRouter } from "./routers/dashboard";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  category: categoryRouter,
  order: orderRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
