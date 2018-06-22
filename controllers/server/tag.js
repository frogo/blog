'use strict';

let mongoose = require('mongoose')
let Tag = mongoose.model('Tag')
let _ = require('lodash')
let core = require('../../libs/core')
let backPath = 'tag'
//列表
exports.list = function(req, res) {
    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Tag.count(condition, function(err, total) {
        let query = Tag.find(condition).populate('author');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/tag/list.hbs', {
                title: '标签',
                tags: results,
                pageInfo: pageInfo,
                Menu: 'tag'
            });
        })
    })
    
};
//单条
exports.one = function(req, res) {
    let id = req.params.id;
    Tag.findById(id).populate('author', 'username name email').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '该分类不存在' ,backPath:backPath
            });
        }
        res.render('server/tag/item.hbs', {
            Menu:"tag",
            title: result.name,
            tag: result
        });
    });
};
//添加
exports.add = function(req, res) {

    if (req.method === 'GET') {
        res.render('server/tag/add.hbs', {
            Menu: 'tag'
        });
    } else if (req.method === 'POST') {

        let obj = _.pick(req.body, 'name', 'description');
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        console.log("ss")
        console.log(req.body)
        console.log(obj)
        let tag = new Tag(obj);
        tag.save(function(err, tag) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '创建失败' ,backPath:backPath
                });
            }
            res.render('server/info.hbs', { layout:'layout-blank',
                message: '创建成功' ,backPath:backPath
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        let id = req.params.id;
        Tag.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限' ,backPath:backPath
                });
            }
            res.render('server/tag/edit.hbs', {
                Menu:'tag',
                tag: result
            });
        });
    } else if(req.method === 'POST') {
        let id = req.params.id;
        let obj = _.pick(req.body, 'name', 'description');
        Tag.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限' ,backPath:backPath
                });
            }
            _.assign(result, obj);
            result.save(function(err, tag) {
                if (req.xhr) {
                    return res.json({
                        status: !err
                    })
                }
                if(!err) {
                    res.render('server/info.hbs', { layout:'layout-blank',
                        message: '更新成功' ,backPath:backPath
                    });
                }
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    let id = req.params.id;
    Tag.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '分类不存在' ,backPath:backPath
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '没有权限' ,backPath:backPath
            });
        }
        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
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