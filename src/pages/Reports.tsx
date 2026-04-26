import { trpc } from "@/providers/trpc";
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function Reports() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: productsData } = trpc.product.list.useQuery({ limit: 100 });
  const { data: categories } = trpc.category.list.useQuery();
  const { data: ordersData } = trpc.order.list.useQuery({ limit: 100 });

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    if (!productsData?.items || !categories) return [];
    const map = new Map<number, { name: string; color: string; count: number; value: number }>();
    categories.forEach((c) => map.set(c.id, { name: c.name, color: c.color ?? "#2563eb", count: 0, value: 0 }));
    productsData.items.forEach((p) => {
      const cat = map.get(p.categoryId ?? 0);
      if (cat) {
        cat.count++;
        cat.value += Number(p.unitPrice) * p.quantity;
      }
    });
    return Array.from(map.values()).filter((c) => c.count > 0).sort((a, b) => b.value - a.value);
  }, [productsData, categories]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    if (!productsData?.items) return { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    const counts = { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    productsData.items.forEach((p) => {
      counts[p.status]++;
    });
    return counts;
  }, [productsData]);

  // Order type breakdown
  const orderBreakdown = useMemo(() => {
    if (!ordersData?.items) return { incoming: 0, outgoing: 0 };
    const counts = { incoming: 0, outgoing: 0 };
    ordersData.items.forEach((o) => {
      counts[o.type]++;
    });
    return counts;
  }, [ordersData]);

  // Top value products
  const topProducts = useMemo(() => {
    if (!productsData?.items) return [];
    return [...productsData.items]
      .map((p) => ({ ...p, totalValue: Number(p.unitPrice) * p.quantity }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  }, [productsData]);

  const totalProducts = productsData?.items.length ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-[#888888] mt-1">Analytics and inventory insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="kpi-card">
          <span className="kpi-label">Total Products</span>
          <span className="kpi-value">{stats?.totalItems ?? 0}</span>
          <div className="flex items-center gap-1 text-xs text-[#00C853]">
            <ArrowUpRight className="w-3 h-3" />
            <span>Active inventory</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Inventory Value</span>
          <span className="kpi-value">
            ${stats?.totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? 0}
          </span>
          <div className="flex items-center gap-1 text-xs text-[#888888]">
            <DollarSign className="w-3 h-3" />
            <span>Total valuation</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Stock Alerts</span>
          <span className="kpi-value" style={{ color: "#FF5252" }}>
            {(stats?.lowStockCount ?? 0) + (stats?.outOfStockCount ?? 0)}
          </span>
          <div className="flex items-center gap-1 text-xs text-[#FF5252]">
            <AlertTriangle className="w-3 h-3" />
            <span>Require attention</span>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending Orders</span>
          <span className="kpi-value">{stats?.pendingOrders ?? 0}</span>
          <div className="flex items-center gap-1 text-xs text-[#d97706]">
            <TrendingUp className="w-3 h-3" />
            <span>Awaiting approval</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
        >
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Category Distribution</h2>
          </div>
          <div className="p-5 space-y-4">
            {categoryBreakdown.map((cat) => {
              const pct = totalProducts > 0 ? (cat.count / totalProducts) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-white">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#888888]">{cat.count} items</span>
                      <span className="text-white font-medium w-20 text-right">
                        ${cat.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel"
        >
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Stock Status</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "In Stock", count: statusBreakdown.in_stock, color: "#00C853", icon: Package },
              { label: "Low Stock", count: statusBreakdown.low_stock, color: "#FF5252", icon: AlertTriangle },
              { label: "Out of Stock", count: statusBreakdown.out_of_stock, color: "#888888", icon: XCircle },
            ].map((item) => {
              const pct = totalProducts > 0 ? (item.count / totalProducts) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#888888]">{item.count} items</span>
                      <span className="text-white font-medium">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Type */}
          <div className="px-5 py-4 border-t border-white/[0.06]">
            <h3 className="text-xs font-medium text-[#888888] uppercase tracking-wider mb-3">Order Types</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00C853]/10">
                <TrendingUp className="w-4 h-4 text-[#00C853]" />
                <span className="text-sm text-white font-medium">{orderBreakdown.incoming} Incoming</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#d97706]/10">
                <TrendingDown className="w-4 h-4 text-[#d97706]" />
                <span className="text-sm text-white font-medium">{orderBreakdown.outgoing} Outgoing</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Products by Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel"
      >
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Top Products by Inventory Value</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id}>
                  <td className="text-[#888888] w-10">{index + 1}</td>
                  <td className="font-medium text-white">{product.name}</td>
                  <td className="text-[#888888] font-mono text-xs">{product.sku}</td>
                  <td className="text-white">{product.quantity}</td>
                  <td className="text-white">${Number(product.unitPrice).toFixed(2)}</td>
                  <td className="text-white font-semibold">
                    ${product.totalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
