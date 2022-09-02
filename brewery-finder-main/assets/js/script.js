// global variables declared
const saveArray = [];
const apiKey = "AIzaSyAnLQaZQJJSUlJR12J-vpuXghllvQP2nx4";
let validStateCodes = [
  "AL",
  "AK",
  "AS",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FM",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MH",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "MP",
  "OH",
  "OK",
  "OR",
  "PW",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VI",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const breweryContainerEl = document.querySelector("#brewery-container");
const searchButton = document.querySelector("#search-btn");
// button action to take input data and feed to brewery by city API

// function to handle submit from HTML and pass it through JS
function handleSubmit(event) {
  event.preventDefault();
  const city = $("#city").val().trim();

  if(city == "")
  {
      alert("Please provide a city name!");
  }

  callCityApi(city);
}

// Function to call city data from HTML input and pass it through Open Brewery API to generate appropriate data
function callCityApi(city) {
  const apiUrlCity = `https://api.openbrewerydb.org/breweries?by_city=${city}&size=20`;

//   fetch data from OpenBrewery API
  fetch(apiUrlCity)
    // take fetched data and formulate needed response for webpage
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
        console.log(data)

      // Choose a random brewery from the given array
      const randomBrewery = data[Math.floor(Math.random() * data.length)];

      // start rendering data needed to screen
      renderBreweryCards(randomBrewery);
    });
}

// Abbreviate full state names for later google map usage.
function abbreviate(input, to) {
  var states = [
    ["Arizona", "AZ"],
    ["Alabama", "AL"],
    ["Alaska", "AK"],
    ["Arkansas", "AR"],
    ["California", "CA"],
    ["Colorado", "CO"],
    ["Connecticut", "CT"],
    ["Delaware", "DE"],
    ["Florida", "FL"],
    ["Georgia", "GA"],
    ["Hawaii", "HI"],
    ["Idaho", "ID"],
    ["Illinois", "IL"],
    ["Indiana", "IN"],
    ["Iowa", "IA"],
    ["Kansas", "KS"],
    ["Kentucky", "KY"],
    ["Louisiana", "LA"],
    ["Maine", "ME"],
    ["Maryland", "MD"],
    ["Massachusetts", "MA"],
    ["Michigan", "MI"],
    ["Minnesota", "MN"],
    ["Mississippi", "MS"],
    ["Missouri", "MO"],
    ["Montana", "MT"],
    ["Nebraska", "NE"],
    ["Nevada", "NV"],
    ["New Hampshire", "NH"],
    ["New Jersey", "NJ"],
    ["New Mexico", "NM"],
    ["New York", "NY"],
    ["North Carolina", "NC"],
    ["North Dakota", "ND"],
    ["Ohio", "OH"],
    ["Oklahoma", "OK"],
    ["Oregon", "OR"],
    ["Pennsylvania", "PA"],
    ["Rhode Island", "RI"],
    ["South Carolina", "SC"],
    ["South Dakota", "SD"],
    ["Tennessee", "TN"],
    ["Texas", "TX"],
    ["Utah", "UT"],
    ["Vermont", "VT"],
    ["Virginia", "VA"],
    ["Washington", "WA"],
    ["West Virginia", "WV"],
    ["Wisconsin", "WI"],
    ["Wyoming", "WY"],
  ];

//   directs data to choose abbreviated data
  if (to == "abbr") {
    input = input.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    for (i = 0; i < states.length; i++) {
      if (states[i][0] == input) {
        return states[i][1];
      }
    }
    // directs state data to full nme
  } else if (to == "name") {
    input = input.toUpperCase();
    for (i = 0; i < states.length; i++) {
      if (states[i][1] == input) {
        return states[i][0];
      }
    }
  }
}


