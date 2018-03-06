'use strict';

let express = require('express')
let router = express.Router()
let core = require('../../libs/core')
let action = require('../../middlewares/action')
let contact = require('../../controllers/server/contact')

//权限判断
router.use(function(req, res, next) {
    console.log('联系人: ' + Date.now());
    res.locals.Path = 'contact';
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    next();
});

//联系人列表
router.route('/').get(contact.list);



module.exports = function(app) {
    let path = core.translateAdminDir('/contact');
    app.use(path, router);
};
