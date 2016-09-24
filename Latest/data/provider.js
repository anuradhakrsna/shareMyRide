var mongoCollections = require("../config/mongoCollections");
var member = mongoCollections.member;
var member_cars = mongoCollections.cars;
var travel_plan = mongoCollections.travelplan;
var booked_plan = mongoCollections.bookedplan;
var uuid = require('node-uuid');
var signin = require("./signin.js")

var exportedMethods= {
    gettravelplanById(id){
        return travel_plan().then((travelCollection) => {
            return travelCollection.findOne({ _id: id }).then((travelplan) => {
                if (!travelplan) throw "Travel Plan with given id not found";
                return travelplan;
            });
        });
    },

    getcountofTravelPlan(id){
        return travel_plan().then((travelCollection) => {
            var dateValue = new Date();
            return travelCollection.find({member_id: id,travel_start_time:{$gte: dateValue}}).count();
        });
    },

    getPlanListById(id){
        return travel_plan().then((travelCollection) => {
            return travelCollection.find({member_id: id}).toArray();
        });
    },

    latestTravelPlan(id){
        return travel_plan().then((travelCollection) => {
            return travel_plan().then((travelCollection) => {
                var dateValue = new Date();
                return travelCollection.find({member_id: id,travel_start_time:{$gte: dateValue}}).sort( { travel_start_time: 1 } ).toArray().then((travelList)=>{
                    if(travelList.length > 0)
                    {
                        return travelList[0];
                    }
                    else
                    {
                        return false;
                    }
                });
            });
        });
    },
    getfuturePlanListById(id){
        return travel_plan().then((travelCollection) => {
            return travel_plan().then((travelCollection) => {
            Date.prototype.addHours= function(h){
                this.setHours(this.getHours()+h);
                return this;
            };
            var dateValue = new Date();
            return travelCollection.find({member_id: id,travel_start_time:{$gte: dateValue}}).sort( { travel_start_time: 1 } ).toArray();
        });
        });
    },
    getseekerListByTravelPlan(travelplanID){
         return booked_plan().then((bookedCollection) => {
            return bookedCollection.find({travel_plan_id: travelplanID}).toArray().then((bookedplanList)=>{
               //console.log(travelplanID);
               bookedplanList.forEach((obj)=>{console.log(obj.member_id)});

                var memberPromisesList = bookedplanList.map(obj => signin.getmemberById(obj.member_id));

               return Promise.all(memberPromisesList).then((arrayOfPeople) => {
                    var totalBooked= 0;
                    bookedplanList.forEach((obj)=>{

                        function filterByID(object) {
                            if ('_id' in object && (object._id.indexOf(obj.member_id)>=0)) {
                                //console.log(object);
                                obj.userInfo = object;
                                return true;
                            } else {
                                if(!obj.userInfo)
                                obj.userInfo={};
                                return false;
                            }
                        }
                        var resultObject = arrayOfPeople.filter(filterByID);

                        totalBooked+=parseInt(obj.seats_needed) ;

                       });
                       bookedplanList.totalBooked = totalBooked;
                       //console.log(bookedplanList);
                       return bookedplanList;
                    }).then((finalList)=>{
                        return finalList;
                    });
                });
            });
    },

    createPlan(createData){

        return signin.getcarInfobyMember(createData.id).then((carInfo)=>{
            if(carInfo._id)
            createData.carId = carInfo._id;
            else
            throw "Car information is not available to provide the ride";


        var ett = parseInt(createData.estimated_travel_time);
        var nos = parseInt(createData.seats_offered);
        var priceInt = parseInt(createData.price);
        if (typeof createData.source_street !== "string") throw "Source street field must be a string";
        if (!createData.source_street) throw "Source street field cannot be empty";
        if (typeof createData.source_city !== "string") throw "Source city field must be a string";
        if (!createData.source_city) throw "Source city field cannot be empty";
        if (typeof createData.source_state !== "string") throw "Source state field must be a string";
        if (!createData.source_state) throw "Source state field cannot be empty";
        if (typeof createData.destination_street !== "string") throw "Destination street field must be a string";
        if (!createData.destination_street) throw "Destination street field cannot be empty";
        if (typeof createData.destination_city !== "string") throw "Destination city field must be a string";
        if (!createData.destination_city) throw "Destination city field cannot be empty";
        if (typeof createData.destination_state !== "string") throw "Destination state field must be a string";
        if (!createData.destination_state) throw "Destination state field cannot be empty";
        if (typeof createData.planDate !== "string") throw "Date of travel field must be a string";
        if (!createData.planDate) throw "Date of travel field cannot be empty";
        if (typeof createData.planTime !== "string") throw "Time of travel field must be a string";
        if (!createData.planTime) throw "Time of travel field cannot be empty";
        if (!createData.estimated_travel_time) throw "Estimated Travel Time field cannot be empty";
        if (typeof ett !== "number") throw "Estimated Travel Time field must be a number";
        if (!createData.seats_offered) throw "No.of seats field cannot be empty";
        if (typeof nos !== "number") throw "No.of seats field must be a number";
        if (!createData.price) throw "Price per co-passenger field cannot be empty";
        if (typeof priceInt !== "number") throw "Price per co-passenger field must be a number";
        if (!createData.description) throw "description field cannot be empty";

        //console.log(createData.planDate);
        //console.log(createData.planTime);
        
        Date.prototype.addHours= function(h){
        this.setHours(this.getHours()+h);
            return this;
        };

        var startDate = createData.planDate+"T"+createData.planTime+":00.000Z";
        //console.log(startDate + " is the start date");
        createData.travel_start_time = new Date(startDate).addHours(4);// Adding 4 hours since it is taking the input in GMT.
        var lessthanDate = new Date(startDate).addHours(5);// Will check if the user has created any plan already with the given time + 1 hour
        var greatthanDate = new Date(startDate).addHours(3);//Will check if the user has created any plan already with the given time + 1 hour
        
        
        //console.log(createData.travel_start_time + " is the createData.travel_start_time"); 
        //console.log(lessthanDate + " is the lessthanDate condition");
        //console.log(greatthanDate + " is the greatthanDate condition");
            return travel_plan().then((travelCollection)=>{
            var createObj = {
                _id: uuid.v4(),
                member_id:createData.id,
                car_id:createData.carId,
                source_street:createData.source_street,
                source_city:createData.source_city,
                source_state:createData.source_state,
                destination_street:createData.destination_street,
                destination_city:createData.destination_city,
                destination_state:createData.destination_state,
                travel_start_time:createData.travel_start_time,
                estimated_travel_time:createData.estimated_travel_time,
                seats_offered:createData.seats_offered,
                price:createData.price,
                description:createData.description
            };

           return travelCollection.find({member_id: createData.id,travel_start_time:{$gte: greatthanDate,$lte: lessthanDate}}).toArray().then((travelObj)=>{
               //console.log(travelObj.length+ " is the travel object length");
               if(travelObj.length === 0)
               {
                    return travelCollection.insertOne(createObj).then((newInsertInformation) => {
                        return newInsertInformation.insertedId;
                        }).then((newId) => {
                            //console.log("New id"+ newId);
                            return this.gettravelplanById(newId);
                        });
               }
               else
               {
                   throw "A travel plan is already created within the selected time plus or minus one hour";
               }

           });
            
        });
        })
    },

    updatePlan(id,updatedPlan){
        return travel_plan().then((travelCollection) => {
            var updatedtravelData = {};
             //console.log("inisde data module");
             //console.log(updatedPlan);


            if (updatedPlan.seats_offered) {
                updatedtravelData.seats_offered = updatedPlan.seats_offered;
            }
            if (updatedPlan.price) {
                updatedtravelData.price = updatedPlan.price;
            }

            var updateCommand = {
                $set: updatedtravelData
            };
                //console.log("updatedtravelData");
                //console.log(updatedtravelData);
            return travelCollection.updateOne({ _id: id }, updateCommand).then((result) => {
                return this.gettravelplanById(id);
            });
        });
    },

    removePlan(id){
         return booked_plan().then((bookedCollection) => {
            return bookedCollection.removeOne({ travel_plan_id: id }).then((bookedDeletioninfo) => {
                return travel_plan().then((travelCollection) => {
                    return travelCollection.removeOne({ _id: id }).then((deletionInfo) => {
                    });
                });
            });
        });
    }
}
module.exports = exportedMethods;