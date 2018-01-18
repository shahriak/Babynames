// Shahria Kazi CSE 190m Section MK TA: Tyler Rigsby, May 23rd 2012
// This webpage displays data given a baby's first name. 
// The data shows the meaning of the particular baby's name, the names
// popularity from 1900-2010 in a bar graph, and a list of celebrities
// having the same first name with their film counts.
"use strict";

// Calls necessary functions depending on different events
document.observe("dom:loaded", function() {
	fetchRequest("list", undefined, undefined, fetchNames);
	$("search").observe("click", fetchData);
});

// resets all data fields for subsequent searches
function eraseData() {
	// show loading images
	$("resultsarea").show();
	$("loadingmeaning").show();
	$("loadinggraph").show();
	$("loadingcelebs").show();
		
	// resetting fields
	$("norankdata").hide();
	$("meaning").innerHTML = "";
	$("graph").innerHTML = "";
	$("celebs").innerHTML = "";
	$("errors").innerHTML = "";
}

// Called when the search button is clicked and fetches the meaning of the baby's name,
// the rank data of that name and celebrities having the identical first name.
function fetchData() {
	var babyName = $("allnames").value;
	var babyGender = null;
	if($("genderm").checked) {
		babyGender = $("genderm").value;
	} else {
		babyGender = $("genderf").value;
	}
	
	// if a name is selected, resets the data fields and makes ajax requests
	if($("allnames").value) {
		eraseData();
		// fetches meaning of the baby's name
		fetchRequest("meaning", babyName, undefined, fetchMeaning);
		// fetches the ranking data of the baby's name
		fetchRequest("rank", babyName, babyGender, fetchRank);
		// fetches the celebrity data for the baby's name
		fetchRequest("celebs", babyName, babyGender, fetchCelebs);
	}
}

// fetches ajax requests with the given parameters. If the request is successful,
// it will call the function onSuccess, otherwise calls the function onFailure
function fetchRequest(requestType, babyName, babyGender, myAjaxSuccessFunction) {
	new Ajax.Request("https://webster.cs.washington.edu/cse190m/babynames.php", {
		method: "get",
		parameters: {type: requestType, name: babyName, gender: babyGender},
		onSuccess: myAjaxSuccessFunction,
		onFailure: ajaxFailure,
		onException: ajaxFailure
	});
}

// inserts all of the names as options to the select box and enables the select box
function fetchNames(ajax) {
	$("loadingnames").hide();
	var names = ajax.responseText.split("\n");
	for(var i = 0; i < names.length; i++) {
		var option = document.createElement("option");
		option.innerHTML = names[i];
		$("allnames").appendChild(option);
	}
	$("allnames").disabled = false; // enabling select box
}

// displays the meaning of the given baby's name
function fetchMeaning(ajax) {
	$("loadingmeaning").hide();
	$("meaning").innerHTML = ajax.responseText;
}

// fills the table with two rows of data. The first row showing the date and the
// second row stating the rank shown inside a bargraph
function fetchRank(ajax) {
	$("loadinggraph").hide();
	var ranks = ajax.responseXML.getElementsByTagName("rank");
	var tr = document.createElement("tr");
	var tr2 = document.createElement("tr");
	for(var i = 0; i < ranks.length; i++) {
		// filling decades
		var th = document.createElement("th");
		var year = ranks[i].getAttribute("year");
		th.innerHTML = year;
		tr.appendChild(th);
		
		// filling ranks
		var td = document.createElement("td");
		var div = document.createElement("div");
		var rank = ranks[i].firstChild.nodeValue;
		div.innerHTML = rank;
		td.appendChild(div);
		tr2.appendChild(td);
		
		// setting height of the table data, a rank of 0 gets to have a height of 0px
		var barHeight = parseInt(1 / 4 * (1000 - rank));
		if(rank == 0) {
			div.style.height = rank + "px";
		} else {
			div.style.height = barHeight + "px";
		}
		
		// adds classname if the baby's rank is within top ten to highlight it in red
		if(rank >= 1 && rank <= 10) {
			div.addClassName("topten");
		}
	}
	// adding the created elements to the page
	$("graph").appendChild(tr);
	$("graph").appendChild(tr2);
}

// fills the actors first name, last name and the film counts in a bulleted list
function fetchCelebs(ajax) {
	$("loadingcelebs").hide();
	var data = JSON.parse(ajax.responseText);
	for(var i = 0; i < data.actors.length; i++) {
		var li = document.createElement("li");
		li.innerHTML = data.actors[i].firstName + " " + data.actors[i].lastName +
			" (" + data.actors[i].filmCount + " films)";
		$("celebs").appendChild(li);
	}
}

// called when an ajax request fails and shows a
// descriptive error message telling the user what went wrong in the request
function ajaxFailure(ajax, exception) {
	$("loadinggraph").hide();
	if(ajax.status == 410) { // called when there is no rank data
		$("norankdata").show();
	} else {
		// hides loading divs
		$("loadingnames").hide();
		$("loadingmeaning").hide();
		$("loadingcelebs").hide();
		
		// injects an error message when error occurs
		$("errors").innerHTML = "Error making Ajax request:" + 
			"\n\nServer status:\n" + ajax.status + " " + ajax.statusText + 
			"\n\nServer response text:\n" + ajax.responseText;
		if (exception) {
			throw exception;
		}
	}
}