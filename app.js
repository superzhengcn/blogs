const express=require('express');
const swig=require('swig');
const path=require('path');
const bodyparser=require('body-parser');
const cookieparser=require('cookie-parser');
const mongoose=require('mongoose');

var app=express();

app.engine('html',swig.renderFile);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','html');
swig.setDefaults({catch:false});

app.use(cookieparser('superzheng.cn'));
app.use( function(req,res,next){

   /* try{
        req.userinfo=req.signedCookies.user;

    }catch(err){
        req.userinfo=null;
        res.render('main/index');
    }
    next();*/
   if(req.signedCookies.user){

       req.userinfo=req.signedCookies.user;

   }else{
       req.userinfo=null;
   }
next();
});
app.use('/public',express.static('public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use('/admin',require('./routers/admin.js'));
app.use('/',require('./routers/main.js'));
app.use('/api',require('./routers/api.js'));


mongoose.connect('mongodb://localhost:27017/blog',function (err) {
    if(err){
        console.log(err);
    }else{
        app.listen('8089');
    }
});
