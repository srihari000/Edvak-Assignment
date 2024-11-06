const express = require('express');
const app = express();
const PORT = 5000;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_USER = 100;  // Max requests per user per minute
const MAX_REQUESTS_PER_IP = 200;    // Max requests per IP per minute

const requestData = new Map(); // For large scale (distributed systems) we can use redis to store the request data 

// Middleware for rate limiting
function rateLimiter(req, res, next) {
    const user = req.headers['user-id'];
    const ip = req.ip;

    if (!user || !ip) {
        return res.status(400).json({ error: 'User ID or IP missing' });
    }

    const currentTime = Date.now();
    // Rate limit by user and IP separately
    if (isRateLimited(requestData, `user-${user}`, currentTime, MAX_REQUESTS_PER_USER)) {
        return res.status(429).json({ error: `Too Many Requests for user ${user}` });
    }
    if (isRateLimited(requestData, `ip-${ip}`, currentTime, MAX_REQUESTS_PER_IP)) {
        return res.status(429).json({ error: `Too Many Requests for IP ${ip}` });
    }

    next();
}

// Helper function to check if a request should be rate limited
function isRateLimited(dataStore, key, currentTime, maxRequests) {
    if (!dataStore.has(key)) {
        dataStore.set(key, []);
    }

    const timestamps = dataStore.get(key);

    // Remove timestamps that are outside the rate limit window
    while (timestamps.length && (currentTime - timestamps[0]) > RATE_LIMIT_WINDOW_MS) {
        timestamps.shift();
    }

    // Check if limit is exceeded
    if (timestamps.length >= maxRequests) {
        return true;
    }

    // Record new request
    timestamps.push(currentTime);

    return false;
}

// Using Custom rateLimiter middleware for all requests
app.use(rateLimiter);

app.get('/', (req, res) => {
    res.send('Welcome! Your request is within the rate limit.');
});

app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;