const express = require('express');

const app = express();

let tokens = 10;
const capacity = 10;
const refillRatePerSec = 2;
let lastRefill = Date.now();

app.use((req, res, next) => {
    const now = Date.now();
    const elapsedSec = (now - lastRefill) / 1000;
    tokens = Math.min(capacity, tokens + elapsedSec * refillRatePerSec)
    lastRefill = now;

    if (tokens < 1) {
        return res.status(429).json({ error: "Too many requests"})
    }
    tokens -=1
    console.log(`tokens remaining: ${tokens.toFixed(2)}`)
    return next();
})
app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(3000, () => {
      console.log("listening on http://localhost:3000");
})