const functions = require('firebase-functions');
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
module.exports = require('./server/server');
