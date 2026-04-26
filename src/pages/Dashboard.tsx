import { trpc } from "@/providers/trpc";
import { Package, AlertTriangle, XCircle, DollarSign, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";

const kpiCards = [
  {
    label: "Total Items",
    icon: Package,
    color: "#2563eb",
    dataKey: "totalItems" as const,
    format: (v: number) => v.toLocaleString(),
  },
  {
    label: "Low Stock Alert",
    icon: AlertTriangle,
    color: "#FF5252",
    dataKey: "lowStockCount" as const,
    format: (v: number) => v.toString(),
  },
  {
    label: "Out of Stock",
    icon: XCircle,
    color: "#888888",
    dataKey: "outOfStockCount" as const,
    format: (v: number) => v.toString(),
  },
  {
    label: "Total Value",
    icon: DollarSign,
    color: "#00C853",
    dataKey: "totalValue" as const,
    format: (v: number) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: lowStockData } = trpc.dashboard.lowStock.useQuery();
  const { data: activityData } = trpc.dashboard.recentActivity.useQuery();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-[#888888] mt-1">Real-time inventory overview</p>
        </div>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.label} variants={item}>
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <span className="kpi-label">{kpi.label}</span>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <kpi.icon className="w-[18px] h-[18px]" style={{ color: kpi.color }} />
                </div>
              </div>
              <span className="kpi-value">
                {stats ? kpi.format(stats[kpi.dataKey] as number) : "..."}
              </span>
              {kpi.dataKey === "totalItems" && stats && (
                <div className="flex items-center gap-1.5 text-xs text-[#00C853]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stats.recentOrders} orders this week</span>
                </div>
              )}
              {kpi.dataKey === "totalValue" && stats && (
                <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                  <span>{stats.pendingOrders} pending orders</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 glass-panel"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5252]" />
              <h2 className="text-sm font-semibold text-white">Low Stock Items</h2>
            </div>
            <Link
              to="/inventory"
              className="text-xs text-[#2563eb] hover:text-[#2563eb]/80 transition-colors font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockData && lowStockData.length > 0 ? (
                  lowStockData.slice(0, 6).map((product) => (
                    <tr key={product.id} className="low-stock-row">
                      <td className="font-medium text-white">{product.name}</td>
                      <td className="text-[#888888]">{product.sku}</td>
                      <td className="text-[#FF5252] font-semibold">{product.quantity}</td>
                      <td className="text-[#888888]">{product.threshold}</td>
                      <td>
                        <span className="status-badge status-low_stock">
                          REORDER
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-[#888888] py-8">
                      No low stock items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-panel"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2563eb]" />
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="p-3 space-y-1 max-h-[360px] overflow-y-auto scrollable-area">
            {activityData && activityData.length > 0 ? (
              activityData.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      backgroundColor:
                        activity.type === "stock_alert"
                          ? "#FF5252"
                          : activity.type === "order_approved"
                          ? "#00C853"
                          : activity.type === "order_denied"
                          ? "#FF5252"
                          : activity.type === "order_completed"
                          ? "#2563eb"
                          : "#888888",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-white/90 leading-snug">
                      {activity.description}
                    </p>
                    <p className="text-xs text-[#888888] mt-0.5">
                      {activity.createdAt
                        ? new Date(activity.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#888888] py-8">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#d97706]/15 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-[#d97706]" />
          </div>
          <div>
            <p className="text-xs text-[#888888]">Pending Orders</p>
            <p className="text-lg font-semibold text-white font-['Space_Grotesk']">
              {stats?.pendingOrders ?? "..."}
            </p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#2563eb]/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <p className="text-xs text-[#888888]">Weekly Orders</p>
            <p className="text-lg font-semibold text-white font-['Space_Grotesk']">
              {stats?.recentOrders ?? "..."}
            </p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#00C853]/15 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-[#00C853]" />
          </div>
          <div>
            <p className="text-xs text-[#888888]">Categories</p>
            <p className="text-lg font-semibold text-white font-['Space_Grotesk']">8</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/15 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <p className="text-xs text-[#888888]">Avg. Unit Price</p>
            <p className="text-lg font-semibold text-white font-['Space_Grotesk']">
              {stats && stats.totalItems > 0
                ? `$${(stats.totalValue / stats.totalItems).toFixed(2)}`
                : "..."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
