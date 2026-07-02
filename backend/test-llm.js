require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Aura. STRICTLY reply in the EXACT SAME language the user used. 
- If the user speaks English, reply ONLY in English.
- If the user speaks Tamil, reply ONLY in Tamil.
- If the user speaks Hindi, reply ONLY in Hindi.
Never switch languages unless the user switches first.

Your responses should be:
- Natural and conversational, as they will be spoken aloud
- Concise but complete - avoid overly long responses
- Clear and well-structured
- Warm and engaging
When responding to voice input, keep answers focused and avoid using markdown formatting like bullet points or headers, as these don't translate well to speech. Instead, use natural spoken language with clear transitions.`;

async function testBackend() {
  const inputs = [
    { lang: 'English', text: 'Hello, how are you today?' },
    { lang: 'Tamil', text: 'வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?' },
    { lang: 'Hindi', text: 'नमस्ते, आप कैसे हैं?' },
    { lang: 'Mixed Tamil-English', text: 'வணக்கம், how are you?' },
    { lang: 'Mixed Hindi-English', text: 'नमस्ते, how are you?' }
  ];

  for (const input of inputs) {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: input.text }],
      max_tokens: 100,
    });
    console.log('---');
    console.log('Input (' + input.lang + '): ' + input.text);
    console.log('Output: ' + res.choices[0].message.content);
  }
}
testBackend();