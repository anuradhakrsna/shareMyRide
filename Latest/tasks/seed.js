var dbConnection = require("../config/mongoConnection");
var data = require("../data/");
var signin = data.signin;
var provider = data.provider;
var seeker=data.seeker;

dbConnection().then(db => {
    return db.dropDatabase().then(() => {
        return dbConnection;
    }).then((db) => {
        return signin.addMember("Philip","Baressi","Male","Philip.Baressi@stevens.edu",["test@1234","test@1234"],"5514047896","ASXDE2345BVCX","34","A","Arcadia Road","Brooklyn","NY","07601","public/userImages/default","Audi","2015","AZB-3RT","Black","Y").then((philipObj)=>{
            var createObj = {
                id:philipObj[0]._id,
                source_street:"castle point",
                source_city:"Hoboken",
                source_state:"NJ",
                destination_street:"Polifly road",
                destination_city:"Brooklyn",
                destination_state:"NY",
                planDate:"2016-08-23",
                planTime:"15:00",
                estimated_travel_time:"2",
                seats_offered:"5",
                price:"20",
                description:"Business Trip"
            };
            return provider.createPlan(createObj).then((philtp1)=>{
                var secondObj = {
                    id:philtp1.member_id,
                    source_street:"castle point",
                    source_city:"Hoboken",
                    source_state:"NJ",
                    destination_street:"Polifly road",
                    destination_city:"Brooklyn",
                    destination_state:"NY",
                    planDate:"2016-08-23",
                    planTime:"10:00",
                    estimated_travel_time:"2",
                    seats_offered:"4",
                    price:"25",
                    description:"Casual Trip"
               };
                return provider.createPlan(secondObj).then((philtp2)=>{
                    return signin.addMember("Muralidharan","Babu","Male","mbabu@stevens.edu",["test@1234","test@1234"],"5514046987","ASXDE1236BVCX","34","B","Arcadia Road","Hackensack","NJ","07607","public/userImages/default","Honda","2016","ADB-4RT","White","Y").then((muraliObj)=>{
                        var thirdObj = {
                            id:muraliObj[0]._id,
                            source_street:"castle point",
                            source_city:"Hoboken",
                            source_state:"NJ",
                            destination_street:"Polifly road",
                            destination_city:"Brooklyn",
                            destination_state:"NY",
                            planDate:"2016-08-23",
                            planTime:"10:00",
                            estimated_travel_time:"1",
                            seats_offered:"3",
                            price:"15",
                            description:"Business Trip"
                        };
                        return provider.createPlan(thirdObj).then((muralitp1)=>{
                            return signin.addMember("Sunder","Palani","Male","svelan@stevens.edu",["test@1234","test@1234"],"5514044569","ASXDE7896BVCX","34","D","Arcadia Road","Jersey City","NJ","07603","public/userImages/default","","","","","N").then((sunderObj)=>{
                                return signin.addMember("Anuradha","Ramprasad","Female","aprasad@stevens.edu",["test@1234","test@1234"],"5517894569","ASXDE345BVCX","34","E","Arcadia Road","Hoboken","NJ","07608","public/userImages/default","","","","","N").then((anuObj)=>{
                                });
                            });    
                        });
                    });
                });
            })
        })
    }).then(() => {
        console.log("Done seeding database");
        db.close();
    });
}, (error) => {
    console.error(error);
});