function validateForm() 
{
	//alert("Testvalidate");
	//var test = document.getElementById("firstname").value;
	//alert(test);
	var returnresult = false;
	jQuery(function($) {
		var PerrorContainer=$("#sp-error-container");
		var PerrorContainerDown=$("#sp-error-container-down");
		var PerrorText=$("#sp-error-text");
		var PerrorTextDown=$("#sp-error-text-down");
		var formSignIn=$("#p-signin");

		PerrorContainer.addClass("hidden");
		PerrorContainerDown.addClass("hidden");
		formSignIn.addClass("hidden");

		var checkCar = true;
		var checkUpdate = true;
		if($("#checkCar").val() === 'N')
			checkCar = false;
		if($('#createorUpdateBack').val() === 'N')
			checkUpdate = false;
       	var fN=$("#firstname").val();
		var lN=$("#lastname").val();
		var genderVal=$('input[name=gender]:checked').val();
		var email=$("#email").val();
		var password=$("#password").val();
		var Cpassword=$("#c-password").val();
		var pn=$("#phone_number").val();
		var dl=$("#dl_number").val();
		var profilePic=$("#profilePicId").val();
		var doorNo=$("#door_no").val();
		var aptNo=$("#apt").val();
		var street=$("#street").val();
		var city=$("#city").val();
		var state=$("#state").val();
		var zip=$("#zip").val();
		var carName;
		var makeYear;
		var regYear;
		var color;
		if(checkCar){
			carName=$("#carname").val();
			makeYear=$("#make_year").val();
			regYear=$("#regist_number").val();
			color=$("#color").val();
		}

		//alert($("#checkCar").val());
		
		try{
		var result=validation(fN,lN,genderVal,email,password,Cpassword,pn,dl,doorNo,street,city,state,zip,carName,makeYear,regYear,color,checkCar,checkUpdate);
		//alert("result is: "+result);
		returnresult = true;
		}
		catch(e){
			//alert("Inside catch");
		var message = typeof e === "string" ? e : e.message;

        PerrorText.text(e);
        PerrorTextDown.text(e);
        PerrorContainer.removeClass("hidden");
        PerrorContainerDown.removeClass("hidden");
		returnresult = false;
		}

    });
	return returnresult;
}

function validation(fnVal,lnVal,genderVal,email,pass,cpass,phoneNo,dlval,doorVal,streetval,cityval,stateval,zipval,carName,makeYearVal,regVal,colorval,checkCar,checkUpdate)
{		
	var alpabetsOnly=/^[A-z]+$/;
	var email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
	var splCharPatter = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
	var placeRegex = /^[a-zA-Z ]*$/;

	var phoneValidation=/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/gm;
	var today = new Date();
	var d = today.getDate();
	var m = today.getMonth()+1; //January is 0!
	var currYr = today.getFullYear();

    //alert(checkCar + 'checkCar');
	//alert(checkUpdate + 'checkUpdate');

	if(checkUpdate)
	{
		if(fnVal.length==0 || !fnVal.match(alpabetsOnly) ){
			throw "Please enter a valid First Name !";
		}else if(lnVal.length==0 || !lnVal.match(alpabetsOnly) ){
			throw "Please enter a valid Last Name !";
		}else if(genderVal==null || genderVal==undefined){
			throw "Please choose the gender!";
		}else if( !email_regex.test(email)){
			throw "Please provide a valid Email address !";
		}else if(pass==undefined || pass.length<8 || pass.length>15){
			throw "Please provide a Password containing atleast 8 characters and not more than 15 characters!";
		}else if(cpass==undefined || cpass!==pass){	
			throw "Please provide the same valid password for password confirmation!";
		} 
	}
	if(phoneNo==undefined || !phoneNo.match(phoneValidation) || phoneNo.length<10){
		throw "Please provide a valid phone number !";
	}else if(dlval==undefined || dlval.length==0){
		throw "Please provide a valid driving licence number!";
	}else if(doorVal==undefined || doorVal.length==0 ){
		throw "Please provide a valid door No !";
	}else if(streetval==undefined || streetval.length==0){
		throw "Please provide a valid Street name !";
	}else if(cityval==undefined || !cityval.match(placeRegex)){
		throw "Please provide a vild City name!";
	}else if(stateval==undefined || !stateval.match(placeRegex)){
		throw "Please provide a valid state name!";
	}else if(zipval==undefined || zipval.length==0 || isNaN(zipval) || zipval.length<5){
		throw "Please provide a valid zip code!";
	}
    else if(checkCar){
        if(carName==undefined || carName.length==0){
		    throw "Please provide a valid Car name!";
	    }else if(makeYearVal.length==0 || makeYearVal.length<4|| makeYearVal>currYr || makeYearVal.length>4 ||isNaN(makeYearVal) ){
		    throw "Please provide a valid 'make year' for your car !";
	    }else if(regVal==undefined || regVal.length==0){
		    throw "Please provide a valid registration number !";
	    }else if(colorval.length==0){
		    throw "Please provide a valid car color!";
	    }
        else{
            return true;
        }
    }else{
		return true;
	}
}

(function ($,location,localStorage) {

var checkCar = true;
    $("#radioSeeker").change(function() {
        checkCar = false;
		$("#checkCar").val('N');
        $("#carInfo").hide();
       // $(this).checked(true);
    });

    $("#radioProvider").change(function() {
        checkCar = true;
		$("#checkCar").val('Y');
        $("#carInfo").show();
    });

	if($("#checkCarBack").val() === 'N')
	{
		//alert($("#checkCarBack").val());
		$("#radioProvider").prop("checked",false);
		$("#radioSeeker").prop("checked",true);
		checkCar = false;
		$("#checkCar").val('N');
        $("#carInfo").hide();
	}

	if($("#createorUpdateBack").val() === 'N')
	{
		//alert("Update module");
		$("#wishText").text("Do you wish to update as");
		$("#firstname").prop("readonly",true);
		$("#lastname").prop("readonly",true);
		$("#email").prop("readonly",true);
		$("#password").prop("readonly",true);
		$("#c-password").prop("readonly",true);

	}

//when the update user info loads.

var imgData=null;

 function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                $('#blah').attr('src', e.target.result);
                
            }

            imgData=$('#blah').attr('src');
            reader.readAsDataURL(input.files[0]);

        }
    }
    
$("#profilePicId").change(function(){
    readURL(this);
});


    
})(jQuery,window.location,window.localStorage);