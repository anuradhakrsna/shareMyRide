(function ($,location,localStorage) {


var lUsername=$("#l-email");
var lpassword=$("#l-password");
var lsubmit=$("#l-submit");
var lErrorContainer=$("#l-error-container");

var sFrom=$("#s-from");
var sTo=$("#s-to");
var sDate=$("#s-date");
var sSearch=$("#s-search");
var sErrorContainer=$("#s-error-container");
var sErrorText=$("#s-error-text");


sSearch.click(function(event){
	event.preventDefault();
	sErrorContainer.addClass("hidden");
	fromVal=sFrom.val();
	toVal=sTo.val();
	dateVal=sDate.val();

	var today = new Date();
	var d = today.getDate();
	var m = today.getMonth()+1; //January is 0!
	var y = today.getFullYear();

	var currDate= new Date(m+'/'+d+'/'+y);
	var givenDate=new Date(dateVal);
	var df=/^((0?[13578]|10|12)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[01]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1}))|(0?[2469]|11)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1})))$/gm;
	/*var dateFormat=/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g;*/
	try{
		if(fromVal.length==0){
			throw "Please enter the 'From' location";
		}else if(toVal.length==0){
			throw "Please enter the 'To' location";
		}else if(dateVal.length==0 || dateVal.length<8){
			throw "Please enter a valid date for the ride";
		}else if(givenDate<currDate){
			throw "Please enter a valid date";
		}else if(!dateVal.match(df)){
			throw "Please enter a valid date in the format-mm/dd/yyyy";
		}else{

			var requestConfig = {
                method: "POST",
                url: "/search/initial",
                contentType: 'application/json',
                data: JSON.stringify({
                    
                    from: fromVal,
                    to:toVal,
                    date:dateVal

                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
            	console.log("data to search successful");
            	window.location="http://localhost:3000/search/initial";
                
            });
		}
		
	}catch(e){
		var message = typeof e === "string" ? e : e.message;
        sErrorText.text(e);
        sErrorContainer.removeClass("hidden");
        /*event.preventDefault();*/ 
	}



});


function emailCheck(user,pass){	
	var email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

	if( !email_regex.test(user)){
		throw "Please provide a valid username";
	}else if(user==undefined){
		throw "Please provide a valid username";
	}else if( pass.length=0 || pass=='' || pass==undefined){
		throw "Please provide a valid Password";
	}else {
		return true;
	}

}

lsubmit.click(function(event){
    event.preventDefault();

    lErrorContainer.addClass("hidden");
    var userNameVal=lUsername.val();
    var passwordVal=lpassword.val();
    var textInputVal=$("#txtInput").val();
    var textCaptchaVal=$("#txtCaptcha").val();

    var captchaCheck=checkform(textInputVal,textCaptchaVal);
    /*console.log("let us see the recaptcha returned");
    var val=grecaptcha.getResponse(captchaVal);
    console.log(val);*/
    if(captchaCheck){
        try
        {
            var result=emailCheck(userNameVal,passwordVal);
            if(result){
                var requestConfig = {
                    method: "POST",
                    url: "/signup/validateUser",
                    contentType: 'application/json',
                    data: JSON.stringify({
                        email: userNameVal,
                        password:passwordVal

                    })
                };

                $.ajax(requestConfig).then(function (responseMessage) {
                    if(responseMessage.error){
                        lErrorContainer.text(responseMessage.message);
                        lErrorContainer.removeClass("hidden");
                    }else if(responseMessage.success){
                        window.location="http://localhost:3000/user/profile";
                    }
                    
                });
            }
            

        }catch(e){

            var message = typeof e === "string" ? e : e.message;
            lErrorContainer.text(e);
            lErrorContainer.removeClass("hidden");
            event.preventDefault();   
        }  
    }
    $('#txtInput').val('');
    
});