// function to grab data from city and display on page
const renderBreweryCards = (brewery) => {
    $('.brewery-card').remove();
  // rendering data fetched to page
  const breweryCity = brewery.city;
  const breweryContainer = $("#brewery-container");
  const returnContainer = $("<div>");
  const breweryCard = $("<div>")
    .attr("id", "brewery-card")
    .addClass("brewery-card bg-gray-300 rounded-lg p-4 m-4 w-80 is-two-thirds");
  const breweryName = $("<h2>").text(brewery.name).addClass("is-size-3");
  const breweryType = $("<p>").text(brewery.brewery_type);
  const breweryAddress = $("<p>").text(
    brewery.street + ", " + brewery.city + ", " + brewery.state
  );
  const breweryPhone = $("<p>").text(brewery.phone);
  const breweryWebsite = $("<a>")
    .text(brewery.website_url)
    .attr("href", brewery.website_url);
  const saveBtn = $("<button>")
    .attr("id", "save-btn-id")
    .addClass("save-btn")
    .text("Save This Info!");
  let formatStateCode = abbreviate(brewery.state, "abbr");

//   Takes all gathered data and appends it to the brewery card
  breweryCard.append(
    breweryName,
    breweryType,
    breweryAddress,
    breweryPhone,
    breweryWebsite,
    saveBtn
  );
//   brewery card Appends to HTML brewery container.
  breweryContainer.append(breweryCard);

//   creates one array for all fetched data needed for local storage
  let saveData = {
    id: brewery.name.replace(/\s/g, '-').toLowerCase(),
    name: brewery.name,
    brewery_type: brewery.brewery_type,
    street: brewery.street,
    city: brewery.city,
    state: brewery.state,
    website_url: brewery.website_url,
  };

//   pushes saveData array into empty Save Array for local storage
  saveArray.push(saveData)
  saveInfo(saveData);

//   Pass data through FindLatLon function that is necessary for API call to generate map
  findLatLon(brewery.street, brewery.city, formatStateCode, brewery.name);
};

// Save data function for local storage
function saveInfo(saveData) {
  $(".save-btn").on("click", function (event) {
    // Stops page from saving multiple cards, now only one card's information is saved at a time
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log(saveData);

    if (!localStorage.getItem(saveData.id)){
        localStorage.setItem(saveData.id, JSON.stringify(saveData))
        // create a button that will reference brewery name
        let savedBreweryBtn = $('<button>')
        .attr('id', saveData.id)
        .text(saveData.name)
        .addClass('saved-brewery');

        // append saved brewery var to location
        $('#saved-locations').append(savedBreweryBtn);
    }
  });
}

// Use gathered data from OpenBrewery fetch and passes this data on to Google Map API to start location focus for map
async function findLatLon(street, city, state, name, website_url) {
    // replaces spaces in data with +'s so the data in functional for Google Maps API
  let formatStreet = street.replace(/\s/g, "+");
  let formatCity = city.replace(/\s/g, "+");

  let apiUrlLocal = `https://maps.googleapis.com/maps/api/geocode/json?address=${formatStreet},+${formatCity},+${state}&key=AIzaSyAnLQaZQJJSUlJR12J-vpuXghllvQP2nx4`;

  const response = await fetch(apiUrlLocal);
  const data = await response.json();
  if (data.results.length === 0) {
    $("#map-container").html(
      `<h2 class="text-center">No map available for ${name}</h2>`
    );
  } else {
    lat = data.results[0].geometry.location.lat;
    lon = data.results[0].geometry.location.lng;
    initMap(lat, lon, name);
  }
}

// Generates Map and allows passed information to be properly displayed to page
async function initMap(lat, lon, name) {
  // Create a map object and specify the Dom element for display.
  let map = new google.maps.Map(document.getElementById("map-container"), {
    center: { lat: lat, lng: lon },
    scrollwheel: false,
    zoom: 14,
  });

//   Creates marker on the page for direct location
  let marker = new google.maps.Marker({
    position: { lat: lat, lng: lon },
    map: map,
  });

  let infoWindow = new google.maps.InfoWindow({
    content: name,
  });

  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });
}

if (localStorage.length >0) {
    for (let i = 0; i < localStorage.length; i++) {
        let breweryId = localStorage.key(i);
        let breweryData = JSON.parse(localStorage.getItem(breweryId));
        let savedBrewery = $('<button>')
        .attr('id', breweryData.id)
        .text(breweryData.name)
        .addClass('saved-brewery');
        $('#saved-locations').append(savedBrewery); 
    }
}

$('.saved-brewery').on('click', function (event) {
    $('.brewery-card').remove();
    let breweryId = $(this).attr('id');
    let breweryData = JSON.parse(localStorage.getItem(breweryId));
    renderBreweryCards(breweryData);
});

$('.clear-btn').on('click', function(event) {
    localStorage.clear();
});

$("#search-form").on("submit", handleSubmit);
