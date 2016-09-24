var dbConnection = require("./mongoConnection");

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
var getCollectionFn = (collection) => {
    var _col = undefined;

    return () => {
        if (!_col) {
            _col = dbConnection().then(db => {
                return db.collection(collection);
            });
        }

        return _col;
    }
}

/* Now, you can list your collections here: */
module.exports = {
    member: getCollectionFn("member"),
    cars: getCollectionFn("member_cars"),
    travelplan: getCollectionFn("travel_plan"),
    bookedplan: getCollectionFn("booked_plan")
};