import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { X, Package, Save } from "lucide-react";
import { motion } from "framer-motion";
import type { Category } from "@db/schema";

interface ProductModalProps {
  productId: number | null;
  onClose: () => void;
  categories: Category[];
}

export function ProductModal({ productId, onClose, categories }: ProductModalProps) {
  const utils = trpc.useUtils();
  const { data: existingProduct } = trpc.product.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  );

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    quantity: "0",
    threshold: "10",
    unitPrice: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingProduct) {
      setForm({
        name: existingProduct.name,
        sku: existingProduct.sku,
        description: existingProduct.description ?? "",
        categoryId: existingProduct.categoryId?.toString() ?? "",
        quantity: existingProduct.quantity.toString(),
        threshold: existingProduct.threshold.toString(),
        unitPrice: existingProduct.unitPrice.toString(),
        location: existingProduct.location ?? "",
      });
    }
  }, [existingProduct]);

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.dashboard.lowStock.invalidate();
      onClose();
    },
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.dashboard.lowStock.invalidate();
      onClose();
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.sku.trim()) newErrors.sku = "SKU is required";
    if (!form.unitPrice || Number(form.unitPrice) <= 0) newErrors.unitPrice = "Valid price required";
    if (Number(form.quantity) < 0) newErrors.quantity = "Cannot be negative";
    if (Number(form.threshold) < 0) newErrors.threshold = "Cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      quantity: Number(form.quantity),
      threshold: Number(form.threshold),
      unitPrice: form.unitPrice,
      location: form.location.trim() || undefined,
    };

    if (productId) {
      updateMutation.mutate({ id: productId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111111] border border-white/[0.08] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollable-area"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563eb]/15 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {productId ? "Edit Product" : "Add Product"}
              </h2>
              <p className="text-xs text-[#888888]">
                {productId ? "Update product details" : "Create a new product entry"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#888888] hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`input-field ${errors.name ? "border-[#FF5252]" : ""}`}
                placeholder="Product name"
              />
              {errors.name && <p className="text-xs text-[#FF5252]">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                SKU *
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={`input-field ${errors.sku ? "border-[#FF5252]" : ""}`}
                placeholder="ELEC-001"
              />
              {errors.sku && <p className="text-xs text-[#FF5252]">{errors.sku}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Brief product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="select-field"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input-field"
                placeholder="A-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={`input-field ${errors.quantity ? "border-[#FF5252]" : ""}`}
              />
              {errors.quantity && <p className="text-xs text-[#FF5252]">{errors.quantity}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                Threshold *
              </label>
              <input
                type="number"
                min="0"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                className={`input-field ${errors.threshold ? "border-[#FF5252]" : ""}`}
              />
              {errors.threshold && <p className="text-xs text-[#FF5252]">{errors.threshold}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                Unit Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                className={`input-field ${errors.unitPrice ? "border-[#FF5252]" : ""}`}
                placeholder="0.00"
              />
              {errors.unitPrice && (
                <p className="text-xs text-[#FF5252]">{errors.unitPrice}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : productId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
