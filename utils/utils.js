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
    cleanObject(obj); // 清理空值
  }
}

module.exports = {
  cleanObject,
  processMapping
}