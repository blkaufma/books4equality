'use strict';

var crypto = require("crypto"),
    express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    login = require('connect-ensure-login'),
    organizations = require('../services/organizations'),
    logger = require('../services/logger');

passport.use(new LocalStrategy(
    function(username, password, done) {
        var passwordHash = crypto.createHash("sha256").update(password, "utf8").digest("base64");

        var criteria = {
            username: username,
            password: passwordHash
        };

        organizations.findOne(criteria, function(err, organization) {
            if (err) {
                logger.info('user auth failed %j', err);
                return done(null, false, err);
            } else {
                logger.info('user info %j', organization);
                return done(null, organization);
            }
        })
    }
));

passport.serializeUser(function serialize(user, done) {
    logger.debug('serialize %j', user);
    done(null, user);
});

passport.deserializeUser(function deserialize(user, done) {
    logger.debug('deserialize %j', user);
    return done(null, user);
});

var router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

router.use(bodyParser.urlencoded({ extended: true }));

//router.get('/organizations',
//   login.ensureLoggedIn('/organizations/login'),
//    function(req, res, next) {
//        res.render('organizations/index');
//    }
//);

router.get('/organizations/login',
    function(req, res, next) {
        res.render('organizations/login');
    }
);

router.post('/organizations/login',
    login.ensureNotLoggedIn(),
    passport.authenticate('local', {
        successRedirect: '/organizations',
        failureRedirect: '/organizations?unauthorized'
    })
);

router.get('/organizations/logout',
    function logout(req, res) {
        req.logout();
        res.redirect('/organizations');
    }
);

router.post('/organizations/signup',
    login.ensureNotLoggedIn(),
    function(req, res, next) {

        // TODO validate format, existing orgs, etc. with 'revalidator'

        var passwordHash = crypto.createHash("sha256").update(req.body.password, "utf8").digest("base64");
        var organization = {
            username: req.body.name,
            password: passwordHash, // do not store plain password
//            name: req.body.name,
//            location: req.body.location,
//            logo: req.body.logo,
            email: req.body.email,
            numberBooks: 0,
            outreach: 0,

            createdAt: new Date()
        };

        organizations.insert(organization, function(err, result) {
            if (err) {
                return next(new Error('Not able to create organization'));
            }

            return res.redirect('/organizations');
        });
    }
);

module.exports = router;
