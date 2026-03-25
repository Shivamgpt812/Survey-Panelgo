const mongoose = require('mongoose');
require('dotenv').config();

// Import the models - use the correct path
const IVendorSurvey = require('./server/vendor-lite/surveyModel.ts');

async function fixSurveyPIDs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/survey-panel-go');
    console.log('Connected to MongoDB');

    // Find all surveys that don't have a PID or have empty PID
    const surveysWithoutPid = await IVendorSurvey.find({
      $or: [
        { pid: { $exists: false } },
        { pid: null },
        { pid: '' }
      ]
    });

    console.log(`Found ${surveysWithoutPid.length} surveys without PID`);

    // Update each survey with a generated PID
    for (const survey of surveysWithoutPid) {
      const generatedPid = 'PID' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await IVendorSurvey.updateOne(
        { _id: survey._id },
        { $set: { pid: generatedPid } }
      );

      console.log(`Updated survey "${survey.title}" with PID: ${generatedPid}`);
    }

    console.log('PID update completed!');
    
    // Show all surveys with their PIDs
    const allSurveys = await IVendorSurvey.find({});
    console.log('\nAll surveys in database:');
    allSurveys.forEach(survey => {
      console.log(`- ${survey.title} (Token: ${survey.token}, PID: ${survey.pid || 'MISSING'})`);
    });

  } catch (error) {
    console.error('Error updating PIDs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixSurveyPIDs();
