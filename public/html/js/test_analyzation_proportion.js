let serialize_data =
  [
    {
      "first_version": "2024.10.14.03",
      "curVersion": "2024.10.14.03",
      "user_count": 55
    }, {
    "first_version": "2024.10.14.03",
    "curVersion": "2024.10.17.01",
    "user_count": 1
  }, {
    "first_version": "2024.10.14.03",
    "curVersion": "2024.10.19.01",
    "user_count": 15
  }, {
    "first_version": "2024.10.14.03",
    "curVersion": "2024.10.30.02",
    "user_count": 11
  }, {
    "first_version": "2024.10.14.03",
    "curVersion": "2024.11.03.03",
    "user_count": 9
  }, {
    "first_version": "2024.10.17.01",
    "curVersion": "2024.10.17.01",
    "user_count": 44
  }, {
    "first_version": "2024.10.17.01",
    "curVersion": "2024.10.19.01",
    "user_count": 50
  }, {
    "first_version": "2024.10.17.01",
    "curVersion": "2024.10.30.02",
    "user_count": 53
  }, {
    "first_version": "2024.10.17.01",
    "curVersion": "2024.11.03.02",
    "user_count": 1
  }, {
    "first_version": "2024.10.17.01",
    "curVersion": "2024.11.03.03",
    "user_count": 24
  }, {
    "first_version": "2024.10.19.01",
    "curVersion": "2024.10.19.01",
    "user_count": 167
  }, {
    "first_version": "2024.10.19.01",
    "curVersion": "2024.10.30.02",
    "user_count": 58
  }, {
    "first_version": "2024.10.19.01",
    "curVersion": "2024.11.03.02",
    "user_count": 3
  }, {
    "first_version": "2024.10.19.01",
    "curVersion": "2024.11.03.03",
    "user_count": 35
  }, {
    "first_version": "2024.10.30.02",
    "curVersion": "2024.10.30.02",
    "user_count": 133
  }, {
    "first_version": "2024.10.30.02",
    "curVersion": "2024.11.03.02",
    "user_count": 1
  }, {
    "first_version": "2024.10.30.02",
    "curVersion": "2024.11.03.03",
    "user_count": 26
  }, {
    "first_version": "2024.11.03.02",
    "curVersion": "2024.11.03.02",
    "user_count": 1
  }, {
    "first_version": "2024.11.03.02",
    "curVersion": "2024.11.03.03",
    "user_count": 1
  }, {"first_version": "2024.11.03.03", "curVersion": "2024.11.03.03", "user_count": 36}];
let first_data = [
  {"first_version": "2024.10.14.03", "user_count": 91}, {
    "first_version": "2024.10.17.01",
    "user_count": 172
  }, {"first_version": "2024.10.19.01", "user_count": 263}, {
    "first_version": "2024.10.30.02",
    "user_count": 160
  }, {"first_version": "2024.11.03.02", "user_count": 2}, {"first_version": "2024.11.03.03", "user_count": 36}]
let cur_data = [{"curVersion": "2024.10.14.03", "user_count": 55}, {
  "curVersion": "2024.10.17.01",
  "user_count": 45
}, {"curVersion": "2024.10.19.01", "user_count": 232}, {
  "curVersion": "2024.10.30.02",
  "user_count": 255
}, {"curVersion": "2024.11.03.02", "user_count": 6}, {"curVersion": "2024.11.03.03", "user_count": 131}]

// getProportionOption(serialize_data, first_data, cur_data)
function getProportionOption(serialize_data, first_data, cur_data){
  let versions = [...new Set([...first_data.map(i=>i.first_version), ...cur_data.map(i=>i.curVersion)])].sort()
  let option_data = versions.map((i,outindex)=>{
    let arr = new Array(versions.length)
    for(let i = 0; i < versions.length; i++){
      if(i >= outindex){
        arr[i] = 0;
      }
    }
    return arr;
  })
  const time_index_map = {};
  versions.forEach((i,index)=>time_index_map[i] = index)
  // console.log(time_index_map,);
  serialize_data.forEach(i=>{
    option_data[time_index_map[i.first_version]][time_index_map[i.curVersion]] = i.user_count;
  })

  // console.log(option_data)
  let time_index_arr = Object.keys(time_index_map)
  // console.log(time_index_arr, time_index_map);
  option_data.forEach((versiondata, index)=>{
    let firstV = time_index_arr[index]
    for(let i = versiondata.length - 1;i >=index ;i--){
      versiondata[i] += (i<versiondata.length - 1)? versiondata[i+1] : 0
    }
  })
  console.log(option_data)
  let seriesdata = Object.keys(time_index_map).map(i=>{
    return{
      name: i,
      type: 'line',
      stack: 'Total',
      data: option_data[time_index_map[i]]

    }
  })
// console.log("seriesdata:",seriesdata);
  option = {
    title: {
      text: 'User preservation proportion'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: Object.keys(time_index_map)
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
      data: Object.keys(time_index_map)
    },
    yAxis: {
      type: 'value'
    },
    series: seriesdata
  };
  // console.dir(option, {depth: null});
  return option;
}
// let data = first_data.map(i => new Array(first_data.length))
// console.log(data)
module.exports = {
  getProportionOption
}