const mongoose = require('mongoose');
require('dotenv').config();

async function addTestMapping() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/survey-panel');
    
    const RespondentMapping = require('./server/models/RespondentMapping.ts').default;
    
    // Add test mapping for UID 'ssss'
    await RespondentMapping.findOneAndUpdate(
      { uid: 'ssss' },
      { uid: 'ssss', token: 'muzywj4f', pid: '6899051' },
      { upsert: true, new: true }
    );
    
    console.log('✅ Added test mapping for UID: ssss');
    
    // Verify the mapping
    const mapping = await RespondentMapping.findOne({ uid: 'ssss' });
    console.log('📋 Mapping found:', mapping);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestMapping();
