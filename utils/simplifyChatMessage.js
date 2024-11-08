// function getChangeIdFunc() {
//   let id_numbers = 0;
//   let node_id_map = {};
//   return function changeId(id) {
//     if (node_id_map[id]) {
//       return node_id_map[id];
//     }
//     node_id_map[id] = id_numbers;
//     id_numbers++;
//     return node_id_map[id];
//   };
// }
// function BatchChangeIds(mapping) {
//   let changeId = getChangeIdFunc();
//   let newMapping = {};
//   for (const key in mapping) {
//     if (mapping.hasOwnProperty(key)) {
//       const node = mapping[key];
//       const newKey = changeId(key);
//       newMapping[newKey] = {
//         ...node,
//         id: newKey,
//         children: Array.isArray(node.children)
//           ? node.children.map(childId => changeId(childId))
//           : null,
//         parent: node.parent ? changeId(node.parent) : null // 更新 `parent` ID
//       };
//     }
//   }
//
//   return newMapping;
// }
// function simplifyChatMessage(chatRow) {
//   chatRow.mapping = BatchChangeIds(chatRow.mapping);
//   return chatRow;
// }
// let testMap = {
//   'uuid1': {},
//   'uuid2': {},
//   'uuid3': {},
//   'uuid4': {},
//   'uuid5': {}
// }
// console.log(BatchChangeIds(testMap))
function simplifyChatMessage(chatRow) {
  console.log("before simplify:",JSON.stringify(chatRow).length);
  let node_id_map = {};

  function getChangeIdFunc() {
    let id_numbers = 0;
    return function changeId(id) {
      if (node_id_map.hasOwnProperty(id)) { // 修改这里
        return node_id_map[id].toString();
      }
      node_id_map[id] = id_numbers;
      id_numbers++;
      return node_id_map[id].toString();
    };
  }

  let changeId = getChangeIdFunc();

  // 先处理当前节点的 ID
  chatRow.current_node = changeId(chatRow.current_node);

  function BatchChangeIds(mapping) {
    let newMapping = {};

    // 遍历每一个对象并修改其 `id`, `children`, 和 `parent`
    for (const key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        const node = mapping[key];

        // 获取并设置新的键名
        const newKey = changeId(key);
        newMapping[newKey] = {
          ...node, // 复制节点内容
          id: newKey, // 更新当前节点的 `id`
        };
        if(node.children){
          newMapping[newKey].children = node.children.map(childId => changeId(childId))
        }
        if(node.parent){
          newMapping[newKey].parent = changeId(node.parent);
        }
      }
    }

    return newMapping;
  }

  // 调用 BatchChangeIds 处理 chatMapping 并替换原始 mapping
  chatRow.mapping = BatchChangeIds(chatRow.mapping);
  console.log("after simplify:",JSON.stringify(chatRow).length);

  return chatRow;
}

module.exports = {
  simplifyChatMessage
}