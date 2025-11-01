export function parseSize(sizeStr: string) {
  // expected format like "7 × 5 – 30 blocks" or "3 x 3 - 9 blocks"
  if (!sizeStr || typeof sizeStr !== 'string') {
    return { x: 1, y: 1, blocks: 1 };
  }

  // normalize common unicode and ASCII variants
  const normalized = sizeStr.replace(/×/g, 'x').replace(/–|—/g, '-');
  const match = normalized.match(/(\d+)\s*x\s*(\d+).*?-\s*(\d+)/i);

  if (match) {
    const x = parseInt(match[1], 10) || 1;
    const y = parseInt(match[2], 10) || 1;
    const blocks = parseInt(match[3], 10) || x * y;
    return { x, y, blocks };
  }

  // fallback: try to extract first two numbers
  const numbers = (normalized.match(/\d+/g) || []).map((v) => parseInt(v, 10));
  if (numbers.length >= 2) {
    const x = numbers[0] || 1;
    const y = numbers[1] || 1;
    const blocks = numbers[2] || x * y || 1;
    return { x, y, blocks };
  }

  return { x: 1, y: 1, blocks: 1 };
}
