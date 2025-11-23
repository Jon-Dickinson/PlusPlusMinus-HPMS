/**
 * REMOVED: recompute-quality-index migration
 *
 * This file previously contained a migration script to recompute and
 * persist city qualityIndex values and write audit rows. It was removed
 * intentionally. Do NOT run this file.
 */

// recompute-quality-index migration removed on purpose. No-op file.
export function recomputeQualityIndexes() {
  throw new Error('recomputeQualityIndexes has been removed.');
}

export default recomputeQualityIndexes;
