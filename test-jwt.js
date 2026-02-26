const jwt = require('jsonwebtoken');

// Simulate admin login payload
const payload = { sub: 'admin-id', role: 'SYSTEM_ADMIN', type: 'admin' };
const token = jwt.sign(payload, 'test-secret');

console.log('Token:', token);
console.log('\nDecoded:', jwt.decode(token));
