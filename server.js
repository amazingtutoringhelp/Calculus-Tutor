/**
 * Analytics Backend Server
 * Receives and stores website statistics
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const HOSTNAME = '0.0.0.0';

// In-memory storage for analytics data
const analyticsData = {
    events: [],
    sessions: new Map(),
    users: new Map(),
    pageViews: [],
    clicks: [],
    scrolls: [],
    heartbeats: []
};

/**
 * Parse JSON body from request
 */
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

/**
 * Process and store analytics events
 */
function processEvents(events) {
    if (!Array.isArray(events)) {
        events = [events];
    }

    events.forEach(event => {
        // Store event
        analyticsData.events.push(event);

        // Update session data
        if (!analyticsData.sessions.has(event.sessionId)) {
            analyticsData.sessions.set(event.sessionId, {
                sessionId: event.sessionId,
                userId: event.userId,
                firstSeen: event.timestamp,
                lastSeen: event.timestamp,
                events: [],
                pageViews: 0,
                clicks: 0
            });
        }
        const session = analyticsData.sessions.get(event.sessionId);
        session.lastSeen = event.timestamp;
        session.events.push(event);

        // Update user data
        if (!analyticsData.users.has(event.userId)) {
            analyticsData.users.set(event.userId, {
                userId: event.userId,
                firstSeen: event.timestamp,
                lastSeen: event.timestamp,
                sessions: new Set(),
                totalPageViews: 0,
                totalClicks: 0
            });
        }
        const user = analyticsData.users.get(event.userId);
        user.lastSeen = event.timestamp;
        user.sessions.add(event.sessionId);

        // Categorize events
        switch (event.type) {
            case 'pageview':
                analyticsData.pageViews.push(event);
                session.pageViews++;
                user.totalPageViews++;
                break;
            case 'click':
                analyticsData.clicks.push(event);
                session.clicks++;
                user.totalClicks++;
                break;
            case 'scroll':
                analyticsData.scrolls.push(event);
                break;
            case 'heartbeat':
                analyticsData.heartbeats.push(event);
                break;
        }
    });

    // Keep only last 10,000 events to prevent memory overflow
    if (analyticsData.events.length > 10000) {
        analyticsData.events = analyticsData.events.slice(-10000);
    }
    if (analyticsData.pageViews.length > 10000) {
        analyticsData.pageViews = analyticsData.pageViews.slice(-10000);
    }
    if (analyticsData.clicks.length > 10000) {
        analyticsData.clicks = analyticsData.clicks.slice(-10000);
    }
    if (analyticsData.scrolls.length > 10000) {
        analyticsData.scrolls = analyticsData.scrolls.slice(-10000);
    }
    if (analyticsData.heartbeats.length > 10000) {
        analyticsData.heartbeats = analyticsData.heartbeats.slice(-10000);
    }
}

/**
 * Get analytics statistics
 */
function getStatistics() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const lastHour = now - (60 * 60 * 1000);

    // Calculate statistics
    const stats = {
        overview: {
            totalEvents: analyticsData.events.length,
            totalPageViews: analyticsData.pageViews.length,
            totalClicks: analyticsData.clicks.length,
            totalSessions: analyticsData.sessions.size,
            totalUsers: analyticsData.users.size
        },
        last24h: {
            events: analyticsData.events.filter(e => e.timestamp > last24h).length,
            pageViews: analyticsData.pageViews.filter(e => e.timestamp > last24h).length,
            clicks: analyticsData.clicks.filter(e => e.timestamp > last24h).length,
            sessions: [...analyticsData.sessions.values()].filter(s => s.lastSeen > last24h).length,
            users: [...analyticsData.users.values()].filter(u => u.lastSeen > last24h).length
        },
        lastHour: {
            events: analyticsData.events.filter(e => e.timestamp > lastHour).length,
            pageViews: analyticsData.pageViews.filter(e => e.timestamp > lastHour).length,
            clicks: analyticsData.clicks.filter(e => e.timestamp > lastHour).length
        },
        recentEvents: analyticsData.events.slice(-50).reverse(),
        topPages: getTopPages(),
        scrollDepths: getScrollDepths(),
        sessions: [...analyticsData.sessions.values()].slice(-20).reverse()
    };

    return stats;
}

/**
 * Get top pages by views
 */
function getTopPages() {
    const pageCounts = {};
    analyticsData.pageViews.forEach(event => {
        const page = event.path || event.url;
        pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    
    return Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

/**
 * Get scroll depth statistics
 */
function getScrollDepths() {
    const depths = {};
    analyticsData.scrolls.forEach(event => {
        const depth = event.data?.depth || 0;
        depths[depth] = (depths[depth] || 0) + 1;
    });
    
    return Object.entries(depths)
        .map(([depth, count]) => ({ depth: parseInt(depth), count }))
        .sort((a, b) => a.depth - b.depth);
}

/**
 * Set CORS headers
 */
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Send JSON response
 */
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

/**
 * Serve static files
 */
function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath);
    const contentTypeMap = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    const contentType = contentTypeMap[extname] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

/**
 * Request handler
 */
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    setCorsHeaders(res);

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // API Routes
        if (pathname === '/api/track' && req.method === 'POST') {
            const events = await parseBody(req);
            processEvents(events);
            sendJson(res, 200, { success: true, message: 'Events tracked' });
            return;
        }

        if (pathname === '/api/stats' && req.method === 'GET') {
            const stats = getStatistics();
            sendJson(res, 200, stats);
            return;
        }

        // Serve dashboard
        if (pathname === '/dashboard' || pathname === '/dashboard/') {
            serveStaticFile(res, path.join(__dirname, 'dashboard.html'));
            return;
        }

        // Serve static files
        if (pathname === '/analytics.js') {
            serveStaticFile(res, path.join(__dirname, 'analytics.js'));
            return;
        }

        // Default route
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Analytics Server Running\n\nEndpoints:\n- POST /api/track - Track events\n- GET /api/stats - Get statistics\n- GET /dashboard - View dashboard');

    } catch (err) {
        console.error('Error handling request:', err);
        sendJson(res, 500, { success: false, error: err.message });
    }
}

/**
 * Start server
 */
const server = http.createServer(handleRequest);

server.listen(PORT, HOSTNAME, () => {
    console.log(`Analytics Server running at http://${HOSTNAME}:${PORT}/`);
    console.log(`Dashboard available at http://${HOSTNAME}:${PORT}/dashboard`);
    console.log('Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
