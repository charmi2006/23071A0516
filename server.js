const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const EventEmitter = require('events');

// Custom event emitter
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Event: log every request with timestamp
myEmitter.on('requestLogged', (url) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Request received: ${url}`);
});

// Event: triggered when path demo is used
myEmitter.on('pathDemoUsed', () => {
  console.log('Path demo route was accessed.');
});

const server = http.createServer((req, res) => {
  myEmitter.emit('requestLogged', req.url);

  if (req.url === '/') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });

  } else if (req.url === '/api/osinfo') {
    const osInfo = {
      platform: os.platform(),
      cpuArch: os.arch(),
      cpus: os.cpus().length,
      totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemMB: Math.round(os.freemem() / 1024 / 1024),
      uptime: os.uptime()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(osInfo, null, 2));

  } else if (req.url === '/path-demo') {
    myEmitter.emit('pathDemoUsed');

    const examplePath = path.join(__dirname, 'public', 'index.html');
    const pathDetails = {
      dirname: path.dirname(examplePath),
      basename: path.basename(examplePath),
      extname: path.extname(examplePath),
      parsed: path.parse(examplePath)
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(pathDetails, null, 2));

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
