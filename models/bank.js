'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 合作银行模型
 */
let BankSchema = new Schema({
    name:{ //银行名称
        type: String,
        required: true
    },
    description:{
        type:String,
    }
});
BankSchema.methods = {

};

mongoose.model('Bank', BankSchema);

