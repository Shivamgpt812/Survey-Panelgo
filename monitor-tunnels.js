import { exec } from 'child_process';
import https from 'https';

const FRONTEND_URL = 'https://26c8b77aa44cd9f2-49-36-136-170.serveousercontent.com';
const BACKEND_URL = 'https://092fb052d114be3c-49-36-136-170.serveousercontent.com';

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function monitor() {
  console.log('🔍 Checking tunnel health...');
  
  const frontendOk = await checkUrl(FRONTEND_URL);
  const backendOk = await checkUrl(`${BACKEND_URL}/api/surveys`);
  
  console.log(`Frontend: ${frontendOk ? '✅' : '❌'}`);
  console.log(`Backend:  ${backendOk ? '✅' : '❌'}`);
  
  if (!frontendOk || !backendOk) {
    console.log('⚠️  Tunnel issues detected!');
    console.log('💡 Solution: Restart the affected tunnels');
    console.log('');
    console.log('To restart backend tunnel:');
    console.log('ssh -R 80:localhost:3000 serveo.net -o "StrictHostKeyChecking=no"');
    console.log('');
    console.log('To restart frontend tunnel:');
    console.log('ssh -R 80:localhost:8080 serveo.net -o "StrictHostKeyChecking=no"');
  } else {
    console.log('✅ All tunnels working properly');
  }
}

monitor();
