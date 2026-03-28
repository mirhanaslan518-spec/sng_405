const form = document.getElementById("weatherForm");
const weatherResult = document.getElementById("weatherResults");

const API_KEY = 'cf6c41a0353eac6f8598f58fde22cd5e';

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = "kyrenia";

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        weatherResult.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <div class="results">
            <div class="weatherResult">
                <p>Temperature: ${data.main.temp}°C</p>
            </div>
            <div class="weatherResult">
                <p>Weather: ${data.weather[0].description}</p>
            </div>
            <div class="weatherResult">
                <p>Humidity: ${data.main.humidity}%</p>
            </div>
            <div class="weatherResult">
                <p>Wind Speed: ${data.wind.speed} m/s</p>
            </div>
        </div>
        `

        if (data.weather[0].description == "broken clouds") {
            document.body.style.background = "linear-gradient(to right, gray)";
        }
        if (data.weather[0].description == "clear sky") {
            document.body.style.background = "linear-gradient(to right, #467ac2)";
        }
    } catch (error) {
        weatherResult.innerHTML = `<p>Error: ${error.message}</p>`
    }
})
