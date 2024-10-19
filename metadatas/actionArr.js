const {db, prodb} = require("../databaseAsync");
db.all(`select * from ActionTypes` , function(err, data) {
  if (err) {
    console.error('Error executing SQL:', err);
  }
  module.exports.actionArr = data
});