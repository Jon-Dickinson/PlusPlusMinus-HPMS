/// <reference types="vitest" />
import { describe, expect, it } from 'vitest';
import { CityGridGenerator } from '../../src/services/city-grid-generator';

describe('CityGridGenerator.calculateQualityIndexFromGrid', () => {
  const generator = new CityGridGenerator();

  it('returns 15 for an empty grid (no buildings)', () => {
    const emptyGrid: number[][] = Array.from({ length: 100 }, () => []);
    const q = generator.calculateQualityIndexFromGrid(emptyGrid);
    expect(q).toBe(15);
  });

  it('returns a number in range 0..100 for a grid with buildings', () => {
    // Make a grid with multiple residential buildings (id 7) which yields high population
    const grid: number[][] = Array.from({ length: 100 }, (_, i) => (i < 6 ? [7] : []));
    const q = generator.calculateQualityIndexFromGrid(grid as number[][]);
    expect(typeof q).toBe('number');
    expect(q).toBeGreaterThanOrEqual(0);
    expect(q).toBeLessThanOrEqual(100);
  });
});
