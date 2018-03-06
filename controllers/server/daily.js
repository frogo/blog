'use strict';

let  mongoose = require('mongoose')
let Daily = mongoose.model('Daily')
let _ = require('lodash')
let core = require('../../libs/core')




//列表
exports.list = function(req, res) {
    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Daily.count(condition, function(err, total) {
        let query = Daily.find(condition).populate('author');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/daily/list', {
                //title: '列表',
                dailies: results,
                pageInfo: pageInfo,
                Menu: 'list'
            });
        })
    })

};

//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        res.render('server/daily/add', {
            Menu: 'add'
        });
    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'date','project', 'task', 'schedule', 'estimated_workload','cumulative_input','yesterday_input_hours','current_progress','today_plan_hours','state','remarks');
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        let daily = new Daily(obj);
        console.log(obj)
        daily.save(function(err, daily) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                return res.render('server/info', {
                    message: '日报添加失败'
                });
            }
            res.render('server/info', {
                message: '日报添加成功'
            });
        });
    }
};
//更新
exports.edit = function(req, res) {

    if(req.method === 'GET') {

        let id = req.params.id;
        Daily.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            // let condition = {};
            // if(req.Roles && req.Roles.indexOf('admin') < 0) {
            //     condition.author = req.session.user._id;
            // }
           console.log('备注是'+result.remarks)
                res.render('server/daily/edit', {
                    daily: result,
                });

        });
    } else if(req.method === 'POST') {

        let id = req.params.id;
        let obj = _.pick(req.body, 'date','project', 'task', 'schedule', 'estimated_workload','cumulative_input','yesterday_input_hours','current_progress','today_plan_hours','state','remarks');

        Daily.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            _.assign(result, obj);
            result.save(function(err, daily) {

                if (req.xhr) {
                    //console.log('啦啦啦啦'+req.xhr)
                    return res.json({
                        status: !err
                    })
                }
                if(!err) {

                    res.render('server/info', {

                        message: '日报更新成功'
                    });
                }
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    let id = req.params.id;
    Daily.findById(id).populate('author').exec(function(err, result) {
        console.log('结果是'+result);
       // console.log(result.author);
        if(!result) {
            return res.render('server/info', {
                message: '日报不存在'
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
                    message: '删除日报失败'
                });
            }
            res.render('server/info', {
                message: '删除日报成功'
            })
        });
    });
};