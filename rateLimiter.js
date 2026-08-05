const MemoryStore = require("./stores/MemoryStore")

class TokenBucketRateLimiter {
    constructor({ capacity, refillRatePerSec, store = new MemoryStore() }) {
        this.capacity = capacity;
        this.refillRatePerSec = refillRatePerSec;
        this.store = store;
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
        return async (req, res, next) => {
            const key = req.ip;

            let state = await this.store.get(key);
            if (!state) {
                state = { 'tokens': this.capacity, 'lastRefill': Date.now() };
            }

            const result = this.checkTokenBucket(state, Date.now());
            await this.store.set(key, { 'tokens': result.tokens, 'lastRefill': result.lastRefill}  );
            
            res.setHeader("X-RateLimit-Limit", this.capacity);
            res.setHeader("X-RateLimit-Remaining", Math.floor(result.tokens))
            
            if (!result.allowed) {
                const retryAfterSec = Math.ceil((1 - result.tokens) / this.refillRatePerSec);
                res.setHeader("Retry-After", retryAfterSec)
                return res.status(429).json({ 'error': "Too many requests" })
            }
            return next();
        };
    }
}

module.exports = TokenBucketRateLimiter