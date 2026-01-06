// Test AI service with both FREE and PAID plans
const path = require('path');

// Mock environment
process.env.GEMINI_API_KEY = 'AIzaSyC_2M03Ecb9IWZss_c1zF0iVRp4BNCOeF8';
process.env.OPENAI_API_KEY = 'sk-placeholder';

async function testAIService() {
  try {
    // Import the AI service
    const { callAIService } = require('./src/lib/ai-service.ts');
    
    const messages = [
      {
        role: 'system',
        content: 'You are a legal AI assistant.'
      },
      {
        role: 'user', 
        content: 'What is contract law in simple terms?'
      }
    ];

    console.log('Testing AI Service for FREE user (should use Gemini)...');
    
    const freeResponse = await callAIService(messages, 'FREE', 100, 0.7);
    console.log('✅ FREE user response:', freeResponse.content.substring(0, 100) + '...');
    
    console.log('\nTesting AI Service for PAID user (should use OpenAI - will fail due to placeholder key)...');
    
    try {
      const paidResponse = await callAIService(messages, 'BASIC', 100, 0.7);
      console.log('✅ PAID user response:', paidResponse.content.substring(0, 100) + '...');
    } catch (error) {
      console.log('❌ PAID user failed (expected due to placeholder OpenAI key):', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIService();