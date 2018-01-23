const express=require('express');
const router=express.Router();
const User=require('../models/user.js');
const Content=require('../models/content.js');
var responsecode;
//自定义初始化返回信息的中间件
router.use(function(req,res,next){
    responsecode={
        code:0,
        message:''
    };
    next();
});
router.post('/register',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    var repassword=req.body.repassword;
    console.log(password+' '+repassword);
    if(username==''){
        responsecode.code=1;
        responsecode.message='用户名不能为空';
        //将数据转换成json对象并发送到客户端
        res.json(responsecode);
        return;
    }
    if(password==''){
        responsecode.code=2;
        responsecode.message='密码不能为空';
        res.json(responsecode);
        return;
    }
    if(repassword==''){
        responsecode.code=3;
        responsecode.message='重复密码不能为空';
        res.json(responsecode);
        return;
    }
    if(repassword!=password){
        responsecode.code=5;
        responsecode.message='密码输入不一致';
        res.json(responsecode);
        return;
    }
    else{
        User.findOne({
        username:username
    }).then(function(user){
        if(user){
            responsecode.code=4;
            responsecode.message='该用户名已被注册';
            res.json(responsecode);
            return;
        }
        var users=new User({
            username:username,
            password:password
        });
        return users.save();
    }).then(function(newuser){
        if(newuser) {
            responsecode.message = '注册成功';
            res.json(responsecode);
            return;
        }
        responsecode.code=6;
        responsecode.message='注册失败';
        res.json(responsecode);
        return;
    });
}

});
router.post('/login',function(req,res){
    //进行简单的检查
    var username=req.body.username;
    var password=req.body.password;
    if(username==''){
        responsecode.code=1;
        responsecode.message='用户名不能为空';
        //将数据转换成json对象并发送到客户端
        res.json(responsecode);
        return;
    }if(password==''){
        responsecode.code=2;
        responsecode.message='密码不能为空';
        res.json(responsecode);
        return;
    }else{
        User.findOne({
            username:username,
            password:password
        }).then(function(userinfo){
            if(!userinfo){
                responsecode.code=7;
                responsecode.message='用户名或密码错误';
                res.json(responsecode);
                return;
            }
            var userinfos={username:userinfo.username,userid:userinfo._id,isAdmin:userinfo.isAdmin};
           // console.log(userinfos);
            res.cookie('user',userinfos,{maxAge:600000*10,signed:true});
            responsecode.message='登陆成功';
            //responsecode.userinfo=userinfos;
            res.json(responsecode);
            return;
        });

    }
});
//退出
router.get('/logout', function(req, res) {
    //删除cookie
    res.cookie('user', '', { expires: new Date(0)});
    res.json(responsecode);
});
/*
* 获取指定文章的所有评论
* */
router.get('/comment', function(req, res) {
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function(content) {
        responsecode.data = content.comments;
        res.json(responsecode);
    })
});

/*
* 评论提交
* */
router.post('/comment/post', function(req, res) {
    //内容的id
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userinfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent) {
        responsecode.message = '评论成功';
        responsecode.data = newContent;
        res.json(responsecode);
    });
});
module.exports=router;