var updateIntervalRedrawChart = 5000;
var plot;


$(document).ready(function() {
	$("#cookingChart").width($("#mainContainer").width());
	$("#cookingChart").height($("#mainContainer").width() / 2.5);
	plot = $.plot("#cookingChart", [getTempData()], {
		series: {
			shadowSize: 0 // Drawing is faster without shadows
		},

		xaxis: {
			show: false
		},

	});

	update();

});

function update() {
	var tempArray = getTempData();
	if (tempArray.length > 0) {
		//console.log(tempArray[tempArray.length - 1][1]);
		$("#lastTempID").text("Last temp: " + tempArray[tempArray.length - 1][1]);
	}
	plot.setData([tempArray]);

	plot.setupGrid();
	plot.draw();
	setTimeout(update, updateIntervalRedrawChart);
}