class TokenBucketRateLimiter {
    constructor({ capacity, refillRatePerSec }) {
        this.capacity = capacity;
        this.refillRatePerSec = refillRatePerSec;
        this.buckets = new Map();
    }

    checkTokenBucket(state, now) {
        const elapsedSec = (now - state.lastRefill) / 1000;
        const refilled = Math.min(this.capacity, state.tokens + elapsedSec * this.refillRatePerSec)

        if (refilled < 1) {
            return {'allowed': false, 'tokens': refilled, 'lastRefill': now};
        }
        return {"allowed": true, 'tokens': refilled - 1, 'lastRefill': now};
    }

    middleware() {
        return (req, res, next) => {
            const key = req.ip;

            let state = this.buckets.get(key);
            if (!state) {
                state = { 'tokens': this.capacity, 'lastRefill': Date.now() };
            }

            const result = this.checkTokenBucket(state, Date.now());
            this.buckets.set(key, { 'tokens': result.tokens, 'lastRefill': result.lastRefill}  );
            console.log(key, { 'tokens': result.tokens, 'lastRefill': result.lastRefill})
            if (!result.allowed) {
                return res.status(429).json({ 'error': "Too many requests" })
            }
            return next();
        };
    }
}

module.exports = TokenBucketRateLimiter