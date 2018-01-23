const mongoose=require('mongoose');
module.exports=new mongoose.Schema({
    //关联字段
    category:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用另一张表的模型
        ref:'categories'
    },
    title:String,
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'user'
    },

    //添加时间
    addTime: {
        type: Date,
        default: new Date()
    },

    //阅读量
    views: {
        type: Number,
        default: 0
    },
    description:{
        type:String,
        dafault:''
    },
    content:{
        type:String,
        dafault:''
    },
    comments: {
        type: Array,
        default: []
    }
});
