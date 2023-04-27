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

      $.validator.addMethod('sellingReasons', function(value, element) {
       console.log('sellingReasons called');
        return $('.selling-reason:checked').length > 0;
      }, 'Please select at least one selling reason.');

      //Define a custom validation method for email validation
      $.validator.addMethod("emailValidation", function(value, element) {
          var isValid = false;
         
          // Call the email validation API using AJAX
          $.ajax({
              url: 'https://api.email-validator.net/api/verify',
              type: 'POST',
              cache: false,
              crossDomain: true,
              data: { EmailAddress: value, APIKey: 'ev-6dc428de6b65a2129a988ea21a983459' },
              dataType: 'json',
              async: false, // set async to false to wait for response
              beforeSend: function() {
                 validating_start();
              },
              success: function (json) {
                  // check API result
                  if (typeof(json.status) != "undefined") {
                      var resultcode = json.status;
                      // resultcode 200, 207, 215 - valid
                      if (resultcode == 200 || resultcode == 207 || resultcode == 215) {
                          isValid = true;
                      }
                  }
              }
          });
         
          return isValid;
      }, "Invalid email address");

      // Define a custom validation method for phone number validation
      $.validator.addMethod("phoneValidation", function(value, element) {
          var isValid = false;
          
          // Call the phone number validation API using AJAX
          $.ajax({
              url: 'https://api.phone-validator.net/api/v2/verify',
              type: 'POST',
              data: { PhoneNumber: value, CountryCode: 'us', Locale: 'en-US', APIKey: 'pv-ba9cb9c6e2ea30a44bcbb2547f89daeb'},
              dataType: 'json',
              async: false, // set async to false to wait for response
              beforeSend: function() {
                 validating_start();
              },
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

          return isValid;
      }, "Invalid phone number");


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
        
        if(data_name == "email_address"){
        	validate_email(next_step);
        }else if(data_name == "phone_home"){
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
        //gtag_report_conversion();
         
         var params = {
          ZipCode: $('[name=zip_code]').val(),
          State: $('[name=state]').val(),
          creditscore: 'Good',
          loanbalance: '150000',
          propertyvalue: '250000',
          MediaChannel: '',
          MilitaryStatus: '',
          EmploymentStatus: '',
          firsttimebuyer: 'Yes',
          SourceID: '118',
          ExtClickID: $('[name=lp_campaign_id]').val(),
          FName: $('[name=first_name]').val(),
          LName: $('[name=last_name]').val(),
          Email: $('[name=email_address]').val(),
          Phone: $('[name=phone_home]').val(),
          Address : $('[name=address]').val(),
          City: $('[name=city]').val(),
          Rendermode: 1
        }

        var params_query = $.param(params);
        
        var formData = {
   
            'first_name': $('[name="first_name"]').val(),
            'last_name': $('[name="last_name"]').val(),
            'phone_home': $('[name="phone_home"]').val(),
            'email_address': $('[name="email_address"]').val(),
            
        };
        
        //console.log(formData);

        $.ajax({
            url: "https://hook.us1.make.com/oey6y63nmxr8loex5821ooln4rn8omuh",
            method: "POST",
            data: formData,
            success: function(response) {
              console.log(response);
                document.location.href = '/thank-you/?'+params_query;
            },
            error: function(error) {
              console.log(error);
               document.location.href = '/thank-you/?'+params_query;
            }
        });
      }
    }));


      $(document).on('click', 'form .w-checkbox', function(event){
        event.preventDefault();
        var checkboxInput = $(this).find('.w-checkbox-input');
        //console.log(checkboxInput);
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
        var step = 33;
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
          $('label.error:visible').hide();
       
         var button = $('.next-btn-wrapper .next-step');
        
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

   $(document).on('input change click', '.selling-reason', function(){
    // Check if at least one checkbox is checked
    if($('.selling-reason:checked').length > 0){
      // Set selling_reason to the text of the label for the first checked checkbox
      $('input[name="selling_reason"]').val($('.selling-reason:checked').first().parent().text().trim());
      console.log('selling_reason value set to: ' + $('input[name="selling_reason"]').val());
    } else {
      $('input[name="selling_reason"]').val('');
      console.log('selling_reason value set to: ' + $('input[name="selling_reason"]').val());
    }
    
    var selectedLabels = [];
    // loop through all the checked checkboxes
    $('.selling-reason:checked').each(function() {
      // add the label text wrapped in quotation marks to the selectedLabels array
      selectedLabels.push('"'+$(this).parent().text().trim()+'"');
    });
    // join the selectedLabels array into a comma-separated string
    var selectedReasons = selectedLabels.join(', ');
    // set the value of the hidden field to the selectedReasons string
    $('input[name="multiple_selling_reason"]').val(selectedReasons);
    
    $("#lp_form").valid();
    
   });

 function initiate_prepop(){

   var urlParams = new URLSearchParams(window.location.search);
 
   var requestId = urlParams.get('request_id');
   if (requestId) {
     $('#lp_request_id').val(requestId);
   }

   var first_name = urlParams.get('first_name');
   if(first_name){
     $('input[name="first_name"]').val(first_name);
   }

   var last_name = urlParams.get('last_name');
   if(last_name){
     $('input[name="last_name"]').val(last_name);
   }

   var email_address = urlParams.get('email_address');
   if(email_address){
     $('input[name="email_address"]').val(email_address);
   }

   var phone_home = urlParams.get('phone_home');
   if(phone_home){
     $('input[name="phone_home"]').val(phone_home);
   }

   var zip_code = urlParams.get('zip_code');
   if(zip_code){
     $('input[name="zip_code"]').val(zip_code);
   }
  
}
   
