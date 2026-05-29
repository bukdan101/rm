import ZAI, { VisionMessage } from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    const imagePath = '/home/z/my-project/upload/Screenshot_45.jpg';
    
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    const zai = await ZAI.create();

    const prompt = `Analisis screenshot ini secara detail. Ini adalah halaman detail produk untuk jual beli mobil. Jelaskan:
1. Layout dan struktur halaman secara detail
2. Komponen-komponen yang ada dan posisinya
3. Warna dan styling yang digunakan
4. Fitur-fitur yang terlihat (tombol, badge, dll)
5. Bagian mana saja yang perlu diperhatikan untuk replikasi UI ini
6. Struktur grid dan kolom yang digunakan`;

    const messages: VisionMessage[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ];

    const response = await zai.chat.completions.createVision({
      model: 'glm-4.6v',
      messages,
      thinking: { type: 'disabled' }
    });

    const reply = response.choices?.[0]?.message?.content;
    console.log('=== ANALISIS SCREENSHOT ===\n');
    console.log(reply ?? JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error('Vision chat failed:', err?.message || err);
    console.error(err);
  }
}

main();
