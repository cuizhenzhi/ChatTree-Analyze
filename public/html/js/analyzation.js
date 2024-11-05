// var echarts = require('echarts');
console.log(echarts)
var chartDom = document.getElementById('main');
console.log("chartDom: ", chartDom);
var myChart = echarts.init(chartDom);
fetch('http://localhost:3003/analyze/user/preserve_proportion')
  .then(async (resp) => await resp.json())
  .then((mydata) => {
  console.log("data:", mydata);
    var option;

    option = {
      title: {
        text: 'User preservation proportion'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine', 'wtf']


      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [1,2,3,4,5,6]
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Email',
          type: 'line',
          stack: 'Total',
          data: [ 91, 36, 35, 20, 9, 9 ]
        },
        {
          name: 'Union Ads',
          type: 'line',
          stack: 'Total',
          data: [ 0, 172, 128, 78, 25, 24 ]
        },
        {
          name: 'Video Ads',
          type: 'line',
          stack: 'Total',
          data: [ 0, 0, 263, 96, 38, 35 ]
        },
        {
          name: 'Direct',
          type: 'line',
          stack: 'Total',
          data: [ 0, 0, 0, 160, 27, 26 ]
        },
        {
          name: 'Search Engine',
          type: 'line',
          stack: 'Total',
          data: [ 0, 0, 0, 0, 2, 1 ]
        },
        {
          name: 'wtf',
          type: 'line',
          stack: 'Total',
          data:  [ 0, 0, 0, 0, 0, 36 ]

        }
      ]
    };

    option && myChart.setOption(mydata);
})