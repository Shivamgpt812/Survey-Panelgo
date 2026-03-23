// Script to make a user an admin
import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/survey-panel-go')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  points: Number,
  surveysCompleted: Number,
  memberSince: String
});

const User = mongoose.model('User', userSchema);

async function makeAdmin() {
  try {
    // Check what users exist
    const users = await User.find({});
    console.log('Existing users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Find or create admin user
    let adminUser = await User.findOne({ email: 'admin@survey.com' });
    
    if (!adminUser) {
      console.log('Admin user not found, creating...');
      // Create admin user directly
      const bcrypt = await import('bcryptjs');
      const passwordHash = bcrypt.default.hashSync('admin123', 12);
      
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@survey.com',
        passwordHash,
        role: 'admin',
        points: 0,
        surveysCompleted: 0,
        memberSince: new Date().toISOString().slice(0, 10),
      });
    } else {
      console.log('Admin user found, updating role to admin...');
      // Update existing user to admin
      const result = await User.updateOne(
        { email: 'admin@survey.com' },
        { role: 'admin' }
      );
      console.log('Update result:', result);
      
      // Refresh the user data
      adminUser = await User.findOne({ email: 'admin@survey.com' });
    }
    
    console.log('\nAdmin user created/updated:', {
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    });
    
    // Test login with the updated user
    console.log('\n🧪 Testing admin login...');
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@survey.com',
          password: 'admin123'
        })
      });
      
      const loginData = await response.json();
      console.log('Login response:', loginData);
      
      if (loginData.user && loginData.user.role === 'admin') {
        console.log('✅ Admin login successful!');
      } else {
        console.log('❌ Admin role not set correctly');
      }
    } catch (error) {
      console.error('Login test failed:', error);
    }
    
    console.log('\n✅ You can now login with:');
    console.log('Email: admin@survey.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error making admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

makeAdmin();
