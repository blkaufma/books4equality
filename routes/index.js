var express = require('express'),
    books = require('../services/books');

var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/contact', function(req, res, next) {
    res.render('contact');
});

router.get('/library', function(req, res, next) {
    res.render('library');
});

router.get('/mission', function(req, res, next) {
    res.render('mission');
});

module.exports = router;
