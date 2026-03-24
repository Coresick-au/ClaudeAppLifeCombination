/**
 * Spiral timeline geometry utilities.
 * Birth at centre, each year radiates outward as a ring.
 */

export interface SpiralPoint {
  x: number;
  y: number;
  angle: number;
  radius: number;
  year: number;
}

/**
 * Calculate a point on an Archimedean spiral.
 * @param centreX - centre X of the canvas
 * @param centreY - centre Y of the canvas
 * @param yearIndex - which year (0 = birth year)
 * @param monthOffset - 0-11 for position within the year
 * @param spacing - pixels between each ring
 * @param birthYear - the actual birth year
 */
export function getSpiralPoint(
  centreX: number,
  centreY: number,
  yearIndex: number,
  monthOffset: number,
  spacing: number,
  birthYear: number,
): SpiralPoint {
  const totalMonths = yearIndex * 12 + monthOffset;
  const angle = (totalMonths / 12) * 2 * Math.PI;
  const radius = spacing * (totalMonths / 12);

  return {
    x: centreX + radius * Math.cos(angle),
    y: centreY + radius * Math.sin(angle),
    angle,
    radius,
    year: birthYear + yearIndex,
  };
}
