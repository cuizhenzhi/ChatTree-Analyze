const {db, runAsync} = require("../databaseAsync");
const express = require('express');
const router = express.Router();

let actionArr;
db.all(`select * from ActionTypes` , function(err, data) {
  if (err) {
    console.error('Error executing SQL:', err);
    // return res.status(500).send('Failed to update user');
  }
  // console.log(data)
  actionArr = data
  // console.log(`Rows updated: ${this.changes}, ${row.id}`);
  // res.send(data)//'User ' + row.id + ' updated successfully');
});

router.post('/uploadinfos', (req, res) => {
  let data = '';

  req.on('data', chunk => {
    data += chunk.toString();  // 转换数据为字符串
  });

  req.on('end', () => {
    const { id } = JSON.parse(data);  // 解析字符串为 JSON
    if (!id) {
      console.log('There is no id!');
      return res.status(400).send('ID is required');
    }

    // 查询数据库中相同 ID 的最新记录
    const sqlCheck = `SELECT timestamp FROM activity WHERE id = ? ORDER BY timestamp DESC LIMIT 1`;
    db.get(sqlCheck, [id], (err, row) => {
      if (err) {
        console.log("Error querying SQL", err);
        return console.error(err.message);
      }

      const now = new Date();
      if (row) {
        const lastTimestamp = new Date(row.timestamp);
        const diffSeconds = (now - lastTimestamp) / 1000;  // 时间差（秒）

        // 如果时间差小于3秒，忽略这次请求
        if (diffSeconds < 3) {
          console.log(`Ignoring request for ${id} as it's only been ${diffSeconds} seconds since the last record.`);
          return res.status(200).send('Request ignored due to timing constraints.');
        }
      }

      // 如果没有最近的记录或时间差大于3秒，插入新记录
      const sqlInsert = `INSERT INTO activity (id, timestamp) VALUES (?, ?)`;

      db.run(sqlInsert, [id, now.toISOString()], function(err) {
        if (err) {
          console.log("Error operating SQL", err);
          return console.error(err.message);
        }
        let tolog = `[activity]: 1 row inserted with rowid ${this.lastID}`
        console.log(tolog);
        res.send('Data saved successfully' + tolog);
      });
    });
  });
});

router.post('/activitylog', (req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk.toString();  // 转换数据为字符串
  });
  req.on('end', () => {
    let { openai_id, action, timestamp } = JSON.parse(data);
    const sqlCheck = `SELECT * FROM Users WHERE openai_id = ?`;
    db.get(sqlCheck, [openai_id], (err, row) => {
      if (err) {
        console.log("Error querying SQL", err);
        return console.error(err.message);
      }
      const now = new Date();
      //如果有记录，更新返回，如果没有则添加新用户信息
      if (row?.openai_id) {
        const sql = `
    INSERT INTO ActivityLogs (id, user_id, action_id, timestamp) VALUES (?, ?,?,?);`;
        db.run(sql, [undefined, row.id, actionArr[actionArr.findIndex(i=>{return i.name === action})].id, timestamp], function(err) {
          if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).send('Failed to update user');
          }
          console.log(`Rows updated: ${this.changes}, ${row.id}`);
          res.send(`Data created successfully ${ openai_id, action, timestamp }`);
          // res.send('User ' + row.id + ' updated successfully');
        });
      }else{
        res.send(`No Such id: ${ openai_id}, refuse to insert.`);
      }
    });
  });
});

router.post('/user', (req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk.toString();  // 转换数据为字符串
  });
  req.on('end', () => {
    let { id, openai_id, at: token, language, email, created, name, location,
      country,
      countryCode,
      city,
      lat,
      lon,
      query,
      regionName,
      timezone,
      expires: token_expires,
      phone_number,
      name_account,
      curVersion
    } = JSON.parse(data);
    console.log('language',language)
    const sqlCheck = `SELECT * FROM Users WHERE openai_id = ?`;
    db.get(sqlCheck, [openai_id], (err, row) => {
      if (err) {
        console.log("Error querying SQL", err);
        return console.error(err.message);
      }
      const now = new Date();
      //如果有记录，更新返回，如果没有则添加新用户信息
      if (row?.openai_id) {
        const sql = `
    UPDATE Users
    SET token = ?,
        language = ?,
        email = ?,
        name = ?,
        location = ?,
        country = ?,
            countryCode = ?,
            city = ?,
            lat = ?,
            lon= ?,
            query = ?,
            regionName = ?,
            timezone = ?,
      token_expires = ?,
      phone_number = ?,
      name_account = ?,
      curVersion = ?
    WHERE id = ?;`;
        db.run(sql, [token, language, email, name, location,
          country,
          countryCode,
          city,
          lat,
          lon,
          query,
          regionName,
          timezone,

          token_expires,
          phone_number,
          name_account,

          curVersion, row.id], function(err) {
          if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).send('Failed to update user');
          }

          console.log(`Rows updated: ${this.changes}, ${row.id}`);
          res.send('User ' + row.id + ' updated successfully');
        });
        return;
      }
      const sqlInsert = `INSERT INTO Users (id, openai_id, token, language, email, created, name, location, first_usage,
          country,
          countryCode,
          city,
          lat,
          lon,
          query,
          regionName,
          timezone,
      token_expires,
      phone_number,
      name_account,
      
      curVersion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?,?, ?, ?, ? ,?, ?, ?, ?)`;
      created = new Date(created).getTime()
      console.log(created,  now.getTime())
      db.run(sqlInsert, [ undefined, openai_id, token, language, email, created, name, location , now.getTime(),
        country,
        countryCode,
        city,
        lat,
        lon,
        query,
        regionName,
        timezone,

        token_expires,
        phone_number,
        name_account,

        curVersion], function(err) {
        if (err) {
          console.log("Error operating SQL", err);
          return console.error(err.message);
        }
        let tolog = `[Users]: 1 row inserted with rowid ${this.lastID}`
        console.log(tolog);
        res.send('Data saved successfully' + tolog);
      });
    });
  });
});
router.get('/checkupdate',(req,res)=>{
  res.send({
    "version": '2024.10.14.1',
    "releaseDate": "2024-10-14",
    "description": "Added new features and fixed bugs.",
    "downloadUrl": "https://greasyfork.org/en/scripts/476683-chatgpt-chattree",
    "urgency": "high"
  })
})
// router.get('/list',(req,res)=>{
//
// })

module.exports = router