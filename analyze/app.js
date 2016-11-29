const path = require('path');

const koa = require('koa');
const staticServer = require('koa-static');
const Mongoose = require('mongoose');

const minimist = require('minimist');

const dbConfig = require('../database/config.js').db;
const dbHandler = require('../database/handler.js');

const argv = minimist(process.argv.slice(2));

const app = new koa();

const post = 5657;

// 连接数据库
const env = argv.env || 'pro';
global.DB = Mongoose.connect('mongodb://' + dbConfig[env].host + ':' + dbConfig[env].port + '/' + dbConfig[env].database, {
	user: dbConfig[env].username,
	pass: dbConfig[env].password
});
const LAGOU = dbHandler('position');

// 挂载所有路由
const routers = require('./routers/index.js');
routers.forEach((item) => {
	app.use(item.routes()).use(item.allowedMethods());
});

// 静态文件
app.use(staticServer(path.join(__dirname, './public')));

// 启动应用
app.listen(post);
console.log(`server listen on port ${post}`);
