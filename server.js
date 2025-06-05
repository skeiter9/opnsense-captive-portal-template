
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;

// MIME types for common file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    const parsedUrl = url.parse(req.url, true);
    
    // Mock OPNsense API endpoints for development
    if (pathname.startsWith('/api/captiveportal/access/')) {
        handleCaptivePortalAPI(req, res, pathname);
        return;
    }
    
    // Default to index.html for root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }
        
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

// Mock OPNsense Captive Portal API for development
function handleCaptivePortalAPI(req, res, pathname) {
    // Set CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const user = params.get('user') || '';
            const password = params.get('password') || '';
            
            if (pathname === '/api/captiveportal/access/status/') {
                // Mock status check - user is not authorized initially
                const mockResponse = {
                    clientState: 'UNAUTHORIZED',
                    authType: 'normal',
                    ipAddress: '192.168.1.100',
                    macAddress: '00:11:22:33:44:55',
                    startTime: Math.floor(Date.now() / 1000)
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mockResponse));
                
            } else if (pathname === '/api/captiveportal/access/logon/') {
                // Mock login attempt
                let mockResponse;
                
                // Demo credentials: username "te", password "st1" = access code "test1"
                if (user === 'te' && password === 'st1') {
                    mockResponse = {
                        clientState: 'AUTHORIZED',
                        authType: 'normal',
                        ipAddress: '192.168.1.100',
                        macAddress: '00:11:22:33:44:55',
                        startTime: Math.floor(Date.now() / 1000),
                        acc_session_timeout: 3600 // 1 hour session
                    };
                } else {
                    mockResponse = {
                        clientState: 'UNAUTHORIZED',
                        authType: 'normal',
                        ipAddress: '192.168.1.100',
                        macAddress: '00:11:22:33:44:55',
                        error: 'Invalid credentials'
                    };
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mockResponse));
                
            } else if (pathname === '/api/captiveportal/access/logoff/') {
                // Mock logout
                const mockResponse = {
                    clientState: 'UNAUTHORIZED',
                    authType: 'normal',
                    message: 'Logged out successfully'
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mockResponse));
            } else {
                res.writeHead(404);
                res.end('API endpoint not found');
            }
        });
    } else {
        res.writeHead(405);
        res.end('Method not allowed');
    }
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Captive Portal development server running at http://0.0.0.0:${PORT}`);
    console.log(`📱 Preview your captive portal template live!`);
    console.log(`🔧 Files are served directly - perfect for OPNsense export`);
});
