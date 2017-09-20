var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var menu = require('./menu.js');
var config = require('./config.js');
var item = require('./item.js');

//mysql
var wechat_mysql = require('./database/questionTable.js');

var http = require('http');
var fs = require('fs');
var request = require('request');
//clawer
var cheerio = require('cheerio');
var charset = require("superagent-charset");
var superagent = charset(require("superagent"));
    superagent.get('http://health.people.com.cn/GB/26466/401878/404200/404225/index.html')
    .charset('gb2312')
    .end(function(err,result){
        if(err) console.log(err);
        var $ = cheerio.load(result.text);
        
        var data = [];
        
        $('.p2_con .p2_list .new_list .list_14 li').each(function(i,el){
            if(i<5){
                data[i] = {};
                data[i].title = el.children[0].children[0].data;
                data[i].description ='发表时间：'+el.children[2].children[0].data;
                data[i].url = el.children[0].attribs.href;
            }
        });
        return data;
    })

var appid = config.appid;
var appsecret = config.appsecret;

var api = new WechatAPI(appid, appsecret);
// api.updateRemark('open_id','remarked',function (err, data, res) {
//   // TODO
// })

var verifyInfo = config.verifyInfo;  //验证信息

var msdidList=[];
var msvoivedidList=[];

api.getAccessToken(function (err, token) {
   // console.log(err);
  // console.log(token);
});
api.createMenu(menu,function(err,result){
    if(err){console.log(err)};
   // console.log('result:\n'+Object.keys(result));
});
//上传素材
// api.uploadMaterial('./public/images/1.jpg','image',function(err,result){
//     if(err){console.log(err)};
//     console.log(result);
//     console.log(result.media_id);
//      msdidList.push(result.media_id);
// });
// api.uploadMaterial('./public/music/nan.mp3','voice',function(err,result){
//     if(err){console.log(err)};
//      console.log(result);
//      console.log(result.media_id);
//     msvoivedidList.push(result.media_id);
// });
// api.getMaterials('image', 0, 10, function(err,result){
//     console.log(result);
//     msdidList[0]=result.item[0].media_id;
// });

// api.getMaterials('voice', 0, 10, function(err,result){
//     console.log(result);
//     msvoivedidList[0]=result.item[0].media_id;
// });


var the_key_content;
var question = false;

