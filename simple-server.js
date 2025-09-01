const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Simple server is working!',
    timestamp: new Date().toISOString()
  }));
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Test with: http://localhost:${PORT}`);
});
