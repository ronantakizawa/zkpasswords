const { setPassword, checkPassword } = require('zkauth');

// Test setPassword function
async function testSetPassword() {
    try {
        const username = 'testUser2';
        const password = 'testPass123';
        const message = await setPassword(username, password);
        console.log('setPassword success:', message);
    } catch (error) {
        console.error('setPassword error:', error.message);
    }
}

// Test checkPassword function
async function testCheckPassword() {
    try {
        const username = 'testUser2';
        const password = 'testPass123';
        const logs = await checkPassword(username, password);
        console.log('checkPassword success:', logs);
    } catch (error) {
        console.error('checkPassword error:', error.message);
    }
}

// Run the tests
testSetPassword().then(() => testCheckPassword());
