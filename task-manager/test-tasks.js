const axios = require('axios');

const API_BASE = 'http://localhost:5003/api/tasks';

async function runTests() {
  console.log('==================================================');
  console.log('📋 Starting Task Manager REST API Integration Tests...');
  console.log('==================================================\n');

  let task1Id, task2Id, task3Id;

  try {
    // 1. Create multiple tasks
    console.log('1. Testing Create Task Endpoint...');
    
    const task1 = {
      title: 'Fix CSS Alignment in App',
      description: 'Adjust container margins and styling for mobile responsive layouts.',
      priority: 'high'
    };
    const res1 = await axios.post(API_BASE, task1);
    task1Id = res1.data.id || res1.data._id;
    if (!task1Id || res1.data.title !== task1.title || res1.data.priority !== 'high') {
      throw new Error('Task 1 creation response invalid');
    }
    console.log(`✅ Success: Created Task 1 (High). ID: ${task1Id}`);

    const task2 = {
      title: 'Code Server REST Endpoints',
      description: 'Implement GET, POST, PUT, DELETE Express routers for task collections.',
      priority: 'medium'
    };
    const res2 = await axios.post(API_BASE, task2);
    task2Id = res2.data.id || res2.data._id;
    console.log(`✅ Success: Created Task 2 (Medium). ID: ${task2Id}`);

    const task3 = {
      title: 'Write Jest Unit Tests',
      description: 'Verify database fallback and controller validations.',
      priority: 'low'
    };
    const res3 = await axios.post(API_BASE, task3);
    task3Id = res3.data.id || res3.data._id;
    console.log(`✅ Success: Created Task 3 (Low). ID: ${task3Id}`);

    // 2. Retrieve all tasks
    console.log('\n2. Testing Retrieve All Tasks...');
    const getAllRes = await axios.get(API_BASE);
    if (!Array.isArray(getAllRes.data) || getAllRes.data.length < 3) {
      throw new Error('Failed to retrieve all 3 tasks');
    }
    console.log(`✅ Success: Retrieved ${getAllRes.data.length} task(s).`);

    // 3. Update task (Toggle complete)
    console.log('\n3. Testing Update Task Endpoint (Complete toggle)...');
    const updateRes = await axios.put(`${API_BASE}/${task1Id}`, {
      completed: true
    });
    if (updateRes.data.completed !== true) {
      throw new Error('Failed to update completed status of Task 1');
    }
    console.log(`✅ Success: Task 1 marked completed. Title: "${updateRes.data.title}"`);

    // 4. Test Filtering API Endpoints
    console.log('\n4. Testing GET API Filters...');

    // A. Filter by completed status
    console.log('   A. Testing status=completed filter...');
    const completedRes = await axios.get(`${API_BASE}?status=completed`);
    if (completedRes.data.length !== 1 || completedRes.data[0].id !== task1Id) {
      throw new Error('Completed filter returned wrong list');
    }
    console.log(`   ✅ Success: Filter completed returned exactly 1 completed task.`);

    // B. Filter by pending status
    console.log('   B. Testing status=pending filter...');
    const pendingRes = await axios.get(`${API_BASE}?status=pending`);
    if (pendingRes.data.length !== 2 || pendingRes.data.find(t => t.id === task1Id)) {
      throw new Error('Pending filter returned wrong list');
    }
    console.log(`   ✅ Success: Filter pending returned exactly 2 pending tasks.`);

    // C. Filter by priority
    console.log('   C. Testing priority=high filter...');
    const priorityRes = await axios.get(`${API_BASE}?priority=high`);
    if (priorityRes.data.length !== 1 || priorityRes.data[0].priority !== 'high') {
      throw new Error('Priority filter returned wrong list');
    }
    console.log(`   ✅ Success: Filter priority=high returned exactly 1 high-priority task.`);

    // D. Filter by text search
    console.log('   D. Testing text search filter...');
    const searchRes = await axios.get(`${API_BASE}?search=Jest`);
    if (searchRes.data.length !== 1 || !searchRes.data[0].title.includes('Jest')) {
      throw new Error('Search filter failed to retrieve unit tests task');
    }
    console.log(`   ✅ Success: Filter search="Jest" returned matching task: "${searchRes.data[0].title}".`);

    // 5. Delete task
    console.log('\n5. Testing Delete Task Endpoint...');
    const deleteRes = await axios.delete(`${API_BASE}/${task2Id}`);
    if (deleteRes.data.id !== task2Id) {
      throw new Error('Delete response ID mismatch');
    }
    console.log(`✅ Success: Deleted Task 2.`);

    // 6. Verify task deletion
    console.log('\n6. Verifying Task Deletion status...');
    const finalGetRes = await axios.get(API_BASE);
    if (finalGetRes.data.find(t => t.id === task2Id)) {
      throw new Error('Deleted task still present in database list');
    }
    console.log(`✅ Success: Verified Task 2 is permanently deleted.`);

    console.log('\n==================================================');
    console.log('🎉 ALL TASK MANAGER CRUD INTEGRATION TESTS PASSED! 🎉');
    console.log('==================================================');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Task Manager integration tests failed:');
    console.error(error.stack || error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Give server 1.5 seconds to start up just in case
setTimeout(runTests, 1500);
