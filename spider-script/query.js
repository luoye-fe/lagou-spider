const fs = require('fs');
const path = require('path');

const Mongoose = require('mongoose');
const minimist = require('minimist');

const dbConfig = require('../config/db.config.js');

const argv = minimist(process.argv.slice(2));

const env = argv.env || 'pro';

global.DB = Mongoose.connect('mongodb://' + dbConfig[env].host + ':' + dbConfig[env].port + '/' + dbConfig[env].database, {
	user: dbConfig[env].username,
	pass: dbConfig[env].password
});

const dbHandler = require('../database/handler.js');
const LAGOU = dbHandler('position');
























/*
 * 北京前端最低薪资分布图
 * 北京前端最高薪资分布图
 * 北京前端平均薪资分布图
 * 北京前端单位时间新增职位数量分布图
 * 北京前端公司阶段与薪资水平关系图
 * 北京前端公司种类与薪资水平关系图
 * 北京前端
 * 北京前端工作地址分布图
 */





