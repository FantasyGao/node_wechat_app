var express = require('express');
var crypto = require('crypto');
var WechatAPI = require('wechat-api');
var fs = require('fs');
var request = require('request')

var userMysql = require('../database/userTable.js');
var questionMysql = require('../database/questionTable.js');
var router = express.Router();

var config = require('../config.js');
var appid = config.appid;
var appsecret = config.appsecret;

var api = new WechatAPI(appid, appsecret);
/* GET home page. */

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
//删除一个用户API
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
//回复消息
router.post('/admin_answer_question_info_api', function(req, res, next) {
    if(!req.session.user){
      return res.redirect('/404');
    }
    console.log(req.body.content);
    console.log(req.body.openId);
    api.sendText(req.body.openId,req.body.content,function(err,res){
       if(err){return}
        console.log(res)
    });
    res.send({
          status_code:1,
          msg:"回复成功！",
    });
});
//根据Medid查询
router.post('/admin_search_info_api', function(req, res, next) {
    if(!req.session.user){
      return res.redirect('/404');
    }
    console.log(req.body.id);
    // api.getMedia(req.body.id,function(err,result,re){
    //     if(err){return}
    //     //console.log(result.toString());
    //     var obj=new Buffer(result);
    //     res.send({
    //         status_code:1,
    //         msg:"回复成功！",
    //         data:obj
    //     });
    // });
    api.getAccessToken(function (err, token) {
       if(err) console.log(err);
       console.log(token.accessToken);
       var Url = 'https://api.weixin.qq.com/cgi-bin/media/get?access_token='+token.accessToken+'&media_id='+req.body.id;
       console.log('https://api.weixin.qq.com/cgi-bin/media/get?access_token='+token.accessToken+'&media_id='+req.body.id);
       res.send({
          status_code:1,
          msg:"回复成功！",
          url:Url
       })
    });
});
//群发消息
router.post('/admin_answer_all_user_api', function(req, res, next) {
    if(!req.session.user){
      return res.redirect('/404');
    }
    api.massSendText(req.body.content,true,function(err,res){
       if(err){return}
        console.log(res)
    });
    res.send({
          status_code:1,
          msg:"回复成功！",
    });
});
module.exports = router;

