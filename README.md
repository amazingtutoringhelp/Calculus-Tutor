# Calculus Tutor - Website Analytics System

A comprehensive website statistics tracking framework similar to Google Analytics, built with JavaScript.

## 📊 Features

- **Real-time Analytics Tracking**: Track page views, clicks, scrolls, and user sessions
- **Client-side Library**: Lightweight JavaScript library that auto-initializes
- **Backend API**: Node.js server to receive and store analytics data
- **Admin Dashboard**: Beautiful dashboard to visualize all statistics
- **Session Tracking**: Persistent user and session identification
- **Event Batching**: Efficient data transmission with automatic batching
- **In-memory Storage**: Fast data access with support for 10,000+ events

## 🚀 Quick Start

### Prerequisites

- Node.js (v12 or higher)
- A web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/amazingtutoringhelp/Calculus-Tutor.git
cd Calculus-Tutor
```

2. Start the analytics server:
```bash
node server.js
```

The server will start on `http://localhost:3000`

3. Open the main website in your browser:
```bash
# If using a local web server
python3 -m http.server 8000
# Or any other method to serve index.html
```

4. Access the analytics dashboard:
```
http://localhost:3000/dashboard
```

## 📁 Project Structure

```
Calculus-Tutor/
├── analytics.js       # Client-side tracking library
├── server.js          # Backend API server
├── dashboard.html     # Admin dashboard UI
├── index.html         # Main website (with analytics integrated)
├── index.js           # Main website JavaScript
├── package.json       # Node.js package configuration
└── README.md          # This file
```

## 🔧 How It Works

### Client-side Tracking (analytics.js)

The client library automatically tracks:
- **Page Views**: When a page loads
- **Clicks**: On buttons, links, and interactive elements
- **Scroll Depth**: User scroll behavior (25%, 50%, 75%, 90%, 100%)
- **Session Duration**: Time spent on site
- **Heartbeats**: Periodic updates every minute

Events are batched and sent to the server efficiently using:
- `navigator.sendBeacon()` for reliability during page unload
- `fetch()` as a fallback for older browsers

### Backend Server (server.js)

The server provides:
- `POST /api/track` - Endpoint to receive analytics events
- `GET /api/stats` - Endpoint to retrieve statistics
- `GET /dashboard` - Serves the admin dashboard
- In-memory storage for fast data access
- CORS support for cross-origin requests

### Admin Dashboard (dashboard.html)

Beautiful, real-time dashboard showing:
- **Overview Statistics**: Total events, page views, clicks, sessions, users
- **24-hour Metrics**: Activity in the last 24 hours
- **Top Pages**: Most visited pages with visual charts
- **Scroll Depth Analysis**: User engagement metrics
- **Recent Events**: Live stream of user activities
- **Active Sessions**: Current user sessions with details
- **Auto-refresh**: Updates every 30 seconds automatically

## 🎨 Customization

### Change Server Port

Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

Or set environment variable:
```bash
PORT=8080 node server.js
```

### Adjust Analytics Configuration

Edit `analytics.js`:
```javascript
const config = {
    endpoint: 'http://localhost:3000/api/track',  // Server URL
    sessionTimeout: 30 * 60 * 1000,               // Session timeout
    batchSize: 10,                                 // Events per batch
    batchTimeout: 5000                             // Batch send delay
};
```

### Track Custom Events

Use the public API:
```javascript
// Track custom event
Analytics.track('button_click', { 
    buttonName: 'Get Started',
    section: 'hero'
});

// Track page view manually
Analytics.trackPageView();
```

## 📊 Dashboard Features

### Real-time Statistics
- Total events, page views, clicks
- User and session counts
- Last 24-hour activity metrics

### Visual Charts
- Top pages by views (bar chart)
- Scroll depth analysis (bar chart)
- Color-coded event types

### Recent Activity Feed
- Live stream of user events
- Event type indicators
- Timestamps and details

### Session Management
- View active and recent sessions
- Session duration tracking
- Events per session

## 🔒 Security Considerations

The current implementation uses in-memory storage, which means:
- ✅ Fast and simple
- ⚠️ Data is lost on server restart
- ⚠️ Not suitable for production with high traffic

For production use, consider:
1. **Persistent Storage**: Add database (MongoDB, PostgreSQL, etc.)
2. **Authentication**: Secure the dashboard with login
3. **Rate Limiting**: Prevent abuse of tracking endpoints
4. **Data Privacy**: Implement GDPR compliance features
5. **API Keys**: Authenticate tracking requests

## 🚀 Deployment

### Local Development
```bash
node server.js
```

### Production (Example with PM2)
```bash
npm install -g pm2
pm2 start server.js --name analytics
pm2 save
pm2 startup
```

### Environment Variables
```bash
export PORT=3000
export NODE_ENV=production
node server.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is part of the Amazing Tutoring Help educational platform.

## 🆘 Support

For issues or questions:
1. Check the dashboard at `http://localhost:3000/dashboard`
2. Review server logs for errors
3. Ensure port 3000 is not in use by another application

## 🎯 Future Enhancements

- [ ] Persistent database storage
- [ ] User authentication for dashboard
- [ ] Export statistics to CSV/JSON
- [ ] Real-time WebSocket updates
- [ ] Geographic location tracking
- [ ] Custom event filtering
- [ ] Multi-site support
- [ ] A/B testing capabilities
- [ ] Heatmap visualization
- [ ] Funnel analysis
