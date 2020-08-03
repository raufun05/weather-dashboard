//Create a city variable to store the input value
var city = $("#input-city").val();
// Create a variable for API key
const apiKey = "&appid=efa28af0867228bf8d37da8d2b1bb082";
// Create a variable for Date
//var date = new Date();

$("#input-city").keypress(function (event) {

  if (event.keyCode === 13) {
    event.preventDefault();
    $("#search-button").click();
  }
});

$("#search-button").on("click", function () {

  $('#weather-forecast').addClass('show');

  // get the value of the input from user
  city = $("#input-city").val();

  // clear input box
  $("#input-city").val("");

  // Create URL to call API
  const queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + apiKey;

  $.ajax({
    url: queryURL,
    method: "GET"
  })
    .then(function (response) {

      console.log(response)

      console.log(response.name)
      console.log(response.weather[0].icon)

      var convertTempToF = (response.main.temp - 273.15) * 1.80 + 32;
      console.log(Math.floor(convertTempToF))

      console.log(response.main.humidity)

      console.log(response.wind.speed)

      getWeatherConditions(response);
      getWeatherForecast(response);
      createList();


    })
});

function createList() {
  var listItem = $("<li>").addClass("list-group-item").text(city);
  $(".list").append(listItem);
}

function getWeatherConditions(response) {

  // convert temperature
  var convertTempToF = (response.main.temp - 273.15) * 1.80 + 32;
  convertTempToF = Math.floor(convertTempToF);

  $('#cityWeatherInfo').empty();
  //var currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
  //cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text("Last updated: " + currdate)));

  // get and set the content 
  const card = $("<div>").addClass("card");
  const cardBody = $("<div>").addClass("card-body");
  const city = $("<h3>").addClass("card-title").text(response.name);
  const currentDate = $("<span>").addClass("card-title").text("(" + moment().format('l') + ")");
  const temperature = $("<p>").addClass("card-text current-temp").text("Temperature: " + convertTempToF + " °F");
  const humidity = $("<p>").addClass("card-text current-humidity").text("Humidity: " + response.main.humidity + "%");
  const wind = $("<p>").addClass("card-text current-wind").text("Wind Speed: " + response.wind.speed + " MPH");
  const image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png")
  // add to page content
  city.append(currentDate, image)
  cardBody.append(city, temperature, humidity, wind);
  card.append(cardBody);
  $("#cityWeatherInfo").append(card)

}

function getWeatherForecast() {

  $.ajax({
    url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + apiKey,
    method: "GET"
  }).then(function (response) {

    console.log(response)
    console.log(response.dt)
    $('#day-forecast').empty();

    // Create a variable to hold response.list
    var results = response.list;
    console.log(results)

    //declare start date to check against
    // startDate = 20
    //have end date, endDate = startDate + 5

    for (var i = 0; i < results.length; i++) {

      var day = Number(results[i].dt_txt.split('-')[2].split(' ')[0]);
      var hour = results[i].dt_txt.split('-')[2].split(' ')[1];
      console.log(day);
      console.log(hour);

      if (results[i].dt_txt.indexOf("12:00:00") !== -1) {

        // convert temperature
        var temp = (results[i].main.temp - 273.15) * 1.80 + 32;
        var convertTempToF = Math.floor(temp);

        const card = $("<div>").addClass("card col-md-2 ml-4 bg-primary text-white");
        const cardBody = $("<div>").addClass("card-body p-3 forecastBody")
        const currentDate = $("<h4>").addClass("card-title").text(date.toLocaleDateString('en-US'));
        const temperature = $("<p>").addClass("card-text forecastTemp").text("Temperature: " + convertTempToF + " °F");
        const humidity = $("<p>").addClass("card-text forecastHumidity").text("Humidity: " + results[i].main.humidity + "%");
        const image = $("<img>").attr("src", "https://openweathermap.org/img/w/" + results[i].weather[0].icon + ".png")

        cardBody.append(currentDate, image, temperature, humidity);
        card.append(cardBody);
        $("#day-forecast").append(card);

      }
    }
  });
}

