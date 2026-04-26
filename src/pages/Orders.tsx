import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "approved" | "denied" | "completed";
type TypeFilter = "all" | "incoming" | "outgoing";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const [swipingId, setSwipingId] = useState<number | null>(null);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

  const utils = trpc.useUtils();

  const { data: ordersData, isLoading } = trpc.order.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    page,
    limit: 15,
  });

  const { data: products } = trpc.product.list.useQuery({ limit: 100 });

  const approveMutation = trpc.order.approve.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.product.list.invalidate();
      setSwipingId(null);
    },
  });

  const denyMutation = trpc.order.deny.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      utils.dashboard.stats.invalidate();
      setSwipingId(null);
    },
  });

  const deleteMutation = trpc.order.delete.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
  });

  const handleApprove = (id: number) => {
    setSwipingId(id);
    setSwipeDir("right");
    setTimeout(() => approveMutation.mutate({ id }), 300);
  };

  const handleDeny = (id: number) => {
    setSwipingId(id);
    setSwipeDir("left");
    setTimeout(() => denyMutation.mutate({ id }), 300);
  };

  const getProductName = (productId: number) => {
    return products?.items.find((p) => p.id === productId)?.name ?? `Product #${productId}`;
  };

  const pendingOrders = ordersData?.items.filter((o) => o.status === "pending") ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-sm text-[#888888] mt-1">Manage incoming and outgoing orders</p>
        </div>
      </div>

      {/* Pending Orders Deck */}
      {pendingOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d97706]" />
            <h2 className="text-sm font-semibold text-white">Pending Approval ({pendingOrders.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {pendingOrders.slice(0, 6).map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: swipingId === order.id ? 0 : 1,
                    scale: swipingId === order.id ? 0.8 : 1,
                    x: swipingId === order.id
                      ? swipeDir === "right"
                        ? 300
                        : -300
                      : 0,
                    rotate: swipingId === order.id
                      ? swipeDir === "right"
                        ? 10
                        : -10
                      : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="glass-panel p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#888888]">{order.orderNumber}</span>
                    <span
                      className={cn(
                        "status-badge",
                        order.type === "incoming" ? "status-approved" : "status-pending"
                      )}
                    >
                      {order.type === "incoming" ? (
                        <>
                          <TrendingUp className="w-3 h-3" /> Incoming
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3" /> Outgoing
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{getProductName(order.productId)}</p>
                    <p className="text-xs text-[#888888]">{order.supplier ?? "No supplier"}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#888888]">Qty: <span className="text-white font-medium">{order.quantity}</span></span>
                    <span className="text-white font-semibold">${Number(order.totalPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleDeny(order.id)}
                      className="flex-1 btn-danger py-2 justify-center text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Deny
                    </button>
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="flex-1 btn-primary py-2 justify-center text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
          className="select-field w-44"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as TypeFilter); setPage(1); }}
          className="select-field w-44"
        >
          <option value="all">All Types</option>
          <option value="incoming">Incoming</option>
          <option value="outgoing">Outgoing</option>
        </select>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Supplier</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-4">
                      <div className="h-4 bg-white/[0.05] rounded animate-pulse mx-4" />
                    </td>
                  </tr>
                ))
              ) : ordersData?.items && ordersData.items.length > 0 ? (
                ordersData.items.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs text-[#888888]">{order.orderNumber}</td>
                    <td>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium",
                          order.type === "incoming" ? "text-[#00C853]" : "text-[#d97706]"
                        )}
                      >
                        {order.type === "incoming" ? (
                          <ArrowRight className="w-3 h-3" />
                        ) : (
                          <ArrowLeft className="w-3 h-3" />
                        )}
                        {order.type}
                      </span>
                    </td>
                    <td className="text-white font-medium">{getProductName(order.productId)}</td>
                    <td className="text-white">{order.quantity}</td>
                    <td className="text-white font-medium">${Number(order.totalPrice).toFixed(2)}</td>
                    <td className="text-[#888888]">{order.supplier ?? "—"}</td>
                    <td>
                      <span className={cn("status-badge", `status-${order.status}`)}>
                        {order.status === "pending" && <Clock className="w-3 h-3" />}
                        {order.status === "approved" && <CheckCircle className="w-3 h-3" />}
                        {order.status === "denied" && <XCircle className="w-3 h-3" />}
                        {order.status === "completed" && <Package className="w-3 h-3" />}
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="p-2 rounded-lg text-[#888888] hover:text-[#00C853] hover:bg-[#00C853]/10 transition-all"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeny(order.id)}
                              className="p-2 rounded-lg text-[#888888] hover:text-[#FF5252] hover:bg-[#FF5252]/10 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Delete this order?")) {
                              deleteMutation.mutate({ id: order.id });
                            }
                          }}
                          className="p-2 rounded-lg text-[#888888] hover:text-[#FF5252] hover:bg-[#FF5252]/10 transition-all"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-[#888888] py-12">
                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {ordersData && ordersData.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
            <p className="text-xs text-[#888888]">
              Page {page} of {ordersData.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm text-[#888888] hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(ordersData.totalPages, p + 1))}
                disabled={page === ordersData.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm text-[#888888] hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
