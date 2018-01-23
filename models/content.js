const mongoose=require('mongoose');
const contents=require('../schemas/contens.js');
module.exports=mongoose.model('content',contents)