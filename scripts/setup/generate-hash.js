// Generate bcrypt hash for demo password
const bcrypt = require('bcryptjs');

const password = 'demo123';

bcrypt.hash(password, 10).then(hash => {
    console.log('Bcrypt hash for "demo123":');
    console.log(hash);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});





















