const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());  // 替代 bodyParser.json()，因为 bodyParser 已经集成到 Express 中

// 初始化 SQLite 数据库，存储在文件中
const db = new sqlite3.Database('./userActivity.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
  db.run('CREATE TABLE IF NOT EXISTS activity (id TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)', (err) => {
    if (err) {
      console.error(err.message);
    }
  });
});
app.use('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else next();
});
// 接收 GET 请求
// app.post('/uploadinfos', (req, res) => {
//   const { id } = req.body;
//   if (!id) {
//     console.log('There is no id!')
//     return res.status(400).send('ID is required');
//   }
//
//   const sql = `INSERT INTO activity (id) VALUES (?)`;
//   db.run(sql, [id], function(err) {
//     if (err) {
//       console.log("Error operating SQL", err);
//       return console.error(err.message);
//     }
//     console.log(`A row has been inserted with rowid ${this.lastID}`);
//     res.send('Data saved successfully');
//   });
// });
app.get('helloword',(req,res)=>{
  res.send("Hello, World!")
})
app.post('/uploadinfos', (req, res) => {
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
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.send('Data saved successfully');
      });
    });
  });
});


// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing the database connection.');
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
