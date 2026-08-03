const express = require('express');
const TokenBucketRateLimiter = require('./rateLimiter')
const app = express();


const limiter = new TokenBucketRateLimiter({ capacity: 10, refillRatePerSec: 2})
app.use(limiter.middleware());

app.get('/', (req, res) => {
    return res.send("hello world")
})

app.listen(3000, () => {
      console.log("listening on http://localhost:3000");
})