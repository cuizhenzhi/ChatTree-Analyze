function cleanObject(obj) {
  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === "" || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete obj[key]; // 删除空字符串、null、空数组
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      cleanObject(value); // 递归检查对象
      if (Object.keys(value).length === 0) {
        delete obj[key]; // 如果对象为空，则删除
      }
    }
  }
}
const maxDepth = 10;
function cleanObject2(obj, seen = new WeakSet(), depth = 0) {
  if (depth > maxDepth) return;

  if (obj === null || typeof obj !== 'object') return;

  // 防止循环引用导致的无限递归
  if (seen.has(obj)) return;
  seen.add(obj);

  const keys = Object.keys(obj);
  for (const key of keys) {
    const value = obj[key];

    // 删除值为 null、""、undefined、空数组的属性
    if (
      value === null ||
      value === '' ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete obj[key];
      continue;
    }

    // 如果值是对象，递归处理
    if (typeof value === 'object') {
      cleanObject2(value, seen, depth + 1);

      // 检查子对象是否为空，如果为空则删除
      if (
        Object.prototype.toString.call(value) === '[object Object]' &&
        Object.keys(value).length === 0
      ) {
        delete obj[key];
      }
    }
  }
}

function cleanObject3(obj, depth = 0, maxDepth = 10) {
  if (depth > maxDepth) return;
  for (const key in obj) {
    const value = obj[key];
    if (
      value === null ||
      value === '' ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete obj[key];
    } else if (typeof value === 'object') {
      cleanObject3(value, depth + 1, maxDepth);
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    }
  }
}

function processMapping(mapping) {
  for (const key in mapping) {
    const obj = mapping[key];
    if (obj.message?.author?.role === 'assistant') {
      if (obj.message?.metadata?.model_slug) {
        obj.message.model_slug = obj.message.metadata.model_slug;
      }
    }
    delete obj.message?.metadata
    delete obj.message?.id
    cleanObject3(obj); // 清理空值
  }
}


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
  cleanObject,
  processMapping,
  getProportionOption
}