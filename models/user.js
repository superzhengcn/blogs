const mongoose=require('mongoose');
const userSchema=require('../schemas/users.js');
module.exports=mongoose.model('user',userSchema);