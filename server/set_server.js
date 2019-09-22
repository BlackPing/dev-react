const express = require('express');
const conf = require('./config');
const path = require('path');
const fs = require('fs');
const util = require('./black_p');
const err = require('./error');
const DB = require('./db');
const log = require('./log');

const Server = () => {
    const app = express();
    const router = express.Router();
    const Set_Router = conf.router;

    app.use((req, res, next) => {
        util.block_ip(req.ip, res);
        next();
    });

    app.use(express.static(path.join(__dirname, "../Views")));
    router.route("/web/idcheck").get((req, res) => {
        if(req.query.user_id == "test" && req.query.password == "1234") {
            log.info('success', req.ip, req.path, "인증 요청 성공");
            res.send("1:");
        } else {
            res.send("0:");
            log.info('warring', req.ip, req.path, "인증 요청 실패");
        }
    });

    for(var i = 0; i < Set_Router.length; i++) {
        console.log("URL PATTERN SET", Set_Router[i].path + '/:id\t\tMapping')
        switch(Set_Router[i].type) {
            case "GET":
                router.route(Set_Router[i].path + '/:id').get((req, res) => {
                    if(Object.keys(req.query).length > 0) {
                        err(req, res, conf.error_handle.path, conf.error_handle.type, "'QueryString request'");
                    } else {
                        DB(req.ip, "GET", "select * from account", []).then((row) => {
                            console.log(row);
                        });
                        util.render(req, res, req.path, 'html');
                    }
                });
                break;

            case "POST":
                router.route(Set_Router[i].path + '/:id').post(util.post_p);
                break;

            default:
                console.log('PATTERN SET ERROR', Set_Router[i].path, Set_Router[i].type);
                break;
        }
    }

    router.route('*').get((req, res) => {
        err(req, res, conf.error_handle.path, conf.error_handle.type, "'Not Found URL'");
    });

    app.use('/', router)

    process.on('uncaughtException', function (err) {
        console.log('uncaughtException 발생 : ' + err);
    });

    app.listen(conf.port, conf.ip, () => {
        console.log('Server_Running ' + conf.ip + ":" + conf.port);
    });
}

module.exports = Server;