var savedLocations = [];
var currLocation;

function initialize() {
    //grab previous locations from local storage
    savedLocations = JSON.parse(localStorage.getItem("weathercities"));
       //display buttons for previous searches
    if (savedLocations) {
        //get the last city searched so we can display it
        currLocation = savedLocations[savedLocations.length - 1];
        showPrevious();
        getCurrent(currLocation);
    }
    else {
        //try to geolocate, otherwise set city to raleigh
        if (!navigator.geolocation) {
            //can't geolocate and no previous searches, so just give them one
            getCurrent("Denver");
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

}

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=efa28af0867228bf8d37da8d2b1bb082";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
      currLocation = response.name;
        saveLoc(response.name);
        getCurrent(currLocation);
    });

}

function error(){
    //can't geolocate and no previous searches, so just give them one
    currLocation = "Denver"
    getCurrent(currLocation);
}

function showPrevious() {
    //show the previously searched for locations based on what is in local storage
    if (savedLocations) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedLocations.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
            if (savedLocations[i] == currLocation){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevSearches").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=efa28af0867228bf8d37da8d2b1bb082&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedLocations));
            initialize();
        }
    }).then(function (response) {
        //create the card
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#weatherForecast").append(currCard);

        //add location to card header
        // var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        // currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);

        //get icon for weather conditions
        // var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        // var imgDiv = $("<div>").attr("class", "img").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        // cardBody.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        //display city name
        const cityName=($("<h3>").attr("class", "card-title").text(response.name));
        const image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
        cardBody.append( cityName, image);
        //display last updated
        var currdate = moment(response.dt, "X").format('l');
        cardBody.append($("<span>").attr("class", "card-text").append($("<medium>").attr("class", "text-muted").text("(" + currdate + ")")));
        //display Temperature
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        //display Humidity
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        //display Wind Speed
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

        //get UV Index
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=efa28af0867228bf8d37da8d2b1bb082&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            var uvindex = uvresponse.value;
            var uvdisp = $("<button>").attr("class", "card-text").text("UV Index: ");
            uvdisp.append($("<span>").attr("class", "uvindex").attr("class", "btn btn-danger").text(uvindex));
            cardBody.append(uvdisp);

        });

        cardRow.append(textDiv);
        getForecast(response.id);
    });
}

function getForecast(city) {
    //get 5 day forecast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=efa28af0867228bf8d37da8d2b1bb082&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //add container div for forecast cards
        var newrow = $("<div>").attr("class", "forecast");
        $("#weatherForecast").append(newrow);

        //loop through array response to find the forecasts for 15:00
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("l"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    //clear all the weather
    $("#weatherForecast").empty();
}

function saveLoc(loc){
    //add this to the saved locations array
    if (savedLocations === null) {
        savedLocations = [loc];
    }
    else if (savedLocations.indexOf(loc) === -1) {
        savedLocations.push(loc);
    }
    //save the new array to localstorage
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
    showPrevious();
}

$("#search-button").on("click", function () {
    //don't refresh the screen
    event.preventDefault();
    //grab the value of the input field
    var loc = $("#city-input").val().trim();
    //if loc wasn't empty
    if (loc !== "") {
        //clear the previous forecast
        clear();
        currLocation = loc;
        saveLoc(loc);
        //clear the search field value
        $("#city-input").val("");
        //get the new forecast
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currLocation = $(this).text();
    showPrevious();
    getCurrent(currLocation);
});

initialize();
