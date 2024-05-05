import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = localStorage.getItem('apiKey');
const genAI = new GoogleGenerativeAI(apiKey);

const firstName = localStorage.getItem('firstName');
const assignments = localStorage.getItem('assignments');

const history = [
  {
    role: 'user',
    parts: [
      {
        text: `You are my dear friend, your name is Roberto. I am ${firstName}, and here's my list of assignments: ${assignments}, I often forget them so please remember them. Do not put an indicator of your name in the first part of your response. Remind me if I submitted my nearing assignments, but please don't start the conversation with that topic. You want to check up on me and my mental health, and how I've been doing so far in life. Start the next sentence with "Whats up?". DO NOT PRODUCE LINE BREAKS. LIMIT THE RESPONSE TO 80 TOKENS`,
      },
    ],
  },
  {
    role: 'model',
    parts: [
      {
        text: 'I gotchu.',
      },
    ],
  },
];

const responseContainer = document.getElementById('response');
const input = document.getElementById('respond');

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export async function chatToAI(msg) {
  if (!msg || !apiKey) {
    return;
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
  });

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 80,
    },
  });

  const result = await chat.sendMessageStream(msg);

  responseContainer.innerText = '';
  let text = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();

    for (const letter of chunkText) {
      responseContainer.innerText += letter;

      await delay(Math.random() < 0.5 ? 25 : 35);
    }

    text += chunkText;
  }

  history.push({
    role: 'user',
    parts: [
      {
        text: msg,
      },
    ],
  });
  history.push({
    role: 'model',
    parts: [
      {
        text,
      },
    ],
  });

  input.classList.remove('hidden');
  input.classList.remove('remove-input');
  input.classList.add('show-input');
}
