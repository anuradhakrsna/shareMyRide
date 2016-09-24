var mongoCollections = require("../config/mongoCollections");
var member = mongoCollections.member;
var member_cars = mongoCollections.cars;
var travel_plan = mongoCollections.travelplan;
var book_plan = mongoCollections.bookedplan;
var uuid = require('node-uuid');
var bcrypt = require("bcrypt-nodejs");
var fs = require('fs');

var exportedMethods= {
    checkUser(emailID,available){
        return member().then((memberCollection)=>{
            return memberCollection.findOne({email:emailID}).then((userinfo)=>{
               // console.log(userinfo);
                if(userinfo && available == 'Y'){
                    return true;
                }
                else if(userinfo && available == 'N'){
                    throw "User already exists! Please try with a different Email ID !";
                }
                else if(!userinfo && available == 'Y')
                {
                    throw "Invalid credentials";
                }
                else if(!userinfo && available == 'N'){
                    return true;
                }
                
            })
        });
    },
    validateUser(userData){
        return member().then((memberCollection)=>{
            return memberCollection.findOne({email:userData.email}).then((userinfo)=>{
                return userinfo;      
           })
        });
    },
    getmemberById(id){
        return member().then((memberCollection) => {
            return memberCollection.findOne({ _id: id }).then((member) => {
                if (!member) throw "Member with given id not found";
                return member;
            });
        });
    },

    getmemberBySessionId(id){
        return member().then((memberCollection) => {
            return memberCollection.findOne({ sessionId: id }).then((member) => {
                if (!member) throw "Member with given session id not found";
                return member;
            });
        });
    },

    updateSession(memberObj){
        return member().then((memberCollection) => {
            return memberCollection.updateOne({ _id: memberObj._id }, memberObj).then(function() {
                    return memberObj;
                });
        });
    },

    getcarInfo(id){
        return member_cars().then((membercarCollection) => {
            return membercarCollection.findOne({ _id: id }).then((carinfo) => {
                if (!carinfo) throw "Car Info with given id not found";
                return carinfo;
            });
        });
    },
    
    getcarInfobyMember(id){
        return member_cars().then((membercarCollection) => {
            return membercarCollection.findOne({ member_id: id }).then((carinfo) => {
                if (!carinfo) throw "Car Info with given member id not found";
                return carinfo;
            });
        });
    },
    
    getcarInfobyMemberUpdate(id){
        return member_cars().then((membercarCollection) => {
            return membercarCollection.findOne({ member_id: id }).then((carinfo) => {
                var id = {_id:null}
                if (!carinfo) return id;
                return carinfo;
            });
        });
    },

    addMember(firstname,lastname,gender,email,password,phone_number,dl_number,door,apt,street,city,state,zip,image,carname,year,regist,color,checkCar){
        if (typeof firstname !== "string") throw "First Name field must be a string";
        if (!firstname) throw "First Name field cannot be empty";
        if (typeof lastname !== "string") throw "Last Name field must be a string";
        if (!lastname) throw "Last Name field cannot be empty";
        if (typeof email !== "string") throw "Email field must be a string";
        if (!email) throw "Email field cannot be empty";
        var regEx = '^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\.([a-zA-Z]{2,5})$';
        var emailMatched = email.match(regEx);
        if(!emailMatched) throw "Email should be a valid one";
        if (!password) throw "Password field cannot be empty";
        regEx = '^([a-zA-Z0-9@*#]{8,15})$';
        var passMatched = password[0].match(regEx);
        if(!passMatched) throw "Match all alphanumeric character and predefined wild characters. Password must consists of at least 8 characters and not more than 15 characters."
        if(password[0] !== password[1]) throw "Password and confirm password should be same"
        var hash = bcrypt.hashSync(password[0]);
        var phoneValidation=/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/gm;
        var placeRegex = /^[a-zA-Z ]*$/;
        var today = new Date();
	    var currYr = today.getFullYear();
        if (!phone_number) throw "Phone number field cannot be empty";
        if(!phone_number.match(phoneValidation)) throw "Phone number should be a valid one";
        if(!dl_number) throw "Driving License Number field cannot be empty";
        if(!door) throw "Door no field cannot be empty";
        if(!street) throw "Street field cannot be empty";
        if(!city) throw "City field cannot be empty";
        if(!city.match(placeRegex)) throw "City should be a valid one";
        if(!state) throw "state field cannot be empty";
        if(!state.match(placeRegex)) throw "Street should be a valid one";
        if(!zip) throw "Zip field cannot be empty";

        if(checkCar === 'Y')
        {
            if(!carname) throw "Car Name field cannot be empty";
            if(!year) throw "Make year field cannot be empty";
            if(year.length<4|| year>currYr || year.length>4 ||isNaN(year) ) throw "Make year should be a valid one";
            if(!regist) throw "Registration field cannot be empty";
            if(!color) throw "Color field cannot be empty";
        }

        return member().then((memberCollection)=>{
            var providerobj = {
                _id: uuid.v4(),
                sessionId:uuid.v4(),
                first_name:firstname,
                last_name:lastname,
                gender:gender,
                email:email,
                hashedPassword:hash,
                phone_number:phone_number,
                dl_number:dl_number,
                door_no:door,
                apt:apt,
                street_name:street,
                city:city,
                state:state,
                zip:zip,
                image_path:image
            };
            if(checkCar === 'Y')
                providerobj.ride_provider = "Y";
            else
                providerobj.ride_provider = "N";

            return memberCollection.insertOne(providerobj).then((newInsertInformation) => {
            return newInsertInformation.insertedId;
                    }).then((newId) => {
                        if(checkCar === 'Y')
                        return this.addCarInfo(newId,carname,year,regist,color);
                        else
                        return this.getmemberById(newId);

            });
        });
    },
    addCarInfo(newId,carname,year,regist,color){
        return member_cars().then((memberCarsCollection)=>{
                var carObj={
                            _id:uuid.v4(),
                            member_id:newId,
                            name:carname,
                            make_year:year,
                            registration_number:regist,
                            color:color
                        }
            return memberCarsCollection.insertOne(carObj).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId)=>{
                return this.getcarInfo(newId).then((carInfo)=>{
                    return  Promise.all([this.getmemberById(carInfo.member_id),carInfo]).then((values)=>{
                         return values;
                     })

                })
            })
        });
    },

    updateMember(id,firstname,lastname,gender,email,password,phone_number,dl_number,door,apt,street,city,state,zip,image,carname,year,regist,color,checkCar,previousImage){
       
        var phoneValidation=/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/gm;
        var placeRegex = /^[a-zA-Z ]*$/;
        var today = new Date();
	    var currYr = today.getFullYear();
        if (!phone_number) throw "Phone number field cannot be empty";
        if(!phone_number.match(phoneValidation)) throw "Phone number should be a valid one";
        if(!dl_number) throw "Driving License Number field cannot be empty";
        if(!door) throw "Door no field cannot be empty";
        if(!street) throw "Street field cannot be empty";
        if(!city) throw "City field cannot be empty";
        if(!city.match(placeRegex)) throw "City should be a valid one";
        if(!state) throw "state field cannot be empty";
        if(!state.match(placeRegex)) throw "Street should be a valid one";
        if(!zip) throw "Zip field cannot be empty";

        if(checkCar === 'Y')
        {
            if(!carname) throw "Car Name field cannot be empty";
            if(!year) throw "Make year field cannot be empty";
            if(year.length<4|| year>currYr || year.length>4 ||isNaN(year) ) throw "Make year should be a valid one";
            if(!regist) throw "Registration field cannot be empty";
            if(!color) throw "Color field cannot be empty";
        }

        return member().then((memberCollection)=>{
            var updatedMemberData = {};

            if (phone_number) {
                updatedMemberData.phone_number = phone_number;
            }

            if (dl_number) {
                updatedMemberData.dl_number = dl_number;
            }

            if (door) {
                updatedMemberData.door_no = door;
            }

            if (apt) {
                updatedMemberData.apt = apt;
            }
            if (street) {
                updatedMemberData.street_name = street;
            }

            if (city) {
                updatedMemberData.city = city;
            }
            if (state) {
                updatedMemberData.state = state;
            }

            if (zip) {
                updatedMemberData.zip = zip;
            }
            if(image)
            {
                updatedMemberData.image_path = image;
            }

            if(checkCar === 'Y')
                updatedMemberData.ride_provider = "Y";
            else
                updatedMemberData.ride_provider = "N";

            updatedMemberData.sessionId = uuid.v4();

            var updateCommand = {
                $set: updatedMemberData
            };

            return memberCollection.updateOne({ _id: id }, updateCommand).then((result) => {
                if(previousImage && image)
                {
                    if(!(previousImage.indexOf("default")>-1))
                    fs.unlink(previousImage);
                }
                if(checkCar === 'Y')
                    return this.updateCarInfo(id,carname,year,regist,color);
                else
                    return this.getmemberById(id);
                
            });
        });
    },

    updateCarInfo(newId,carname,year,regist,color){
        return this.getcarInfobyMemberUpdate(newId).then((result)=>{
            //console.log(result._id + "is the updateCarInfo");
            if(result._id)
            {
                return member_cars().then((memberCarsCollection)=>{
                    var updatedCarData = {};
                    if (carname) {
                        updatedCarData.name = carname;
                    }
                    if (year) {
                        updatedCarData.make_year = year;
                    }
                    if (regist) {
                        updatedCarData.registration_number = regist;
                    }
                    if (color) {
                       updatedCarData.color = color;
                    }
                    var updateCommand = {
                        $set: updatedCarData
                    }; 

                    return memberCarsCollection.updateOne({_id:result._id},updateCommand).then((newUpdatedInformation) => {
                            return this.getcarInfo(result._id).then((carInfo)=>{
                                return  Promise.all([this.getmemberById(result.member_id),carInfo]).then((values)=>{
                                    return values;
                                })
                        })
                    })
                });
            }
            else
            {
                return this.addCarInfo(newId,carname,year,regist,color);
            }

        })
        
    },

    removeMember(id) {
        return book_plan().then((bookedCollection)=>{
            return bookedCollection.removeOne({ member_id: id }).then((deletionBooked) => {
                return travel_plan().then((travelCollection)=>{
                    return travelCollection.removeOne({ member_id: id }).then((deletionPlanned) => {
                        return member_cars().then((membercarCollection)=>{
                            return membercarCollection.removeOne({ member_id: id }).then((deletioncarInfo) => {
                                return member().then((memberCollection) => {
                                    return memberCollection.removeOne({ _id: id }).then((deletionInfo) => {
                                        if (deletionInfo.deletedCount === 0) {
                                            throw "Could not delete member with id of " +id
                                        }                       
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });
    }

}
module.exports = exportedMethods;
