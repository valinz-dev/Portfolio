// Seeded Random Number Generator (Mulberry32)
class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.state = seed;
    }

    reset() {
        this.state = this.seed;
    }

    setSeed(seed) {
        this.seed = seed;
        this.state = seed;
    }

    // Returns a random number between 0 and 1
    next() {
        let t = this.state += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // Returns a random integer between min (inclusive) and max (exclusive)
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }

    // Returns a random float between min and max
    nextFloat(min, max) {
        return this.next() * (max - min) + min;
    }
}

// Direction constants
const Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// Direction vectors
const DirectionVector = {
    [Direction.UP]: { x: 0, y: -1 },
    [Direction.RIGHT]: { x: 1, y: 0 },
    [Direction.DOWN]: { x: 0, y: 1 },
    [Direction.LEFT]: { x: -1, y: 0 }
};

// Get opposite direction
function getOppositeDirection(dir) {
    return (dir + 2) % 4;
}

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Linear interpolation
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Map a value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Deep clone an object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Color utilities
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function lerpColor(color1, color2, t) {
    const r = lerp(color1.r, color2.r, t);
    const g = lerp(color1.g, color2.g, t);
    const b = lerp(color1.b, color2.b, t);
    return { r, g, b };
}

// Get a color based on a value (negative = red, positive = green)
function getWeightColor(weight, maxWeight = 2) {
    const normalizedWeight = clamp(weight / maxWeight, -1, 1);
    if (normalizedWeight >= 0) {
        // Green for positive
        const intensity = Math.floor(normalizedWeight * 200 + 55);
        return `rgb(50, ${intensity}, 80)`;
    } else {
        // Red for negative
        const intensity = Math.floor(-normalizedWeight * 200 + 55);
        return `rgb(${intensity}, 50, 80)`;
    }
}

// Get activation color (darker to brighter based on activation)
function getActivationColor(activation, baseColor = { r: 78, g: 204, b: 163 }) {
    const normalizedActivation = clamp(activation, 0, 1);
    const brightness = 0.2 + normalizedActivation * 0.8;
    return rgbToHex(
        baseColor.r * brightness,
        baseColor.g * brightness,
        baseColor.b * brightness
    );
}
