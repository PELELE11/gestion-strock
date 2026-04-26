import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductModal } from "@/components/modals/ProductModal";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    categoryId: categoryFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    sort: sortField,
    page,
    limit: 15,
  });

  const { data: categories } = trpc.category.list.useQuery();

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.dashboard.lowStock.invalidate();
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Delete this product?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEdit = (id: number) => {
    setEditProduct(id);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="text-sm text-[#888888] mt-1">Manage your stock items</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="search-input"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter ?? ""}
            onChange={(e) => {
              setCategoryFilter(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="select-field w-44"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="select-field w-40"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>
                  <button
                    onClick={() => setSortField("name")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Product <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>SKU</th>
                <th>Category</th>
                <th>
                  <button
                    onClick={() => setSortField("quantity")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Qty <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>Threshold</th>
                <th>
                  <button
                    onClick={() => setSortField("unitPrice")}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    Price <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>Location</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={10} className="py-4">
                      <div className="h-4 bg-white/[0.05] rounded animate-pulse mx-4" />
                    </td>
                  </tr>
                ))
              ) : productsData?.items && productsData.items.length > 0 ? (
                productsData.items.map((product) => {
                  const category = categories?.find((c) => c.id === product.categoryId);
                  const isLow = product.status === "low_stock";
                  const isOut = product.status === "out_of_stock";

                  return (
                    <tr
                      key={product.id}
                      className={cn(
                        isLow && "low-stock-row",
                        isOut && "out-of-stock-row"
                      )}
                    >
                      <td className="px-4">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isLow && "bg-[#FF5252] animate-pulse",
                            isOut && "bg-[#888888]",
                            !isLow && !isOut && "bg-[#00C853]"
                          )}
                        />
                      </td>
                      <td className="font-medium text-white">{product.name}</td>
                      <td className="text-[#888888] font-mono text-xs">{product.sku}</td>
                      <td>
                        {category && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${category.color ?? "#2563eb"}15`,
                              color: category.color ?? "#2563eb",
                            }}
                          >
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className={cn("font-semibold", isLow && "text-[#FF5252]", isOut && "text-[#888888]")}>
                        {product.quantity}
                      </td>
                      <td className="text-[#888888]">{product.threshold}</td>
                      <td className="text-white font-medium">
                        ${Number(product.unitPrice).toFixed(2)}
                      </td>
                      <td className="text-[#888888]">{product.location ?? "—"}</td>
                      <td>
                        <span className={cn("status-badge", `status-${product.status}`)}>
                          {product.status === "in_stock" && (
                            <>
                              <Package className="w-3 h-3" /> In Stock
                            </>
                          )}
                          {product.status === "low_stock" && (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </>
                          )}
                          {product.status === "out_of_stock" && (
                            <>
                              <XCircle className="w-3 h-3" /> Out
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="p-2 rounded-lg text-[#888888] hover:text-[#2563eb] hover:bg-[#2563eb]/10 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg text-[#888888] hover:text-[#FF5252] hover:bg-[#FF5252]/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center text-[#888888] py-12">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
            <p className="text-xs text-[#888888]">
              Showing {(page - 1) * 15 + 1} - {Math.min(page * 15, productsData.total)} of{" "}
              {productsData.total} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm text-[#888888] hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, productsData.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                      page === pageNum
                        ? "bg-[#2563eb] text-white"
                        : "text-[#888888] hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(productsData.totalPages, p + 1))}
                disabled={page === productsData.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm text-[#888888] hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ProductModal
            productId={editProduct}
            onClose={handleModalClose}
            categories={categories ?? []}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
