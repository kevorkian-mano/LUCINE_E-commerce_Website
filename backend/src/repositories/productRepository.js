import Product from "../models/Product.js";

class ProductRepository {
  async findAll(filters = {}) {
    const query = { isActive: true, ...filters };
    return await Product.find(query).lean();
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async search(searchTerm, category, minPrice, maxPrice) {
    // Declarative query building
    const query = { isActive: true };
    
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    return await Product.find(query).lean();
  }

  async findByCategory(category) {
    return await Product.find({ category, isActive: true }).lean();
  }

  async create(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }

  async updateStock(id, quantity) {
    return await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -quantity } },
      { new: true }
    );
  }

  async getCategories() {
    return await Product.distinct("category");
  }
}

// Export both: singleton for backward compatibility and class for factory
export default new ProductRepository();
export { ProductRepository };
