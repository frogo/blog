'use strict';

let  mongoose = require('mongoose')
let User = mongoose.model('User')
let Bank = mongoose.model('Bank')
let Client = mongoose.model('Client')
let _ = require('lodash')
let core = require('../../libs/core')
let backPath = 'client';





//搜索
exports.filter = function(req, res) {
    if (req.method === 'POST') {
        let obj = _.pick(req.body, 'start', 'end', 'assign', 'origin', 'matched_condition');
       console.log('搜索')
        console.log(obj)
        let condition ={};

        if(obj.start && obj.end){
            console.log(obj.start)
            console.log(obj.end)
            condition.created = {"$gte":obj.start,"$lt":obj.end}
        }
        if(obj.assign == '1'){//没有分配
            condition.responsible =  {$exists:false}
        }else if(obj.assign == '2') {//已经分配
            condition.responsible =  {$exists:true}
        }
        if(obj.origin =='1'){
            condition.from = '0'
        }else if(obj.origin =='2'){
            condition.from = '1'
        }else if(obj.origin =='3'){
            condition.from = '2'
        }else if(obj.origin =='4'){
            condition.from = '3'
        }

        if(obj.matched_condition){
            condition.matched_condition = obj.matched_condition
        }
         console.log(condition)
        Client.find(condition).populate('responsible').populate('bank').exec().then(function(clients) {
            console.log(clients)
        res.render('server/client/filter.html', {
             //title: result.name,
             clients: clients,

        });
        });
    }


};

//我的下属客户列表
exports.mysubclient = function(req, res) {


            res.render('server/client/mysubclient.html', {
                title: '我的下属客户列表',
                Menu:'mysubclient'


            });


};

//公海客户列表
exports.opensea = function(req, res) {


    res.render('server/client/opensea.html', {
        title: '公海客户',
        Menu:'opensea'

    });


};

//我的客户列表
exports.list = function(req, res) {
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
    let userIdArr =[];//声明当前用户和该用户下属员工的用户ID数组，用于查询未成交客户信息
    User.count( function(err, total) {
        let query = User.find(condition_user).populate('department')
        query.exec(function(err, results) {
            results.forEach(function(item,index){
                userIdArr.push(item.id)
            })
            if(!isStaff){
                condition_client.responsible ={ "$in":userIdArr};
            }

            Client.count( function(err, total) {
                console.log('哈哈哈哈哈哈h')
                console.log(condition_client);
                let query = Client.find(condition_client).populate('responsible').populate('bank');
                //分页
                let pageInfo = core.createPage(req.query.page, total);
                console.log(pageInfo)
                query.skip(pageInfo.start);
                query.limit(pageInfo.pageSize);
                query.sort({created: -1});
                query.exec(function(err, results) {
                    res.render('server/client/list.html', {
                        title: '未成交客户列表',
                        clients: results,
                        pageInfo: pageInfo,
                        Menu: 'myclient',
                    });
                })
            })


        });
    })



};


//单条
exports.one = function(req, res) {
    console.log('单条')
    let id = req.params.id;
    Client.findById(id).populate('responsible','name').populate('bank').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该条客户信息不存在'
            });
        }
        res.render('server/client/item.html', {
            title: result.name,
            client: result,

        });
    });
};

//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {

        let condition_user = {};
        if (req.Roles && req.Roles.indexOf('admin') < 0) {//判断是否是管理员

            if(req.session.user.level=='1'){//判断是否是基层业务员，是
                condition_user._id = req.session.user._id;//是基层员工就组装 查找自己的条件
            }
            else{//不是基层业务员，组装查找隶属这个部门的用户
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
        }else{
            // condition.level = { $lt:8 }//是管理员可以查看所有用户
        }
        Promise.all([User.find(condition_user).exec(),Bank.find().exec()]).then((result) => {
            res.render('server/client/add.html', {
            title: '添加客户信息',
            users: result[0],
            banks:result[1],
            Menu: 'add',
        });
    }).catch((e) => {
            res.render('server/client/add.html', {
            title: '添加客户信息',
            Menu: 'add',
        });
    })

    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'name','phone_number', 'from', 'matched_condition','bank', 'responsible','remarks');
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        if (!obj.responsible) {//如果负责人为空，删除该字段
            delete obj.responsible
        }
        let client = new Client(obj);
        console.log(obj)
        client.save(function(err, client) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                console.log(err)
                return res.render('server/info', {
                    message: '客户添加失败'
                });
            }
            res.render('server/info', {
                message: '客户添加成功',
                backPath:'client',

            });
        });
    }
};

//编辑
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        let id = req.params.id;
        Client.findById(id).populate('author').exec(function(err, result) {

            let condition_user = {};
            if (req.Roles && req.Roles.indexOf('admin') < 0) {//判断是否是管理员

                if(req.session.user.level=='1'){//判断是否是基层业务员，是
                    condition_user._id = req.session.user._id;//是基层员工就组装 查找自己的条件
                }
                else{//不是基层业务员，组装查找隶属这个部门的用户
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
            }else{
                // condition.level = { $lt:8 }//是管理员可以查看所有用户
            }


            User.find(condition_user).exec().then(function(users) {
                Bank.find().exec().then(function(banks) {

                res.render('server/client/edit.html', {
                    title: '编辑客户信息',
                    client: result,
                    banks:banks || [],
                    users: users || [],
                 });
                });
            })
        });
    } else if(req.method === 'POST') {

        let id = req.params.id;
        let obj = _.pick(req.body, 'name','phone_number', 'from', 'matched_condition','bank', 'responsible','remarks');

        Client.findById(id).populate('author').exec(function(err, result) {
            // let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            // let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);
            //
            // if(!isAdmin && !isAuthor) {
            //     return res.render('server/info', {
            //         message: '没有权限'
            //     });
            // }
            _.assign(result, obj);
            result.save(function(err, client) {


                if (req.xhr) {

                    return res.json({
                        status: !err
                    })
                }
                if(!err) {

                    res.render('server/info', {

                        message: '客户资料更新成功',
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
    Client.findById(id).populate('author').exec(function(err, result) {
        if(err || !result) {
            return res.render('server/info', {
                message: '内容不存在',
                backPath:backPath
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info', {
                message: '没有权限',
                backPath:backPath
            });
        }
        //
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