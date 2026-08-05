class MemoryStore {
    constructor() {
        this.data = new Map();
    }

    async get(key) {
        return this.data.get(key);
    }

    async set(key, state) {
        this.data.set(key,state);
    }
}

module.exports = MemoryStore;