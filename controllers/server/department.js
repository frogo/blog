'use strict';

let  mongoose = require('mongoose')
let User = mongoose.model('User')
let Department = mongoose.model('Department')
let _ = require('lodash')
let core = require('../../libs/core')

let backPath = 'department';

//列表
exports.list = function(req, res) {

    let condition = {};
    // if(req.Roles && req.Roles.indexOf('admin') < 0) {
    //     condition.author = req.session.user._id;
    // }
    // condition.level = '4';
    // condition.department ='';

    Department.count(condition, function(err, total) {
        let query = Department.find(condition).populate({path:'parent',populate:{path:'parent',populate:{path:'parent',populate:{path:'parent',populate:{path:'parent'}}}}});
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        console.log(pageInfo)
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            res.render('server/department/list.html', {
                title: '未成交客户列表',
                departments: results,
                pageInfo: pageInfo,
                Menu: 'list',
            });
        })
    })

};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        // let condition = {};
        // if(req.Roles && req.Roles.indexOf('admin') < 0) {
        //     condition.author = req.session.user._id;
        // }
        Department.find().populate('parent').exec().then(function(departments) {
            // User.find().exec().then(function(users) {
            console.log(departments)
           // if(departments != ''){
                res.render('server/department/add.html', {
                    title:'部门添加',
                    Menu: 'add',
                    departments: departments || [],
                   // users:users||[]
                });
            // }else{
            //     console.log('进来了')
            //     // let path = core.translateAdminDir('/department/create');
            //     // console.log(path)
            //     // return res.redirect(path);
            // }
            // })
        })
    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'name','level', 'parent');
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        if (!obj.parent) {
             delete obj.parent;
        }
        let department = new Department(obj);
        console.log(obj)
        department.save(function(err, department) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                return res.render('server/info', {
                    message: '创建失败'
                });
            }
            res.render('server/info', {
                message: '创建成功'
            });
        });
    }
};
//编辑
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        let id = req.params.id;
        Department.findById(id).populate('author').exec(function(err, result) {
            console.log(result)
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            let condition = {};
            if(req.Roles && req.Roles.indexOf('admin') < 0) {
                condition.author = req.session.user._id;
            }
            Department.find(condition).populate('parent').exec().then(function(departments) {

                res.render('server/department/edit.html', {
                    title: '编辑部门信息',
                    department: result,
                    departments: departments || [],
                });
            })
        });
    } else if(req.method === 'POST') {

        let id = req.params.id;
        let obj = _.pick(req.body, 'name','level', 'parent');

        Department.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            _.assign(result, obj);
            result.save(function(err, client) {


                if (req.xhr) {

                    return res.json({
                        status: !err
                    })
                }
                if(!err) {

                    res.render('server/info', {

                        message: '部门更新成功',
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
    Department.findById(id).populate('author').exec(function(err, result) {
        if(err || !result) {
            return res.render('server/info', {
                message: '部门不存在'
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
         console.log(result.id)
        if(!isAdmin && !isAuthor) {
            return res.render('server/info', {
                message: '没有权限',
                backPath:backPath
            });
        }
        let condition = {};
            condition.parent = result.id;
        Department.find(condition).exec().then(function(departments) {
            if(departments != ''){
                console.log('有下属部门')
                return res.render('server/info', {
                    message: '请先删除'+ departments.length +'个下属部门',
                    backPath: backPath
                });
            }
        })
        console.log('没有下属部门')

        result.remove(function(err) {
            if (req.xhr) {
                return res.json({
                    status: !err
                });
            }
            if(err) {
                return res.render('server/info', {
                    message: '删除失败',
                    backPath:backPath
                });
            }
            res.render('server/info', {
                message: '删除成功',
                backPath:backPath
            })
        });
    });
};