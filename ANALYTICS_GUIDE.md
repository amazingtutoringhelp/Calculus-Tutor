# Analytics System Implementation - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Analytics Server

```bash
cd /home/runner/work/Calculus-Tutor/Calculus-Tutor
node server.js
```

Expected output:
```
Analytics Server running at http://0.0.0.0:3000/
Dashboard available at http://0.0.0.0:3000/dashboard
Press Ctrl+C to stop
```

### 2. Serve the Main Website

In a separate terminal:

```bash
cd /home/runner/work/Calculus-Tutor/Calculus-Tutor
python3 -m http.server 8080
```

Or use any static file server.

### 3. Access the Dashboard

Open your browser to:
```
http://localhost:3000/dashboard
```

### 4. View the Main Website

Open your browser to:
```
http://localhost:8080/index.html
```

The analytics will automatically start tracking user interactions!

## 📊 What Gets Tracked

### Automatic Tracking
- **Page Views**: Every page load
- **Clicks**: Buttons, links, lesson cards, and interactive elements
- **Scroll Depth**: 25%, 50%, 75%, 90%, 100% milestones
- **Session Duration**: Time spent on site
- **Heartbeats**: Periodic updates every 60 seconds

### Session Management
- **Session ID**: Unique per browser session (30-minute timeout)
- **User ID**: Persistent across sessions (stored in localStorage)

## 🎨 Dashboard Features

### Overview Cards
- Total Events
- Page Views
- Clicks
- Sessions
- Users

Each card shows:
- Current total
- Last 24-hour activity

### Visual Analytics
- **Top Pages**: Bar chart showing most visited pages
- **Scroll Depth**: Engagement metrics by percentage
- **Recent Events**: Live feed of user activities
- **Active Sessions**: Session details with duration

### Auto-Refresh
The dashboard automatically refreshes every 30 seconds to show real-time data.

## 🔧 Configuration

### Change Server Port

Edit `server.js` or use environment variable:
```bash
PORT=8080 node server.js
```

### Adjust Tracking Behavior

Edit `analytics.js`:
```javascript
const config = {
    endpoint: '/api/track',           // Server endpoint
    sessionTimeout: 30 * 60 * 1000,  // 30 minutes
    batchSize: 10,                    // Events per batch
    batchTimeout: 5000                // 5 seconds
};
```

### Track Custom Events

Use the public API in your code:
```javascript
// Track custom event
Analytics.track('custom_event', {
    action: 'button_click',
    label: 'Get Started'
});

// Get session info
const session = Analytics.getSession();
console.log(session.sessionId, session.userId);
```

## 🧪 Testing

### Send Test Events

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '[{
    "type": "pageview",
    "timestamp": '$(date +%s000)',
    "sessionId": "test-session",
    "userId": "test-user",
    "url": "http://localhost/test",
    "path": "/test",
    "data": {"title": "Test Page"}
  }]'
```

### Check Statistics

```bash
curl http://localhost:3000/api/stats | python3 -m json.tool
```

## 📝 API Endpoints

### POST /api/track
Track analytics events (batched array of events)

**Request Body:**
```json
[{
  "type": "pageview|click|scroll|heartbeat|session_end",
  "timestamp": 1234567890000,
  "sessionId": "uuid",
  "userId": "uuid",
  "url": "http://...",
  "path": "/page",
  "data": { /* event-specific data */ }
}]
```

**Response:**
```json
{"success": true, "message": "Events tracked"}
```

### GET /api/stats
Retrieve all statistics

**Response:**
```json
{
  "overview": {
    "totalEvents": 100,
    "totalPageViews": 50,
    "totalClicks": 30,
    "totalSessions": 10,
    "totalUsers": 8
  },
  "last24h": { /* 24-hour metrics */ },
  "lastHour": { /* hourly metrics */ },
  "recentEvents": [ /* last 50 events */ ],
  "topPages": [ /* top 10 pages */ ],
  "scrollDepths": [ /* scroll metrics */ ],
  "sessions": [ /* last 20 sessions */ ]
}
```

### GET /dashboard
Serves the admin dashboard HTML

## 🔒 Security Notes

### Current Implementation
- ✅ In-memory storage (no database setup needed)
- ✅ CORS enabled for local development
- ✅ No authentication (for simplicity)
- ✅ Event size limits (10,000 events max)
- ✅ Passed CodeQL security scan

### Production Recommendations
1. **Add Authentication**: Protect the dashboard with login
2. **Use Database**: Replace in-memory storage with MongoDB, PostgreSQL, etc.
3. **Rate Limiting**: Prevent tracking endpoint abuse
4. **HTTPS**: Use SSL/TLS in production
5. **Data Privacy**: Implement GDPR compliance (opt-out, data deletion)
6. **API Keys**: Authenticate tracking requests
7. **Input Validation**: Validate all incoming data
8. **Restrict CORS**: Limit to specific domains

## 🐛 Troubleshooting

### Dashboard shows "Error loading statistics"
- Ensure the analytics server is running on port 3000
- Check server logs for errors
- Verify no firewall blocking port 3000

### Events not being tracked
- Open browser DevTools Console and check for errors
- Verify `analytics.js` is loaded (check Network tab)
- Check if Analytics object exists: `console.log(window.Analytics)`

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

## 📈 Performance

### Memory Usage
- Stores up to 10,000 events in memory
- Older events are automatically removed
- Each event is approximately 500-1000 bytes

### Network Efficiency
- Events are batched (10 per request or 5 seconds)
- Uses `sendBeacon` for reliable transmission
- Minimal overhead (<10KB per batch)

### Dashboard Performance
- Auto-refresh every 30 seconds
- Displays last 50 events
- Shows last 20 sessions
- Minimal CPU usage

## 🎯 Use Cases

### Monitor User Engagement
- See which lessons are most popular
- Track how far users scroll
- Identify drop-off points

### Understand User Behavior
- Session duration analysis
- Click patterns
- Navigation paths

### Track Site Performance
- Page load times (tracked in pageview data)
- Session counts over time
- Active users metrics

## 📚 Additional Resources

For more details, see:
- `README.md` - Complete documentation
- `analytics.js` - Client library source code
- `server.js` - Backend API documentation
- `dashboard.html` - Dashboard implementation

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for errors
3. Verify all dependencies are installed
4. Ensure ports 3000 and 8080 are available

---

**Happy Tracking! 📊**
