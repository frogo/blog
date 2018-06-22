'use strict';

let mongoose = require('mongoose')
let Message = mongoose.model('Message')
let core = require('../../libs/core')
let backPath = 'message';
//列表
exports.list = function(req, res) {
    let condition = {};
    /*if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }*/
    Message.count(condition, function(err, total) {
        let query = Message.find(condition);
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/message/list.hbs', {
                title: '留言列表',
                Menu: 'message',
                messages: results,
                pageInfo: pageInfo
            });
        })
    })
    
};
//单条
exports.one = function(req, res) {
    let id = req.params.id;
    Message.findById(id).exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '该留言不存在' ,backPath:backPath
            });
        }
        res.render('server/message/item.hbs', {
            title: result.name + '的留言',
            Menu: 'message',
            message: result
        });
    });
};
//删除
exports.del = function(req, res) {
    let id = req.params.id;
    Message.findById(id).exec(function(err, result) {
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '留言不存在' ,backPath:backPath
            });
        }
        /*if(req.Roles && req.Roles.indexOf('admin') === -1) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '没有权限'
            });
        }*/
        console.log(result)
        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                });
            }
            if(err) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '删除失败' ,backPath:backPath
                });
            }
            res.render('server/info.hbs', { layout:'layout-blank',
                message: '删除成功' ,backPath:backPath
            })
        });
    });
};