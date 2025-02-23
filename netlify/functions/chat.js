import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Log the incoming request body for debugging
    console.log('Incoming request body:', event.body);
    
    const { messages } = JSON.parse(event.body);
    
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid messages format. Expected an array.' })
      };
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Format the conversation history
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.content
    }));

    // Get the last message
    const lastMessage = messages[messages.length - 1].content;

    try {
      // Start a new chat
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Send the message and get the response
      const result = await chat.sendMessage(lastMessage);
      const response = await result.response;
      const text = response.text();

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