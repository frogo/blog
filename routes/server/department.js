'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let department = require('../../controllers/server/department')

//权限判断
router.use(function(req, res, next) {
    console.log('部门: ' + Date.now());
    res.locals.Path = 'department';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        console.log(path)
        return res.redirect(path);
    }
    next();
});
//部门列表
router.route('/').get(action.checkAction('DEPARTMENT_INDEX'), department.list);

//添加部门
router.route('/add').all(action.checkAction('DEPARTMENT_CREATE'), department.add);
//更新信息
 router.route('/:id/edit').all(action.checkAction('DEPARTMENT_UPDATE'), department.edit);
//删除信息
router.route('/:id/del').all(action.checkAction('DEPARTMENT_DELETE'), department.del);



module.exports = function(app) {
    let path = core.translateAdminDir('/department');
    app.use(path, router);
};
