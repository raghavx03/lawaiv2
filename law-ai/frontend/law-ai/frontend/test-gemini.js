// Simple test script to check if Gemini API is working
const fetch = require('node-fetch');

async function testGeminiAPI() {
  const GEMINI_API_KEY = 'AIzaSyC_2M03Ecb9IWZss_c1zF0iVRp4BNCOeF8';
  
  console.log('Testing Gemini API...');
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'What is Section 420 IPC in simple words?'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7,
        }
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Response:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content.parts[0]?.text;
      console.log('\n✅ Gemini API Response:');
      console.log(content);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGeminiAPI();