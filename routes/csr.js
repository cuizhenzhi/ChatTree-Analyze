const {db, runAsync, getActionArray,getAsync} = require("../databaseAsync.js");
const express = require('express');
const {processMapping} = require('../utils/utils.js')

const router = express.Router();

async function updateMaxUpdateTime(user_id, is_archived) {
  const sqlGetMaxUpdateTime = `SELECT MAX(update_time) as maxUpdateTime FROM Conversations WHERE user_id = ? AND is_archived = ?`;
  const maxUpdateTimeRow = await getAsync(sqlGetMaxUpdateTime, [user_id, is_archived ? 1 : 0]);
  if (!maxUpdateTimeRow || !maxUpdateTimeRow.maxUpdateTime) {
    console.error('No conversations found for the user');
    return;
  }
  const maxUpdateTime = maxUpdateTimeRow.maxUpdateTime;
  const sqlUpdateUser = is_archived ?
    `UPDATE Users SET last_updated = ?, archived_ts = ? WHERE id = ?` :
    `UPDATE Users SET last_updated = ?, non_archived_ts = ? WHERE id = ?`;
  await runAsync(sqlUpdateUser, [new Date().getTime(), maxUpdateTime, user_id]);
}


//details
router.post('/dts', (req, res) => {

  let data = '';
  req.on('data', chunk => {
    data += chunk.toString();  // 转换数据为字符串
  });
  req.on('end',  async () => {
    // console.log("/dts",JSON.parse(data));
    let { openai_id, newChats} = JSON.parse(data);
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
        let isArchived = newChats[0].is_archived
        await runAsync('BEGIN TRANSACTION');

        // console.log("newChats.length: ",newChats.length, "isArchived: ", isArchived);
        for (const chat of newChats) {
          // console.log(chat.conversation_id)
          const createdTime = new Date(chat.create_time * 1000).getTime();
          const updatedTime = new Date(chat.update_time * 1000).getTime();
          // const isArchived = chat.is_archived ? 1 : 0;
          processMapping(chat.mapping);
          const content = JSON.stringify(chat);
          await runAsync(sqlUpsert, [user_row.id, chat.conversation_id, chat.current_node, createdTime, updatedTime, chat.title, content, isArchived, chat.default_model_slug]);
        }
        await runAsync('COMMIT');

        console.log("dts openai_id: ",openai_id, "user_row.id:", user_row.id);
        await updateMaxUpdateTime(user_row.id, isArchived)
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

/**
 * lastUpdateState： {
 *   lastUpdateTimeStamp(last_updated):
 *   nonArchiveConversationTimeStamp(non_archived_ts):
 *   ArchiveConversationTimeStamp(archived_ts):
 * }
 */
router.get('/lu', async (req, res) => {
  try {
    console.log('/u')
    // res.send({last_updated: 0, archived_ts:1718978885.898, non_archived_ts: 1730485161.170});
    // return;
    const openai_id = req.query.openai_id;  // 从查询参数中获取 openai_id
    // const is_archived = req.query.is_archived;  // 从查询参数中获取 openai_id
    if (!openai_id) {
      return res.status(400).send('OpenAI ID is required');
    }
    if(openai_id === "user-LIqRZ8zThmAUTxofWxSDB9p6"){
      res.send({last_updated: 1000000000000000, archived_ts:1718978885.898, non_archived_ts: 1730485161.170});
      return
    }
    console.log("lu openai_id: ",openai_id);
    const sqlCheckUser = `SELECT * FROM Users WHERE openai_id = ?`;
    const user_row = await getAsync(sqlCheckUser, [openai_id]);
    if (user_row) {
        // const sqlGetMaxUpdateTime = `SELECT MAX(update_time) as maxUpdateTime FROM Conversations WHERE user_id = ? AND is_archived = 1`;
        // const result = await getAsync(sqlGetMaxUpdateTime, [user_row.id]);
        // res.send({lastUpdateTime: result.maxUpdateTime / 1000});
      // console.log(user_row)
      let {last_updated, archived_ts, non_archived_ts} = user_row;
      res.send({last_updated, archived_ts:archived_ts/1000, non_archived_ts: non_archived_ts/1000});
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Internal server error');
  }
});



// router.get('/c', async (req, res) => {
//   try {
//     console.log('/u')
//     // res.send({last_updated: 0, archived_ts:1718978885.898, non_archived_ts: 1730485161.170});
//     // return;
//     const conversation_id = req.query.id;  // 从查询参数中获取 openai_id
//     // console.log("lu openai_id: ",openai_id);
//     const sqlCheckchat = `SELECT * FROM Conversations WHERE conversation_id = ?`;
//     const chatrow = await getAsync(sqlCheckchat, [conversation_id]);
//     if (chatrow) {
//       // const sqlGetMaxUpdateTime = `SELECT MAX(update_time) as maxUpdateTime FROM Conversations WHERE user_id = ? AND is_archived = 1`;
//       // const result = await getAsync(sqlGetMaxUpdateTime, [user_row.id]);
//       // res.send({lastUpdateTime: result.maxUpdateTime / 1000});
//       // console.log(user_row)
//       // let {last_updated, archived_ts, non_archived_ts} = user_row;
//       res.send(chatrow);
//     } else {
//       res.status(404).send('User not found');
//     }
//   } catch (error) {
//     console.error('Database error:', error);
//     res.status(500).send('Internal server error');
//   }
// });

module.exports = router