import crypto from 'crypto';

// Generate a 64-byte random string, encoded in hexadecimal format
const secretKey = crypto.randomBytes(64).toString('hex');

console.log(secretKey);