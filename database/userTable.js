var mysql = require('mysql');
var config = require('./config.js');
var connection = mysql.createConnection(config);

//连接出错
connection.on('error',function(err) {
  console.log(err.code); // 'ECONNREFUSED'
  console.log(err.fatal); // true
});

//查找用户
var selectUser =function(userName,callback){
  connection = mysql.createConnection(config);
  connection.connect();
  connection.query('SELECT * FROM `user` WHERE `username` =  ?', [userName], function (err, results,fields) {
    if (err){
      return callback(err);
    };
    callback(null,results,fields);
    connection.end();
  });
}

//按照用户名更新邮箱
var updateEmailUser =function(Email,userName,callback){
  connection = mysql.createConnection(config);
  connection.connect();
  connection.query('UPDATE user SET email = ?  WHERE username = ?', [Email, userName], function (error, results, fields) {
    if (error){
      return callback(error);
    };
    callback(null,results,fields);
    connection.end();
  });
}

//按照用户名更新密码
var updatePasswordUser =function(password,userName,callback){
  connection = mysql.createConnection(config);
  connection.connect();
  connection.query('UPDATE user SET password = ?  WHERE username = ?', [password, userName], function (error, results, fields) {
    if (error){
      return callback(error);
    };
    callback(null,results,fields);
    connection.end();
  });
}
//根据用户名删除用户
var deleteUser =function(userName,callback){
  connection = mysql.createConnection(config);
  connection.connect();
  connection.query('DELETE FROM user WHERE username = ?',[userName], function (error, results, fields) {
    if (error){
      return callback(error);
    };
    callback(null,results.affectedRows);
    connection.end();
  });
}
//插入一条用户信息
var insertUser = function(userinfo,callback){
    connection = mysql.createConnection(config);
    connection.connect();
    connection.query('insert into `user` set ?',userinfo, function (error, results) {
      if (error){
          console.log("insert fail"+error);
          return callback(error);
      };
      callback(null,results)
      connection.end();
    });
}

//返回所有用户信息
var selectAllUser = function(callback){
  connection = mysql.createConnection(config);
  connection.connect();
  connection.query('SELECT * from user', function (error, results, fields) {
    if (error){
      return callback(error);
    }
    callback(null,results,fields);
    connection.end();
  });
}

exports.selectUser = selectUser;
exports.updatePasswordUser = updatePasswordUser;
exports.updateEmailUser = updateEmailUser;
exports.deleteUser = deleteUser;
exports.insertUser = insertUser;
exports.selectAllUser = selectAllUser;