import type { HeatSensitivity } from "./types.js";

/**
 * Capas Frías — physical sizing helpers.
 *
 * A NanoFreeze cold layer is assembled from **franjas** (strips): the XS cut
 * of the commercial pallet layer. From the 2026 one-pagers:
 *
 *   - Pallet layer: 360 cm long × 25 cm wide, divisible into 24 XS strips.
 *   - One franja (XS): 15 cm long × 25 cm wide.
 *
 * A prospect outside NanoFreeze doesn't know how many franjas or capas their
 * boxes need — but they DO know their box length and how heat-sensitive their
 * product is. These helpers derive the technical quantities from those two
 * facts; the guided builder UI uses them, and a manual-override toggle keeps
 * the raw fields reachable.
 *
 * Pure: no IO, no globals. Same input → same output.
 */

/** Length of one franja (XS strip), cm. 360 cm pallet ÷ 24 strips. */
export const CAPA_STRIP_LENGTH_CM = 15;

/** Width of every capa cut, cm (the pallet layer's width). */
export const CAPA_STRIP_WIDTH_CM = 25;

/** Full commercial pallet layer length, cm. */
export const CAPA_PALLET_LENGTH_CM = 360;

/** Cold layers per box by product heat sensitivity: a merely heat-sensitive
 *  product takes one layer; a highly heat-sensitive one takes two. */
export const CAPA_LAYERS_PER_SENSITIVITY: Record<HeatSensitivity, number> = {
  sensible: 1,
  "altamente-sensible": 2,
};

/**
 * Franjas needed so one capa spans the full box length. Rounds UP — a partial
 * franja still has to be bought — with a floor of one whole franja for any
 * positive length. Non-finite or non-positive lengths yield 0 ("no box yet").
 */
export function stripsPerLayerForBoxLength(boxLengthCm: number): number {
  if (!Number.isFinite(boxLengthCm) || boxLengthCm <= 0) return 0;
  return Math.max(1, Math.ceil(boxLengthCm / CAPA_STRIP_LENGTH_CM));
}

/** Cold layers per box for a product's heat sensitivity. */
export function layersForSensitivity(sensitivity: HeatSensitivity): number {
  return CAPA_LAYERS_PER_SENSITIVITY[sensitivity];
}
