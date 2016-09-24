var mongoCollections = require("../config/mongoCollections");
var member = mongoCollections.member;
var member_cars = mongoCollections.cars;
var travel_plan = mongoCollections.travelplan;
var booked_plan = mongoCollections.bookedplan;
var uuid = require('node-uuid');
var provider = require("./provider");

var exportedMethods= {

    latestBookPlan(id){
        return booked_plan().then((bookedCollection) => {
            return bookedCollection.find({ member_id: id }).toArray().then((bookedList)=>{
                var finalResult = {result:null,count:null};
                if(bookedList.length > 0)
                {
                    var travelPlanList = bookedList.map(obj => provider.gettravelplanById(obj.travel_plan_id));
                    return Promise.all(travelPlanList).then((arrayofTravelPlan)=>{
                        console.log(arrayofTravelPlan);
                        var currentTime = new Date().getTime();
                        var previousValue = 'Y';
                        var result;
                        var count = 0;
                        arrayofTravelPlan.forEach((obj)=>{
                            console.log(new Date(obj.travel_start_time).getTime());
                            var currentValue = new Date(obj.travel_start_time).getTime();
                            if(currentValue > currentTime)
                            {
                                    if(previousValue === 'Y'){
                                        console.log("firstTime");
                                        previousValue = currentValue;
                                        count++;
                                        result = obj;
                                    }
                                    else{
                                        if(previousValue>currentValue)
                                        {
                                            previousValue = currentValue;
                                            result = obj;
                                        }
                                        count++;
                                    }
                            }
                            else{
                                if(!result)
                                result = false;
                            }    
                            
                        })
                        console.log(result);
                        console.log(count);
                        finalResult.result = result;
                        finalResult.count = count;
                        return finalResult;
                    })
                }
                else
                {
                    finalResult.result = false;
                    finalResult.count = 0;
                    return finalResult;
                }
            })
        });
    },
    getbookedplanById(id){
        return booked_plan().then((bookedCollection) => {
            return bookedCollection.findOne({ _id: id }).then((bookedplan) => {
                if (!bookedplan) throw "Booked Plan with given id not found";
                return bookedplan;
            });
        });
    },

    getPlanListById(id){
        return booked_plan().then((bookedCollection) => {
            return bookedCollection.find({member_id: id}).toArray();
        });
    },
    bookPlan(createData){
        
        return booked_plan().then((bookedCollection)=>{
            var createObj = {
                _id: uuid.v4(),
                member_id:createData.member_id,
                travel_plan_id:createData.travel_plan_id,
                description:createData.description,
                seats_needed:createData.seats_needed
            };

            return bookedCollection.insertOne(createObj).then((newInsertInformation) => {
            return newInsertInformation.insertedId;
                    }).then((newId) => {
                       // console.log("New id"+ newId);
                        return this.getbookedplanById(newId);
            });
        });
    },
    bookPlanwithdetails(member_id,travelplanid,desc,seats){

        return booked_plan().then((bookedCollection)=>{
            var createObj = {
                _id: uuid.v4(),
                member_id:member_id,
                travel_plan_id:travelplanid,
                description:desc,
                seats_needed:seats
            };

            return bookedCollection.insertOne(createObj).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                // console.log("New id"+ newId);
                return this.getbookedplanById(newId);
            });
        });
    },

    updatePlan(id,updatedPlan){
        return booked_plan().then((bookedCollection) => {
            var updatedtravelData = {};
            if (updatedPlan.seats_needed) {
                updatedtravelData.seats_needed = updatedPlan.seats_needed;
            }
            if (updatedPlan.description) {
                updatedtravelData.description = updatedPlan.description;
            }

            var updateCommand = {
                $set: updatedtravelData
            };

            return bookedCollection.updateOne({ _id: id }, updateCommand).then((result) => {
                return this.getbookedplanById(id);
            });
        });
    },

    removePlan(id){
        return booked_plan().then((bookedCollection) => {
            return bookedCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw "Could not delete travel plan with id of " +id
                }
            });
        });
    }
}
module.exports = exportedMethods;