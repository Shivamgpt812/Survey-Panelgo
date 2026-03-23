import mongoose from 'mongoose';
import 'dotenv/config';
import { Survey } from './server/models/Survey.ts';

async function checkSurveys() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/survey-rewards');
    const surveys = await Survey.find({});
    console.log(JSON.stringify(surveys.map(s => s.title), null, 2));
    await mongoose.disconnect();
}

checkSurveys().catch(console.error);
