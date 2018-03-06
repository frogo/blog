'use strict';

let  mongoose = require('mongoose')
let User = mongoose.model('User')
let Content = mongoose.model('Content')
let Category = mongoose.model('Category')
let Comment = mongoose.model('Comment')
let File = mongoose.model('File')
let Role = mongoose.model('Role')
let Client = mongoose.model('Client')
let Department = mongoose.model('Department')
let Bank = mongoose.model('Bank')
let userController = require('./user')
let config = require('../../config')
let core = require('../../libs/core')
let userService = require('../../services/user')

//后台首页
exports.index = function(req, res) {
    if(!req.session.user) {
        let path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    let obj = {}
    let filter = {};
    let name = req.session.user.name;
    // if(req.Roles && req.Roles.indexOf('admin') < 0) {
    //    // filter = {author: req.session.user._id};
    // }注释之前的用户自己添加的才能看到
    let userIdArr =[];//声明当前用户和该用户下属员工的用户ID数组，用于查询未成交客户信息
    let condition_user = {};//用户查询条件
    let condition_client ={}//客户查询条件
    let isStaff = true;//基层员工flag
    if (req.Roles && req.Roles.indexOf('admin') < 0) {//判断是否是管理员
        if(req.session.user.level=='1'){//判断是否是基层业务员，是
            condition_client.responsible = req.session.user._id;
        }
        else{//不是基层业务员
            isStaff =false;
            switch (req.session.user.level){//level对用部门的字段数组下标
                case 7: //level=7 : department[0] 老板 ：公司
                    condition_user = {'department':req.session.user.department[0]};
                    break;
                case 6://level=6 : department[1] 总经办：总经办
                    condition_user = {'department':req.session.user.department[1]};
                    break;
                case 5://level=5 : department[2] 总经理：市场营销部
                    condition_user = {'department':req.session.user.department[2]};
                    break;
                case 4:// level=4 : department[3] 大区经理：大区
                    condition_user = {'department':req.session.user.department[3]};
                    break;
                case 3://level=3 : department[4] 大组长：大组
                    condition_user = {'department':req.session.user.department[4]};
                    break;
                case 2://level=2 : department[5] 小组长：小组
                    condition_user = {'department':req.session.user.department[5]};
                    break;
            }
        }

        //department_id = req.session.user.department[department_index];

    }else{
        // condition.level = { $lt:8 }//是管理员可以查看所有用户
    }
    User.count( function(err, total) {
        let query = User.find(condition_user).populate('department')
        query.exec(function(err, results) {
            results.forEach(function(item,index){
                userIdArr.push(item.id)
            })
            if(!isStaff){
                condition_client.responsible ={ "$in":userIdArr};
            }
    //Promise
    Promise.all([
        Content.find(filter).count().exec(),
        Category.find(filter).count().exec(),
        Comment.find(filter).count().exec(),
        User.find(condition_user).count().exec(),
        Role.find(filter).count().exec(),
        Client.find(condition_client).count().exec(),
        Department.find(filter).count().exec(),
        Bank.find(filter).count().exec(),
        File.find(filter).count().exec(),
        userService.trend()
    ]).then((result) => {
       // console.log(result)
        res.render('server/index.hbs', {
            name:name,
            title: '汉银管理后台',
            data: {
                content: result[0],
                category: result[1],
                comment: result[2],
                user: result[3],
                role: result[4],
                client: result[5],
                department: result[6],
                bank: result[7],
                file: result[8],
                trend: result[9]
            }
        });
    }).catch((e) => {

    })
    //Promise
        });
    })
};

//初始化后台,安装初始数据
exports.install = function(req, res) {
    if(req.session.user) {
        let path = core.translateAdminDir('');
        return res.redirect(path);
    }
    //检查是否已经有用户
    User.find({}, function(err, results) {
        console.log(err, results);
        if(err) {
            return;
        }
        if(results.length < 1) {
            //满足条件
            if(req.method === 'GET') {
                res.render('server/install', {
                    title: '初始化'
                });
            } else if(req.method === 'POST') {
                let createUser = function(obj) {
                    let user = new User(obj);
                    user.save(function() {
                        res.render('server/info', {
                            message: '初始化完成'
                        });
                    });
                };
                let obj = req.body;
                obj.status = 101;//系统默认管理员
                //检查是否有角色，没有的话创建
                Role.find({status: 201}, function(err, roles) {
                    console.log('查找role', err, roles)
                    if(roles.length < 1) {
                        console.log('没有角色 ' + config.admin.role.admin);
                        let role = new Role({
                            name: config.admin.role.admin,
                            actions: [],
                            status: 201//系统默认管理员角色
                        });
                        role.save(function(err, result) {
                            console.log('role result', result);
                            obj.roles = [role._id];
                            createUser(obj);
                        });
                        //创建普通角色
                        new Role({
                            name: config.admin.role.user,
                            actions: [],
                            status: 202//系统默认用户角色
                        }).save();
                    }else{
                        obj.roles = [roles[0]._id];
                        createUser(obj);
                    }
                })
            }
        }else{
            //已经初始化过，跳过
            let path = core.translateAdminDir('');
            res.redirect(path);
        }
    })
};