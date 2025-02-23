import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);
    
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid messages format. Expected an array.' })
      };
    }

    // Initialize the model with specific configuration
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        maxOutputTokens: 150, // Limit response length
        temperature: 0.7, // Balance between creativity and consistency
        topP: 0.8, // Focus on more likely responses
        topK: 40 // Limit vocabulary diversity
      }
    });

    // Format the conversation history
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content
    }));

    // Get the last message
    const lastMessage = messages[messages.length - 1].content;

    try {
      // Add specific instructions for AI behavior
      const systemPrompt = messages.find(msg => msg.role === 'system')?.content || '';
      const enhancedPrompt = `
${systemPrompt}

Instructions for responses:
- Keep responses concise and focused (2-3 sentences when possible)
- Use a professional yet friendly tone
- Only discuss information provided in the business context
- Avoid special characters or emoji
- Focus on being helpful and driving sales naturally
- If you don't have specific information about something, say so politely

User message: ${lastMessage}`;

      // Start a new chat
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 150,
        },
      });

      // Send the message and get the response
      const result = await chat.sendMessage(enhancedPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean up the response
      text = text
        .trim()
        .replace(/[^\x20-\x7E\n]/g, '') // Remove special characters
        .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
        .replace(/\s{2,}/g, ' '); // Remove excessive spaces

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: text })
      };
    } catch (modelError) {
      console.error('Gemini API Error:', modelError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Error communicating with Gemini API',
          details: modelError.message 
        })
      };
    }
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
}