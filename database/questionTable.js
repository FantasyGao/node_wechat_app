var mysql = require('mysql');
var config = require('./config.js');
var connection = mysql.createConnection(config);

//连接出错
connection.on('error',function(err) {
  console.log(err.code); // 'ECONNREFUSED'
  console.log(err.fatal); // true
});
//插入一条用户信息
var insertInfo = function(qusetioninfo,callback){
    connection = mysql.createConnection(config);
    connection.connect();
    connection.query('insert into `question` set ?',qusetioninfo, function (error, results) {
      if (error){
          console.log("insert fail"+error);
          return callback(error);
      };
      callback(null,results)
      connection.end();
    });
}
//返回所有信息
var selectAllQuestion = function(callback){
  connection = mysql.createConnection(config);
  connection.connect();
  connection.query('SELECT * from question', function (error, results, fields) {
    if (error){
      return callback(error);
    }
    callback(null,results,fields);
    connection.end();
  });
}
exports.insertInfo = insertInfo;
exports.selectAllQuestion = selectAllQuestion;