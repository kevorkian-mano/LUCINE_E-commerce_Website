import Order from "../models/Order.js";

class OrderRepository {
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  async findById(id) {
    return await Order.findById(id).populate("user", "name email").populate("orderItems.product");
  }

  async findByUserId(userId) {
    return await Order.find({ user: userId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });
  }

  async findAll(filters = {}) {
    return await Order.find(filters)
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });
  }

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getSalesAnalytics(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // Declarative aggregation pipeline
    return await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalPrice" }
        }
      }
    ]);
  }

  async getSalesByCategory(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    return await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          totalSales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
          totalItems: { $sum: "$orderItems.quantity" }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
  }
}

export default new OrderRepository();

