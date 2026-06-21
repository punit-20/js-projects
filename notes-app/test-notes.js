const axios = require('axios');

const API_BASE = 'http://localhost:5001';

async function runTests() {
  console.log('==================================================');
  console.log('📝 Starting Notes App Integration Tests...');
  console.log('==================================================\n');

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123';
  const testName = 'Alice Testuser';
  let jwtToken = '';
  let noteId = '';

  try {
    // 1. Register a user
    console.log('1. Testing User Registration...');
    const registerRes = await axios.post(`${API_BASE}/api/auth/register`, {
      name: testName,
      email: testEmail,
      password: testPassword
    });

    if (!registerRes.data.token || registerRes.data.user.email !== testEmail.toLowerCase()) {
      throw new Error('Registration response missing token or email mismatch');
    }
    console.log(`✅ Success: User registered. ID: ${registerRes.data.user.id}, Token issued.`);

    // 2. Login user
    console.log('\n2. Testing User Login...');
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    jwtToken = loginRes.data.token;
    if (!jwtToken) {
      throw new Error('Login response missing token');
    }
    console.log(`✅ Success: User logged in. Token issued.`);

    // Set axios auth header for future requests
    const authHeaders = { headers: { Authorization: `Bearer ${jwtToken}` } };

    // 3. Add Note
    console.log('\n3. Testing Create Note...');
    const newNote = {
      title: 'Integration Test Note',
      content: 'This note is created dynamically during automated testing.',
      tags: ['test', 'automated'],
      color: '#4c1d95',
      isPinned: true
    };

    const addNoteRes = await axios.post(`${API_BASE}/api/notes`, newNote, authHeaders);
    noteId = addNoteRes.data.id || addNoteRes.data._id;
    if (!noteId || addNoteRes.data.title !== newNote.title) {
      throw new Error('Failed to create note or note details mismatch');
    }
    console.log(`✅ Success: Note created. ID: ${noteId}, Pinned: ${addNoteRes.data.isPinned}`);

    // 4. Retrieve Notes
    console.log('\n4. Testing Retrieve Notes...');
    const getNotesRes = await axios.get(`${API_BASE}/api/notes`, authHeaders);
    if (!Array.isArray(getNotesRes.data) || getNotesRes.data.length === 0) {
      throw new Error('Failed to fetch notes or empty list returned');
    }

    const fetchedNote = getNotesRes.data.find(n => (n._id || n.id) === noteId);
    if (!fetchedNote) {
      throw new Error('Created note not found in the fetched notes list');
    }
    console.log(`✅ Success: Fetched ${getNotesRes.data.length} note(s). Created note found.`);

    // 5. Update Note
    console.log('\n5. Testing Update Note...');
    const updatedFields = {
      title: 'Updated Test Note Title',
      content: 'This content has been modified.',
      isPinned: false
    };

    const updateNoteRes = await axios.put(`${API_BASE}/api/notes/${noteId}`, updatedFields, authHeaders);
    if (updateNoteRes.data.title !== updatedFields.title || updateNoteRes.data.isPinned !== false) {
      throw new Error('Note update failed or fields mismatch');
    }
    console.log(`✅ Success: Note title updated to "${updateNoteRes.data.title}", Pinned: ${updateNoteRes.data.isPinned}`);

    // 6. Delete Note
    console.log('\n6. Testing Delete Note...');
    const deleteNoteRes = await axios.delete(`${API_BASE}/api/notes/${noteId}`, authHeaders);
    if (deleteNoteRes.data.id !== noteId) {
      throw new Error('Delete note response ID mismatch');
    }

    // Verify it is gone
    const verifyNotesRes = await axios.get(`${API_BASE}/api/notes`, authHeaders);
    const deletedNoteCheck = verifyNotesRes.data.find(n => (n._id || n.id) === noteId);
    if (deletedNoteCheck) {
      throw new Error('Note was not deleted; still present in fetched notes list');
    }
    console.log(`✅ Success: Note successfully deleted.`);

    // 7. Verify Auth protection on Notes Routes
    console.log('\n7. Testing Authentication Protection on CRUD endpoints...');
    try {
      await axios.get(`${API_BASE}/api/notes`);
      throw new Error('Endpoint accessible without Authorization token');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Success: Access blocked with 401 Unauthorized.');
      } else {
        throw err;
      }
    }

    console.log('\n==================================================');
    console.log('🎉 ALL NOTES APP INTEGRATION TESTS PASSED! 🎉');
    console.log('==================================================');

  } catch (error) {
    console.error('\n❌ Notes integration tests failed:');
    console.error(error.stack || error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Start running tests
setTimeout(runTests, 1000);
