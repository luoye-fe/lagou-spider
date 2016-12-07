const fs = require('fs');
const path = require('path');

const Mongoose = require('mongoose');
const minimist = require('minimist');
const ora = require('ora');

const logger = require('./logger.js');

const dbConfig = require('../config/db.config.js');

const argv = minimist(process.argv.slice(2));

const env = argv.env || 'pro';

// global.DB = Mongoose.connect('mongodb://' + dbConfig[env].host + ':' + dbConfig[env].port + '/' + dbConfig[env].database, {
// 	user: dbConfig[env].username,
// 	pass: dbConfig[env].password
// });

// const dbHandler = require('../database/handler.js');
// const LAGOU = dbHandler('position');

const targetJSON = path.join(__dirname, '../analyze/public/result.json');


// 修正最高薪资
/*
LAGOU.find({
	'salary-max': 999
}, (err, docs) => {
	let index = 0;
	function loop() {
		if (!docs[index]) return;
		let item  = docs[index];
		LAGOU.update({
			'positionId': item.positionId
		}, {
			$set: {
				'salary-max': item['salary-min']
			}
		}, (err, raw) => {
			if (err) return err;
			console.log(raw);
			index++;
			loop();
		});
	}
	loop();
})
*/


let result = [];

let spinner = ora('正在获取库数据 ...').start();
// LAGOU.find({}, (err, docs) => {
// 	spinner.stop();
// 	logger.success(`获取库数据成功，共 ${docs.length} 条数据`);
// 	fs.writeFileSync(targetJSON, JSON.stringify(docs));
// });

fs.readFile(targetJSON, 'utf-8', async(err, docs) => {
	spinner.stop();
	logger.success(`获取库数据成功，共 ${docs.length} 条数据`);
	await averageSalary(JSON.parse(docs));
});


// 前端平均薪资分布图 (北京、上海、广州、深圳、杭州、南京)
async function averageSalary(docs) {
	let result = {
		'北京': {},
		'上海': {},
		'广州': {},
		'深圳': {},
		'杭州': {},
		'南京': {}
	};

	docs.forEach((item) => {
		let averageSalary = (item['salary-min'] + item['salary-max']) / 2;
		if (result[item.city]) {
			result[item.city][averageSalary] ? result[item.city][averageSalary]++ : result[item.city][averageSalary] = 1;
		}
	});

	let resultData = [];

	Object.keys(result).forEach((key, index) => {
		if (!resultData[index]) {
			resultData[index] = [];
		}
		Object.keys(result[key]).forEach((each) => {
			resultData[index].push([result[key][each], each])
		});
	});

	let itemStyle = {
		normal: {
			opacity: 0.8,
			shadowBlur: 10,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			shadowColor: 'rgba(0, 0, 0, 0.5)'
		}
	};

	let echartOption = {
		backgroundColor: '#404a59',
		// color: [
		// '#dd4444', '#fec42c', '#80F1BE'
		// ],
		// title: {
		// 	text: '123',
		// 	x: 'center',
		// 	y: 0,
		// 	textStyle: {
		// 		color: '#fff'
		// 	}
		// },
		grid: {
			show: true
		},
		legend: {
			y: 'top',
			data: ['北京', '上海', '广州', '深圳', '杭州', '南京'],
			textStyle: {
				color: '#fff',
				fontSize: 16
			}
		},
		xAxis: {
			type: 'value',
			name: '薪资(K)',
			nameTextStyle: {
				color: '#fff',
				fontSize: 14
			},
			axisLine: {
				lineStyle: {
					color: '#eee'
				}
			}
		},
		yAxis: {
			type: 'value',
			name: '公司数量',
			nameTextStyle: {
				color: '#fff',
				fontSize: 14
			},
			axisLine: {
				lineStyle: {
					color: '#eee'
				}
			}
		},
		visualMap: [{
			left: '90%',
			top: '5%',
			dimension: 1,
			min: 0,
			max: 50,
			itemWidth: 25,
			itemHeight: 120,
			calculable: true,
			precision: 0.1,
			text: ['圆形大小：公司数量'],
			textGap: 30,
			textStyle: {
				color: '#fff'
			},
			inRange: {
				symbolSize: [10, 50]
			},
			outOfRange: {
				symbolSize: [10, 50],
				color: ['rgba(255,255,255,.2)']
			},
			controller: {
				inRange: {
					color: ['#c23531']
				},
				outOfRange: {
					color: ['#444']
				}
			}
		}],
		tooltip: {
			padding: 10,
			backgroundColor: '#222',
			borderColor: '#777',
			borderWidth: 1,
			formatter: function(obj) {
				var value = obj.value;
				return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
				               + obj.seriesName + '</div>'
				               + '公司数量：' + value[0] + '<br>'
				               + '薪资水平：' + value[1] + '<br>'
			}
		},
		series: [{
			type: 'scatter',
			name: '北京',
			data: resultData[0],
			itemStyle: itemStyle
		}, {
			type: 'scatter',
			name: '上海',
			data: resultData[1],
			itemStyle: itemStyle
		}, {
			type: 'scatter',
			name: '广州',
			data: resultData[2],
			itemStyle: itemStyle
		}, {
			type: 'scatter',
			name: '深圳',
			data: resultData[3],
			itemStyle: itemStyle
		}, {
			type: 'scatter',
			name: '杭州',
			data: resultData[4],
			itemStyle: itemStyle
		}, {
			type: 'scatter',
			name: '杭州',
			data: resultData[5],
			itemStyle: itemStyle
		}]
	};
	// console.log(JSON.stringify(echartOption));
	console.log(resultData[0]);
	return echartOption;
}















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
