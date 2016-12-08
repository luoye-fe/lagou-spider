Vue.directive('chart', {
	bind(el) {
		// console.log(el);
		el.style.width = document.body.clientWidth/10*9 + 'px';
		el.style.height = document.body.clientWidth/10*9/16*9 + 'px';
	},
	inserted(el, binding) {
		var myChart = echarts.init(el);
		myChart.setOption(binding.value);
	}
})

fetch(`/public/result.json?timestamp=${Date.now()}`)
	.then(function(res) {
		return res.json();
	})
	.then(function(res) {
		new Vue({
			el: '#app',
			data: {
				generateTime: res.generateTime,
				charts: res.charts
			},
			template: `
<div>
	<h1>图表更新时间：{{new Date(generateTime).toLocaleTimeString('ja-chinese', {year: "numeric", month: '2-digit', day: '2-digit'})}}</h1>
	<div class="charts" v-for="item in charts" v-chart="item"></div>
</div>
`,
			mounted() {
				// console.log(this.charts);
			},
			methods: {

			}
		})

	})
