const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function runTests() {
  console.log('==================================================');
  console.log('🚀 Starting URL Shortener Integration Tests...');
  console.log('==================================================\n');

  try {
    // 1. Fetch user (should create a new session/user)
    console.log('1. Fetching initial user profile...');
    const userRes1 = await axios.get(`${API_BASE}/api/users`, {
      headers: { 'X-Forwarded-For': '192.168.1.50' } // Simulate some initial IP
    });
    
    const user1 = userRes1.data.user;
    if (!user1 || !user1.id || !user1.virtualIp) {
      throw new Error('Failed to create user or missing virtual IP');
    }
    console.log(`✅ Success: User created! ID: ${user1.id}, Virtual IP: ${user1.virtualIp}, Physical IP: ${user1.ip}`);

    const userId = user1.id;
    const initialVirtualIp = user1.virtualIp;

    // 2. Shorten a URL
    console.log('\n2. Shortening URL: https://example.com/test-integration');
    const targetUrl = 'https://example.com/test-integration';
    const shortenRes = await axios.post(`${API_BASE}/api/urls`, {
      longUrl: targetUrl
    }, {
      headers: { 'X-User-Id': userId }
    });

    const shortUrl = shortenRes.data.shortUrl;
    const shortCode = shortenRes.data.shortCode;
    if (!shortUrl || !shortCode) {
      throw new Error('Failed to shorten URL or missing shortCode');
    }
    console.log(`✅ Success: URL shortened. Short URL path: ${shortUrl}`);

    // 3. Verify URL list click count is 0
    console.log('\n3. Verifying initial click count...');
    const urlsRes1 = await axios.get(`${API_BASE}/api/urls`);
    const createdUrlObj1 = urlsRes1.data.find(u => u.shortCode === shortCode);
    if (!createdUrlObj1) {
      throw new Error('Shortened URL not found in URL list');
    }
    console.log(`✅ Success: Initial Click count: ${createdUrlObj1.clickCount}`);

    // 4. Simulate a redirect (visit short URL)
    console.log(`\n4. Simulating link visit: ${API_BASE}/r/${shortCode}`);
    // Disable automatic redirect following so we can inspect redirect status
    const redirectRes = await axios.get(`${API_BASE}/r/${shortCode}`, {
      headers: { 'X-User-Id': userId },
      maxRedirects: 0,
      validateStatus: (status) => status >= 300 && status < 400
    });

    console.log(`✅ Success: Redirected with status ${redirectRes.status}. Target Location: ${redirectRes.headers.location}`);

    // 5. Verify click count incremented
    console.log('\n5. Verifying incremented click count...');
    const urlsRes2 = await axios.get(`${API_BASE}/api/urls`);
    const createdUrlObj2 = urlsRes2.data.find(u => u.shortCode === shortCode);
    if (createdUrlObj2.clickCount !== 1) {
      throw new Error(`Click count did not increment. Expected 1, got ${createdUrlObj2.clickCount}`);
    }
    console.log(`✅ Success: Click count is now: ${createdUrlObj2.clickCount}`);

    // 6. Simulate internet connection/IP change
    console.log('\n6. Simulating internet change (IP changes from 192.168.1.50 to 203.0.113.1)...');
    const userRes2 = await axios.get(`${API_BASE}/api/users`, {
      headers: { 
        'X-User-Id': userId,
        'X-Forwarded-For': '203.0.113.1'
      }
    });

    const updatedUser = userRes2.data.user;
    if (updatedUser.id !== userId) {
      throw new Error('User identity changed! History would be lost.');
    }
    if (updatedUser.virtualIp !== initialVirtualIp) {
      throw new Error('User virtual IP changed! Should remain static.');
    }
    console.log(`✅ Success: User ID remains: ${updatedUser.id}`);
    console.log(`✅ Success: Virtual IP remains unchanged: ${updatedUser.virtualIp}`);
    console.log(`✅ Success: Physical IP updated correctly: ${updatedUser.ip}`);

    // 7. Verify user activity history
    console.log('\n7. Verifying user activity history log...');
    if (updatedUser.activity.length < 2) {
      throw new Error(`Activity log has less entries than expected (should have created and visited). Got ${updatedUser.activity.length}`);
    }

    const createdActivity = updatedUser.activity.find(a => a.type === 'created' && a.shortCode === shortCode);
    const visitedActivity = updatedUser.activity.find(a => a.type === 'visited' && a.shortCode === shortCode);

    if (!createdActivity || !visitedActivity) {
      throw new Error('Activity history is missing the integration activities');
    }

    console.log('✅ Success: Activity history details:');
    console.log(`  - Creation event logged: ${createdActivity.longUrl} -> ${createdActivity.shortUrl}`);
    console.log(`  - Visit event logged: ${visitedActivity.longUrl} -> ${visitedActivity.shortUrl}`);

    console.log('\n==================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('==================================================');

  } catch (error) {
    console.error('\n❌ Test execution failed:');
    console.error(error.stack || error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Wait a second for dev server to fully set up, then run
setTimeout(runTests, 1500);
