
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

// Session storage for mock authenticated users
const sessions = new Map();

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
    
    // Modern Portal API (RFC 8908) - GET endpoint
    if (req.method === 'GET' && pathname.includes('/api/captiveportal/access/api')) {
        handleModernPortalAPI(req, res);
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
            const accessCode = params.get('code') || '';
            
            // Extract zone ID from path if present
            const zoneMatch = pathname.match(/\/(\d+)\//);
            const zoneId = zoneMatch ? zoneMatch[1] : '0';
            
            if (pathname.includes('/status')) {
                // Mock status check
                const clientIP = req.socket.remoteAddress || '192.168.1.100';
                const session = sessions.get(clientIP);
                
                const mockResponse = session || {
                    clientState: 'UNAUTHORIZED',
                    authType: 'normal',
                    ipAddress: clientIP,
                    macAddress: '00:11:22:33:44:55',
                    startTime: Math.floor(Date.now() / 1000)
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mockResponse));
                
            } else if (pathname.includes('/logon')) {
                // Mock login attempt
                let mockResponse;
                const clientIP = req.socket.remoteAddress || '192.168.1.100';
                
                // Demo credentials with different ticket durations
                // Test codes (5 characters: 2 for username + 3 for password):
                // "HR001" = username "HR" + password "001" = 1 hour ticket
                // "DY001" = username "DY" + password "001" = 1 day ticket  
                // "WK001" = username "WK" + password "001" = 1 week ticket
                // "MO001" = username "MO" + password "001" = 1 month ticket
                let sessionTimeout = 0;
                let isValid = false;
                
                // Check username/password combinations (OPNsense standard)
                if (user === 'HR' && password === '001') {
                    sessionTimeout = 3600; // 1 hour
                    isValid = true;
                } else if (user === 'DY' && password === '001') {
                    sessionTimeout = 86400; // 1 day
                    isValid = true;
                } else if (user === 'WK' && password === '001') {
                    sessionTimeout = 604800; // 1 week
                    isValid = true;
                } else if (user === 'MO' && password === '001') {
                    sessionTimeout = 2592000; // 30 days (1 month)
                    isValid = true;
                }
                
                if (isValid) {
                    mockResponse = {
                        clientState: 'AUTHORIZED',
                        authType: 'normal',
                        ipAddress: clientIP,
                        macAddress: '00:11:22:33:44:55',
                        startTime: Math.floor(Date.now() / 1000),
                        acc_session_timeout: sessionTimeout,
                        sessionTimeoutRemaining: sessionTimeout,
                        userName: user,
                        zoneId: zoneId
                    };
                    
                    // Store session for modern portal API
                    sessions.set(clientIP, mockResponse);
                } else {
                    mockResponse = {
                        clientState: 'UNAUTHORIZED',
                        authType: 'normal',
                        ipAddress: clientIP,
                        macAddress: '00:11:22:33:44:55',
                        error: 'Invalid credentials',
                        errorDetail: 'The access code you entered is incorrect. Please check and try again.'
                    };
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mockResponse));
                
            } else if (pathname.includes('/logoff')) {
                // Mock logout
                const clientIP = req.socket.remoteAddress || '192.168.1.100';
                sessions.delete(clientIP);
                
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

// Modern Portal API (RFC 8908) - Returns captive portal status for modern devices
function handleModernPortalAPI(req, res) {
    const clientIP = req.socket.remoteAddress || '192.168.1.100';
    const session = sessions.get(clientIP);
    
    let response;
    
    if (session && session.clientState === 'AUTHORIZED') {
        // User is authenticated
        const elapsed = Math.floor(Date.now() / 1000) - session.startTime;
        const remaining = Math.max(0, session.acc_session_timeout - elapsed);
        
        response = {
            captive: false,
            'user-portal-url': `http://127.0.0.1:${PORT}/`,
            'venue-info-url': null,
            'seconds-remaining': remaining,
            'bytes-remaining': null
        };
    } else {
        // User needs to authenticate
        response = {
            captive: true,
            'user-portal-url': `http://127.0.0.1:${PORT}/`,
            'venue-info-url': null
        };
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Captive Portal development server running at http://0.0.0.0:${PORT}`);
    console.log(`📱 Preview your captive portal template live!`);
    console.log(`🔧 Files are served directly - perfect for OPNsense export`);
});
