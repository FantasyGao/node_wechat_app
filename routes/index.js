var express = require('express');
var crypto = require('crypto');
var fs = require('fs');

var userMysql = require('../database/userTable.js');
var questionMysql = require('../database/questionTable.js');
var router = express.Router();

var is_admin = 0;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: '微信公众健康号--后台管理登录' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: '微信公众健康号--后台管理登录' });
});

router.post('/login', function(req, res, next) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    var username = req.body.name;
    console.log(username);
    userMysql.selectUser(username,function(err,result,fields){
        if(err) {
         var errmsg={
            status_code:-1,
            msg:"查询密码错误！",
            error:err
          };
          res.send(errmsg);
          return err
       }
       if(!result[0]){
          res.send({
                status_code:4,
                msg:"用户名输入有误！",
          });
          return;
       }
       var thepassword =result[0].password;
       if(thepassword == password){
          req.session.user = username;
          res.send({
                status_code:1,
                msg:"登录成功！"
          });
       } else{
          res.send({
                status_code:2,
                msg:"密码输入有误",
          });
       }
    })
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: '微信公众健康号--注册账号' });
});

router.post('/register', function(req, res, next) {
    //密码md5加密
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    var userInfo = {};
    userInfo.username = req.body.name;
    userInfo.email = req.body.email;
    userInfo.password = password;
    userMysql.insertUser(userInfo,function(err,data){
       if(err) {
         var errmsg={
            status_code:-1,
            msg:"输入不合法或者用户名已被占用！",
            error:err
          };
          res.send(errmsg);
          return err
       }
       res.send({
         status_code:1,
         msg:"注册成功"
       });
    });
});

router.get('/admin/all_user_info', function(req, res, next) {
       if(!req.session.user){
         return res.redirect('/404');
       }
       res.render('userinfo', {
          title: '微信公众健康号--后台管理',
          username:req.session.user
        });
});
router.get('/index', function(req, res, next) {
       if(!req.session.user){
         return res.redirect('/login');
       }
       res.render('index', {
          title: '主页',
          username:req.session.user
        });
});
//高德地图
router.get('/gaodeditu', function(req, res, next) {
        var text = fs.readFileSync('./views/gaodeditu.html', 'utf8');
        res.send(text);
});
//问题解答
router.get('/question', function(req, res, next) {
       if(!req.session.user){
         return res.redirect('/login');
       }
       res.render('question', {
          title: '问题页',
          username:req.session.user
        });
});
router.get('/404', function(req, res, next) {
       res.render('noPage', {
          title: '没有权限！',
        });
});




//API

//查询所有API
router.get('/admin_all_user_info_api', function(req, res, next) {
  if(!req.session.user){
      return res.redirect('/404');
    }
    userMysql.selectAllUser(function(err,results, fields){
       if(err) {
         var errmsg={
            status_code:-1,
            msg:"获取信息出错！",
            error:err
          };
          return err
       }
       let user_info = [];
       results.forEach(function(item,index){
         user_info[index]={};
         user_info[index].userName = item.username;
         user_info[index].Email = item.email;
       });
       res.json(user_info)
    });
});
//删除一行API
router.get('/admin_delete_user_info_api', function(req, res, next) {
 // console.log(req.param("username"));
   if(!req.session.user){
      return res.redirect('/404');
    }
  if(!req.query.username){
     res.send({
         status_code:2,
         msg:"缺少参数！"
       });
      return;
  }
  userMysql.deleteUser(req.query.username,function(err,results, fields){
       if(err) {
         var errmsg={
            status_code:-1,
            msg:"删除出错！(数据库错误)",
            error:err
          };
          return err
       }
       if(results==1){
         res.send({
            status_code:1,
            msg:"删除成功"
          });
       }else{
          res.send({
            status_code:3,
            msg:"用户不存在"
          });
       }
    });
});
//查询所有问题列表API
router.get('/admin_all_question_info_api', function(req, res, next) {
    if(!req.session.user){
      return res.redirect('/404');
    }
    questionMysql.selectAllQuestion(function(err,results, fields){
       if(err) {
         var errmsg={
            status_code:-1,
            msg:"获取信息出错！",
            error:err
          };
          return err
       }
       let question_info = [];
       results.forEach(function(item,index){
         question_info[index]={};
         question_info[index].id = item.id;
         question_info[index].FromUserName = item.FromUserName;
         question_info[index].MediaId = item.MediaId;
         question_info[index].PicUrl = item.PicUrl;
         question_info[index].Content = item.Content;
         question_info[index].CreateTime = item.CreateTime;
       });
       res.json(question_info)
    });
});
//群发消息
router.get('/answer_all', function(req, res, next) {
    if(!req.session.user){
      return res.redirect('/404');
    }
    res.render('answer', {
      title: '群发',
      username:req.session.user
    });
});
module.exports = router;
