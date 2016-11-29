const Router = require('koa-router');

const Query = new Router({
	prefix: '/query'
});


// 北京前端工作地址分布图
Query.get('/', (ctx, next) => {

});

module.exports = Query;
