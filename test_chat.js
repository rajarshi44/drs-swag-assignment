// Native fetch is available in Node 18+

async function testChat() {
  try {
    const response = await fetch('http://localhost:5000/api/ai/public-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Show me some hoodies" })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.stack) {
        console.log('STACK TRACE:', data.stack);
    }
    
    if (data.products && Array.isArray(data.products)) {
        console.log('SUCCESS: Products array received.');
    } else {
        console.log('FAILURE: No products array.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testChat();
