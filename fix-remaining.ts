import mongoose from 'mongoose';
import 'dotenv/config';
import { Survey } from './server/models/Survey.ts';

async function updateAll() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/survey-rewards');

    // Future of EV
    await Survey.updateOne({ title: 'Future of EV in Indian Cities' }, {
        questions: [
            { id: 'ev1', text: 'Do you own an electric vehicle?', type: 'single', options: ['Yes', 'No, but plan to', 'No'], required: true },
            { id: 'ev2', text: 'Main concern regarding EV?', type: 'single', options: ['Charging infrastructure', 'Price', 'Battery life', 'Performance'], required: true }
        ]
    });

    // Digital payments - external?
    await Survey.updateOne({ title: 'Digital Payment Trends 2024', isExternal: true }, {
        link: 'https://example.com/survey/digital-payments-2024'
    });

    console.log('Finished updating remaining dummy data.');
    await mongoose.disconnect();
}
updateAll().catch(console.error);
