const express = require('express');

const app = express();

let tokens = 10;
const capacity = 10;
const refillRatePerSec = 2;
let lastRefill = Date.now();

function checkTokenBucket(state, now, capacity, refillRatePerSec) {
    const elapsedSec = (now - state.lastRefill)/ 1000;
    const refilled = Math.min(capacity, state.tokens + elapsedSec * refillRatePerSec)

    if (refilled < 1) {
        return {allowed: false, tokens: refilled, lastRefill: now};
    }
    return {allowed: true, tokens: refilled - 1, lastRefill: now};
}
app.use((req, res, next) => {
    const result = checkTokenBucket(
        {tokens, lastRefill},
        Date.now(),
        capacity,
        refillRatePerSec
    );

    tokens = result.tokens;
    lastRefill = result.lastRefill;

    if (!result.allowed) {
        return res.status(429).json({ error: "Too many requests" });
    }
    
    return next();
})
app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(3000, () => {
      console.log("listening on http://localhost:3000");
})