const {db, runAsync, getAllAsync} = require("../databaseAsync.js");
const express = require('express');
const {getActionArray} = require("../databaseAsync.js");
const {getProportionOption} = require('../utils/utils.js')
const router = express.Router();

// const actionArr = require('../metadatas/actionArr.js')
let actionArr;
getActionArray()
  .then(data => actionArr = data);//require('../metadatas/actionArr.js')
router.get('/arrs',(req,res)=>{
  res.send(actionArr)
})
router.get('/user/lonlat', async (req,res)=>{
  // res.send('alskdfjalksflasakjlsdflkjasl')
  db.all (`select * from users`,(err, data)=>{
    if(err){
      console.log("err: ",err);
    }
    // console.log(data,);
    data = data.filter(i=>{return i.lon !== null && i.lat !== null}).map(i=> {
      return {
        value: [i.lon < -20 ? (i.lon + 360).toFixed(2) : i.lon.toFixed(2), i.lat.toFixed(2)],
        city: i.city,
        country: i.country
      }
    })
    res.send(data)
  })
})

router.get('/user/lonlat/zh', async (req,res)=>{
  // res.send('alskdfjalksflasakjlsdflkjasl')
  db.all(`select language, lon, lat from Users`,(err, data)=>{
    data = data.filter(i=>{return i.lon !== null && i.lat !== null && i.language.includes('zh')}).map(i=> {return {value: [i.lon < -20 ? i.lon + 360 : i.lon, i.lat]}})
    res.send(data)
  })
})

router.get('/user/preserve_proportion', async (req, res)=>{
  // console.log("runAsync: ",runAsync);
  let serialize_data = await getAllAsync(`SELECT first_version, curVersion, COUNT(*) AS user_count
FROM Users
GROUP BY first_version, curVersion
ORDER BY first_version, curVersion;`);
  let first_data = await getAllAsync(`SELECT first_version, COUNT(*) AS user_count
FROM Users
GROUP BY first_version
ORDER BY first_version;`);
  let cur_data = await getAllAsync(`SELECT curVersion, COUNT(*) AS user_count
FROM Users
GROUP BY curVersion
ORDER BY curVersion;`);
  res.send(getProportionOption(serialize_data,first_data,cur_data))
})
module.exports = router