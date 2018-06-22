'use strict';

let  mongoose = require('mongoose')
let Category = mongoose.model('Category')
let _ = require('lodash')
let core = require('../../libs/core')
let backPath = 'category'
//列表
exports.list = function(req, res) {
    let condition = {};
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    Category.count(condition, function(err, total) {
        let query = Category.find(condition).populate('author');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            res.render('server/category/list.hbs', {
                title: '分类列表',
                categorys: results,
                pageInfo: pageInfo,
                Menu: 'category'
            });
        })
    })
    
};
//单条
exports.one = function(req, res) {
    let id = req.params.id;
    Category.findById(id).populate('author', 'username name email').populate('parent').exec(function(err, result) {
        console.log(result);
        var parentName;
        if(!result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '该分类不存在'
            });
        }
        if(!result.parent){
            parentName ="暂无父类";
        } else{
            parentName = result.parent.name;
        }

        res.render('server/category/item.hbs', {

            title: result.name,
            category: result,
            parentName:parentName

        });
    });
};
//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        let condition = {};
        if(req.Roles && req.Roles.indexOf('admin') < 0) {
            condition.author = req.session.user._id;
        }
        Category.find(condition).exec().then(function(categorys) {
            res.render('server/category/add.hbs', {
                title:'添加分类',
                Menu: 'category',
                items: categorys || []
            });
        })
    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'name','subName', 'flag', 'description', 'parent');
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        if (!obj.parent) {
            delete obj.parent
        }
        let category = new Category(obj);
        category.save(function(err, category) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '创建失败',backPath:backPath
                });
            }
            res.render('server/info.hbs', { layout:'layout-blank',
                message: '创建成功',backPath:backPath
            });
        });
    }
};
exports.edit = function(req, res) {

    if(req.method === 'GET') {

        let id = req.params.id;
        Category.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限',backPath:backPath
                });
            }
            let condition = {};
            if(req.Roles && req.Roles.indexOf('admin') < 0) {
                condition.author = req.session.user._id;
            }
            Category.find(condition).exec().then(function(categorys) {
                res.render('server/category/edit.hbs', {
                    category: result,
                    items: categorys || []
                });
            })
        });
    } else if(req.method === 'POST') {

        let id = req.params.id;
        let obj = _.pick(req.body, 'name','subName', 'flag', 'description', 'parent');
        if (!obj.parent) {
            delete obj.parent
        }
        Category.findById(id).populate('author').exec(function(err, result) {
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限',backPath:backPath
                });
            }
            _.assign(result, obj);
            result.save(function(err, category) {
                console.log('保存 '+ err + 'leibie ' +category)

                if (req.xhr) {
                    console.log('啦啦啦啦'+req.xhr)
                    return res.json({
                        status: !err
                    })
                }
                if(!err) {

                    res.render('server/info.hbs', { layout:'layout-blank',

                        message: '更新成功',backPath:backPath
                    });
                }
            });
        });
    }
};
//删除
exports.del = function(req, res) {
        let id = req.params.id;
        Category.findById(id).populate('author').exec(function (err, result) {
            if (!result) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '分类不存在',backPath:backPath
                });
            }
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if (!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限',backPath:backPath
                });
            }
            result.remove(function (err) {
                if (req.xhr) {
                    return res.json({
                        status: !err
                    });
                }
                if (err) {
                    return res.render('server/info.hbs', { layout:'layout-blank',
                        message: '删除失败',backPath:backPath
                    });
                }
                res.render('server/info.hbs', { layout:'layout-blank',
                    message: '删除成功',backPath:backPath
                })
            });
        });

};