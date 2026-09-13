import { hexToRgb, srgbChannelToLinear, type RGB } from "@/lib/contrast";

export type ColorVisionMode =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia";

type ColorVisionMatrix = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

const MAX_RGB_CHANNEL = 255;
const LINEAR_RGB_THRESHOLD = 0.0031308;

/**
 * Full-severity matrices from the Machado, Oliveira, and Fernandes (2009)
 * physiologically based model. This is an approximate interface-preview aid,
 * not a medical diagnostic model or an exact representation of any individual's vision.
 */
const COLOR_VISION_MATRICES: Record<
  Exclude<ColorVisionMode, "normal">,
  ColorVisionMatrix
> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

function clampChannel(channel: number): number {
  if (!Number.isFinite(channel)) {
    return 0;
  }

  return Math.min(MAX_RGB_CHANNEL, Math.max(0, Math.round(channel)));
}

function normalizeRgb({ r, g, b }: RGB): RGB {
  return {
    r: clampChannel(r),
    g: clampChannel(g),
    b: clampChannel(b),
  };
}

function linearChannelToSrgb(channel: number): number {
  const clampedChannel = Math.min(1, Math.max(0, channel));

  return clampedChannel <= LINEAR_RGB_THRESHOLD
    ? clampedChannel * 12.92
    : 1.055 * clampedChannel ** (1 / 2.4) - 0.055;
}

function applyMatrix(
  [red, green, blue]: readonly [number, number, number],
  matrix: ColorVisionMatrix,
): [number, number, number] {
  return [
    matrix[0][0] * red + matrix[0][1] * green + matrix[0][2] * blue,
    matrix[1][0] * red + matrix[1][1] * green + matrix[1][2] * blue,
    matrix[2][0] * red + matrix[2][1] * green + matrix[2][2] * blue,
  ];
}

/** Simulates a color-vision mode and returns finite, clamped 8-bit RGB channels. */
export function simulateColorVision(rgb: RGB, mode: ColorVisionMode): RGB {
  const source = normalizeRgb(rgb);

  if (mode === "normal") {
    return source;
  }

  const linearRgb = [
    srgbChannelToLinear(source.r / MAX_RGB_CHANNEL),
    srgbChannelToLinear(source.g / MAX_RGB_CHANNEL),
    srgbChannelToLinear(source.b / MAX_RGB_CHANNEL),
  ] as const;
  const transformedRgb = applyMatrix(linearRgb, COLOR_VISION_MATRICES[mode]);

  return {
    r: clampChannel(linearChannelToSrgb(transformedRgb[0]) * MAX_RGB_CHANNEL),
    g: clampChannel(linearChannelToSrgb(transformedRgb[1]) * MAX_RGB_CHANNEL),
    b: clampChannel(linearChannelToSrgb(transformedRgb[2]) * MAX_RGB_CHANNEL),
  };
}

/** Converts 8-bit RGB channels to an uppercase, six-digit hexadecimal color. */
export function rgbToHex(rgb: RGB): string {
  const { r, g, b } = normalizeRgb(rgb);

  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

/** Simulates a valid hexadecimal color, returning null when the input cannot be parsed. */
export function simulateHexColor(
  hex: string,
  mode: ColorVisionMode,
): string | null {
  const rgb = hexToRgb(hex);

  return rgb === null ? null : rgbToHex(simulateColorVision(rgb, mode));
}
