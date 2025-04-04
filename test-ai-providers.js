/**
 * Test script to verify the multi-provider AI integration
 * This script tests the AI service with different providers
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateText, getAIProvider } from './utils/aiService.js';

// Load environment variables from .env.local if it exists
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function testAIProviders() {
  console.log('Testing AI providers integration...');
  
  // Get the currently configured provider
  const currentProvider = getAIProvider();
  console.log(`Current AI provider: ${currentProvider}`);
  
  // Simple prompt for testing
  const prompt = 'Explain what DeFi is in one sentence.';
  
  try {
    // Test with the current provider
    console.log(`\nTesting with ${currentProvider}...`);
    const response = await generateText(prompt);
    console.log(`Response: ${response}`);
    
    // If we have OpenAI configured, test it explicitly
    if (process.env.OPENAI_API_KEY) {
      // Temporarily override the provider
      process.env.AI_PROVIDER = 'openai';
      console.log('\nTesting with OpenAI explicitly...');
      const openaiResponse = await generateText(prompt);
      console.log(`OpenAI response: ${openaiResponse}`);
    } else {
      console.log('\nSkipping OpenAI test (no API key configured)');
    }
    
    // If we have Anthropic configured, test it explicitly
    if (process.env.ANTHROPIC_API_KEY) {
      // Temporarily override the provider
      process.env.AI_PROVIDER = 'anthropic';
      console.log('\nTesting with Anthropic (Claude) explicitly...');
      const claudeResponse = await generateText(prompt);
      console.log(`Claude response: ${claudeResponse}`);
    } else {
      console.log('\nSkipping Anthropic test (no API key configured)');
    }
    
    // Test Ollama if configured
    if (process.env.OLLAMA_BASE_URL) {
      // Temporarily override the provider
      process.env.AI_PROVIDER = 'ollama';
      console.log('\nTesting with Ollama explicitly...');
      try {
        const ollamaResponse = await generateText(prompt);
        console.log(`Ollama response: ${ollamaResponse}`);
      } catch (ollamaError) {
        console.error('Ollama test failed:', ollamaError.message);
        console.log('Make sure Ollama is running locally with: ollama serve');
      }
    } else {
      console.log('\nSkipping Ollama test (no base URL configured)');
    }
    
  } catch (error) {
    console.error('Error testing AI providers:', error);
  }
}

testAIProviders();
