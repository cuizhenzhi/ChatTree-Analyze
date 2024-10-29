const {db, runAsync, getActionArray} = require("../databaseAsync.js");
const express = require('express');
const router = express.Router();

let actionArr;
getActionArray()
  .then(data => actionArr = data);//require('../metadatas/actionArr.js')
router.get('/arrs', (req, res) => {
  getActionArray()
    .then(actionArr => res.send(actionArr))
    .catch(err => res.status(500).send('Error loading data'));
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
   // console.log("/user",JSON.parse(data));
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
    // console.log('language',language)
    const sqlCheck = `SELECT * FROM Users WHERE openai_id = ?`;
    db.get(sqlCheck, [openai_id], (err, row) => {
      if (err) {
        // console.log("Error querying SQL", err);
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
      curVersion = ?,
      last_usage = ?
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

          curVersion,

          new Date().getTime(), row.id], function(err) {
          if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).send('Failed to update user');
          }

          // console.log(`Rows updated: ${this.changes}, ${row.id}`);
          res.send('User ' + row.id + ' updated successfully');
        });
        return;
      }
      const sqlInsert = `INSERT INTO Users (id, openai_id, token, language, email, created, name, location, first_usage, last_usage,
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
      curVersion,
          
      first_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?,?, ?, ?, ? ,?, ?, ?, ?, ?, ?)`;
      created = new Date(created).getTime()
      // console.log(created,  now.getTime())
      db.run(sqlInsert, [ undefined, openai_id, token, language, email, created, name, location , now.getTime(), now.getTime(),
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

        curVersion,
        curVersion], function(err) {
        if (err) {
          // console.log("Error operating SQL", err);
          return console.error(err.message);
        }
        let tolog = `[Users]: 1 row inserted with rowid ${this.lastID}`
        // console.log(tolog);
        res.send('Data saved successfully' + tolog);
      });
    });
  });
});

router.post('/user/originLocation', (req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk.toString();  // 转换数据为字符串
  });
  req.on('end', () => {
  //  console.log("/user/originLocation",JSON.parse(data));
    let {
      openai_id,
      location: location_origin,
      country: country_origin,
      countryCode: countryCode_origin,
      city: city_origin,
      lat: lat_origin,
      lon: lon_origin,
      query: query_origin,
      regionName: regionName_origin,
      timezone: timezone_origin,
    } = JSON.parse(data);
    // console.log('language',language)
    const sqlCheck = `SELECT * FROM Users WHERE openai_id = ?`;
    db.get(sqlCheck, [openai_id], (err, row) => {
      if (err) {
        // console.log("Error querying SQL", err);
        return console.error(err.message);
      }
      const now = new Date();
      //如果有记录，更新返回，如果没有则添加新用户信息
      if (row?.openai_id) {
        const sql = `
        UPDATE Users
        SET
        location_origin = ?,
        country_origin = ?,
        countryCode_origin = ?,
        city_origin = ?,
        lat_origin = ?,
        lon_origin= ?,
        query_origin = ?,
        regionName_origin = ?,
        timezone_origin = ?
    WHERE id = ?;`;
        db.run(sql, [
          location_origin,
          country_origin,
          countryCode_origin,
          city_origin,
          lat_origin,
          lon_origin,
          query_origin,
          regionName_origin,
          timezone_origin,

          row.id], function(err) {
          if (err) {
            console.error('Error executing SQL:', err);
            return res.status(500).send('Failed to update user');
          }

          // console.log(`Rows updated: ${this.changes}, ${row.id}`);
          res.send('User ' + row.id + ' updated successfully');
        });
      }
    });
  });
});

router.get('/checkupdate',(req,res)=>{
  res.send({
    "version": '2024.10.30.02',
    "releaseDate": "2024-10-30",
    "description": "New Feature: Multi-Dragging-Version-ChatTree of a single conversation is available now! Update to check it out!",
    "descriptions": {"zh": "新版本特性：一颗对话树可留存多个版本的拖拽记录，实现一次对话产生不同版本的思维导图。"},
    "downloadUrl": "https://greasyfork.org/en/scripts/476683-chatgpt-chattree",
    "urgency": "medium"
  })
})


module.exports = router