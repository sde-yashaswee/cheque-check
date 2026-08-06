/**
 * Test script for Cheque OCR API
 * 
 * Usage: node scripts/test-ocr.js <IMAGE_URL>
 * Note: Ensure your local server is running (npm run dev) before running this script.
 */

const targetUrl = 'http://localhost:3000/api/ocr/cheque';
const imageUrl = process.argv[2];

if (!imageUrl) {
  console.error('❌ Please provide an image URL.');
  console.error('Usage: node scripts/test-ocr.js <IMAGE_URL>');
  process.exit(1);
}

async function testOCR() {
  console.log(`🚀 Testing OCR endpoint at ${targetUrl}`);
  console.log(`📸 Image URL: ${imageUrl}\n`);
  console.log(`⏳ Waiting for response (this may take a few seconds)...\n`);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Request failed with status ${response.status}`);
      console.error(data);
      return;
    }

    console.log('✅ OCR Extraction Successful!\n');
    console.log('📦 Extracted Data:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error testing OCR:', error.message);
  }
}

testOCR();
