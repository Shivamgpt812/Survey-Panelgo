import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from './db.js';
import { User } from './models/User.js';

const uri = process.env.MONGODB_URI;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'Administrator';

async function main() {
  if (!uri || !email || !password) {
    console.error('Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in .env');
    process.exit(1);
  }
  await connectDb(uri);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists for this email. No changes made.');
    process.exit(0);
  }
  const passwordHash = bcrypt.hashSync(password, 12);
  await User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
    points: 0,
    surveysCompleted: 0,
    memberSince: new Date().toISOString().slice(0, 10),
  });
  console.log('Admin user created successfully.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
