// Simple test to verify Gemini integration works
const fetch = require('node-fetch');

async function testGeminiIntegration() {
  const GEMINI_API_KEY = 'AIzaSyC_2M03Ecb9IWZss_c1zF0iVRp4BNCOeF8';
  
  console.log('🧪 Testing Gemini Integration for FREE users...\n');
  
  // Test 1: Basic API call
  console.log('1. Testing basic Gemini API call...');
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
            text: 'System: You are a legal AI assistant.\n\nUser: What is a rental agreement?\nAssistant:'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.candidates[0].content.parts[0]?.text;
      console.log('✅ SUCCESS: Gemini API working');
      console.log('📝 Response preview:', content.substring(0, 100) + '...\n');
    } else {
      console.log('❌ FAILED: API call failed with status', response.status);
      return;
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return;
  }

  // Test 2: Legal document generation format
  console.log('2. Testing legal document generation...');
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
            text: 'System: You are a legal document expert. Generate a professional rental agreement based on Indian law.\n\nUser: Generate a rental agreement with the following details: {"landlord":"John Doe","tenant":"Jane Smith","property":"123 Main St","rent":"15000","duration":"11 months"}\nAssistant:'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.2,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.candidates[0].content.parts[0]?.text;
      console.log('✅ SUCCESS: Document generation working');
      console.log('📄 Document preview:', content.substring(0, 150) + '...\n');
    } else {
      console.log('❌ FAILED: Document generation failed');
      return;
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return;
  }

  // Test 3: Judgment summarization
  console.log('3. Testing judgment summarization...');
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
            text: 'System: You are a legal expert specializing in summarizing court judgments and legal documents.\n\nUser: Please summarize this legal document titled "Sample Contract Case": This is a contract dispute between ABC Corp and XYZ Ltd regarding breach of service agreement. The court found that ABC Corp failed to deliver services as per the contract terms and awarded damages of Rs. 5 lakhs to XYZ Ltd.\nAssistant:'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.3,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.candidates[0].content.parts[0]?.text;
      console.log('✅ SUCCESS: Judgment summarization working');
      console.log('📋 Summary preview:', content.substring(0, 150) + '...\n');
    } else {
      console.log('❌ FAILED: Summarization failed');
      return;
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    return;
  }

  console.log('🎉 ALL TESTS PASSED! Gemini integration is working perfectly for FREE users.');
  console.log('📌 Next steps:');
  console.log('   1. Push code to GitHub');
  console.log('   2. Deploy to production');
  console.log('   3. Add GEMINI_API_KEY to production environment');
  console.log('   4. Test on lawai.ragspro.com');
}

testGeminiIntegration();