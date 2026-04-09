import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function analyzeImage(imagePath: string, prompt: string) {
  const zai = await ZAI.create();
  
  // Read image file and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { 
            type: 'image_url', 
            image_url: { url: `data:image/png;base64,${base64Image}` } 
          }
        ]
      }
    ],
    thinking: { type: 'disabled' }
  });

  return response.choices[0]?.message?.content;
}

async function main() {
  const images = [
    "/home/z/my-project/upload/ChatGPT Image Mar 16, 2026, 07_04_08 AM.png",
    "/home/z/my-project/upload/ChatGPT Image Mar 16, 2026, 07_37_34 AM.png"
  ];
  
  for (const img of images) {
    console.log(`\n=== Analyzing: ${path.basename(img)} ===\n`);
    const result = await analyzeImage(img, "Describe this image in detail. What UI/flowchart/diagram does it show? Is it about car marketplace business logic? What are the key elements, flows, and information shown?");
    console.log(result);
  }
}

main().catch(console.error);
