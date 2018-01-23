const express=require('express');
const Categories=require('../models/categories.js');
const Content=require('../models/content.js');
const router=express.Router();
router.get('/',function(req,res){
   //console.log(req.signedCookies);
    var data={
        userinfo:req.userinfo,
        category:[],//类别
        categorys:req.query.categorys || '',//类别id
        page:Number(req.query.page || 1),
        pages:0,
        limit:4,
        count:0,
        contents:[]
    };
    var where={};
    if(data.categorys){
        where.category=data.categorys
    }
    Categories.find().then(function(cate){
        data.category=cate;
       // console.log(data);
        return Content.where(where).count();
    }).then(function(count){
        data.count=count;
        data.pages=Math.ceil(data.count/data.limit);
        data.page=Math.min(data.page,data.pages);
        data.page=Math.max(data.page,1);
        var skip=(data.page-1)*data.limit;
        console.log(data);
        return Content.where(where).find().limit(data.limit).skip(skip).sort({_id:-1}).populate(['category','user']);//使用find中的条件也可以实现同where一样的效果，但是当查询首页的时候，因为值为空所以查不到值
    }).then(function(contents){
        data.contents=contents;

        if(req.userinfo){
            res.render('main/index',data);
        }else{
            res.render('main/index',data);

        }
    });

});
router.get('/view',function(req,res){
    var data={
      userinfo:req.userinfo,
      contentid:req.query.contentid,
      category:[],
      content:{}
    };
    Categories.find().then(function(category){
        data.category=category;
        console.log(data);
        return  Content.findOne({
            _id:data.contentid
        });
    }).then(function(content){
        data.content = content;
        content.views++;
        content.save();

        res.render('main/view', data);
    });
});
module.exports=router;