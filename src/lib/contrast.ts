export type RGB = {
    r: number;
    g: number;
    b: number;
};

/**
 * Convert a HEX color to RGB.
 *
 * Supports:
 * - #RGB
 * - #RRGGBB
 */
export function hexToRgb(hex: string): RGB | null {
    const normalized = hex.replace("#", "").trim();

    if (!/^[0-9A-Fa-f]+$/.test(normalized)) {
        return null;
    }

    let value = normalized;

    // Expand shorthand HEX: #RGB → #RRGGBB
    if (value.length === 3) {
        value = value
            .split("")
            .map((char) => char + char)
            .join("");
    }

    if (value.length !== 6) {
        return null;
    }

    const numericValue = Number.parseInt(value, 16);

    return {
        r: (numericValue >> 16) & 255,
        g: (numericValue >> 8) & 255,
        b: numericValue & 255,
    };
}