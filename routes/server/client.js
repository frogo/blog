'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let client = require('../../controllers/server/client')

//权限判断
router.use(function(req, res, next) {
    console.log('未成交客户页: ' + Date.now());
    res.locals.Path = 'client';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//我的客户
router.route('/').get(action.checkAction('CLIENT_INDEX'), client.list);
//添加内容
router.route('/add').all(action.checkAction('CLIENT_CREATE'), client.add);
//搜索列表
router.route('/filter').all(client.filter);
//公海客户
router.route('/opensea').all(client.opensea)
//下属的客户
router.route('/mysubclient').all(client.mysubclient)
//单条信息
router.route('/:id').get(action.checkAction('CLIENT_DETAIL'), client.one);
//更新信息
 router.route('/:id/edit').all(action.checkAction('CLIENT_UPDATE'), client.edit);
//删除信息
 router.route('/:id/del').all(action.checkAction('CLIENT_DELETE'), client.del);


module.exports = function(app) {
    let path = core.translateAdminDir('/client');
    app.use(path, router);
};
