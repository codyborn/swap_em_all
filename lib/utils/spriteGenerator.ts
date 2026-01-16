// Utility to generate simple colored sprites programmatically
// This creates base64 data URLs that can be used as temporary sprites

export function generateTokenSprite(
  symbol: string,
  color: string,
  size: number = 32
): string {
  const canvas = typeof document !== 'undefined'
    ? document.createElement('canvas')
    : null;

  if (!canvas) return '';

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Create simple pixel art style sprite
  ctx.fillStyle = color;

  // Draw body (circle or square based on symbol)
  if (symbol === 'WETH' || symbol === 'cbETH') {
    // Diamond shape for ETH
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size, size / 2);
    ctx.lineTo(size / 2, size);
    ctx.lineTo(0, size / 2);
    ctx.closePath();
    ctx.fill();
  } else if (symbol === 'USDC' || symbol === 'DAI' || symbol === 'USDbC') {
    // Circle for stablecoins
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Square for others
    ctx.fillRect(2, 2, size - 4, size - 4);
  }

  // Add symbol text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol.slice(0, 4), size / 2, size / 2);

  return canvas.toDataURL();
}

export const TOKEN_COLORS: Record<string, string> = {
  WETH: '#627EEA',
  USDC: '#2775CA',
  DAI: '#F4B731',
  USDbC: '#0052FF',
  cbETH: '#1652F0',
  PEPE: '#4AAF4A',
  DEGEN: '#A36EFF',
  TOSHI: '#FF6B9D',
  BRETT: '#FFD700',
  MFER: '#FF4500',
};

export function generatePlayerSprite(size: number = 16): string {
  const canvas = typeof document !== 'undefined'
    ? document.createElement('canvas')
    : null;

  if (!canvas) return '';

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Simple player sprite - red cap, blue body
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(4, 2, 8, 4); // Hat

  ctx.fillStyle = '#FFE0BD';
  ctx.fillRect(4, 6, 8, 4); // Head

  ctx.fillStyle = '#0000FF';
  ctx.fillRect(4, 10, 8, 4); // Body

  ctx.fillStyle = '#000080';
  ctx.fillRect(2, 14, 4, 2); // Left leg
  ctx.fillRect(10, 14, 4, 2); // Right leg

  return canvas.toDataURL();
}

export function generateNPCSprite(type: 'professor' | 'clerk' | 'trader', size: number = 16): string {
  const canvas = typeof document !== 'undefined'
    ? document.createElement('canvas')
    : null;

  if (!canvas) return '';

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  switch (type) {
    case 'professor':
      // White coat professor
      ctx.fillStyle = '#808080';
      ctx.fillRect(4, 2, 8, 4); // Hair
      ctx.fillStyle = '#FFE0BD';
      ctx.fillRect(4, 6, 8, 4); // Head
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(4, 10, 8, 6); // White coat
      break;

    case 'clerk':
      // Green apron clerk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(4, 2, 8, 4); // Hair
      ctx.fillStyle = '#FFE0BD';
      ctx.fillRect(4, 6, 8, 4); // Head
      ctx.fillStyle = '#228B22';
      ctx.fillRect(4, 10, 8, 6); // Green apron
      break;

    case 'trader':
      // Orange shirt trader
      ctx.fillStyle = '#000000';
      ctx.fillRect(4, 2, 8, 4); // Hair
      ctx.fillStyle = '#FFE0BD';
      ctx.fillRect(4, 6, 8, 4); // Head
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(4, 10, 8, 6); // Orange shirt
      break;
  }

  return canvas.toDataURL();
}
