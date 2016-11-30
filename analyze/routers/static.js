const path = require('path');

const Router = require('koa-router');
const send = require('koa-send');

const Static = new Router({
	prefix: '/public'
});

const root = path.join(__dirname, '../public/');

Static.get('*', async (ctx, next) => {
	await send(ctx, ctx.path.replace('/public/', ''), {
		root: root
	});
});

module.exports = Static;