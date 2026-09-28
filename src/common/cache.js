class TtlCache {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.values = new Map();
  }

  get(key) {
    const entry = this.values.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.values.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.values.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

module.exports = TtlCache;
