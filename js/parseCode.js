Parse.initialize("cm3U67mf6vv0qI53OG9ZEUwhy2LV6gFSL7uvC1IO", "hF70381LfP74FecVPUMgLyoWfrl0DXNvzAkxqyEi");
var tempData = [];
var chartData = [];

var updateParseInterval = 5000;
var updateInterval = 20000;
var Session = Parse.Object.extend("Session");
var mainSession;
var ParseRequestLimit = 1000;
var ParseOffset = 0;



$(document).ready(function() {
	mainSession = new Session();
	getLastSession(SPARK_CORE_ID);
});

function getParseData() {

	//console.log("getting parse data");
	var Temperature = Parse.Object.extend("Temperature");
	var query = new Parse.Query(Temperature);
	query.equalTo("coreID", SPARK_CORE_ID);
	query.limit(ParseRequestLimit);
	query.skip(ParseOffset);
	//query.ascending("createdAt");
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
			if (ParseOffset == 0) {
				chartData = [];
			}

			for (var i = 0; i < tempData.length; ++i) {
				chartData.push([i + ParseOffset, tempData[i]]);
			}
			if (results.length < ParseRequestLimit) {
				console.log("Found all the results");
				ParseOffset = 0;
				updateGraph();
				setTime();
				return;
			} else {
				ParseOffset += ParseRequestLimit;
				//console.log("looping one more time...");
				getParseData();
			}
			//updateChart(chartData);
		},
		error: function(error) {
			console.error("Error: " + error.code + " " + error.message);
		}
	});
}
setInterval(getParseData, updateInterval);


// set a time stamp of a session so that we know what data set to retrieve
// first call stop session to make sure that is dead
// then start with timestamp that will be used in the above to retrieve the sessions
// then start polling

function newSession(coreID) {
	updateMainSessionVariable("endTime", Date.now());

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

function setTime() {
	var differenceInMilliseconds = Date.now() - mainSession.get("startTime");
	console.log(differenceInMilliseconds);
	// minutes
	minutes = Math.floor(differenceInMilliseconds / 1000 / 60);

	// hours
	hours = Math.floor(differenceInMilliseconds / 1000 / 60 / 60);

	// days
	days = Math.floor(differenceInMilliseconds / 1000 / 60 / 60 / 24);
	console.log("Days: " + days + " hours: " + hours + " minutes " + minutes);

	var minutesMinusHours=minutes-(hours*60);
	output =hours+" hours "+ minutesMinusHours + " minutes";

	$("#timeRunningID").text("Time: " + output);
}



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
			setTime();
			getParseData();
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