import sharp from 'sharp';
import path from 'path';

const logoPath = './public/logo.png';
const outputDir = './public';

async function createFavicons() {
  const image = sharp(logoPath);
  const metadata = await image.metadata();
  console.log('Original image size:', metadata.width, 'x', metadata.height);
  
  // Create different favicon sizes
  const sizes = [16, 32, 48, 64, 180, 192, 512];
  
  for (const size of sizes) {
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, `favicon-${size}.png`));
    console.log(`Created favicon-${size}.png`);
  }
  
  // Create apple-touch-icon
  await sharp(logoPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');
  
  // Create favicon.ico (PNG format, browsers accept it)
  await sharp(logoPath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(outputDir, 'favicon.ico'));
  console.log('Created favicon.ico');
  
  console.log('All favicons created successfully!');
}

createFavicons().catch(console.error);
