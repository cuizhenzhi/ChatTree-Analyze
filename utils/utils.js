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

module.exports = {
  cleanObject,
  processMapping
}