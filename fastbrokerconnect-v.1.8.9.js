//Validation for REB - Do not copy

   function form_validation(){
       console.log('validation initiate');
      $('input[name="phone_home"]').mask('(000) 000-0000');

      //validation
      $("#lp_form").validate({
        onfocusout: function(element) { $(element).valid(); },
        rules: {
          address:{
            required: true,
            incomplete_address: true
          },
          property_type: {
            required: true,
            valid_property_type: true
          },
          property_listed: {
            required: true,
            valid_property_listed: true
          },
          tcpa_consent_text:'required', city:'required', state:'required', 
          first_name:'required', last_name:'required', selling_timeframe:'required',
          interested:'required',
          phone_home: {
              required: true,
              phoneUS: true,
              phoneValidation: true,
             //onkeyup: false, // disable validation on input for this field only
             //onchange: false // disable validation on change for this field only
          },
          email_address: {
              required: true,
              email: true,
              emailValidation: true,
          },
          zip_code: {
              required: true,minlength: 5,maxlength: 5,zipcodeUS: true,number: true
          }
        },
        messages: {
            firstname: "Please enter your firstname",
            lastname: "Please enter your lastname",
            phone_home: "Please provide a valid phone number",
            email_address: "Please enter a valid email address",
            zip_code: "Please enter a valid zip code"
        },
        errorPlacement: function(error, element) {
            //error.insertAfter(element.parent());
            if ( element.is("select") ) {
                error.insertAfter( element.parents('.steps').find('.select-wrapper-2') );
            }else if ( element.is(":checkbox") ) {
                error.insertAfter( element.parents('.steps').find('label.w-checkbox') );
            } else {
                error.insertAfter(element);
            }
        },
         onfocusout: function(element) {
          $(element).valid();
        },
        // Trigger only on focusout
        onkeyup: function(element) {
          if ($(element).attr('name') === 'phone_home' || $(element).attr('name') === 'email_address') {
            var the_element = $(element);
             var delay = 3000; // Delay in milliseconds (3 seconds)
             clearTimeout(the_element.data('timeoutId')); // Clear the previous timeout, if any
             the_element.data('timeoutId', setTimeout(function() {
               the_element.valid();
             }, delay));
             return false;
          }
        },
      });
    
  
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
  
      // Define a custom validation method for email validation
      $.validator.addMethod("emailValidation", function(value, element) {
          var isValid = false;
          var button = $('.next-btn-wrapper .next-step:visible');
           button.prop('disabled', true); // Disable the button
           button.text('Validating...'); // Change the text
         
          // Call the email validation API using AJAX
          $.ajax({
              url: 'https://api.email-validator.net/api/verify',
              type: 'POST',
              cache: false,
              crossDomain: true,
              data: { EmailAddress: value, APIKey: 'ev-6dc428de6b65a2129a988ea21a983459' },
              dataType: 'json',
              async: false, // set async to false to wait for response
              success: function (json) {
                  // check API result
                  if (typeof(json.status) != "undefined") {
                      var resultcode = json.status;
                      // resultcode 200, 207, 215 - valid
                      if (resultcode == 200 || resultcode == 207 || resultcode == 215) {
                          isValid = true;
                      }
                  }
                  button.prop('disabled', false); // Enable the button
                  button.text('Next'); // Restore the text
              }
          });
         
          return isValid;
      }, "Invalid email address");

  
      // Define a custom validation method for phone number validation
      $.validator.addMethod("phoneValidation", function(value, element) {
          var isValid = false;
          var button = $('.next-btn-wrapper .next-step:visible');
           button.prop('disabled', true); // Disable the button
           button.text('Validating...'); // Change the text
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
                  button.prop('disabled', false); // Enable the button
                  button.text('Next'); // Restore the text
              }
          });

          return isValid;
      }, "Invalid phone number");
         
   }
