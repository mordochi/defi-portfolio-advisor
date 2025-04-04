# Multi-Provider AI Integration

This project now supports multiple AI providers for generating DeFi investment strategies and explanations:

1. **OpenAI** (default) - Uses GPT models for high-quality strategy generation
2. **Anthropic Claude** - Alternative high-quality AI model with different strengths
3. **Ollama** - Local open-source AI models for privacy and no API costs

## Configuration

Set up your preferred AI provider in the `.env.local` file:

```
# AI API keys for recommendations
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# AI provider to use: 'openai', 'anthropic', or 'ollama'
AI_PROVIDER=openai
```

## Provider Details

### OpenAI
- Default provider
- Requires an API key from [OpenAI](https://platform.openai.com/)
- Uses GPT-4o by default (configurable in `aiService.js`)

### Anthropic Claude
- Alternative provider with excellent reasoning capabilities
- Requires an API key from [Anthropic](https://www.anthropic.com/)
- Uses Claude 3 Opus by default (configurable in `aiService.js`)

### Ollama
- Local AI provider that runs on your machine
- No API key required, but needs [Ollama](https://ollama.ai/) installed and running
- Uses llama3 by default (configurable in `.env.local`)
- Start Ollama with `ollama serve` before using this provider

## Testing

You can test the AI providers using the included test script:

```bash
node test-ai-providers.js
```

This will test the currently configured provider and any others that have API keys set up.

## Fallback Mechanism

The system includes automatic fallback mechanisms:
- If the selected provider fails, it will try to use other configured providers
- If all AI providers fail, it falls back to template-based explanations

## Customizing Models

You can customize the specific models used for each provider by modifying the `aiService.js` file:

```javascript
// For OpenAI
const model = options.model || 'gpt-4o';

// For Anthropic
const model = options.model || 'claude-3-opus-20240229';

// For Ollama
const model = options.model || ollamaModel; // from .env.local
```
