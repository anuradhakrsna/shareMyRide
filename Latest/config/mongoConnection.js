var MongoClient = require("mongodb").MongoClient;;

var settings = {
    mongoConfig: {
        serverUrl: "mongodb://localhost:27017/",
        database: "sharemyride"
    }
};

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var _connection = undefined

var connectDb = () => {
    if (!_connection) {
        _connection = MongoClient.connect(fullMongoUrl)
            .then((db) => {
                return db;
            });
    }

    return _connection;
};

module.exports = connectDb;