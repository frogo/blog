'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let bank = require('../../controllers/server/bank')

//权限判断
router.use(function(req, res, next) {
    console.log('合作银行: ' + Date.now());
    res.locals.Path = 'bank';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//银行列表
router.route('/').get(action.checkAction('BANK_INDEX'), bank.list);
//添加银行
router.route('/add').all(action.checkAction('BANK_CREATE'), bank.add);
//单条信息
// router.route('/:id').get(action.checkAction('CLIENT_DETAIL'), bank.one);
//更新信息
 router.route('/:id/edit').all(action.checkAction('BANK_UPDATE'), bank.edit);
//删除信息
 router.route('/:id/del').all(action.checkAction('BANK_DELETE'), bank.del);


module.exports = function(app) {
    let path = core.translateAdminDir('/bank');
    app.use(path, router);
};
