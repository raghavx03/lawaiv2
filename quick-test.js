// Quick test with hardcoded API key
const fetch = require('node-fetch');

async function quickTest() {
  console.log('🚀 Quick Test with Hardcoded API Key...\n');
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': 'AIzaSyC_2M03Ecb9IWZss_c1zF0iVRp4BNCOeF8'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: 'What is contract law?'
        }]
      }],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    })
  });

  if (response.ok) {
    const data = await response.json();
    const content = data.candidates[0].content.parts[0]?.text;
    console.log('✅ SUCCESS! Gemini API working with hardcoded key');
    console.log('Response:', content);
  } else {
    console.log('❌ FAILED:', response.status);
    const error = await response.text();
    console.log('Error:', error);
  }
}

quickTest();