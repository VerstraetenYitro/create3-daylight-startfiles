// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const date = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = '0' + date.getHours();
  // Minutes part from the timestamp
  const minutes = '0' + date.getMinutes();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
const updateSun = function (sun, left, bottom, today) {
  sun.style.left = `${left}%`;
  sun.style.bottom = `${bottom}%`;
  sun.setAttribute('data-time', ('0' + today.getHours()).slice(-2) + ':' + ('0' + today.getMinutes()).slice(-2));
};

const itIsNight = () => {
  document.querySelector('html').classList.add('is-night');
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  const sun = document.querySelector('.js-sun');
  const minutes = document.querySelector('.js-time-left');
  // Bepaal het aantal minuten dat de zon al op is.
  let now = new Date();
  const dateSunrise = new Date(sunrise * 1000);
  let minutesSunIsUp = now.getHours() * 60 + now.getMinutes() - (dateSunrise.getHours() * 60 + dateSunrise.getMinutes());
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  let percentage = (100 / totalMinutes) * minutesSunIsUp;
  let sunLeft = percentage;
  let sunBottom;
  if (percentage < 50) {
    sunBottom = percentage * 2;
  } else {
    sunBottom = (100 - percentage) * 2;
  }
  updateSun(sun, sunLeft, sunBottom, now);
  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  document.querySelector('body').classList.add('is-loaded');
  // Vergeet niet om het resterende aantal minuten in te vullen.
  minutes.innerHTML = totalMinutes - minutesSunIsUp;

  if (minutesSunIsUp < 0 || minutesSunIsUp > totalMinutes) {
    itIsNight();
  } else {
    percentage = (100 / totalMinutes) * minutesSunIsUp;
    if (percentage < 50) {
      sunBottom = percentage * 2;
    } else {
      sunBottom = (100 - percentage) * 2;
    }
    // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
    updateSun(sun, sunLeft, sunBottom, now);
    // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
    minutes.innerHTML = totalMinutes - minutesSunIsUp;
  }

  // Nu maken we een functie die de zon elke minuut zal updaten
  let t = setInterval(() => {
    now = new Date();
    // Bekijk of de zon niet nog onder of reeds onder is
    if (minutesSunIsUp < 0 || minutesSunIsUp > totalMinutes) {
      itIsNight();
      clearInterval(t);
    } else {
      percentage = (100 / totalMinutes) * minutesSunIsUp;
      if (percentage < 50) {
        sunBottom = percentage * 2;
      } else {
        sunBottom = (100 - percentage) * 2;
      }
      // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
      updateSun(sun, sunLeft, sunBottom, now);
      // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
      minutes.innerHTML = totalMinutes - minutesSunIsUp;
    }
    minutesSunIsUp++;
  }, 60000);
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  console.log(queryResponse);
  const location = document.querySelector('.js-location');
  const sunset = document.querySelector('.js-sunset');
  const sunrise = document.querySelector('.js-sunrise');
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  location.innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  sunset.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
  sunrise.innerHTML = _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  const time = new Date(queryResponse.city.sunset * 1000 - queryResponse.city.sunrise * 1000);
  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  placeSunAndStartMoving(time.getHours() * 60 + time.getMinutes(), queryResponse.city.sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = (lat, lon) => {
  // Eerst bouwen we onze url op
  const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=9acf2ca71a11d2b607eb3b70529917d2&units=metric&lang=nl&cnt=1`;
  // Met de fetch API proberen we de data op te halen.
  const request = fetch(`${url}`)
    .then((response) => response.json())
    .then((data) => showResult(data));
  // Als dat gelukt is, gaan we naar onze showResult functie.
  //showResult(data);
};

const geo = function () {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position.coords.latitude, position.coords.longitude);
      getAPI(position.coords.latitude, position.coords.longitude);
    });
  } else {
    console.log('not available');
  }
};

document.addEventListener('DOMContentLoaded', function () {
  // 1 We will query the API with longitude and latitude.
  //getAPI(50.8027841, 3.2097454);
  geo();
});
