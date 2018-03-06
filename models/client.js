'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 未成交客户信息模型
 */
let ClientSchema = new Schema({
    name:{ //姓名
        type: String,
        required: true
    },
    phone_number: {//电话
        type:Number,
        required: true
    },
    from: {//来源
        type: String,
    },
    matched_condition:[{//符合的条件
        type:String,
    }],
    bank:[{//如果选择信用贷款，包括的银行
        type: Schema.ObjectId,
        ref: 'Bank'
    }],
    responsible:{//负责人
        type: Schema.ObjectId,
        ref: 'User'
    },
    author: {//创建人
        type: Schema.ObjectId,
        ref: 'User'
    },
    remarks:{
        type:String,
    },
    created: {
        type: Date,
        default: Date.now
    }
});
ClientSchema.methods = {

};

mongoose.model('Client', ClientSchema);

