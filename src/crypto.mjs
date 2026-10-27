import crypto from 'node:crypto';

const hash = crypto.createHash('sha256').update('your_password').digest('hex');

console.log(hash);

