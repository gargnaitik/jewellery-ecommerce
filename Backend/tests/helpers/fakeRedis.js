// Minimal in-memory stand-in for the ioredis commands the app uses.
// TTLs are recorded but not enforced — tests assert on them directly.
const createFakeRedis = () => {
    const store = new Map();
    const ttls = new Map();

    return {
        store,
        ttls,
        async get(key) { return store.has(key) ? store.get(key) : null; },
        async set(key, value) { store.set(key, String(value)); return 'OK'; },
        async setex(key, seconds, value) {
            store.set(key, String(value));
            ttls.set(key, seconds);
            return 'OK';
        },
        async del(...keys) {
            let removed = 0;
            for (const key of keys) {
                if (store.delete(key)) removed += 1;
                ttls.delete(key);
            }
            return removed;
        },
        async incr(key) {
            const next = (parseInt(store.get(key), 10) || 0) + 1;
            store.set(key, String(next));
            return next;
        },
        async expire(key, seconds) { ttls.set(key, seconds); return 1; },
        async ttl(key) { return ttls.has(key) ? ttls.get(key) : -1; },
        async ping() { return 'PONG'; },
        on() {},
        reset() { store.clear(); ttls.clear(); },
    };
};

module.exports = { createFakeRedis };
