var DEBUG = true;
var API_MOVENSW = "https://api.movensw.com/";
var TOKEN;
var PAGE = "page-trips";


function debug(output)
{
	if(DEBUG)
	{
		console.log(output);
	}
}

function closeDraw()
{
	$(".mdl-layout__drawer").toggleClass("is-visible");
	$(".mdl-layout__obfuscator").toggleClass("is-visible");
}

function launchApp(response)
{
	$('#auth-signin-email').val(null);
	$('#auth-signin-password').val(null);
	$('#auth-signup-email').val(null);
	$('#auth-signup-password').val(null);
	$('#auth-signup-confirm').val(null);
	
	$('#auth-signin-email').parent().removeClass('is-dirty');
	$('#auth-signin-password').parent().removeClass('is-dirty');
	$('#auth-signup-email').parent().removeClass('is-dirty');
	$('#auth-signup-password').parent().removeClass('is-dirty');
	$('#auth-signup-confirm').parent().removeClass('is-dirty');
	
	changePage('page-trips');

	myRoutes();

	$('#auth').hide();
	$('#app').show();
	$('#title-name').html(response.user.name);
}

// To be used to display existing routes/ create new routes
function myRoutes() {
    $('#page-trips >section').html('');

    var output = '<div class="mdl-cell mdl-cell--12-col"><h3>My Routes</h3></div>' +
        '<div class="mdl-cell mdl-cell--12-col">' +
        '<!-- FAB button with ripple -->' +
        '<button onclick="newTrip()" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect">' +
        '<i class="material-icons">add</i>' +
        '</button>' +
        '</div>';

    $('#page-trips >section').html(output);
}

function newTrip()
{
	postRequest("stations/read", null, outputStations, debug);
}

// Assigns departing and arriving station for route creation
function selectStation(id,name)
{
	debug(id);
	var departing;
	var arriving;
	if($('#stations-depart').html())
	{
		$('#stations-arrive').html(name);
        $('#stations-arrive').val(id);
		// Temp post request as to what i think might be needed, awaiting backend dev
		// postRequest('routes/create', {"email":email, "departing": $('#stations-depart').html(), "arriving": $('#stations-arrive').html()}, myRoutes, authError);
		//once actual postRequest remove below function
		debug({"station-depart": $('#stations-depart').val(), "station-arrive": $('#stations-arrive').val()});
		myRoutes();
	}
	else
	{
		$('#stations-depart').html(name);
		$('#stations-depart').val(id);
		$('#stations-search').val(null);
		$('#stations-search').parent().removeClass('is-dirty');
		updateStations();
	}
}

// Updates the station list based on what is in the search bar
function updateStations()
{
	var search = $('#stations-search').val().toLowerCase();
	var rows = $('#stations-table >tbody >tr');
	
	debug(search);
	
	for(var i = 0; i < rows.length; i++)
	{
		if($(rows[i]).children(0).html().toLowerCase().match("^" + search))
		{
			$(rows[i]).show();
		}
		else
		{
			$(rows[i]).hide();
		}
	}
}

// Displays the stations that allow route creation
function outputStations(response)
{
	$('#page-trips >section').html('');
	
	var output = '<div class="mdl-cell mdl-cell--12-col"><h5>Depart: <span id="stations-depart"></span></h5><h5>Arrive: <span id="stations-arrive"></span></h5></div>';
	
	output += '<div class="mdl-cell mdl-cell--12-col">' +
		'<!-- Textfield with Floating Label -->' +
		'<div style="width:100%" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
			'<input onkeyup="updateStations()" class="mdl-textfield__input" type="text" id="stations-search">' +
			'<label class="mdl-textfield__label" for="stations-search">Search</label>' +
		'</div>';
	
	output += '<table id="stations-table" class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width:100%">' +
		'<thead>' +
			'<tr>' +
				'<th class="mdl-data-table__cell--non-numeric">Station</th>' +
				'<th>Platforms</th>' +
			'</tr>' +
		'</thead>' +
		'<tbody>';
	
	for(var i = 0; i < response.stations.length; i++)
	{
		var station = response.stations[i];
		
		output+= '<tr style="cursor:pointer" onclick="selectStation(' + "'" + station.stop_id + "','" + station.stop_name + "'" + ')">' +
				'<td class="mdl-data-table__cell--non-numeric">' + station.stop_name + '</td>' +
				'<td>' + station.platforms.length + '</td>' +
			'</tr>';
	}
	
	output += '</tbody>' +
		'</table>' +
		'</div>';
	
	$('#page-trips').children(0).html(output);
	
	componentHandler.upgradeDom();
}

function authError(response)
{
	$('#auth-error').html(response.status + ": " + response.message);
}

function changePage(name)
{
	var pages = $(".mdl-layout__tab-panel");
	
	for(var i = 0; i < pages.length; i++)
	{
		pages[i].classList.remove("is-active");
		debug("Page change: " + name);
		
		if(pages[i].getAttribute('id') == name)
		{
			pages[i].classList.add("is-active");
		}
	}
}

function postRequest(endpoint, payload, success, failure)
{
	$('#loading').show();
	debug(payload);
	
	$.ajax({
		url: API_MOVENSW + endpoint,
		type: 'POST',
		data: JSON.stringify(payload),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		success: function (response) 
		{
			$('#loading').hide();
			debug(response);
			
			if(response.status >= 200 && response.status < 300)
			{
				success(response);
			}
			else
			{
				failure(response);
			}
		},
		error: function ()
		{
			var response  = {"status":500,"message":"Connection error"};
			$('#loading').hide();
			debug(response);
			failure(response);
		}
	});
}

function validPassword(str) {
    if (str.length < 8) {
        return("Password must be 8-20 characters");
    } else if (str.length > 20) {
        return("Password must be 8-20 characters");
    } else if (str.search(/\d/) == -1) {
        return("Password must have letters and numbers");
    } else if (str.search(/[a-zA-Z]/) == -1) {
        return("Password must have letters and numbers");
    } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
        return("Password must not have invalid characters");
    }
    return("ok");
}

$("#auth-signout-button").click(function()
{
	$('#auth').show();
	$('#app').hide();
});

$("#auth-signin-button").click(function()
{
	var email = $('#auth-signin-email').val();
	var password = $('#auth-signin-password').val();
	
	if(email && password)
	{
		window.localStorage.setItem("email",email);
		window.localStorage.setItem("password",password);
		postRequest("users/login", {"email":email,"password":password}, launchApp, authError);
	}
	else
	{
		$('#auth-error').html("Missing fields");
	}
});

$("#auth-signup-button").click(function()
{
	var name = $('#auth-signup-name').val();
	var email = $('#auth-signup-email').val();
	var password = $('#auth-signup-password').val();
	var confirm = $('#auth-signup-confirm').val();
	
	if(name && email && password && confirm)
	{
		if(password == confirm)
		{
			if(validPassword(password) == "ok")
			{
				postRequest("users/create", {"name":name,"email":email,"password":password}, launchApp, authError);
			}
			else
			{
				$('#auth-error').html(validPassword(password));
			}
		}
		else
		{
			$('#auth-error').html("Passwords don't match");
		}
	}
	else
	{
		$('#auth-error').html("Missing fields");
	}
});

$( document ).ready(function() {
	var email = window.localStorage.getItem("email",email);
	var password = window.localStorage.getItem("password",password);
	
	if(email !== null && password != null)
	{
		postRequest("users/login", {"email":email,"password":password}, launchApp, authError);
	}
});