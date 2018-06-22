'use strict';

let mongoose = require('mongoose')
let Page = mongoose.model('Page')
let _ = require('lodash')
let core = require('../../libs/core')
let backPath = 'page'
//列表
exports.list = function(req, res) {
    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Page.count(condition, function(err, total) {
        let query = Page.find(condition);
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/page/list.hbs', {
                title: '单页面',
                Menu:'page',
                pages: results,
                pageInfo: pageInfo
            });
        })
    })
};

//单条
exports.one = function(req, res) {
    let id = req.params.id;
    Page.findById(id).populate('author').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '该页面不存在' ,backPath:backPath
            });
        }
        res.render('server/page/item.hbs', {
            title: result.title,
            page: result
        });
    });
};
//删除
exports.del = function(req, res) {
    let id = req.params.id;
    Page.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '留言不存在' ,backPath:backPath
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '没有权限' ,backPath:backPath
            });
        }
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

//发送
exports.add = function(req, res) {
    let obj = _.pick(req.body, 'title', 'flag', 'description', 'content');
    if (req.session.user) {
        obj.author = req.session.user._id;
    }
    let page = new Page(obj);
    page.save(function(err) {
        if (err) {
            /*return res.render('server/info.hbs', { layout:'layout-blank',
                message: '发送失败'
            });*/
            console.log(err);
            return res.json({
                message: '创建失败'
            })
        }
        /*return res.render('server/info.hbs', { layout:'layout-blank',
            message: '发送成功'
        });*/
        return res.json({
            message: '创建成功'
        })
    });
};