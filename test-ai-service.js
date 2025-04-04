/**
 * Simple test script for the AI service
 * This directly tests the AI service without going through the API
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateText, getAIProvider } from './utils/aiService.js';

// Load environment variables from .env.local if it exists
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function testAIService() {
  console.log('Testing AI service directly...');
  
  // Get the currently configured provider
  const provider = getAIProvider();
  console.log(`Current AI provider: ${provider}`);
  
  // Simple prompt for testing
  const prompt = 'What are the top 3 DeFi protocols for earning yield?';
  
  try {
    console.log(`\nSending prompt to ${provider}...`);
    console.log(`Prompt: "${prompt}"`);
    
    const response = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 500
    });
    
    console.log('\nResponse:');
    console.log('-----------------------------------');
    console.log(response);
    console.log('-----------------------------------');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing AI service:', error);
  }
}

testAIService();
