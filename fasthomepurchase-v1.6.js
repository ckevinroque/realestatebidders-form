//Validation for REB - Do not copy
 //validation

     $('input[name="phone_home"]').mask('(000) 000-0000');

      $.validator.addMethod("valid_property_type", function(value, element) {
          return this.optional(element) || value !== "Mobile Home";
      }, "Sorry, we do not accept mobile homes at this time.");   
  
      $.validator.addMethod("valid_property_listed", function(value, element) {
          return this.optional(element) || value !== "Yes";
      }, "Sorry, we do not accept homes that are listed at this time.");
  
      $.validator.addMethod("incomplete_address", function(value, element) {
        var zipCode = $('input[name="zip_code"]').val();
        return this.optional(element) || zipCode !== "";
      }, "Please enter specific valid address.");
  
      var validateEmailDebounced = _.debounce(function(value) {
        $.ajax({
          url: 'https://api.email-validator.net/api/verify',
          type: 'POST',
          cache: false,
          crossDomain: true,
          data: { EmailAddress: value, APIKey: 'ev-6dc428de6b65a2129a988ea21a983459' },
          dataType: 'json',
          async: false,
          success: function(json) {
            if (typeof(json.status) != "undefined") {
              var resultcode = json.status;
              if (resultcode == 200 || resultcode == 207 || resultcode == 215) {
                $('#email-validation-result').val('true');
              } else {
                $('#email-validation-result').val('false');
              }
            }
          }
        });
      }, 500);

      $.validator.addMethod("emailValidation", function(value, element) {
        var isValid = $('#email-validation-result').val() == 'true';

        validateEmailDebounced(value);

        return isValid;
      }, "Invalid email address");

      // Define a custom validation method for email validation
//       $.validator.addMethod("emailValidation", function(value, element) {
//           var isValid = false;
         
//           // Call the email validation API using AJAX
//           $.ajax({
//               url: 'https://api.email-validator.net/api/verify',
//               type: 'POST',
//               cache: false,
//               crossDomain: true,
//               data: { EmailAddress: value, APIKey: 'ev-6dc428de6b65a2129a988ea21a983459' },
//               dataType: 'json',
//               async: false, // set async to false to wait for response
//               success: function (json) {
//                   // check API result
//                   if (typeof(json.status) != "undefined") {
//                       var resultcode = json.status;
//                       // resultcode 200, 207, 215 - valid
//                       if (resultcode == 200 || resultcode == 207 || resultcode == 215) {
//                           isValid = true;
//                       }
//                   }
//               }
//           });
         
//           return isValid;
//       }, "Invalid email address");

       var validatePhoneDebounced = _.debounce(function(value) {
       // Call the phone number validation API using AJAX
          $.ajax({
              url: 'https://api.phone-validator.net/api/v2/verify',
              type: 'POST',
              data: { PhoneNumber: value, CountryCode: 'us', Locale: 'en-US', APIKey: 'pv-ba9cb9c6e2ea30a44bcbb2547f89daeb'},
              dataType: 'json',
              async: false, // set async to false to wait for response
              success: function (json) {
                  // check API result
                  if (typeof(json.status) != "undefined") {
                      statuscode = json.status;
                      switch (statuscode) {
                          case "VALID_CONFIRMED":
                          case "VALID_UNCONFIRMED":
                              isValid = true;
                              break;
                          case "INVALID":
                              isValid = false;
                              break;
                          default:
                              isValid = false;
                      }
                  }

              }
          });
      }, 500);
  

      $.validator.addMethod("phoneValidation", function(value, element) {
          var isValid = false;
          validatePhoneDebounced(value);
          // return the value of isValid here, since the AJAX call is async and we don't know the result yet
          return isValid;
      }, "Invalid phone number");

      // Define a custom validation method for phone number validation
//       $.validator.addMethod("phoneValidation", function(value, element) {
//           var isValid = false;
          
