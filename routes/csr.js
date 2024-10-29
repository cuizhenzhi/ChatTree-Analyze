const {db, runAsync, getActionArray,getAsync} = require("../databaseAsync.js");
const express = require('express');
const {processMapping} = require('../utils/utils.js')

const router = express.Router();

//details
router.post('/dts', (req, res) => {

  let data = '';
  req.on('data', chunk => {
    data += chunk.toString();  // 转换数据为字符串
  });
  req.on('end',  async () => {
    // console.log("/dts",JSON.parse(data));
    let { openai_id, newChats, offset} = JSON.parse(data);
    try {
      const sqlCheckUser = `SELECT * FROM Users WHERE openai_id = ?`;
      const user_row = await getAsync(sqlCheckUser, [openai_id]);

      if (user_row?.openai_id) {
        // console.log("openai_id:", openai_id, "user_id: ", user_row.id)
        // console.log("newChats.length: ",newChats.length);
        const sqlUpsert = `INSERT INTO Conversations (user_id, conversation_id, current_node, create_time, update_time, title, content, is_archived, default_model_slug) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                       ON CONFLICT(user_id, conversation_id) 
                       DO UPDATE SET
                         current_node = excluded.current_node,
                         create_time = excluded.create_time,
                         update_time = excluded.update_time,
                         title = excluded.title,
                         content = excluded.content,
                         is_archived = excluded.is_archived,
                         default_model_slug = excluded.default_model_slug;`;
        for (const chat of newChats) {
          // console.log(chat.conversation_id)
          const createdTime = new Date(chat.create_time * 1000).getTime();
          const updatedTime = new Date(chat.update_time * 1000).getTime();
          const isArchived = chat.is_archived ? 1 : 0;
          processMapping(chat.mapping);
          const content = JSON.stringify(chat);
          await runAsync(sqlUpsert, [user_row.id, chat.conversation_id, chat.current_node, createdTime, updatedTime, chat.title, content, isArchived, chat.default_model_slug]);
        }
        if(offset >= 0){
          const sqlUpdateUserOffset = `UPDATE Users SET lastUpdateOffset = ? WHERE id = ?;`
          await runAsync(sqlUpdateUserOffset, [offset,user_row.id])
        }
        res.send('Data saved successfully.');
      } else {
        res.status(404).send('User not found.');
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
});

router.get('/lu', async (req, res) => {
  console.log('/u')
  const openai_id = req.query.openai_id;  // 从查询参数中获取 openai_id
  const is_archived = req.query.is_archived;  // 从查询参数中获取 openai_id
  if (!openai_id) {
    return res.status(400).send('OpenAI ID is required');
  }

  try {
    const sqlCheckUser = `SELECT * FROM Users WHERE openai_id = ?`;
    const user_row = await getAsync(sqlCheckUser, [openai_id]);
    if (user_row) {
      // console.log("user_row: ",user_row);
      if(is_archived){
        const sqlGetMaxUpdateTime = `SELECT MAX(update_time) as maxUpdateTime FROM Conversations WHERE user_id = ? AND is_archived = 1`;
        const result = await getAsync(sqlGetMaxUpdateTime, [user_row.id]);
        res.send({lastUpdateTime: result.maxUpdateTime / 1000});
      }else {
        const sqlGetMaxUpdateTime = `SELECT MAX(update_time) as maxUpdateTime FROM Conversations WHERE user_id = ?`;
        const result = await getAsync(sqlGetMaxUpdateTime, [user_row.id]);
        res.send({lastUpdateTime: result.maxUpdateTime / 1000, lastUpdateOffset: user_row.lastUpdateOffset});
      }
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router