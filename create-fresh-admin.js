// Create a completely fresh admin user
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/survey-panel-go')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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

async function createFreshAdmin() {
  try {
    // Update superadmin user to admin role
    const result = await User.updateOne(
      { email: 'superadmin@survey.com' },
      { role: 'admin' }
    );
    console.log('Updated superadmin to admin:', result);
    
    // Test login with superadmin
    console.log('\n🧪 Testing superadmin login...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@survey.com',
        password: 'admin123'
      })
    });
    
    const loginData = await response.json();
    console.log('Login response:', loginData);
    
    if (loginData.user && loginData.user.role === 'admin') {
      console.log('✅ SUCCESS! Super admin login working!');
    } else {
      console.log('❌ Still not working');
    }
    
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log('Email: superadmin@survey.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createFreshAdmin();
