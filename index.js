process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const dev = !(process.env.NODE_ENV === 'production' );

if (dev) {
    module.exports = require('./__sapper__/dev/server/server');
} else {
    module.exports = require('./__sapper__/build/server/server');
}
