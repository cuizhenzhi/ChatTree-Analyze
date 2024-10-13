const sqlite3 = require('sqlite3').verbose();

// 初始化数据库连接
const db = new sqlite3.Database('./userActivity.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');

  // 创建 Users 表
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openai_id TEXT UNIQUE NOT NULL,
      token TEXT,
      language VARCHAR(10),
      email TEXT,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      name TEXT,
      location TEXT,
      first_usage TIMESTAMP
    )`, (err) => {
    if (err) console.error('Error creating Users table', err.message);
  });

  // 创建 ActivityLogs 表
  db.run(`
    CREATE TABLE IF NOT EXISTS ActivityLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action_id INTEGER NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id),
      FOREIGN KEY (action_id) REFERENCES ActionTypes(id)
    )`, (err) => {
    if (err) console.error('Error creating ActivityLogs table', err.message);
  });

  // 创建 ActionTypes 表
  db.run(`
  CREATE TABLE IF NOT EXISTS ActionTypes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  )`, (err) => {
    if (err) console.error('Error creating ActionTypes table', err.message);
    else{

      // 插入预定义的操作类型
      const actions = [
        { name: 'updateCurrentConversationTree', description: 'Update current conversation tree' },
        { name: 'toggleConversationTree', description: 'Toggle visibility of the conversation tree' },
        { name: 'jumptonewnode', description: 'Jump to a new node' },
        { name: 'nodetakenote', description: 'Take note at a node' },
        { name: 'nodebookmark', description: 'Bookmark a node' }
      ];

      actions.forEach(action => {
        db.run(`INSERT OR IGNORE INTO ActionTypes (name, description) VALUES (?, ?)`, [action.name, action.description], (err) => {
          if (err) {
            console.error(`Error inserting action type ${action.name}`, err.message);
          }
        });
      });
    }
  });

});

module.exports = db;
