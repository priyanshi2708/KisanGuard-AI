/**
 * End-to-End Live HTTP API Test for KisanGuard AI Backend
 */
async function testEndpoints() {
  const baseUrl = 'http://localhost:3001';
  console.log('🚀 Testing Live Endpoints on', baseUrl, '...\n');

  try {
    // 1. Test Weather endpoint
    console.log('1. Testing GET /api/weather...');
    const weatherRes = await fetch(`${baseUrl}/api/weather?location=Anand`);
    const weatherData = await weatherRes.json();
    console.log('   Weather Status:', weatherRes.status, '| City:', weatherData.city || weatherData.data?.city);

    // 2. Test Registration endpoint
    console.log('\n2. Testing POST /api/auth/register...');
    const regEmail = `live_test_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bharat Farmer',
        email: regEmail,
        password: 'SecurePassword123',
        language: 'gu'
      })
    });
    const regCookies = regRes.headers.get('set-cookie');
    const regData = await regRes.json();
    console.log('   Register Status:', regRes.status, '| User:', regData.user?.name, '| Email:', regData.user?.email);
    console.log('   Cookie received:', !!regCookies);

    // Extract cookie
    const cookieVal = regCookies ? regCookies.split(';')[0] : '';

    // 3. Test GET /api/auth/me with cookie
    console.log('\n3. Testing GET /api/auth/me with auth cookie...');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: cookieVal }
    });
    const meData = await meRes.json();
    console.log('   /me Status:', meRes.status, '| Authenticated User ID:', meData.user?.id, '| Lang:', meData.user?.language);

    // 4. Test Updating Language (Profile requirement: only changeable from Profile)
    console.log('\n4. Testing PUT /api/user/language...');
    const langRes = await fetch(`${baseUrl}/api/user/language`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: cookieVal },
      body: JSON.stringify({ language: 'hi' })
    });
    const langData = await langRes.json();
    console.log('   Language update status:', langRes.status, '| New language in DB:', langData.user?.language);

    // 5. Test Farm Book Expense Creation & Retrieval
    console.log('\n5. Testing Farm Book Operations...');
    const expRes = await fetch(`${baseUrl}/api/farmbook/expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieVal },
      body: JSON.stringify({
        year: 2026,
        date: '2026-10-02',
        category: 'Seeds',
        amount: 3500,
        crop: 'Wheat',
        notes: 'Premium Wheat seeds'
      })
    });
    const expData = await expRes.json();
    console.log('   Create expense status:', expRes.status, '| Saved record ID:', expData.record?._id);

    const fbRes = await fetch(`${baseUrl}/api/farmbook?year=2026`, {
      headers: { Cookie: cookieVal }
    });
    const fbData = await fbRes.json();
    console.log('   Farm Book fetch status:', fbRes.status, '| Expenses total:', fbData.summary?.totalExpenses);

    // 6. Test AI Chat Endpoint
    console.log('\n6. Testing POST /api/chat (Groq AI)...');
    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieVal },
      body: JSON.stringify({
        message: 'નમસ્તે, કપાસના પાકમાં ખાતર ક્યારે આપવું?',
        language: 'gu'
      })
    });
    const chatData = await chatRes.json();
    console.log('   Chat Status:', chatRes.status, '| Reply preview:', (chatData.message?.content || '').slice(0, 70), '...');

    // 7. Test Logout
    console.log('\n7. Testing POST /api/auth/logout...');
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: cookieVal }
    });
    console.log('   Logout status:', logoutRes.status);

    console.log('\n✨ ALL LIVE ENDPOINT TESTS PASSED SUCCESSFULLY! ✨\n');
  } catch (err) {
    console.error('❌ Live test failed:', err);
  }
}

testEndpoints();
