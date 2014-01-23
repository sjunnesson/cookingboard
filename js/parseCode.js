Parse.initialize("QvJbOzUIMLphGxYkonhtzfsa28udV7n58155MnHU", "87AcQFBUPOPsCXcsn5SG5acuH5VfGLDab4HKgW2K");
var tempData = [];
var chartData = [];

var updateParseInterval = 5000;
var updateInterval = 5000;
var Session = Parse.Object.extend("Session");
var mainSession;



$(document).ready(function() {
	mainSession = new Session();
	getLastSession(SPARK_CORE_ID);
	getParseData();
});

function getParseData() {
	console.log("getting parse data");
	var Temperature = Parse.Object.extend("Temperature");
	var query = new Parse.Query(Temperature);
	query.equalTo("coreID", SPARK_CORE_ID);
	query.limit(1000);
	query.ascending("createdAt");
	if (mainSession != null) {
		query.greaterThan("createdAt", mainSession.createdAt);
	}
	query.find({
		success: function(results) {
			console.log("Successfully retrieved " + results.length + " temperatures.");
			// Do something with the returned Parse.Object values
			tempData = [];
			for (var i = 0; i < results.length; i++) {
				var object = results[i];
				//console.log(object.createdAt + ' - ' + object.get('value'));
				var temp = object.get('value');
				tempData.push(temp);
			}
			chartData = [];
			for (var i = 0; i < tempData.length; ++i) {
				chartData.push([i, tempData[i]]);
			}
			//updateChart(chartData);
		},
		error: function(error) {
			console.error("Error: " + error.code + " " + error.message);
		}
	});

	setTimeout(getParseData, updateInterval);
}

// set a time stamp of a session so that we know what data set to retrieve
// first call stop session to make sure that is dead
// then start with timestamp that will be used in the above to retrieve the sessions
// then start polling

function newSession(coreID) {
	updateMainSessionVariable("endTime",Date.now());

	mainSession = new Session();
	console.log(mainSession);

	mainSession.set("startTime", Date.now());
	mainSession.set("coreID", coreID);
	mainSession.set("status", 1);
	mainSession.save(null, {
		success: function(session) {
			// Execute any logic that should take place after the object is saved.
			console.log('New session created');
		},
		error: function(session, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and description.
			console.error('Failed to create new session, with error code: ' + error.description);
		}
	});

}


// function stopSession(coreID) {

// 	if (mainSession != null) {
// 		var _mainSession=mainSession;
// 		_mainSession.set("endTime", Date.now());
// 		_mainSession.set("status", 0);
// 		_mainSession.save(null, {
// 			success: function(session) {
// 				console.log('Session stoped');
// 			},
// 			error: function(session, error) {
// 				// Execute any logic that should take place if the save fails.
// 				// error is a Parse.Error with an error code and description.
// 				console.error('Failed to stop session, with error code: ' + error.description);
// 			}
// 		});
// 	}
// }

function updateMainSessionVariable(variableName, value) {
	if (mainSession != null || mainSession == undefined) {
		var _mainSession = mainSession;
		_mainSession.set(variableName, value);
		_mainSession.save(null, {
			success: function(session) {
				console.log("Variable updated")
			},
			error: function(session, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and description.
				console.error('Failed to update variable, with error code: ' + error.description);
			}
		});
	}
}

function getLastSession(coreID) {
	query = new Parse.Query(Session);
	query.equalTo("coreID", coreID);
	query.descending("createdAt");
	query.find({
		success: function(object) {
			console.log(object[0]);
			mainSession = object[0];
			if (object[0].get("status") == 1) {

				if (mainSession.get("targetTemperature") != undefined) {
					initSpark(mainSession.get("targetTemperature"), 1);
				}
			}
		},
		error: function(error) {
			console.error("Error: " + error.code + " " + error.message);
			return -1;
		}
	});
}

function getTempData() {
	return chartData;
}