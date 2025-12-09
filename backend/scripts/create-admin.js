import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Admin user details
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin@123456';
    
    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin user already exists');
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
    } else {
      // Create new admin user
      admin = new User({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`Role: ${admin.role}`);
    }
    
    // Disconnect from MongoDB
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