function checkform(txtInput,txtCaptcha){
    var why = "";

    if(txtInput == ""){
        why += "- Security code should not be empty.\n";
    }
    if(txtInput != ""){
        if(ValidCaptcha(txtInput) == false){
            why += "- Security code did not match.\n";
        }
    }
    if(why != ""){
        /*alert(why);*/
        lErrorContainer.text(why);
        lErrorContainer.removeClass("hidden");
        return false;
    }else{
        return true;
    }
}


// Validate the Entered input aganist the generated security code function
function ValidCaptcha(){
    var str1 = removeSpaces($('#txtCaptcha').val());
    var str2 = removeSpaces($('#txtInput').val());
    if (str1 == str2){
        return true;
    }else{
        return false;
    }
}

// Remove the spaces from the entered and generated code
function removeSpaces(string){
    return string.split(' ').join('');
}



var newNameInput = $("#fromlocation");
    var newName = newNameInput.val();
    var newContent = $("#new-content");

    //For the search boxes.This function will be called for the autocomplete in the source and
// destination city text boxes in search page
// when a city's first letter is entered into the search destination city text box. Then this function will
// populate all the matching cities

    $("#fromlocation").keyup(function (e) {
        var requestConfig = {
            method: "POST",
            url: "http://localhost:3000/search/cityFinder",
            contentType: 'application/json',
            data: JSON.stringify({
                name: newName,

            })
        };

        $.ajax(requestConfig).then(function (responseMessage) {
            var availablecities= [];

            for( var i = 0; i < responseMessage.cities.length; i++ )
            {
                availablecities.push(responseMessage.cities[i]);

            }

            $( "#fromlocation" ).autocomplete({
                source: availablecities
            });

        });
    });

    var toLocation = $("#tolocation");
    var location = toLocation.val();

    //For the search boxes.This function will be called for the autocomplete in the source and
// destination city text boxes in search page
// when a city's first letter is entered into the search destination city text box. Then this function will
// populate all the matching cities
    $("#tolocation").keyup(function (e) {
        var requestConfig = {
            method: "POST",
            url: "http://localhost:3000/search/cityFinder",
            contentType: 'application/json',
            data: JSON.stringify({
                name: location,
                testField: 12,
                testBool: true
            })
        };

        $.ajax(requestConfig).then(function (responseMessage) {
            var availablecities= [];

            for( var i = 0; i < responseMessage.cities.length; i++ )
            {
                availablecities.push(responseMessage.cities[i]);

            }

            $( "#tolocation" ).autocomplete({
                source: availablecities
            });
        });
    });






    var availableTags = [
        "Scheme"
    ];
    $( "#fromlocation" ).autocomplete({
        source: availableTags
    });

    //This is the jquery datepicker in the search page
    $('#idTourDateDetails').datepicker({
        dateFormat: 'dd-mm-yy',
        minDate: '+1d',
        changeMonth: true,
        changeYear: true,
        altField: "#idTourDateDetailsHidden",
        altFormat: "yy-mm-dd"
    });


    
})(jQuery,window.location,window.localStorage);

//This will validate the fields in the search page

function validateSearch() {

    var From=$("#fromlocation");
    var To=$("#tolocation");
    var date=$("#idTourDateDetails");
   var time=$("#traveltime");

    fromVal=From.val();
    toVal=To.val();
    dateVal=date.val();
    timeVal = time.val();

    if(fromVal.length==0){
        document.getElementById('errfn').innerHTML="'From location' cannot be empty";
        return false;
    }else if(toVal.length==0){
        document.getElementById('errfn').innerHTML="'To location' cannot be empty";
        return false;
}
    else if(dateVal.length==0){
        document.getElementById('errfn').innerHTML="'Date' cannot be empty";
        return false;
    }
    else if(timeVal.length==0){
        document.getElementById('errfn').innerHTML="'Time' cannot be empty";
        return false;

    }
    else if (fromVal==toVal)
    {
        document.getElementById('errfn').innerHTML="'From' and 'To' location cannot be same";
        return false;
    }

    else {

        return true;
    }


}