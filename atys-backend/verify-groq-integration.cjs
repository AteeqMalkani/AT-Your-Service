const axios = require('axios');

async function test() {
  const BASE_URL = 'http://localhost:3000';
  const cases = [
    'I want milk',
    "My AC isn't cooling",
    'Mujhe ghar shift karne mein help chahiye',
    'I need someone to buy two large colas',
    'Kal tak mera assignment complete karna hai'
  ];

  try {
    for (const msg of cases) {
      console.log(`Testing: "${msg}"`);
      const start = Date.now();
      const res = await axios.post(`${BASE_URL}/ai-requests/prepare`, {
        message: msg,
        language: 'en'
      });
      const duration = Date.now() - start;
      console.log(`  [✅] Success (${duration}ms) - ${res.data.draft.title}`);
    }
    console.log('\nAll test cases passed successfully!');
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
}

test();
