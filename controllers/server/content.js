'use strict';

let mongoose = require('mongoose')
let Content = mongoose.model('Content')
let Category = mongoose.model('Category')
let Tag = mongoose.model('Tag')
let _ = require('lodash')
let core = require('../../libs/core')
let backPath = 'content';
/*let userService = require('../../services/user')
userService.findById('53b6ca419dfe0cf41ccbaf96', ['roles', 'author']).then(function(res) {
    console.log(res)
}, function(err) {
    console.log(err)
})*/

//let contentService = require('../../services/content');

//console.log(contentService, 111);

/*contentService.findBySome('5741aeb9e5ba3ff9025dfdec').then(function(res) {
    console.log(res, 222);
})*/


//同步mysql
//先安装mysql模块 npm install mysql
/*let mysql = require('mysql');
let connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'ouyo'
});
connection.connect();
connection.query('select * from info', function(err, result) {
    result.forEach(function(item) {
        let content = new Content({
            title: item.title,
            content: item.content,
            created: item.created
        });
        content.save(function(c) {
            console.log('保存成功', c);
        });
    })
});*/
//备份end
//列表
exports.list = function(req, res) {
    let condition = {};
    let category = req.query.category;
    if(category) {
        condition.category = category;
    }
    if(req.Roles && req.Roles.indexOf('admin') < 0) {
        condition.author = req.session.user._id;
    }
    //查数据总数
    Content.count(condition).exec().then(function(total) {
        let query = Content.find(condition).populate('author', 'username name email');
        //分页
        let pageInfo = core.createPage(req.query.page, total);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            //console.log(err, results);
            console.log(pageInfo)
            res.render('server/content/list.hbs', {
                title: '文章列表',
                contents: results,
                pageInfo: pageInfo,
                Menu: 'content'
            });
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
        console.log('测试condition')
        console.log(condition.author);
        Promise.all([Category.find(condition).exec(), Tag.find(condition).exec()]).then((result) => {
            res.render('server/content/add.hbs', {
                title:'添加文章',
                categorys: result[0],
                tags: result[1],
                Menu: 'content',

            });
        }).catch((e) => {
            res.render('server/content/add.hbs', {
                title:'添加文章',
                Menu: 'content'
            });
        })
    } else if (req.method === 'POST') {
        let obj = _.pick(req.body, 'title', 'summary', 'content', 'gallery', 'category', 'tags','keywords');
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        if(obj.category === '') {
            obj.category = null;
        }
        
        let content = new Content(obj);
        content.save(function(err, content) {
            if (req.xhr) {
                return res.json({
                    status: !err
                })
            }
            if (err) {
                console.log(err);
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
        Content.findById(id).populate('author gallery tags').exec(function(err, result) {
            if(err) {
                console.log('加载内容失败');
            }
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
            Category.find(condition, function(err, categorys) {
                Tag.find(condition).exec().then(function(tags) {
                    console.log('是'+result)
                    res.render('server/content/edit.hbs', {
                        content: result,
                        categorys: categorys,
                        tags: tags,
                        Menu: 'content'
                    });
                });
                
            });
        });
    } else if(req.method === 'POST') {
        let id = req.params.id;
        let obj = _.pick(req.body, 'title', 'summary', 'content', 'gallery', 'thumb','category', 'tags','keywords');
        console.log(obj);

        if(obj.thumb === '') {
            obj.thumb = null;
        }
        if(obj.category === '') {
            obj.category = null;
        }
        if(!obj.gallery) {
            obj.gallery = [];
        }
        
        Content.findById(id).populate('author').exec(function(err, result) {
            //console.log(result);
            let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
            let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

            if(!isAdmin && !isAuthor) {
                return res.render('server/info.hbs', { layout:'layout-blank',
                    message: '没有权限',backPath:backPath
                });
            }
            _.assign(result, obj);
            result.save(function(err, content) {
                if (req.xhr) {
                    return res.json({
                        status: !err
                    })
                }
                if(err || !content) {
                    return res.render('server/info.hbs', { layout:'layout-blank',
                        message: '修改失败',backPath:backPath
                    });
                }
                res.render('server/info.hbs', { layout:'layout-blank',
                    message: '更新成功',backPath:backPath
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    let id = req.params.id;
    Content.findById(id).populate('author').exec(function(err, result) {
        if(err || !result) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '内容不存在',backPath:backPath
            });
        }
        let isAdmin = req.Roles && req.Roles.indexOf('admin') > -1;
        let isAuthor = result.author && ((result.author._id + '') === req.session.user._id);

        if(!isAdmin && !isAuthor) {
            return res.render('server/info.hbs', { layout:'layout-blank',
                message: '没有权限',backPath:backPath
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
                return res.render('server/info.hbs',
                    {
                    layout:'layout-blank',
                    message: '删除失败',
                    backPath:backPath
                });
            }
            res.render('server/info.hbs',
                {
                layout:'layout-blank',
                message: '删除成功',
                backPath:backPath
            })
        });
    });
};