/**
 * Website Analytics Tracking Library
 * Similar to Google Analytics - tracks page views, events, and user interactions
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        endpoint: '/api/track',
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        batchSize: 10,
        batchTimeout: 5000 // 5 seconds
    };

    // Analytics state
    const analytics = {
        sessionId: null,
        userId: null,
        queue: [],
        pageLoadTime: Date.now(),
        scrollDepthTracked: new Set(),
        eventsTracked: []
    };

    /**
     * Initialize session
     */
    function initSession() {
        // Get or create session ID
        let sessionId = sessionStorage.getItem('analytics_session_id');
        let sessionStart = sessionStorage.getItem('analytics_session_start');
        
        const now = Date.now();
        
        if (!sessionId || !sessionStart || (now - parseInt(sessionStart)) > config.sessionTimeout) {
            sessionId = generateId();
            sessionStorage.setItem('analytics_session_id', sessionId);
            sessionStorage.setItem('analytics_session_start', now.toString());
        }
        
        analytics.sessionId = sessionId;
        
        // Get or create user ID (persistent across sessions)
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = generateId();
            localStorage.setItem('analytics_user_id', userId);
        }
        analytics.userId = userId;
    }

    /**
     * Generate unique ID
     */
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Track an event
     */
    function track(eventType, eventData = {}) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            sessionId: analytics.sessionId,
            userId: analytics.userId,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            data: eventData
        };

        analytics.queue.push(event);
        analytics.eventsTracked.push(event);

        // Send immediately or batch
        if (analytics.queue.length >= config.batchSize) {
            sendBatch();
        } else {
            scheduleBatchSend();
        }
    }

    /**
     * Schedule batch send
     */
    let batchTimer = null;
    function scheduleBatchSend() {
        if (batchTimer) return;
        batchTimer = setTimeout(() => {
            sendBatch();
            batchTimer = null;
        }, config.batchTimeout);
    }

    /**
     * Send batch of events to server
     */
    function sendBatch() {
        if (analytics.queue.length === 0) return;

        const batch = analytics.queue.splice(0, analytics.queue.length);
        
        // Use sendBeacon if available (better for page unload)
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(batch)], { type: 'application/json' });
            navigator.sendBeacon(config.endpoint, blob);
        } else {
            // Fallback to fetch
            fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(batch),
                keepalive: true
            }).catch(err => {
                console.error('Analytics tracking error:', err);
            });
        }
    }

    /**
     * Track page view
     */
    function trackPageView() {
        track('pageview', {
            title: document.title,
            loadTime: Date.now() - analytics.pageLoadTime
        });
    }

    /**
     * Track click event
     */
    function trackClick(element, data = {}) {
        track('click', {
            element: element.tagName,
            text: element.textContent?.substring(0, 100),
            id: element.id,
            className: element.className,
            ...data
        });
    }

    /**
     * Track scroll depth
     */
    function trackScrollDepth() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        const milestones = [25, 50, 75, 90, 100];
        for (const milestone of milestones) {
            if (scrollPercent >= milestone && !analytics.scrollDepthTracked.has(milestone)) {
                analytics.scrollDepthTracked.add(milestone);
                track('scroll', { depth: milestone });
            }
        }
    }

    /**
     * Track session duration on page unload
     */
    function trackSessionEnd() {
        const sessionDuration = Date.now() - analytics.pageLoadTime;
        track('session_end', {
            duration: sessionDuration,
            eventsCount: analytics.eventsTracked.length
        });
        sendBatch(); // Force send remaining events
    }

    /**
     * Initialize analytics
     */
    function init() {
        initSession();
        trackPageView();

        // Track scroll depth
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(trackScrollDepth, 100);
        }, { passive: true });

        // Track clicks on interactive elements
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
                target.closest('a') || target.closest('button') ||
                target.classList.contains('lesson-card')) {
                trackClick(target);
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', trackSessionEnd);
        window.addEventListener('pagehide', trackSessionEnd);

        // Periodic heartbeat (every minute)
        setInterval(() => {
            track('heartbeat', { duration: Date.now() - analytics.pageLoadTime });
        }, 60000);
    }

    // Public API
    window.Analytics = {
        track: track,
        trackPageView: trackPageView,
        trackClick: trackClick,
        init: init,
        getSession: () => ({
            sessionId: analytics.sessionId,
            userId: analytics.userId,
            eventsCount: analytics.eventsTracked.length
        })
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
