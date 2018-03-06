'use strict';

let express = require('express');
let mongoose = require('mongoose');
let gravatar = require('gravatar');
let path = require('path');
let favicon = require('serve-favicon');
let compression = require('compression')
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let RedisStore = require('connect-redis')(session); //存储session,防止服务重启后session丢失
let bodyParser = require('body-parser');
let csrf = require('csurf');
let moment = require('moment');
let _ = require('lodash');
let multipart = require('connect-multiparty'); //解析文件
let core = require('./libs/core');
let xss = require('xss')
let marked = require('marked');
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    //sanitize: true,// 不解析html标签
    smartLists: true,
    smartypants: false
});
let strip = require('strip');

let appPath = process.cwd();
let config = require('./config');
//设置moment语言
moment.locale('zh-cn');

let app = express();

app.use(compression())

//连接数据库
/*mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('mongodb连接成功++++');
});*/

//连接数据库
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.uri, {
    useMongoClient: true
}).then(function(db) {
    console.log(config.mongodb.uri)
    console.log('mongodb连接成功')
}, function(err) {
    console.log('mongodb连接失败', err)
})

//载入数据模型
core.walk(appPath + '/models', null, function(path) {
    require(path);
});

//var engines = require('consolidate');
var handlebars  = require('express-handlebars');
var hbs = handlebars.create({
    defaultLayout: __dirname+'/views/server/layout',
    extname:'hbs',
    helpers : {
        section : function(name, options){ if(!this._sections) this._sections = {}; this._sections[name] = options.fn(this); return null; },
        compare:function(left, operator, right, options) {
            if (arguments.length < 3) {
                throw new Error('Handlerbars Helper "compare" needs 2 parameters');
            }
            var operators = {
                '==':     function(l, r) {return l == r; },
                '===':    function(l, r) {return l === r; },
                '!=':     function(l, r) {return l != r; },
                '!==':    function(l, r) {return l !== r; },
                '<':      function(l, r) {return l < r; },
                '>':      function(l, r) {return l > r; },
                '<=':     function(l, r) {return l <= r; },
                '>=':     function(l, r) {return l >= r; },
                'typeof': function(l, r) {return typeof l == r; },
                'contains':function(l,r){return l.indexOf(r) > -1}
            };
            if (!operators[operator]) {
                throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
            }
            var result = operators[operator](left, right);
            if (result) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        where:function( collection, key, value, limit, options ){
            options = options || limit;
            if( typeof limit !== 'number' ) limit = Infinity;
            var matches = 0;
            var result = '';
            for( var i = 0; i < collection.length; i++ ){
                if( collection[i][key] === value ){
                    result += options.fn( collection[i] );
                    matches++;
                    if( matches === limit ) return result;
                }
            }
            return result;
        },
        avatar:function(userEmail,options){
            return gravatar.url(userEmail || '', {s: '40',r: 'x',d: 'retro'}, true)
        },//定义模版头像
        hasMoudle:function(user,roles,actions,action_moudle,options)//moudle是左侧菜单模块,其中user是当前模块req返回到模板的User,roles是当前模块req返回到模板的Roles,actions是当前模块req返回到模板的Actions,action_moudle是当前helper作用域所在的模块名称
        {
            if(user && actions.indexOf(action_moudle) > -1 || roles.indexOf('admin') > -1  ){
                return options.fn(this);
            }else{
                return options.inverse(this);
            }

        },
        pagination:function(pageInfo,options){

                 var totalPage = pageInfo.totalPage;
                 var range = 3;
                 var currentPage = Math.min(pageInfo.currentPage, pageInfo.totalPage);
                 var prevPage = (currentPage - 1) || 1;
                 var nextPage = currentPage >= pageInfo.totalPage ? pageInfo.totalPage : (currentPage + 1);
                 var query = pageInfo.query || {};



                 var html_prev = function(){
                     query.page = prevPage
                     var prev_status = '';
                     if(currentPage === 1){
                         prev_status = 'disabled'
                     }
                     return "<li class='"+ prev_status +"'><a href='?"+ core.stringify(query) +"'>&laquo;</a></li>";
                 }
                 var html_prev_omit = function(){
                     if (currentPage - range >= 2) {
                         query.page = 1
                         var prev_omit_status = '';
                         if (currentPage === 1) {
                             prev_omit_status = 'active'
                         }
                         return "<li class='" + prev_omit_status + "'><a href='?" + core.stringify(query) + "'>1</a></li><li><a>...</a></li>"
                     }else{
                         return "";
                     }
                 }
                 var html_main = function(){
                     var html_str = '';
                     var status = '';
                     for (var i = 1; i <= totalPage; i ++){
                         query.page = i;
                         if(i >= Math.min(Math.max(currentPage - range, 1), totalPage - 2 * range) && i <= Math.max(Math.min(range + currentPage, totalPage), 2 * range)){
                             status = currentPage === i ? 'active' : '';
                             html_str += "<li class='"+status+"'><a href='?"+ core.stringify(query) +"'>"+i+"</a></li>"
                         }
                     }
                     return html_str;
                 }
                var html_next_omit = function(){
                    if (currentPage + range <= totalPage - 1 ) {
                        query.page = totalPage
                        var next_omit_status = '';
                        if (currentPage === totalPage) {
                            next_omit_status = 'active'
                        }
                        return "<li><a>...</a></li><li class='" + next_omit_status + "'><a href='?" + core.stringify(query) + "'>"+totalPage+"</a></li>"
                    }else{
                        return '';
                    }
                }
                var  html_next =function(){
                    query.page = nextPage
                    var next_status = '';
                    if(currentPage === 1){
                        next_status = 'disabled'
                    }
                    return "<li class='"+ next_status +"'><a href='?"+ core.stringify(query) +"'>&raquo;</a></li>";
                }


            return html_prev() + html_prev_omit() + html_main() +  html_next_omit() + html_next()
        },//分页
        css:function(str,option){
            var cssList = this.cssList || [];
            str = str.split(/[,，;；]/);
            console.log('css: ',str);
            str.forEach(function (item) {
                if(cssList.indexOf(item)<0) {
                    cssList.push(item);
                }
            });
            this.cssList = cssList.concat();
        },//css 自定义在页面
        js:function(str,option){
            var jsList = this.jsList || [];
            str = str.split(/[,，;；]/);
            console.log('js: ',str);
            str.forEach(function (item) {
                if(jsList.indexOf(item)<0) {
                    jsList.push(item);
                }
            });
            this.jsList = jsList.concat();
        }//js自定义在页面


    }

})

//app.engine('jade', engines.jade);

// 设置后缀名为html和hbs的文件都可以作为handlebars的模板
app.engine('html', hbs.engine);
app.engine('hbs', hbs.engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'jade');


if (config.env === 'production') {
    app.enable('view cache');
}

//定义全局字段
app.locals = {
    title: config.title || 'nodejs后台管理系统+++++',
    pretty: true,
    moment: moment,
    _: _,
    core: core,
    config: config,
    adminDir: config.admin.dir ? ('/' + config.admin.dir) : '',
    gravatar: gravatar,
    md: marked,
    strip: strip,
    env: config.env,
    xss: xss
};
app.set('config', config);

app.use(favicon(__dirname + '/public/assets/app/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.sessionSecret || 'cms',
    store: (config.redis.host ? new RedisStore(config.redis) : null)
}));
//上传中间件，todo：换成multer, no global middleware
app.use(multipart({
    uploadDir: config.upload.tmpDir
}));
core.walk(appPath + '/routes/api', 'middlewares', function(path) {
    require(path)(app);
});
app.use(csrf());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.header('X-Powered-By', 'wengqianshan');
    if (req.csrfToken) {
        res.cookie('TOKEN', req.csrfToken())
    }
    // TODO remove
    res.locals.token = req.csrfToken && req.csrfToken();

    res.locals.query = req.query;
    if (req.session && req.session.user) {
        res.locals.User = req.session.user;
        //角色信息
        let roles = core.getRoles(req.session.user);
        let actions = core.getActions(req.session.user);
        req.Roles = roles;
        req.Actions = actions;
        res.locals.Roles = roles;
        res.locals.Actions = actions;
    } else {
        res.locals.User = null;
        req.Roles = null;
        req.Actions = null;
        res.locals.Roles = null;
        res.locals.Actions = null;
    }
    next();
});

//路由控制
core.walk(appPath + '/routes/app', 'middlewares', function(path) {
    require(path)(app);
});
core.walk(appPath + '/routes/server', 'middlewares', function(path) {
    require(path)(app);
});


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('页面不存在');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (config.env === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('server/error', {
            message: err.message,
            error: err
        });
    });
} else {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('app/error', {
            message: err.message
        });
    });    
}

let debug = require('debug')('cms');
app.set('port', process.env.PORT || config.port || 7000);
let server = app.listen(app.get('port'), function() {
    console.log('网站服务已启动，端口号： ' + server.address().port);
});