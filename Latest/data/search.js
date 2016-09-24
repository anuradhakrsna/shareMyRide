var mongoCollections = require("../config/mongoCollections");
var member = mongoCollections.member;
var member_cars = mongoCollections.cars;
var travel_plan = mongoCollections.travelplan;
var booked_plan = mongoCollections.bookedplan;
var uuid = require('node-uuid');

var exportedMethods= {

    getalltravelplansource(){
        return travel_plan().then((bookedCollection) => {
            var source = bookedCollection.distinct("source_city");
            return source;
        });
    },
    getalltravelplandestination(){
        return travel_plan().then((bookedCollection) => {
            var destination = bookedCollection.distinct("destination_city");
            return destination;
        });
    },
    getPlanListByTravelId(id){
        return booked_plan().then((bookedCollection) => {
            return bookedCollection.find({travel_plan_id: id}).toArray().then((bookedplan) => {
                if (!bookedplan) throw "booked plan with given id not found";
                return bookedplan;
            });



        });
    },
    getPlanListBydate(source,destination,travelDate,finallessthanDate){

        return travel_plan().then((bookedCollection) => {
            console.log("details" +source+destination+travelDate +finallessthanDate );
            return bookedCollection.find({source_city: source,destination_city:destination,travel_start_time:{$gte: travelDate,$lt: finallessthanDate}}).sort({travel_start_time:1}).toArray().then((bookedplan) => {
                if (!bookedplan) throw "Travel plan with given id not found";
                return bookedplan;
            });
            //  return bookedCollection.find({source_city: source,destination_city:destination,travel_start_time:travelDate});
        });}

}

module.exports = exportedMethods;