'use strict';

let appPath = process.cwd();
let config = {
    port: 7000,
    env: process.env.NODE_ENV || 'development', // development   production
    //mongodb配置信息
    mongodb: {
        uri: 'mongodb://jinshuai:jinshuai@localhost:27085/blog',
        options: {}
    },
    //redis服务，用来session维持，非必须
    redis: {
        host: '', // �?127.0.0.1 配置此项表示启用redis，需保证redis服务已启�?
        port: 6379, // 6379
        pass: ''
    },
    //找回密码hash过期时间
    findPasswordTill: 24 * 60 * 60 * 1000,
    // session secret
    sessionSecret: 'SessionSecret',
    // jsonwebtoken config
    jwt: {
        secret: 'JWTSecret',
        options: {
            expiresIn: '10h'
        }
    },
    title: '管理后台',
    //后台相关配置
    admin: {
        dir: 'admin', //后台访问路径，如http://localhost/admin配置为admin
        role: {//默认角色�?
            admin: 'admin',
            user: 'user'
        }
    },
    upload: {
        tmpDir:  appPath + '/public/uploaded/tmp',
        uploadDir: appPath + '/public/uploaded/files',
        uploadUrl:  '/uploaded/files/',
        maxPostSize: 100 * 1024 * 1024, // 100M
        minFileSize:  1,
        maxFileSize:  50 * 1024 * 1024, // 50M
        acceptFileTypes:  /.+/i,
        storage: {
            type: 'local',//保存类型，如果保存到本地可省略或local, 目前支持7牛：qiniu
            options: {
                accessKey: 'your key',
                secretKey: 'your secret',
                bucket: 'your bucket',
                domain: 'http://yourdomain.qiniudn.com', // 域名，包含http，如http://yourdomain.qiniudn.com
                timeout: 3600000, // default rpc timeout: one hour, optional
            }
        }
    },
    stopForumSpam: false,
    // 是否启动用户注册校验TODO:
    userVerify: {
        enable: false,
        type: 'admin' // mail | admin, 默认admin
    },
    // 邮箱配置，找回密码、用户注册使�?
    mail: {
        // 发信人邮�?
        from: 'username@domain.com',
        // nodemailer config see https://nodemailer.com/about/
        nodemailer: {
            // https://nodemailer.com/smtp/
            service: 'gmail',
            host: '',
            port: '',
            auth: {
                user: '',
                pass: ''
            }
        }
        
    },
    // google analytics
    ga: '',
    // 短信服务配置TODO:
    sms: {

    }
};

module.exports = config;