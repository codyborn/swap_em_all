import { test, expect } from '@playwright/test';

test.describe('Orange Border Filter', () => {
  test('should remove orange color #ff7f27 from sprites', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('Replaced') || text.includes('orange')) {
        console.log('[BROWSER]', text);
      }
    });

    // Navigate to the game
    await page.goto('http://localhost:3000/game/test');

    console.log('Navigating to /game/test...');

    // Wait for Phaser to initialize
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('Canvas found');

    // Wait for title screen
    await page.waitForTimeout(2000);

    // Press Enter to start the game
    console.log('Pressing Enter to start game...');
    await page.keyboard.press('Enter');

    // Wait for overworld scene to load
    await page.waitForTimeout(2000);

    // Take a screenshot for reference
    await page.screenshot({
      path: 'tests/screenshots/orange-filter-check.png',
      fullPage: true
    });

    // Check for orange pixels in the canvas
    const hasOrangePixels = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for next animation frame to ensure we capture during rendering
        requestAnimationFrame(() => {
          const canvas = document.querySelector('canvas');
          if (!canvas) {
            resolve({ found: false, error: 'No canvas found' });
            return;
          }

          // For WebGL canvases, we need to create a temporary 2D canvas
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const ctx = tempCanvas.getContext('2d');
          if (!ctx) {
            resolve({ found: false, error: 'No 2D context' });
            return;
          }

          try {
            // Draw the WebGL canvas onto the 2D canvas
            ctx.drawImage(canvas, 0, 0);
            const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;

        let orangePixelCount = 0;
        const orangePixels: Array<{x: number, y: number, r: number, g: number, b: number}> = [];
        const colorCounts = new Map<string, number>();

        // Check for orange pixels (RGB 255, 127, 39 with tolerance)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip fully transparent pixels
          if (a < 10) continue;

          // Count all non-transparent colors
          const colorKey = `${r},${g},${b}`;
          colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);

          // Check if pixel matches orange color (#ff7f27)
          // Broader tolerance: R: 200-255, G: 100-150, B: 20-60
          if (r >= 200 && g >= 100 && g <= 150 && b >= 20 && b <= 60 && r > g && r > b) {
            orangePixelCount++;

            // Store first 20 orange pixels for debugging
            if (orangePixels.length < 20) {
              const pixelIndex = i / 4;
              const x = pixelIndex % tempCanvas.width;
              const y = Math.floor(pixelIndex / tempCanvas.width);
              orangePixels.push({ x, y, r, g, b });
            }
          }
        }

        // Get top 10 most common colors
        const topColors = Array.from(colorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([color, count]) => ({
            color,
            count,
            percentage: ((count / (data.length / 4)) * 100).toFixed(2)
          }));

            resolve({
              found: orangePixelCount > 0,
              count: orangePixelCount,
              totalPixels: data.length / 4,
              percentage: ((orangePixelCount / (data.length / 4)) * 100).toFixed(4),
              samples: orangePixels,
              canvasSize: { width: tempCanvas.width, height: tempCanvas.height },
              topColors
            });
          } catch (e) {
            resolve({ found: false, error: (e as Error).message });
          }
        });
      });
    });

    console.log('\n========== ORANGE PIXEL CHECK ==========');
    console.log('Canvas size:', hasOrangePixels.canvasSize);
    console.log('Total pixels:', hasOrangePixels.totalPixels);
    console.log('Orange pixels found:', hasOrangePixels.count);
    console.log('Percentage:', hasOrangePixels.percentage + '%');

    if (hasOrangePixels.topColors && hasOrangePixels.topColors.length > 0) {
      console.log('\nTop 10 most common colors:');
      hasOrangePixels.topColors.forEach((colorInfo: any, i: number) => {
        const [r, g, b] = colorInfo.color.split(',').map(Number);
        const isOrange = r >= 200 && g >= 100 && g <= 150 && b >= 20 && b <= 60 && r > g && r > b;
        const flag = isOrange ? ' <- ORANGE!' : '';
        console.log(`  ${i + 1}. RGB(${colorInfo.color}) - ${colorInfo.count} pixels (${colorInfo.percentage}%)${flag}`);
      });
    }

    if (hasOrangePixels.samples && hasOrangePixels.samples.length > 0) {
      console.log('\nSample orange pixels (first 20):');
      hasOrangePixels.samples.forEach((pixel, i) => {
        console.log(`  ${i + 1}. Position (${pixel.x}, ${pixel.y}) - RGB(${pixel.r}, ${pixel.g}, ${pixel.b})`);
      });
    }
    console.log('=========================================\n');

    if (hasOrangePixels.error) {
      console.error('Error checking pixels:', hasOrangePixels.error);
    }

    // The test passes if NO orange pixels are found
    expect(hasOrangePixels.found).toBe(false);
  });
});
