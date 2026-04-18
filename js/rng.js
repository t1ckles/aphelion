// ============================================
//  APHELION — Seeded Random Number Generator
//  rng.js
//
//  Everything in Aphelion is deterministic.
//  Same seed = same galaxy, every time.
//  This is the foundation all other systems
//  are built on.
// ============================================

class RNG {

  constructor(seed) {
    // Convert whatever seed we receive into a number.
    // If someone passes "4471-KETH-NULL" we turn it
    // into a consistent number first.
    this.seed = RNG.hashSeed(seed);
  }

  // ── Internal engine ──────────────────────────────
  // This is a "Mulberry32" generator — a well-tested
  // algorithm that produces high-quality random numbers
  // from a seed. You don't need to understand the math.
  // You need to know: same seed = same sequence, always.

  next() {
    this.seed |= 0;
    this.seed = this.seed + 0x6D2B79F5 | 0;
    let t = Math.imul(this.seed ^ this.seed >>> 15, 1 | this.seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // ── Public methods ───────────────────────────────
  // These are what the rest of Aphelion uses.
  // The internal engine above never gets called directly.

  // Returns a float between 0 and 1.
  // e.g.  rng.float() → 0.7341...
  float() {
    return this.next();
  }

  // Returns a whole number between min and max (inclusive).
  // e.g.  rng.int(1, 10) → 7
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Picks one item from an array.
  // e.g.  rng.pick(['Voss', 'Calder', 'Korr']) → 'Calder'
  pick(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  // Picks one item from an array using weights.
  // Higher weight = more likely to be chosen.
  // e.g.  rng.weighted(['Common','Rare'], [90, 10])
  weighted(array, weights) {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let threshold = this.next() * total;
    for (let i = 0; i < array.length; i++) {
      threshold -= weights[i];
      if (threshold <= 0) return array[i];
    }
    return array[array.length - 1];
  }

  // Returns true or false based on a probability (0–1).
  // e.g.  rng.chance(0.3) → true 30% of the time
  chance(probability) {
    return this.next() < probability;
  }

  // Shuffles an array. Returns a new array, doesn't
  // modify the original.
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Seed derivation ──────────────────────────────
  // This is how child systems get their own RNG
  // without breaking the parent's sequence.
  //
  // Example: the galaxy has a seed. Each quadrant
  // derives its own seed from the galaxy seed + its
  // index. Each star derives from its quadrant seed.
  // They're all connected but independent.

  derive(identifier) {
    const combined = String(this.seed) + String(identifier);
    return new RNG(RNG.hashSeed(combined));
  }

  // ── Seed hashing ────────────────────────────────
  // Turns any string or number into a consistent
  // numeric seed. "4471-KETH-NULL" always becomes
  // the same number, so the galaxy is always the same.

  static hashSeed(input) {
    const str = String(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash) || 1; // Never return 0
  }

}