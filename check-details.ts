import mongoose from 'mongoose';
import 'dotenv/config';
import { Survey } from './server/models/Survey.ts';

async function checkDetails() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/survey-rewards');
    const s1 = await Survey.findOne({ title: 'Retail habits: Online vs Offline' });
    const s2 = await Survey.findOne({ title: 'Employee Work-Life Balance Study' });
    console.log(JSON.stringify({ s1, s2 }, null, 2));
    await mongoose.disconnect();
}

checkDetails().catch(console.error);
