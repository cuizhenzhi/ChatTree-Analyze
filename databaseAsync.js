const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// 初始化数据库连接
const db = new sqlite3.Database('./userActivity.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');

});

const runAsync = promisify(db.run.bind(db))
const getAsync = promisify(db.get.bind(db))
const getAllAsync = promisify(db.all.bind(db))
async function setupDatabase(){

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
      first_usage TIMESTAMP,
      city TEXT,
      country TEXT,
      countryCode TEXT,
      lat REAL,
      lon REAL,
      query TEXT,
      timezone TEXT,
      token_expires TIMESTAMP,
      phone_number TEXT,
      name_account TEXT,
      curVersion TEXT,
      regionName TEXT,
      location_origin TEXT,
      country_origin TEXT,
      countryCode_origin TEXT,
      city_origin TEXT,
      lat_origin REAL,
      lon_origin REAL,
      query_origin TEXT,
      regionName_origin TEXT,
      timezone_origin TEXT,
      first_version TEXT,
      last_usage TIMESTAMP,
      last_updated TIMESTAMP,
      non_archived_ts TIMESTAMP,
      archived_ts TIMESTAMP
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
    )`, async (err) => {
    if (err) {
      console.error('Error creating ActivityLogs table', err.message);
      return
    }
    try {
      await runAsync('CREATE TABLE IF NOT EXISTS ActionTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT)');

      const actions = [
        { name: 'useScript', description: 'Record the time user open the page with Chattree' },
        { name: 'updateCurrentConversationTree', description: 'Update current conversation tree' },
        { name: 'toggleConversationTree', description: 'Toggle visibility of the conversation tree' },
        { name: 'jumptonewnode', description: 'Jump to a new node' },
        { name: 'nodetakenote', description: 'Take note at a node' },
        { name: 'nodebookmark', description: 'Bookmark a node' },
        { name: 'readManual', description: 'read the manual' },
        { name: 'changeColors', description: 'change ui colors' },
        { name: 'searchForNode', description: 'search for node with keywords' },
        { name: 'changeLanguage', description: 'change default language' },
        {name:"showNodeDetails", description: 'show node detail window kit'}
      ];

      for (let action of actions) {
        await runAsync('INSERT OR  IGNORE INTO ActionTypes (name, description) VALUES (?, ?)', [action.name, action.description]);
      }
    } catch (err) {
      console.error('Error during database setup:', err.message);
    }
  });

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS ConversationList (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     openai_id TEXT,
  //     create_time TIMESTAMP,
  //     update_time TIMESTAMP,
  //     openai_id TEXT,
  //     is_archived BOOLEAN,
  //     FOREIGN KEY (user_id) REFERENCES Users(id),
  //   )`, (err) => {
  //   if (err) console.error('Error creating ConversationList table', err.message);
  // });

  db.run(`
    CREATE TABLE IF NOT EXISTS Conversations (
        user_id INTEGER NOT NULL,
        conversation_id TEXT NOT NULL,
        current_node TEXT,
        create_time TIMESTAMP,
        update_time TIMESTAMP,
        title TEXT,
        content TEXT,
        is_archived INTEGER,
        default_model_slug TEXT,
        PRIMARY KEY (user_id, conversation_id),
        FOREIGN KEY (user_id) REFERENCES Users(id)
    )`, (err) => {
    if (err) console.error('Error creating Conversations table', err.message);
    db.run(`CREATE INDEX IF NOT EXISTS idx_userid ON Conversations(user_id)`, (err) => {
      if (err) console.error('Error creating index on user_id', err.message);
    });
  });
}
setupDatabase();

function getActionArray() {
  return new Promise((resolve, reject) => {
    db.all(`select * from ActionTypes`, (err, data) => {
      if (err) {
        console.error('Error executing SQL:', err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
module.exports = {db,runAsync,getAsync,getActionArray, getAllAsync};
