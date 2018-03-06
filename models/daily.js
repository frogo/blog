'use strict';

/**
 * 模块依赖
 */
let mongoose = require('mongoose')
let Schema = mongoose.Schema

/**
 * 日报模型
 */
let DailySchema = new Schema({
    date:{//日期
        type: String,
        required: true
    },
    author: {//作者
        type: Schema.ObjectId,
        ref: 'User'
    },
    project: {//项目
        type: String,
        required: true
    },
    task:{//任务
        type: String,
        required: true
    },
    schedule:{//时间计划
        type: String,
        required: true
    },
    estimated_workload:{//預估工作量
        type: String,
        required: true
    },
    cumulative_input:{//累计投入量
        type:Number
    },
    yesterday_input_hours:{//昨天投入时间
        type:Number
    },
    current_progress:{//总体进度
        type: String,
        required: true
    },
    today_plan_hours:{//今天计划投入时间
        type:Number
    },
    state:{//状态
        type: String,
    },
    remarks:{//备注，补充
        type: String,
    }
});
DailySchema.methods = {

};

mongoose.model('Daily', DailySchema);

