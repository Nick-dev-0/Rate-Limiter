const express = require('express');

const app = express();

function checkTokenBucket(state, now, capacity, refillRatePerSec) {
    const elapsedSec = (now - state.lastRefill) / 1000;
    const refilled = Math.min(capacity, state.tokens + elapsedSec * refillRatePerSec)

    if (refilled < 1) {
        return {'allowed': false, 'tokens': refilled, 'lastRefill': now};
    }
    return {"allowed": true, 'tokens': refilled - 1, 'lastRefill': now};
}


function createRateLimiter({ capacity, refillRatePerSec }) {
    const buckets = new Map();

    return function rateLimitMiddleware(req, res, next) {
        const key = req.ip;

        let state = buckets.get(key);
        if (!state) {
            state = { 'tokens': capacity, 'lastRefill': Date.now() };
        }

        const result = checkTokenBucket(state, Date.now(), capacity, refillRatePerSec);
        buckets.set(key, { 'tokens': result.tokens, 'lastRefill': result.lastRefill })
        console.log(key, { 'tokens': result.tokens, 'lastRefill': result.lastRefill })
        if (!result.allowed) {
            return res.status(429).json({ error: "Too many requests" });
        }
        return next()
    };
}

app.use(createRateLimiter({capacity: 10, refillRatePerSec: 2}))

app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(3000, () => {
      console.log("listening on http://localhost:3000");
})