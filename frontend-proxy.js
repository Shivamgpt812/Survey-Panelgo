import { createProxyMiddleware } from 'http-proxy-middleware';
import http from 'http';

const proxy = createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true
});

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  proxy(req, res);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Frontend proxy running on http://localhost:${PORT}`);
});