//           // Call the phone number validation API using AJAX
//           $.ajax({
//               url: 'https://api.phone-validator.net/api/v2/verify',
//               type: 'POST',
//               data: { PhoneNumber: value, CountryCode: 'us', Locale: 'en-US', APIKey: 'pv-ba9cb9c6e2ea30a44bcbb2547f89daeb'},
//               dataType: 'json',
//               async: false, // set async to false to wait for response
//               success: function (json) {
//                   // check API result
//                   if (typeof(json.status) != "undefined") {
//                       statuscode = json.status;
//                       switch (statuscode) {
//                           case "VALID_CONFIRMED":
//                           case "VALID_UNCONFIRMED":
//                               isValid = true;
//                               break;
//                           case "INVALID":
//                               isValid = false;
//                               break;
//                           default:
//                               isValid = false;
//                       }
//                   }

//               }
//           });

//           return isValid;
//       }, "Invalid phone number");


 


     $.validator.addMethod("require_from_group", function(value, element, options) {
       var groupSize = $(options[1]).find(":checkbox:checked").length;
       return groupSize > 0 && groupSize >= options[0];
     }, "Please select at least {0} options.");


    let autocomplete;
    let address1Field;
    let postalField;
    function initAutocomplete() {
      address1Field = document.querySelector("#address");
      postalField = document.querySelector("#zip_code");
      autocomplete = new google.maps.places.Autocomplete(address1Field);
      // address1Field.focus();
      autocomplete.setComponentRestrictions({
        country: ["us"],
      });
      autocomplete.setTypes(['address']);
      //autocomplete.setTypes( [] );
      autocomplete.addListener("place_changed", fillInAddress);
    }
    function fillInAddress() {
      const place = autocomplete.getPlace();
      let address1 = "";
      let postcode = "";
      for (const component of place.address_components) {
        const componentType = component.types[0];
        switch (componentType) {
          case "street_number": {
            address1 = `${component.long_name} ${address1}`;
            break;
          }
          case "route": {
            address1 += component.short_name;
            break;
          }
          case "postal_code": {
            postcode = `${component.short_name}${postcode}`;
            break;
          }
          case "postal_code_suffix": {
            postcode = `${postcode}`;
            break;
          }
          case "postal_code_prefix": {
            postcode = `${component.short_name}`;
            break;
          }
          case "locality":
            document.querySelector("#city").value = component.long_name;
            break;
          case "administrative_area_level_1": {
            document.querySelector("#state").value = component.short_name;
            break;
          }
        }
      }
      address1Field.value = address1;
      postalField.value = postcode;
  
    }
    //initAutocomplete();
    
    function get_request_id(){
      const urlParams = new URLSearchParams(window.location.search);
      const requestId = urlParams.get('request_id');
      if (requestId) {
        document.getElementById('lp_request_id').value = requestId;
      }
    }
    
    
    $(document).on('input change onblur', 'input[name="address"]', function(){
      setTimeout(function() { 
        $("#lp_form").valid();
      }, 800);
    });

 //next previous actions
    $(document).on('click', '*[data-next-step]', function(){
        //get the id of the clicked element
        var next_step = $(this).attr('data-next-step');
        var data_name = $(this).attr('data-name');
        console.log(next_step);
         console.log(data_name);
        if(data_name == "email_address"){
         validating_start();
        	validate_email(next_step);
        }else if(data_name == "phone_home"){
         validating_start();
        	validate_phone(next_step);
        }else{
        		//validate all inputs
        	if($("#lp_form").valid()){
            $(".steps:visible").hide();
            $("[data-step="+next_step+"]").show('slide', { direction: 'right' }, 300, function(){
              progress_bar('add');
           });
        	}
        }
    });
      
      
    //back button
    $(document).on('click', '*[data-previous-step]', function(){
        //get the id of the clicked element
        var previous_step = $(this).attr('data-previous-step');
        $(".steps:visible").hide();
        $("[data-step="+previous_step+"]").show('slide', { direction: 'left' }, 300, function(){
          progress_bar('subtract');
        });
    })
    
    //submit form
    $(document).on('click', '#submit', (function(event){
      event.preventDefault();
       if($("#lp_form").valid()){
        $(this).text("Submitting... Please wait...");
        $(this).prop('disabled', true);
        $(this).css('background-color', 'gray');
        $('input[name="phone_home"]').mask('0000000000');
        gtag_report_conversion();
         
         var formData = $('#lp_form').serializeArray();
         var reason_to_sell_options = [];
         
         // Loop through the array and extract checkbox values
        for (var i = 0; i < formData.length; i++) {
          if (formData[i].name == "reason_to_sell[]") {
            reason_to_sell_options.push(formData[i].value);
          }
        }
         
         // Join checkbox values into a comma-separated string
        var optionsString = reason_to_sell_options.join(",");

        // Add comma-separated string to form data
        formData.push({ name: "reason_to_sell", value: optionsString });
         
        $.ajax({
          url: 'https://realestatebidders.leadspediatrack.com/post.do',
          type: 'POST',
          data: formData,
          success: function () {
            document.location.href = '/thank-you';
          },
          error: function () {
            document.location.href = '/thank-you';
          },
        });
      }
    }));


      $(document).on('click', 'form .w-checkbox', function(event){
        event.preventDefault();
        var checkboxInput = $(this).find('.w-checkbox-input');
        console.log(checkboxInput);
        if (checkboxInput.hasClass('w--redirected-checked')) {
          checkboxInput.removeClass('w--redirected-checked');
          $('[name="tcpa_consent_text"]').prop('checked', false);
        } else {
          checkboxInput.addClass('w--redirected-checked');
          $('[name="tcpa_consent_text"]').prop('checked', true);
        }
      });

      $(document).on('change', '.w-checkbox-input', function(){
        $(this).validate();
      });


      function progress_bar(status){
        var step = 12.5;
        var current_width = parseFloat($("#progress-status")[0].style.width);
        var step_number = parseFloat($("#current-step-label").text());
        var total_width = 0;

        if(status == 'add'){
            total_width = (current_width + step);
            step_number = step_number + 1; 
        }else{
            total_width = (current_width - step);
            step_number = step_number - 1; 
        }
        $("#progress-status").css("width", total_width + '%');
        $("#progress-percent").text((total_width.toFixed()) + "%");
        $("#current-step-label").text(step_number);
    }
      

      
      $('input[name="phone_home"]').mask('(000) 000-0000');

     
      
      function validating_start(){
         
         var button = $('.next-btn-wrapper .next-step');
         console.log(button);
           button.prop('disabled', true); // Disable the button
           button.text('Validating...'); // Change the text
      }
      
      function validating_end(){
         var button = $('.next-btn-wrapper .next-step');
          button.prop('disabled', false); // Enable the button
          button.text('Next'); // Restore the text
      }
      
      function validate_email(next_step){
        $('label.error:visible').hide();
         
        
         if($("#lp_form").valid()){
           setTimeout(function() { 
              validating_end();
              $(".steps:visible").hide();
              $("[data-step="+next_step+"]").show('slide', { direction: 'right' }, 300, function(){
                progress_bar('add');
               });
           }, 1000);
           
         }else{
           setTimeout(function() { 
             validating_end();
           }, 800);
         }
         
      }
      
      function validate_phone(next_step){
       $('label.error:visible').hide();
       
         if($("#lp_form").valid()){
          setTimeout(function() { 
            validating_end();
            $(".steps:visible").hide();
            $("[data-step="+next_step+"]").show('slide', { direction: 'right' }, 300, function(){
                progress_bar('add');
            });
           }, 1000);
         }else{
          setTimeout(function() { 
               validating_end();
           }, 800);
         }
      }
   
