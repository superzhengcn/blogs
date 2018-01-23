const express=require('express');
const User=require('../models/user.js');
const Categories=require('../models/categories.js');
const Content=require('../models/content.js');

var router=express.Router();
router.use(function(req,res,next){
    if(req.userinfo && req.userinfo.isAdmin){
       next();
    }else{
        res.redirect('/')
    }
});
router.get('/',function (req,res) {
    res.render('admin/index',{userinfo:req.userinfo});
});
router.get('/user',function (req,res) {
    var page=Number(req.query.page || 1);//当前页
    var limit=2;//每页显示的条数
    var skip=0;
    var pages=0;
    User.count().then(function(count){
        pages=Math.ceil(count/limit);
        page=Math.min(page,pages);
        page=Math.max(page,1);
        skip=(page-1)*limit;
        User.find().limit(limit).skip(skip).then(function(list){
            res.render('admin/user_index',{
                userinfo:req.userinfo,
                users:list,
                page:page,
                pages:pages,
                limit:limit,
                count:count
            });
        });
    });
});
router.get('/category',function(req,res){
    var limit=2;
    var page=Number(req.query.page || 1);
    var pages=0;
    Categories.count().then(function(count){
        pages=Math.ceil(count/limit);
        page=Math.min(page,pages);
        page=Math.max(page,1);
        var skip=(page-1)*limit;
        Categories.find().limit(limit).skip(skip).then(function(cates){
            if(cates){
                res.render('admin/category_index',{
                    userinfo:req.userinfo,
                    categories:cates,
                    page:page,
                    pages,pages,
                    limit,limit,
                    skip,skip
                });
            }
        });
    });

});
router.get('/category/add',function(req,res){
    res.render('admin/category_add',{userinfo:req.userinfo});
});
router.post('/category/add',function(req,res){
    var cate=req.body.name || '';
    if(cate==''){
        res.render('admin/error',{
            userinfo:req.userinfo,
            message:'类型不能为空'
        })
    }else{
        Categories.findOne({name:cate}).then(function(cates){
            if(cates){
                res.render('admin/error',{
                    userinfo:req.userinfo,
                    message:'该类型已存在'
                });
                return Promise.reject();//很关键
            }else {
                var category = new Categories({
                    name: cate
                });
                return category.save();
            }
        }).then(function(cate){
            if(cate){
                res.render('admin/success',{
                    userinfo:req.userinfo,
                    message:'添加成功',
                    url:'/admin/category'//admin前加斜杠与不加差别很大，加斜杠会访问目录，不加会在当前地址中加入该目录访问
                });
            }else{
                res.render('admin/error',{
                    userinfo:req.userinfo,
                    message:'添加失败'
                });
            }
        });

    }

});
router.get('/category/edit',function(req,res){
    var id=req.query.id;
    Categories.findOne({_id:id}).then(function(cate){//查询条件键一定是数据库表的键值
        if(cate){
            res.render('admin/category_edit',{
                userinfo:req.userinfo,
                category:cate
            })
        }else{
            res.render('admin/error',{
                userinfo:req.userinfo,
                message:'分类信息不存在'
            })
        }
    });
});
router.post('/category/edit',function(req,res){
    var id=req.query.id;
    var name=req.body.name;
    Categories.findOne({_id:id}).then(function(cate){//查询条件键一定是数据库表的键值
        if(cate){
            if(cate.name==name){
                res.render('admin/success',{
                    userinfo:req.userinfo,
                    message:'修改分类成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                //判断是否已有该分类
                return Categories.findOne({
                    _id:{$ne:id},
                    name:name
                });
                    /*if(cate){
                        res.render('admin/error',{
                            userinfo:req.userinfo,
                            message:'该分类已存在'
                        })
                    }else{
                        Categories.update().then();
                    }*/
            }

        }else{
            res.render('admin/error',{
                userinfo:req.userinfo,
                message:'分类信息不存在'
            })
        }
    }).then(function(same){
        if(same){
            res.render('admin/error',{
                userinfo:req.userinfo,
                message:'该分类已存在'
            });
            return Promise.reject();
        }else{
            return Categories.update({
                _id:id
            },{
                name:name
            });
        }
    }).then(function(){
        res.render('admin/success',{
            userinfo:req.userinfo,
            message:'修改分类成功',
            url:'/admin/category'
        });
    });
});
router.get('/category/delete',function(req,res){
    var id=req.query.id;
    Categories.remove({
        _id:id
    }).then(function(){
        res.render('admin/success',{
            userinfo:req.userinfo,
            message:'删除成功',
            url:'/admin/category'
        });
    });
});
router.get('/content', function(req, res) {

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Content.count().then(function(count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page, pages );
        //取值不能小于1
        page = Math.max( page, 1 );

        var skip = (page - 1) * limit;

        Content.find().limit(limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        }).then(function(contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });

    });

});

/*
 * 内容添加页面
 * */
router.get('/content/add', function(req, res) {

    Categories.find().sort({_id: -1}).then(function(categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    });

});

/*
* 内容保存
* */
router.post('/content/add', function(req, res) {

    //console.log(req.body)

    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }

    if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    //保存数据到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userinfo.userid.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function(rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        })
    });

});

/*
* 修改内容
* */
router.get('/content/edit', function(req, res) {

    var id = req.query.id || '';

    var categories = [];

    Categories.find().sort({_id: 1}).then(function(rs) {

        categories = rs;

        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function(content) {

        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            })
        }
    });

});

/*
 * 保存修改内容
 * */
router.post('/content/edit', function(req, res) {
    var id = req.query.id || '';

    if ( req.body.category == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }

    if ( req.body.title == '' ) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content/edit?id=' + id
        })
    });

});

/*
* 内容删除
* */
router.get('/content/delete', function(req, res) {
    var id = req.query.id || '';

    Content.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });
});

module.exports=router;