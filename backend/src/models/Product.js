import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true, index: true },
  image: { type: String, default: "" },
  stock: { type: Number, required: true, min: 0, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for search performance (NFR1)
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });

export default mongoose.model("Product", productSchema);

