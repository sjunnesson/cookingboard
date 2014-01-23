var updateIntervalRedrawChart = 5000;
var plot;


$(document).ready(function() {
	$("#cookingChart").width($("#mainContainer").width());
	$("#cookingChart").height($("#mainContainer").width() / 2.5);
	plot = $.plot("#cookingChart", [], {
		series: {
			shadowSize: 0 // Drawing is faster without shadows
		},

		xaxis: {
			show: false
		},

	});

	updateGraph();

});

function updateGraph() {
	console.log("Updating graph");
	var tempArray = getTempData();
	if (tempArray.length > 0) {
		//console.log(tempArray[tempArray.length - 1][1]);
		$("#lastTempID").text("Last temp: " + tempArray[tempArray.length - 1][1]);
	}
	plot.setData([tempArray]);

	plot.setupGrid();
	plot.draw();
	//setTimeout(update, updateIntervalRedrawChart);
}