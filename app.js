const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const {promisify} = require("util");
const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());  // 替代 bodyParser.json()，因为 bodyParser 已经集成到 Express 中

// 初始化 SQLite 数据库，存储在文件中
const {db,runAsync} = require('./databaseAsync.js')
const uploadInfosRoutes = require('./routes/uploadinfos.js');

app.use('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else next();
});
function extractAppInfo(app) {
  return {
    routes: app._router.stack
      .filter(r => r.route) // 只提取具有路由的堆栈层
      .map(r => ({
        path: r.route.path,
        methods: r.route.methods
      }))
  };
}

// app.get('/', function(req, res) {
//   // res.send(extractAppInfo(app));
//   res.send('helloworld')
// });

app.use('/',uploadInfosRoutes)
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
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
