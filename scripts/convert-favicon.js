const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  try {
    const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/default-favicon.min.svg'));
    
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/default-favicon.png'));
    
    console.log('SVG 已成功转换为 PNG');
  } catch (error) {
    console.error('转换过程中出错:', error);
  }
}

convertSvgToPng(); 