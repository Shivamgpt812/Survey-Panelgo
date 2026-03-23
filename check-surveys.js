import mongoose from 'mongoose';
import 'dotenv/config';
import { Survey } from './server/models/Survey.js';

async function checkSurveys() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/survey-rewards');
    const surveys = await Survey.find({ title: { $in: ['Retail habits: Online vs Offline', 'Employee Work-Life Balance Study Survey'] } });
    console.log(JSON.stringify(surveys, null, 2));
    await mongoose.disconnect();
}

checkSurveys().catch(console.error);
