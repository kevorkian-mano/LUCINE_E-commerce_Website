# Backend Setup Guide

## Issues Fixed

1. ✅ Added `"type": "module"` to `package.json` (required for ES6 imports)
2. ⚠️ **You need to create a `.env` file** (see below)

## Quick Setup

### Step 1: Create `.env` file

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/ecommerce

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### Step 2: Start MongoDB

Make sure MongoDB is running:

**Option A: Local MongoDB**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `MONGO_URI` in `.env` file

### Step 3: Install Dependencies (if not done)

```bash
cd backend
npm install
```

### Step 4: Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:5000`

## Common Issues

### Issue 1: "Cannot find module" or Import errors
**Solution:** Make sure `package.json` has `"type": "module"` (already fixed ✅)

### Issue 2: MongoDB connection error
**Solutions:**
- Make sure MongoDB is running locally, OR
- Use MongoDB Atlas and update `MONGO_URI` in `.env`
- Check if the connection string is correct

### Issue 3: Port already in use
**Solution:** Change `PORT=5000` to another port in `.env` file

### Issue 4: JWT_SECRET missing
**Solution:** Make sure `.env` file has `JWT_SECRET` set (required for authentication)

## Testing the Server

Once running, test with:

```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"success":true,"message":"Server is running"}
```

## Next Steps

1. Create the `.env` file (copy from above)
2. Start MongoDB
3. Run `npm run dev`
4. Test the health endpoint

If you still have issues, check the console output for specific error messages.