var handler = wechat(verifyInfo, wechat
    .text(function(message, req, res, next){
        var input = (message.Content || '').trim(); 
        var the_key =false;
        item.forEach(function(x){
            if(x.item_key.search(input)!=-1){
                 the_key =true;
                 the_key_content=x.item_content;
            }
        })
        if(the_key&&!question){
            res.reply(the_key_content);
        } else if(input =='T'){
            question = false;
            res.reply('请输入近期关于健康的关键字，我们将带领你一起了解它！');
        } else if(question){
            var questionInfo = {};
            questionInfo.FromUserName = message.FromUserName;
            questionInfo.CreateTime = new Date(message.CreateTime*1000);
            questionInfo.MsgType = message.MsgType;
            questionInfo.MediaId = !message.MediaId?'':message.MediaId;
            questionInfo.PicUrl = !message.PicUrl?'':message.PicUrl;
            questionInfo.Content = !message.Content?'':message.Content;
            wechat_mysql.insertInfo(questionInfo,function(error,result){
                if(error){
                    res.reply('发生错误，请重试！回复T退出留言页！');
                }
                res.reply('您的健康问题已收到，请等候专业人员分析后回复结果！回复T退出留言页！');
            });

        } 
        else{
            res.reply('该词条未被收录');
        }
    })
    .image(function(message, req, res, next){
        if(question){
            var questionInfo = {};
            questionInfo.FromUserName = message.FromUserName;
            questionInfo.CreateTime = new Date(message.CreateTime*1000);
            questionInfo.MsgType = message.MsgType;
            questionInfo.MediaId = !message.MediaId?'':message.MediaId;
            questionInfo.PicUrl = !message.PicUrl?'':message.PicUrl;
            questionInfo.Content = !message.Content?'':message.Content;
            wechat_mysql.insertInfo(questionInfo,function(error,result){
                if(error){
                    res.reply('发生错误，请重试！回复T退出留言页！');
                }
                res.reply('您发送的图片已收到，请等候专业人员分析后回复结果！回复T退出留言页！');
            });
        } else{
            res.reply("如需留言请先到问题与咨询~");
        }
        // msdidList.push(message.MsgId);
        // console.log(__filename);
        // res.reply(message.ToUserName+'图片连接：\n'+message.PicUrl+'ID：\n'+message.MsgId);
        // console.log(msdidList);
    })
    .voice(function(message, req, res, next){
        if(question){
            var questionInfo = {};
            questionInfo.FromUserName = message.FromUserName;
            questionInfo.CreateTime = new Date(message.CreateTime*1000);
            questionInfo.MsgType = message.MsgType;
            questionInfo.MediaId = !message.MediaId?'':message.MediaId;
            questionInfo.PicUrl = !message.PicUrl?'':message.PicUrl;
            questionInfo.Content = !message.Content?'':message.Content;
            wechat_mysql.insertInfo(questionInfo,function(error,result){
                if(error){
                    res.reply('发生错误，请重试！回复T退出留言页！');
                }
                res.reply('您发送的语音已收到，请等候专业人员分析后回复结果！回复T退出留言页！');
            });
        } else{
            res.reply("如需留言请先到问题与咨询~");
        }
    })
    .video(function(message, req, res, next){
         if(question){
             console.log(message.CreateTime);
            var questionInfo = {};
            questionInfo.FromUserName = message.FromUserName;
            questionInfo.CreateTime = new Date(message.CreateTime*1000);
            questionInfo.MsgType = message.MsgType;
            questionInfo.MediaId = !message.MediaId?'':message.MediaId;
            questionInfo.PicUrl = !message.PicUrl?'':message.PicUrl;
            questionInfo.Content = !message.Content?'':message.Content;
            console.log(questionInfo.CreateTime);
            wechat_mysql.insertInfo(questionInfo,function(error,result){
                if(error){
                    res.reply('发生错误，请重试！回复T退出留言页！');
                }
                res.reply('您发送的视频已收到，请等候专业人员分析后回复结果！回复T退出留言页！');
            });
        } else{
            res.reply("如需留言请先到问题与咨询~");
        }
    })
    .shortvideo(function(message, req, res, next){
         if(question){
            var questionInfo = {};
            questionInfo.FromUserName = message.FromUserName;
            questionInfo.CreateTime = new Date(message.CreateTime*1000);
            questionInfo.MsgType = message.MsgType;
            questionInfo.MediaId = !message.MediaId?'':message.MediaId;
            questionInfo.PicUrl = !message.PicUrl?'':message.PicUrl;
            questionInfo.Content = !message.Content?'':message.Content;
            wechat_mysql.insertInfo(questionInfo,function(error,result){
                if(error){
                    res.reply('发生错误，请重试！回复T退出留言页！');
                }
                res.reply('您发送的短视频已收到，请等候专业人员分析后回复结果！回复T退出留言页！');
            });
        } else{
            res.reply("如需留言请先到问题与咨询~");
        }
    })
    .location(function(message, req, res, next){
        res.reply('地理位置已收到');
    })
    .link(function(message, req, res, next){
             res.reply('链接已收到');
    })
    .event(function(message, req, res, next){
        console.log(message);
        //留言
        if(message.EventKey == 'question_key'){
            question = true; 
            res.reply('欢迎留言健康问题，我们将尽快为你给出正确的解答与指导！（可以给是文字描述，图片展示，语音描述还有拍短视频哦！）');
        }
        //精选文章
        if(message.EventKey =='article_key'){
            //爬取文章精选文章
           superagent.get('http://health.people.com.cn/GB/26466/401878/404200/404225/index.html')
            .charset('gb2312')
            .end(function(err,result){
                if(err) console.log(err);
                var $ = cheerio.load(result.text);
                
                var data = [];
                
                $('.p2_con .p2_list .new_list .list_14 li').each(function(i,el){
                    if(i<5){
                        data[i] = {};
                        data[i].title = el.children[0].children[0].data;
                        data[i].description ='发表时间：'+el.children[2].children[0].data;
                        data[i].picurl='https://pic2.zhimg.com/1f04cdca7d4906a5afe1faaa8c6f2b4d_b.jpg',
                        data[i].url = 'http://health.people.com.cn/GB/26466/401878/404200/404225'+el.children[0].attribs.href;
                    }
                });
                res.reply(data);
            })
        }
        //活动
        if(message.EventKey =='activity_key'){
            res.reply([
                 {
                    title: '绿色健康行。',
                    description: "本周六日,由XX单位组织的徒步5公里行走在XX地方举行，望大家为了健康走起来。",
                    picurl: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcR09e3UdZ902BTDgbv01Ert7ESwjz2wvCHhcm5Hae37kljX6A6I6A',
                    url: 'http://www.oagao.cn/'
                },
                {
                    title: '呼吁健康',
                    description: "恶劣的环境是健康最大的威胁，为了健康携起手来。",
                    picurl: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ2c4KN38Xqb61hxbZ_rj8NpHtrRZRGJZjkuexY_v-AH6dYdUlBDKBpm9CdlA',
                    url: 'http://www.oagao.cn/'
                }
            ]);
        }
        //众筹
        if(message.EventKey =='Crowdfunding_key'){
            res.reply([ 
                 {
                    title: '健康众筹社',
                    description: "互帮互助是中华民族的传统美德，让我们一起参与进来吧",
                    picurl: 'http://www.zhongchou.com/deal-show/id-652452',
                    url: 'http://health.people.com.cn/GB/404254/index.html'
                },
                {
                    title: '众筹的意义',
                    description: "互帮互助是中华民族的传统美德，让我们一起参与进来吧",
                    picurl: 'http://www.zhongchou.com/deal-show/id-652452',
                    url: 'http://health.people.com.cn/GB/404254/index.html'
                },
                {
                    title: '了解众筹',
                    description: "恶劣的环境是健康最大的威胁，为了健康携起手来。",
                    picurl: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ2c4KN38Xqb61hxbZ_rj8NpHtrRZRGJZjkuexY_v-AH6dYdUlBDKBpm9CdlA',
                    url: 'http://www.oagao.cn/'
                }
            ]);
        }
        //大讲堂
        if(message.EventKey =='lecture_key'){
            res.reply([ 
                {
                    title: '健康大讲堂：本期内容：如何保护颈椎？？',
                    description: "本期内容：长时间的不正确姿势、外伤、局部组织炎症。这里的长时间一般指数年甚至数十年。那么如何保护颈椎呢",
                    picurl: 'https://pic2.zhimg.com/1f04cdca7d4906a5afe1faaa8c6f2b4d_b.jpg',
                    url: 'https://www.zhihu.com/question/19550657'
                },
                 {
                    title: '健康大讲堂：上期内容：感冒怎么办？？',
                    description: "恶劣的环境是健康最大的威胁，为了健康携起手来。",
                    picurl: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ2c4KN38Xqb61hxbZ_rj8NpHtrRZRGJZjkuexY_v-AH6dYdUlBDKBpm9CdlA',
                    url: 'http://www.oagao.cn/'
                }
            ]);
        }
        //附近医院
        if(message.EventKey =='hospital_key'){
            res.reply([ 
                {
                    title: '健康大讲堂：本期内容：如何保护颈椎？？',
                    description: "本期内容：长时间的不正确姿势、外伤、局部组织炎症。这里的长时间一般指数年甚至数十年。那么如何保护颈椎呢",
                    picurl: 'https://pic2.zhimg.com/1f04cdca7d4906a5afe1faaa8c6f2b4d_b.jpg',
                    url: 'https://www.zhihu.com/question/19550657'
                },
                 {
                    title: '健康大讲堂：上期内容：感冒怎么办？？',
                    description: "恶劣的环境是健康最大的威胁，为了健康携起手来。",
                    picurl: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ2c4KN38Xqb61hxbZ_rj8NpHtrRZRGJZjkuexY_v-AH6dYdUlBDKBpm9CdlA',
                    url: 'http://www.oagao.cn/'
                }
            ]);
        }
        
        switch (message.Event) {
            case 'subscribe':
                var openid=message.FromUserName;
                
                res.reply('欢迎关注健康号!请输入近期关于健康的关键字，我们将带领你一起了解它！');
                break;
            case 'unsubscribe':
                var openid=message.FromUserName;
                
                res.reply('取消关注!');
                break;
        }
    })
    .device_text(function(message, req, res, next){
         res.reply('设备消息已收到');
    })
    .device_event(function(message, req, res, next){
         res.reply('设备事件已收到');
    })
);  

module.exports = handler;