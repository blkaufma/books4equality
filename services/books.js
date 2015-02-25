'use strict';

var db = require('./db'),
    logger = require('./logger'),
    ObjectID = require('mongodb').ObjectID;

function parseCategories(categories) {
    function isEmpty(element) {
        return element;
    }

    return categories.split(',').filter(isEmpty);
}

function find(options, callback) {
    var criteria = {
        $query: {
            available: true
        }
    };

    if (options.title) {
        criteria.$query.title = { $regex: options.title };
    }

    if (options.categories) {
        var categories = parseCategories(options.categories);
        if (categories.length > 0) {
            criteria.$query.categories = { $in: categories };
        }
    }

    if (options.orderby) {
        criteria.$orderby = {};
        criteria.$orderby[options.orderby] = parseInt(options.dir) || 1;
    }

    var hints = {
        limit: 100
    };

    if (options.skip) {
        hints.skip = parseInt(options.skip);
    }

    logger.info('search criteria %j', criteria);
    logger.info('search hints %j', hints);

    db.get().collection('books').find(criteria, hints).toArray(function(err, books) {
        if (err) {
            return callback(err);
        }
        return callback(null, books);
    });
}

function findOne(id, callback) {
    var oid = new ObjectID(id)
    var criteria = {
        _id: oid,
        available: true
    };

    db.get().collection('books').findOne(criteria, function(err, book) {
        if (err) {
            return callback(err);
        }
        return callback(null, book);
    });
}

function insert(book, callback) {
    db.get().collection('books').save(book, function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

module.exports = {
    find: find,
    findOne: findOne,
    insert: insert
};
