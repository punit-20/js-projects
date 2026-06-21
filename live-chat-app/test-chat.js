const { io } = require('socket.io-client');

const SOCKET_SERVER_URL = 'http://localhost:5002';

async function runTests() {
  console.log('==================================================');
  console.log('💬 Starting Live Chat WebSocket Integration Tests...');
  console.log('==================================================\n');

  let clientSocketA;
  let clientSocketB;

  const cleanup = () => {
    if (clientSocketA && clientSocketA.connected) clientSocketA.disconnect();
    if (clientSocketB && clientSocketB.connected) clientSocketB.disconnect();
  };

  try {
    // 1. Establish Connection for Client A
    console.log('1. Connecting Client A (Alice)...');
    clientSocketA = io(SOCKET_SERVER_URL, { forceNew: true });
    
    await new Promise((resolve, reject) => {
      clientSocketA.on('connect', resolve);
      clientSocketA.on('connect_error', reject);
      setTimeout(() => reject(new Error('Client A connection timeout')), 3000);
    });
    console.log('✅ Success: Client A connected to socket server.');

    // 2. Client A Joins Room 'TestRoom'
    console.log('\n2. Joining Room "TestRoom" as Alice...');
    clientSocketA.emit('join_room', {
      username: 'Alice',
      room: 'TestRoom',
      color: '#8b5cf6'
    });

    // Verify room users event contains Alice
    const usersList1 = await new Promise((resolve, reject) => {
      clientSocketA.once('room_users', resolve);
      setTimeout(() => reject(new Error('Room users list not received for Client A')), 3000);
    });

    if (!usersList1.find(u => u.username === 'Alice')) {
      throw new Error('Alice is missing from active user list');
    }
    console.log(`✅ Success: Alice joined TestRoom. Active user count: ${usersList1.length}`);

    // 3. Connect Client B and join same room
    console.log('\n3. Connecting Client B (Bob) and joining "TestRoom"...');
    clientSocketB = io(SOCKET_SERVER_URL, { forceNew: true });
    
    await new Promise((resolve, reject) => {
      clientSocketB.on('connect', resolve);
      setTimeout(() => reject(new Error('Client B connection timeout')), 3000);
    });

    // Alice should listen to Bob joining system message
    const bobJoinNotificationPromise = new Promise((resolve, reject) => {
      clientSocketA.on('receive_message', (msg) => {
        if (msg.isSystem && msg.text.includes('Bob joined')) {
          resolve(msg);
        }
      });
      setTimeout(() => reject(new Error('Alice did not receive Bob joining notification')), 3000);
    });

    clientSocketB.emit('join_room', {
      username: 'Bob',
      room: 'TestRoom',
      color: '#10b981'
    });

    const bobUsersList = await new Promise((resolve, reject) => {
      clientSocketB.once('room_users', resolve);
      setTimeout(() => reject(new Error('Room users list not received for Client B')), 3000);
    });

    const systemMsg = await bobJoinNotificationPromise;
    clientSocketA.off('receive_message'); // Clean up listener

    if (bobUsersList.length !== 2 || !bobUsersList.find(u => u.username === 'Bob')) {
      throw new Error('Active user list incorrect after Bob joined');
    }
    console.log(`✅ Success: Bob joined room. Alice received system notify: "${systemMsg.text}".`);

    // 4. Test Chat Message Send and Receive
    console.log('\n4. Testing message broadcasting between users...');
    const messageText = 'Hello Bob! Welcome to the chat room.';
    
    const messageReceivePromise = new Promise((resolve, reject) => {
      clientSocketB.once('receive_message', (msg) => {
        if (msg.sender === 'Alice' && msg.text === messageText) {
          resolve(msg);
        } else {
          reject(new Error(`Unexpected message format: ${JSON.stringify(msg)}`));
        }
      });
      setTimeout(() => reject(new Error('Bob did not receive Alice\'s message')), 3000);
    });

    clientSocketA.emit('send_message', { text: messageText });
    
    const receivedMsg = await messageReceivePromise;
    console.log(`✅ Success: Bob received Alice's message: "${receivedMsg.text}" with color indicator: ${receivedMsg.color}`);

    // 5. Test Typing Indicator
    console.log('\n5. Testing typing indicator status events...');
    const typingPromise = new Promise((resolve, reject) => {
      clientSocketA.once('user_typing', (data) => {
        if (data.username === 'Bob' && data.isTyping === true) {
          resolve(data);
        } else {
          reject(new Error(`Unexpected typing data: ${JSON.stringify(data)}`));
        }
      });
      setTimeout(() => reject(new Error('Alice did not receive Bob\'s typing state')), 3000);
    });

    clientSocketB.emit('typing', { isTyping: true });
    
    const typingData = await typingPromise;
    console.log(`✅ Success: Alice received typing indicator for ${typingData.username} (isTyping: ${typingData.isTyping})`);

    // 6. Test Disconnection System Notification
    console.log('\n6. Testing user leave system notification...');
    const bobLeavePromise = new Promise((resolve, reject) => {
      clientSocketA.once('receive_message', (msg) => {
        if (msg.isSystem && msg.text.includes('Bob disconnected')) {
          resolve(msg);
        } else {
          reject(new Error(`Expected disconnect message, got: ${JSON.stringify(msg)}`));
        }
      });
      setTimeout(() => reject(new Error('Alice did not receive Bob\'s disconnect message')), 3000);
    });

    clientSocketB.disconnect();
    
    const disconnectMsg = await bobLeavePromise;
    console.log(`✅ Success: Bob disconnected. Alice received system notify: "${disconnectMsg.text}"`);

    console.log('\n==================================================');
    console.log('🎉 ALL WEBSOCKET CHAT ROOM TESTS PASSED! 🎉');
    console.log('==================================================');
    
    cleanup();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ WebSocket chat room tests failed:');
    console.error(error.stack || error);
    cleanup();
    process.exit(1);
  }
}

// Allow server 1.5 seconds to start up just in case
setTimeout(runTests, 1500);
