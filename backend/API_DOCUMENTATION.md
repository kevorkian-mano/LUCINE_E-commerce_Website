# E-commerce Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## User Endpoints

### Register User
**POST** `/users/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object and JWT token

### Login
**POST** `/users/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object and JWT token

### Get Profile
**GET** `/users/profile`
- **Auth:** Required
- **Response:** User profile

### Logout
**POST** `/users/logout`
- **Auth:** Required
- **Response:** Success message

---

## Product Endpoints

### Get All Products
**GET** `/products`
- **Query Params:** `category`, `minPrice`, `maxPrice`
- **Response:** Array of products

### Search Products
**GET** `/products/search`
- **Query Params:** `q` (search term), `category`, `minPrice`, `maxPrice`
- **Response:** Array of matching products

### Get Products by Category
**GET** `/products/category/:category`
- **Response:** Array of products in category

### Get All Categories
**GET** `/products/categories`
- **Response:** Array of category names

### Get Product by ID
**GET** `/products/:id`
- **Response:** Product object

### Create Product (Admin Only)
**POST** `/products`
- **Auth:** Required (Admin)
- **Body:**
  ```json
  {
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "category": "Electronics",
    "stock": 100,
    "image": "https://example.com/image.jpg"
  }
  ```

### Update Product (Admin Only)
**PUT** `/products/:id`
- **Auth:** Required (Admin)
- **Body:** Product fields to update

### Delete Product (Admin Only)
**DELETE** `/products/:id`
- **Auth:** Required (Admin)

---

## Cart Endpoints

All cart endpoints require authentication.

### Get Cart
**GET** `/cart`
- **Response:** User's cart with populated products

### Add Item to Cart
**POST** `/cart/items`
- **Body:**
  ```json
  {
    "productId": "product_id_here",
    "quantity": 2
  }
  ```

### Update Item Quantity
**PUT** `/cart/items/:productId`
- **Body:**
  ```json
  {
    "quantity": 3
  }
  ```

### Remove Item from Cart
**DELETE** `/cart/items/:productId`

### Clear Cart
**DELETE** `/cart`

---

## Order Endpoints

### Create Order
**POST** `/orders`
- **Auth:** Required
- **Body:**
  ```json
  {
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "PayPal"
  }
  ```

### Get User Orders
**GET** `/orders/my-orders`
- **Auth:** Required
- **Response:** Array of user's orders

### Get Order by ID
**GET** `/orders/:id`
- **Auth:** Required
- **Response:** Order details

### Update Order Payment
**PUT** `/orders/:id/payment`
- **Auth:** Required
- **Body:** Payment result object

### Get All Orders (Admin Only)
**GET** `/orders`
- **Auth:** Required (Admin)

### Get Sales Analytics (Admin Only)
**GET** `/orders/analytics/sales`
- **Auth:** Required (Admin)
- **Query Params:** `startDate`, `endDate` (ISO format)

### Get Sales by Category (Admin Only)
**GET** `/orders/analytics/category`
- **Auth:** Required (Admin)
- **Query Params:** `startDate`, `endDate` (ISO format)

---

## Health Check

### Server Status
**GET** `/health`
- **Response:** Server status

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

