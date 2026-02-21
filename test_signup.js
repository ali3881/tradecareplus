
async function testSignup() {
  const email = "duplicate_" + Date.now() + "@example.com";
  
  console.log("--- Attempt 1: Create User ---");
  try {
    const res = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        email: email,
        password: "password123",
        phone: "1234567890",
        plan: "BASIC"
      })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error('Error:', e);
  }

  console.log("\n--- Attempt 2: Duplicate User ---");
  try {
    const res = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        email: email,
        password: "password123",
        phone: "1234567890",
        plan: "BASIC"
      })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testSignup();
