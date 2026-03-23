import mongoose from 'mongoose';
import 'dotenv/config';
import { Survey } from './server/models/Survey.ts';

async function updateSurveys() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/survey-rewards');

    // 1. External Survey: Retail habits
    await Survey.updateOne(
        { title: 'Retail habits: Online vs Offline' },
        {
            link: 'https://example.com/survey/retail-habits-2024',
            description: 'Analyze the evolving landscape of Indian retail. Share your shopping preferences for apparel, groceries, and electronics post-2020.'
        }
    );

    // 2. Internal Survey: Employee Work-Life Balance Study
    await Survey.updateOne(
        { title: 'Employee Work-Life Balance Study' },
        {
            questions: [
                {
                    id: 'q1',
                    text: 'How often do you work from home?',
                    type: 'single',
                    options: ['Daily', '2-3 times a week', 'Once a week', 'Rarely or never'],
                    required: true
                },
                {
                    id: 'q2',
                    text: 'On a scale of 1-5, how satisfied are you with your current work-life balance?',
                    type: 'single',
                    options: ['1 (Very Dissatisfied)', '2', '3', '4', '5 (Very Satisfied)'],
                    required: true
                },
                {
                    id: 'q3',
                    text: 'What is the biggest challenge of remote work for you?',
                    type: 'single',
                    options: ['Internet connectivity', 'Lack of social interaction', 'Overlapping work-home boundaries', 'None of the above'],
                    required: true
                },
                {
                    id: 'q4',
                    text: 'Would you prefer a 4-day work week even with longer hours?',
                    type: 'single',
                    options: ['Yes, definitely', 'Maybe', 'No'],
                    required: true
                }
            ]
        }
    );

    console.log('Surveys updated successfully with questions and links.');
    await mongoose.disconnect();
}

updateSurveys().catch(console.error);
