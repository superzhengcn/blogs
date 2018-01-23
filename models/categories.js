const mongoose=require('mongoose');
const categories=require('../schemas/categories.js');
module.exports=mongoose.model('categories',categories);