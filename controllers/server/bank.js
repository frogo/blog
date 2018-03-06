'use strict';

let  mongoose = require('mongoose')
let Bank = mongoose.model('Bank')
let _ = require('lodash')
let core = require('../../libs/core')
let backPath = 'bank';




//列表
exports.list = function(req, res) {

    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Bank.count(condition, function(err, total) {
        let query = Bank.find(condition).populate('author');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/bank/list.html', {
                //title: '列表',
                banks: results,
                pageInfo: pageInfo,
                Menu: 'list'
            });
        })
    })


};




//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        res.render('server/bank/add.html', {
            Menu: 'add'
        });
    } else if (req.method === 'POST') {

        let obj = _.pick(req.body, 'name', 'description');
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        console.log(req.body)
        console.log(obj)
        let bank = new Bank(obj);
        bank.save(function(err, bank) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                return res.render('server/info', {
                    message: '创建失败',
                    backPath:backPath
                });
            }
            res.render('server/info', {
                message: '创建成功',
                backPath:backPath
            });
        });
    }
};

//编辑
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        let id = req.params.id;
        Bank.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            res.render('server/bank/edit.html', {
                bank: result
            });
        });
    } else if(req.method === 'POST') {
        let id = req.params.id;
        let obj = _.pick(req.body, 'name', 'description');
        Bank.findById(id).populate('author').exec(function(err, result) {
            // let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            // let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
            //
            // if(!isAdmin && !isAuthor) {
            //     return res.render('server/info', {
            //         message: '没有权限'
            //     });
            // }
            _.assign(result, obj);
            result.save(function(err, bank) {
                if (req.xhr) {
                    return res.json({
                        status: !err
                    })
                }
                if(!err) {
                    res.render('server/info', {
                        message: '更新成功',
                        backPath:backPath
                    });
                }
            });
        });
    }
};


//删除
exports.del = function(req, res) {
    let id = req.params.id;
    Bank.findById(id).populate('author').exec(function(err, result) {
        if(!result) {
            return res.render('server/info', {
                message: '分类不存在'
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if(err) {
                return res.render('server/info', {
                    message: '删除失败'
                });
            }
            res.render('server/info', {
                message: '删除成功',
                backPath:backPath
            })
        });
    });
};