const {db, prodb} = require("../databaseAsync");
// let actionArr = 1234;
db.all(`select * from ActionTypes` , function(err, data) {
  if (err) {
    console.error('Error executing SQL:', err);
  }
  // actionArr = data
  module.exports.actionArr = data
});