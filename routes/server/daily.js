'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let daily = require('../../controllers/server/daily')

//权限判断
router.use(function(req, res, next) {
    console.log('日报页: ' + Date.now());
    res.locals.Path = 'daily';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//内容列表
router.route('/').get(action.checkAction('DAILY_INDEX'), daily.list);
//添加内容
 router.route('/add').all(action.checkAction('DAILY_CREATE'), daily.add);
//更新信息
 router.route('/:id/edit').all(action.checkAction('DAILY_UPDATE'), daily.edit);
//删除信息
 router.route('/:id/del').all(action.checkAction('DAILY_DELETE'), daily.del);


module.exports = function(app) {
    let path = core.translateAdminDir('/daily');
    app.use(path, router);
};
