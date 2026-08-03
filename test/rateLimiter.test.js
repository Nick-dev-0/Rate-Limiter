const TokenBucketRateLimiter = require("../rateLimiter");

describe("checkTokenBucket", () => {
    test("allows a request when the bucket is full", () => {
        const limiter = new TokenBucketRateLimiter({ capacity: 10, refillRatePerSec: 2})
        const state = {'tokens': 10, 'lastRefill': 1000}

        const result = limiter.checkTokenBucket(state, 1000);

        expect(result.allowed).toBe(true);
        expect(result.tokens).toBe(9);
    })
    test("rejects a request when the bucket is empty", () => {
        const limiter = new TokenBucketRateLimiter({ capacity: 10, refillRatePerSec: 2 })
        const state = { tokens: 0, lastRefill: 1000}

        const result = limiter.checkTokenBucket(state, 1000)
        
        expect(result.allowed).toBe(false)
        expect(result.tokens).toBe(0)

    })  
    test("refills tokens based on elapsed time", () => {
        const limiter = new TokenBucketRateLimiter({ capacity: 10, refillRatePerSec: 2})
        const state = { tokens: 0, lastRefill: 1000}
        // 3 seconds later
        const result = limiter.checkTokenBucket(state, 4000) 

        expect(result.allowed).toBe(true)
        expect(result.tokens).toBe(5) // 3s * 2 rps = 6 tokens to be refilled, minus 1 spent. total of 5 now
    })
})