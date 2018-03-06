'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 部门模型
 */
let DepartmentSchema = new Schema({
    name:{ //部门名称
        type: String,
        required: true
    },
    level: {//部门类型等级 7：公司（唯一，对应老板），6：总经办(唯一)，5：市场部（唯一，对应总经理），4：大区，3：大组，2：小组，1：基层
        type:Number,
        required: true
    },
    parent: {//上级部门Id
        type: Schema.ObjectId,
        ref: 'Department',
    },
    author: {//创建人
        type: Schema.ObjectId,
        ref: 'User'
    },
    // remarks:{//备注
    //     type:String,
    // }
});
DepartmentSchema.methods = {

};

mongoose.model('Department', DepartmentSchema);

