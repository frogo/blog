/**
 * 未成交客户信息服务
 **/
'use strict';

let mongoose = require('mongoose');
let _ = require('lodash');
let Client = mongoose.model('Client');


let baseServices = require('./base')(Client);

let services = {
    findBySome: function(id, populates) {
        return new Promise(function(resolve, reject) {
            let query = Client.findById(id)
            if (populates && populates.length > 0) {
                populates.forEach(function(item) {
                    query = query.populate(item);
                })
            }
            query.exec(function(err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            });
        })
    }
};

module.exports = _.assign({}, baseServices, services);