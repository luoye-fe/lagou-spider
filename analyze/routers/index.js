const Router = require('koa-router');

const View = require('./view.js');
const Static = require('./static.js');

module.exports = [View, Static];
