var express = require('express');
var router = express.Router();


var config = require('../config.js');
var request = require('request');
var qs = require('querystring');

/* GET kefu listing. */
router.get('/admin', function(req, res, next) {
   if(!req.session.user){
      return res.redirect('/login');
    }
    res.render('kf_admin', {
      title: '客服服务',
      username:req.session.user
    });
});
router.get('/user', function(req, res, next) {
  var _res = res;
 // var userInfo = getToken(req.query.code);
  var reqUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
  var params = {
    appid: config.appid,
    secret: config.appsecret,
    code: req.query.code,
    grant_type: 'authorization_code'
  };
  var options = {
    method: 'get',
    url: reqUrl+qs.stringify(params)
  };
  request(options, function (err, res, body) {
      if (res) {
        var a = JSON.parse(body);
        var reqUrl = 'https://api.weixin.qq.com/sns/userinfo?';
        var params = {
            access_token: a.access_token,
            openid: a.openid,
            lang: 'zh_CN'
          };
         var options = {
            method: 'get',
            url: reqUrl+qs.stringify(params)
          };
          request(options, function (err, res, body) {
              if (res) {
                var info=JSON.parse(body);
                _res.render('user_kf',{
                  title:"欢迎来到客服服务中心！",
                  userInfo:info
                })
              } else {
                return false;
              }
          });
      } else {
        return false;
      }
  });
});
module.exports = router;
