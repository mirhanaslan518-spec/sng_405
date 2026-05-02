const API_KEY = 'cf6c41a0353eac6f8598f58fde22cd5e';

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResults");
const unitToggle = document.getElementById("unitToggle");


let isMetric = true;

unitToggle.addEventListener("change", () => {
    isMetric = !unitToggle.checked;
    if (cityInput.value.trim() !== "") {
        getWeather(cityInput.value.trim());
    }
    loadDefaultCities();
});


form.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city === "") return;
    getWeather(city);
});


function getWeatherBackground(main) {
    switch (main) {
        case "Clear":
            document.body.style.background = "linear-gradient(135deg, #1a3a6b, #f97316)";
            break;
        case "Clouds":
            document.body.style.background = "linear-gradient(135deg, #374151, #6b7280)";
            break;
        case "Rain":
            document.body.style.background = "linear-gradient(135deg, #265875, #173961)";
            break;
        case "Drizzle":
            document.body.style.background = "linear-gradient(135deg, #0c4a6e, #1e40af)";
            break;
        case "Thunderstorm":
            document.body.style.background = "linear-gradient(135deg, #1e1b4b, #312e81)";
            break;
        case "Snow":
            document.body.style.background = "linear-gradient(135deg, #1e3a5f, #bfdbfe)";
            break;
        default:
            document.body.style.background = "linear-gradient(135deg, #1a1a2e, #467ac2)";
            break;
    }
}

async function getWeather(city) {
    const units = isMetric ? "metric" : "imperial";
    const unitSymbol = isMetric ? "°C" : "°F";

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`
        );

        
        if (!response.ok) {
            if (response.status === 404) {
                weatherResult.innerHTML = `<p class="error">City not found. Please try again.</p>`;
            } else {
                weatherResult.innerHTML = `<p class="error">Something went wrong. Try again.</p>`;
            }
            return;
        }

        const data = await response.json();

        
        getWeatherBackground(data.weather[0].main);

        weatherResult.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <div class="results">
                <div class="weatherResult">
                    <i class="fa-solid fa-temperature-half"></i>
                    <p>Temperature: ${data.main.temp}${unitSymbol}</p>
                </div>
                <div class="weatherResult">
                    <i class="fa-solid fa-cloud"></i>
                    <p>Weather: ${data.weather[0].description}</p>
                </div>
                <div class="weatherResult">
                    <i class="fa-solid fa-droplet"></i>
                    <p>Humidity: ${data.main.humidity}%</p>
                </div>
                <div class="weatherResult">
                    <i class="fa-solid fa-wind"></i>
                    <p>Wind Speed: ${data.wind.speed} m/s</p>
                </div>
            </div>
        `;
    } catch (error) {
        weatherResult.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

async function loadCityCard(city, cardId) {
    const units = isMetric ? "metric" : "imperial";
    const unitSymbol = isMetric ? "°C" : "°F";
    const card = document.getElementById(cardId);

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`
        );

        if (!response.ok) {
            card.innerHTML = `<span class="error">Could not load ${city}</span>`;
            return;
        }

        const data = await response.json();

        card.innerHTML = `
            <div class="card-city">${data.name}, ${data.sys.country}</div>
            <div class="card-temp">${data.main.temp}${unitSymbol}</div>
            <div class="card-desc">${data.weather[0].description}</div>
            <div class="card-stats">
                <i class="fa-solid fa-droplet"></i> ${data.main.humidity}%
                &nbsp;|&nbsp;
                <i class="fa-solid fa-wind"></i> ${data.wind.speed} m/s
            </div>
        `;
    } catch (error) {
        card.innerHTML = `<span class="error">Error loading ${city}</span>`;
    }
}


function loadDefaultCities() {
    document.getElementById("card-istanbul").innerHTML = "Loading...";
    document.getElementById("card-kyrenia").innerHTML = "Loading...";
    document.getElementById("card-london").innerHTML = "Loading...";

    loadCityCard("istanbul", "card-istanbul");
    loadCityCard("kyrenia", "card-kyrenia");
    loadCityCard("london", "card-london");
}

loadDefaultCities();
