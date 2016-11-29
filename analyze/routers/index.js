const Router = require('koa-router');

const View = require('./view.js');
const Query = require('./query.js');

// const Common = new Router();

// // 错误重定向
// Common.all('*', (ctx, next) => {
// 	console.log('error page');
// 	ctx.redirect('http://luoye.pw');
// 	ctx.status = 404;
// });

module.exports = [View, Query];
