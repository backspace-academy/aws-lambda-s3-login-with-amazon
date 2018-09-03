// Self-invoking anonymous function
(function($) {
	'use strict';

	// Region must be defined
	AWS.config.region = 'us-east-1';
	// Insert your IAM role arn here
	var roleArn = 'YOUR-ROLE-ARN-GOES-HERE';

	var userLoggedIn = false;
	var accessToken, userProfile, S3, lambda;

	// Click event listeners for buttons
	$('#LoginWithAmazon').click(function() {
		loginWithAmazon();
	});
	$('#Logout').click(function() {
		amazon.Login.logout();
	});
	$('#btnInvoke').click(function() {
		invokeLambda();
	});	
	$('#btnGet').click(function() {
		getLambda();
	});	

	//Login with Amazon code
	function loginWithAmazon(){
		var options = {};
		options.scope = 'profile';
		// Get access token
		amazon.Login.authorize(options, function(response) {
			if ( response.error ) {
				alert('oauth error ' + response.error);
				return;
			}
			console.log('Amazon Login Details:');
			console.log(JSON.stringify(response));
			accessToken  = response.access_token;
			// Get user profile
			amazon.Login.retrieveProfile(response.access_token, function(response) {
				userProfile = response.profile;
				console.log('Amazon Profile Details:');
				console.log(JSON.stringify(userProfile));
				createCredentials(accessToken, response);
			});
		});
		return false;
	}

	//Set up AWS Credentials
	function createCredentials(accessToken) {
		console.log('Creating AWS Credentials for:');
		console.log('Role: ' + roleArn);
		console.log('Access Token: ' + accessToken);
  		AWS.config.credentials = new AWS.WebIdentityCredentials({
      		ProviderId: 'www.amazon.com',
      		RoleArn: roleArn,
      		WebIdentityToken: accessToken
  		});

		//refreshes credentials
		AWS.config.credentials.refresh((error) => {
			if (error) {
				console.error(error);
				alert('Unable to sign in. Please try again.');
			} else {
				// Instantiate aws sdk service objects now that the credentials have been updated.
				S3 = new AWS.S3({
    				params: {
						Bucket: 'YOUR-BUCKET-NAME-GOES-HERE'
					}
				});
				lambda = new AWS.Lambda();
				userLoggedIn = true;
				console.log('Successfully created AWS STS temporary credentials!');
				alert('You are now signed in.');					
			}
		});
	}

	//Invoke Lambda function
	function invokeLambda(){
	  var params = {
		FunctionName: 'BackSpace-Lambda-Lab', /* required */
		InvocationType: 'RequestResponse',
		LogType: 'Tail',
		Payload: '{'key3': 'This is value3 from Browser','key2': 'This is value2 from Browser','key1': 'This is value1 from Browser'}'
	  };
	  lambda.invoke(params, function(err, data) {
		if (err) {
		  console.log(err, err.stack); // an error occurred
		  alert('Failed to invoke AWS Lambda function.');
		}
		else {
		  console.log(data);           // successful response
		  alert('Invoked AWS Lambda function.');
		}
	  });
	}

	function getLambda(){
	  var params = {
		FunctionName: 'BackSpace-Lambda-Lab' /* required */
	  };
	  lambda.getFunction(params, function(err, data) {
		if (err) {
		  console.log(err, err.stack); // an error occurred
		  alert('Failed to get AWS Lambda function.');
		}
		else {
		  console.log(data);           // successful response
		  alert('Got AWS Lambda function.');
		}
	  });
	}


	// End 	self-invoking anonymous function
})(jQuery);
