const API_KEY = 'cf6c41a0353eac6f8598f58fde22cd5e';
 
const form            = document.getElementById("weatherForm");
const cityInput       = document.getElementById("cityInput");
const weatherResult   = document.getElementById("weatherResults");
const forecastSection = document.getElementById("forecastSection");
const unitToggle      = document.getElementById("unitToggle");
const cityCardsGrid   = document.getElementById("cityCardsGrid");
const container       = document.querySelector(".container");
 
let isMetric = true;
 
const CAPITALS = [
    "London", "Paris", "Berlin", "Madrid", "Rome",
    "Amsterdam", "Moscow", "Tokyo", "Beijing", "New Delhi",
    "Seoul", "Bangkok", "Abu Dhabi", "Cairo", "Nairobi",
    "Washington,DC,US", "Ottawa", "Mexico City", "Brasilia", "Buenos Aires"
];
 
function getRandomCities() {
    return [...CAPITALS].sort(() => Math.random() - 0.5).slice(0, 3);
}
 
unitToggle.addEventListener("change", () => {
    isMetric = !unitToggle.checked;
    if (cityInput.value.trim() !== "") {
        getWeatherAndForecast(cityInput.value.trim());
    }
    loadDefaultCities();
});
 

const DEBUG_CONDITIONS = [
    'clear','clouds','rain','drizzle','thunderstorm',
    'snow','mist','fog','haze','smoke','dust','sand','ash','squall','tornado'
];
 
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city === "") return;
 
    if (DEBUG_CONDITIONS.includes(city.toLowerCase())) {
        const condition = city.charAt(0).toUpperCase() + city.slice(1);
        applyWeatherTheme(condition);
        startAnimation(condition);
        weatherResult.innerHTML = `
            <p style="text-align:center;opacity:.45;margin-top:1.5rem;font-size:13px;">
                Testing animation: <strong>${condition}</strong>
            </p>`;
        forecastSection.innerHTML = '';
        return;
    }
 
    getWeatherAndForecast(city);
});
 
function applyWeatherTheme(main) {
    const themes = {
        Clear:        { bg: 'linear-gradient(135deg, #c47d0a , #1e5799, #0a1628)', glow: 'glow-snow' },
        Clouds:       { bg: 'linear-gradient(135deg, #1a2535, #2e4460, #5a7a96)', glow: 'glow-clouds' },
        Rain:         { bg: 'linear-gradient(135deg, #060e1e, #0e2d5e, #1a5a96)', glow: 'glow-rain' },
        Drizzle:      { bg: 'linear-gradient(135deg, #0a1828, #12355e, #1e5a82)', glow: 'glow-rain' },
        Thunderstorm: { bg: 'linear-gradient(135deg, #05040f, #110b2e, #2a0f5e)', glow: 'glow-storm' },
        Snow:         { bg: 'linear-gradient(135deg, #0a1525, #0f2a55, #2a5a9e)', glow: 'glow-snow' },
        Mist:         { bg: 'linear-gradient(135deg, #080f1c, #10253a, #1a4a6e)', glow: 'glow-fog' },
        Fog:          { bg: 'linear-gradient(135deg, #080f1c, #10253a, #1a4a6e)', glow: 'glow-fog' },
        Haze:         { bg: 'linear-gradient(135deg, #080f1c, #10253a, #1a4a6e)', glow: 'glow-fog' },
        Smoke:        { bg: 'linear-gradient(135deg, #1a0f06, #3d2210, #7a4818)', glow: 'glow-dust' },
        Dust:         { bg: 'linear-gradient(135deg, #1e1206, #4a2c0e, #8a5518)', glow: 'glow-dust' },
        Sand:         { bg: 'linear-gradient(135deg, #1e1206, #4a2c0e, #8a5518)', glow: 'glow-dust' },
        Ash:          { bg: 'linear-gradient(135deg, #1a0f06, #3d2210, #7a4818)', glow: 'glow-dust' },
        Squall:       { bg: 'linear-gradient(135deg, #060e1a, #0e2240, #1a4268)', glow: 'glow-rain' },
        Tornado:      { bg: 'linear-gradient(135deg, #1e1206, #4a2c0e, #8a5518)', glow: 'glow-dust' },
    };
 
    const t = themes[main] || { bg: 'linear-gradient(135deg, #1a1a2e, #467ac2)', glow: '' };
    document.body.style.background = t.bg;
 
    container.className = 'container';
    if (t.glow) container.classList.add(t.glow);
}
 
async function fetchUVI(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (!res.ok) return "N/A";
        const data = await res.json();
        return data.value;
    } catch {
        return "N/A";
    }
}
 
async function getWeatherAndForecast(city) {
    weatherResult.innerHTML = '<p style="text-align:center;opacity:.5;margin-top:1rem;">Loading...</p>';
    forecastSection.innerHTML = '';
 
    const units      = isMetric ? "metric" : "imperial";
    const unitSymbol = isMetric ? "°C" : "°F";
 
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}`
        );
 
        if (!response.ok) {
            weatherResult.innerHTML = response.status === 404
                ? `<p class="error"><i class="fa-solid fa-circle-exclamation"></i> City not found. Please try again.</p>`
                : `<p class="error">Something went wrong. Try again.</p>`;
            return;
        }
 
        const data = await response.json();
        const uvi  = await fetchUVI(data.coord.lat, data.coord.lon);
 
        applyWeatherTheme(data.weather[0].main);
        startAnimation(data.weather[0].main);
        renderWeather(data, uvi, unitSymbol);
        await getForecast(city, units, unitSymbol);
 
    } catch (error) {
        weatherResult.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}
 
function renderWeather(data, uvi, unitSymbol) {
    const speedUnit  = isMetric ? "m/s" : "mph";
    const sunrise    = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunset     = new Date(data.sys.sunset  * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) + " km" : "N/A";
    const icon       = getWeatherIcon(data.weather[0].main);
 
    weatherResult.innerHTML = `
        <div class="result-city">${data.name} <span>${data.sys.country}</span></div>
        <div class="result-main">
            <i class="fa-solid ${icon} result-weather-icon"></i>
            <span class="result-temp">${Math.round(data.main.temp)}${unitSymbol}</span>
        </div>
        <div class="result-desc">${data.weather[0].description}</div>
        <div class="attr-grid">
            <div class="attr-item">
                <i class="fa-solid fa-temperature-half"></i>
                <span class="attr-val">${Math.round(data.main.temp)}${unitSymbol}</span>
                <span class="attr-lbl">Temp</span>
            </div>
            <div class="attr-item">
                <i class="fa-solid fa-temperature-low"></i>
                <span class="attr-val">${Math.round(data.main.feels_like)}${unitSymbol}</span>
                <span class="attr-lbl">Feels Like</span>
            </div>
            <div class="attr-item">
                <i class="fa-solid fa-droplet"></i>
                <span class="attr-val">${data.main.humidity}%</span>
                <span class="attr-lbl">Humidity</span>
            </div>
            <div class="attr-item">
                <i class="fa-solid fa-wind"></i>
                <span class="attr-val">${data.wind.speed.toFixed(1)}</span>
                <span class="attr-lbl">${speedUnit}</span>
            </div>
            <div class="attr-item">
                <i class="fa-solid fa-eye"></i>
                <span class="attr-val">${visibility}</span>
                <span class="attr-lbl">Visibility</span>
            </div>
            <div class="attr-item">
                <i class="fa-solid fa-sun"></i>
                <span class="attr-val">${uvi}</span>
                <span class="attr-lbl">UV Index</span>
            </div>
            <div class="attr-item">
                <i class="fa-solid fa-arrow-up"></i>
                <span class="attr-val">${sunrise}</span>
                <span class="attr-lbl">Sunrise</span>
            </div>
            <div class="attr-item">
                <i class="fa-solid fa-arrow-down"></i>
                <span class="attr-val">${sunset}</span>
                <span class="attr-lbl">Sunset</span>
            </div>
        </div>
    `;
}
 
async function getForecast(city, units, unitSymbol) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&cnt=40`
        );
        if (!res.ok) return;
        const data = await res.json();
        renderForecast(data.list, unitSymbol);
    } catch (err) {
        console.error("Forecast error:", err);
    }
}
 
function renderForecast(list, unitSymbol) {
    const days = {};
    list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!days[date]) days[date] = [];
        days[date].push(item);
    });
 
    const dayKeys = Object.keys(days).slice(0, 5);
    let html = '<div class="forecast-row">';
 
    dayKeys.forEach(dateStr => {
        const items   = days[dateStr];
        const rep     = items.find(i => i.dt_txt.includes('12:00')) || items[0];
        const temps   = items.map(i => i.main.temp);
        const max     = Math.round(Math.max(...temps));
        const min     = Math.round(Math.min(...temps));
        const dayName = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
        const icon    = getWeatherIcon(rep.weather[0].main);
 
        html += `
            <div class="forecast-card">
                <div class="fc-day">${dayName}</div>
                <i class="fa-solid ${icon}"></i>
                <div class="fc-desc">${rep.weather[0].main}</div>
                <div class="fc-high">${max}${unitSymbol}</div>
                <div class="fc-low">${min}${unitSymbol}</div>
            </div>
        `;
    });
 
    html += '</div>';
    forecastSection.innerHTML = '<h3 class="forecast-title">5-Day Forecast</h3>' + html;
}
 
function getWeatherIcon(main) {
    const icons = {
        Clear: 'fa-sun', Clouds: 'fa-cloud',
        Rain: 'fa-cloud-rain', Drizzle: 'fa-cloud-rain',
        Thunderstorm: 'fa-cloud-bolt', Snow: 'fa-snowflake',
        Mist: 'fa-smog', Fog: 'fa-smog', Haze: 'fa-smog',
        Smoke: 'fa-smog', Dust: 'fa-wind', Sand: 'fa-wind',
        Ash: 'fa-smog', Squall: 'fa-wind', Tornado: 'fa-tornado'
    };
    return icons[main] || 'fa-cloud-sun';
}
 
const canvas = document.getElementById('weatherCanvas');
const ctx    = canvas.getContext('2d');
 
let animId         = null;
let particles      = [];
let lightningTimer = null;
let sunRotation    = 0;
 
function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
 
function stopAnimation() {
    if (animId)         { cancelAnimationFrame(animId); animId = null; }
    if (lightningTimer) { clearTimeout(lightningTimer); lightningTimer = null; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles   = [];
    sunRotation = 0;
    document.getElementById('lightningOverlay').style.opacity = '0';
}
 
function startAnimation(weatherMain) {
    stopAnimation();
    switch (weatherMain) {
        case 'Thunderstorm':
            initRain(200); animateRain(); scheduleLightning(); break;
        case 'Rain':
            initRain(150); animateRain(); break;
        case 'Drizzle':
            initRain(70, true); animateRain(); break;
        case 'Snow':
            initSnow(110); animateSnow(); break;
        case 'Clear':
            initClear(); animateClear(); break;
        case 'Clouds':
            initClouds(); animateClouds(); break;
        case 'Mist':
        case 'Fog':
        case 'Haze':
            initFog(); animateFog(); break;
        case 'Smoke':
        case 'Dust':
        case 'Sand':
        case 'Ash':
            initDust(); animateDust(); break;
        case 'Squall':
            initSquall(); animateSquall(); break;
        case 'Tornado':
            initTornado(); animateTornado(); break;
        default:
            break;
    }
}
 
function initRain(count, light = false) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            len:   light ? Math.random() * 8  + 4  : Math.random() * 18 + 10,
            speed: light ? Math.random() * 4  + 3  : Math.random() * 7  + 8,
            alpha: Math.random() * 0.8 + 0.15
        });
    }
}
 
function animateRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.len);
        ctx.strokeStyle = `rgba(120, 195, 255, ${p.alpha})`;
        ctx.stroke();
        p.y += p.speed;
        p.x -= 1;
        if (p.y > canvas.height) {
            p.y = -p.len;
            p.x = Math.random() * (canvas.width + 60);
        }
    });
    animId = requestAnimationFrame(animateRain);
}
 
function initSnow(count) {
    for (let i = 0; i < count*3; i++) {
        particles.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            r:     Math.random() * 8 + 0.8,
            speed: Math.random() * 1.2 + 0.3,
            drift: Math.random() * 0.8 - 0.4,
            alpha: Math.random() * 0.65 + 0.3
        });
    }
}
 
function animateSnow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 238, 255, ${p.alpha})`;
        ctx.fill();
        p.y += p.speed;
        p.x += p.drift*0.5;
        if (p.y > canvas.height) { p.y = -p.r; p.x = Math.random() * canvas.width; }
    });
    animId = requestAnimationFrame(animateSnow);
}
 
function initClear() {
    for (let i = 0; i < 40; i++) {
        particles.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            r:     Math.random() * 2 + 0.4,
            speed: Math.random() * 0.7 + 0.2,
            drift: Math.random() * 0.5 - 0.25,
            alpha: Math.random() * 0.45 + 0.12
        });
    }
}
 
function animateClear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    const sx = canvas.width  * 0.08;
    const sy = canvas.height * 0.15;
    const sr = Math.min(canvas.width, canvas.height) * 0.3;
 
    sunRotation += 0.004;
 
    const glow = ctx.createRadialGradient(sx, sy, sr * 0.1, sx, sy, sr * 3.8);
    glow.addColorStop(0,    'rgba(255, 185, 20, 0.32)');
    glow.addColorStop(0.35, 'rgba(255, 155, 10, 0.14)');
    glow.addColorStop(0.7,  'rgba(255, 120, 0,  0.05)');
    glow.addColorStop(1,    'rgba(255, 100, 0,  0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 3.8, 0, Math.PI * 2);
    ctx.fill();
 
    for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2 + sunRotation;
        const inner = sr * 1.2;
        const outer = sr * 2.2;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(angle) * inner, sy + Math.sin(angle) * inner);
        ctx.lineTo(sx + Math.cos(angle) * outer, sy + Math.sin(angle) * outer);
        ctx.strokeStyle = 'rgba(255, 174, 0, 0.2)';
        ctx.lineWidth = 20;
        ctx.stroke();
    }
 
    const sunCore = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sunCore.addColorStop(0,  'rgba(255, 191, 0, 0.93)');
    sunCore.addColorStop(0.6, 'rgba(235, 173, 15, 0.57)');
    sunCore.addColorStop(1,   'rgba(255, 166, 0, 0.04)');
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = sunCore;
    ctx.fill();
 
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r*2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 60, ${p.alpha})`;
        ctx.fill();
        p.y -= p.speed*0.7;
        p.x += p.drift*0.5;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
    });
 
    animId = requestAnimationFrame(animateClear);
}
 
function initClouds() {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x:     Math.random() * canvas.width,
            y:     30 + Math.random() * canvas.height * 0.9,
            scale: Math.random() * 5 + 0.8,
            speed: Math.random() * 0.25 + 0.08,
            alpha: Math.random() * 0.6 + 0.04
        });
    }
}
 
function drawCloud(x, y, scale, alpha) {
    ctx.fillStyle = `rgba(200, 220, 240, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x,              y,              33 * scale, 0, Math.PI * 2);
    ctx.arc(x + 28 * scale, y - 18 * scale, 24 * scale, 0, Math.PI * 2);
    ctx.arc(x + 56 * scale, y,              28 * scale, 0, Math.PI * 2);
    ctx.arc(x + 28 * scale, y + 12 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
}
 
function animateClouds() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        drawCloud(p.x, p.y, p.scale, p.alpha);
        p.x += p.speed;
        if (p.x > canvas.width + 200) {
            p.x = -220;
            p.y = 30 + Math.random() * canvas.height * 0.5;
        }
    });
    animId = requestAnimationFrame(animateClouds);
}
 
function initFog() {
    
    
    particles.push({
            x:     0.2* canvas.width,
            y:     (canvas.height * 0.9) + 300,
            scale: 15,
            speed: -0.1, 
            alpha: 0.6
        });

}
function drawFog(x, y, scale, alpha) {
    ctx.fillStyle = `rgba(200, 220, 240, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x -200 ,              y,              45 * scale, 0, Math.PI * 2);
    ctx.arc(x + 28 * scale, y - 18 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.arc(x + 56 * scale, y,              24 * scale, 0, Math.PI * 2);
    ctx.arc(x + 28 * scale, y + 12 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.fill();
}
function animateFog() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        drawFog(p.x, p.y, p.scale, p.alpha);
        p.x += p.speed;
        if (p.x > canvas.width + 200) {
            p.x = -220;
            p.y = 30 + Math.random() * canvas.height * 0.5;
        }
    });
    animId = requestAnimationFrame(animateFog);
}
 
function initDust() {
    for (let i = 0; i < 90; i++) {
        particles.push({
            x:      Math.random() * canvas.width,
            y:      Math.random() * canvas.height,
            r:      Math.random() * 7 + 0.4,
            speedX: Math.random() * 5 + 0.5,
            speedY: (Math.random() - 0.5) * 1,
            alpha:  Math.random() * 0.32 + 0.1
        });
    }
}
 
function animateDust() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215, 155, 60, ${p.alpha})`;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > canvas.width + 4) { p.x = -4; p.y = Math.random() * canvas.height; }
    });
    animId = requestAnimationFrame(animateDust);
}
 
function initSquall() {
    for (let i = 0; i < 70; i++) {
        particles.push({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            len:   Math.random() * 100 + 25,
            speed: Math.random() * 18 + 10,
            alpha: Math.random() * 0.9 + 0.08
        });
    }
}
 
function animateSquall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len, p.y + 3);
        ctx.strokeStyle = `rgba(150, 210, 255, ${p.alpha})`;
        ctx.stroke();
        p.x -= p.speed;
        if (p.x < -p.len) { p.x = canvas.width + p.len; p.y = Math.random() * canvas.height; }
    });
    animId = requestAnimationFrame(animateSquall);
}
 
function initTornado() {
    for (let i = 0; i < 130; i++) {
        particles.push({
            angle:  Math.random() * Math.PI * 2,
            radius: Math.random() * 200+ 10,
            y:      Math.random() * canvas.height,
            speed:  Math.random() * 0.06 + 0.025,
            r:      Math.random() * 10 + 0.5,
            alpha:  Math.random() * 0.95 + 0.04
        });
    }
}
 
function animateTornado() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    particles.forEach(p => {
        p.angle += p.speed;
        const progress = canvas.height / p.y;
        const r = p.radius * (0.15 + progress * 0.85);
        const x = cx + Math.cos(p.angle) * r;
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 238, 255, ${p.alpha})`;
        ctx.fill();
        p.y += 1.2;
        if (p.y > canvas.height) p.y = 0;
    });
    animId = requestAnimationFrame(animateTornado);
}
 
function scheduleLightning() {
    const delay = Math.random() * 3500 + 1200;
    lightningTimer = setTimeout(() => {
        flashLightning();
        scheduleLightning();
    }, delay);
}
 
function flashLightning() {
    const ov = document.getElementById('lightningOverlay');
    ov.style.transition = 'none';
    ov.style.opacity = '0.65';
    setTimeout(() => {
        ov.style.transition = 'opacity 0.1s';
        ov.style.opacity = '0';
        setTimeout(() => {
            ov.style.transition = 'none';
            ov.style.opacity = '0.35';
            setTimeout(() => {
                ov.style.transition = 'opacity 0.3s';
                ov.style.opacity = '0';
            }, 60);
        }, 100);
    }, 60);
}
 
async function loadCityCard(city, card) {
    const units      = isMetric ? "metric" : "imperial";
    const unitSymbol = isMetric ? "°C" : "°F";
 
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}`
        );
        if (!res.ok) { card.innerHTML = `<span class="error">Could not load</span>`; return; }
        const data = await res.json();
        card.innerHTML = `
            <div class="card-left">
                <div class="card-city">${data.name}</div>
                <div class="card-desc">${data.weather[0].description}</div>
            </div>
            <div class="card-temp">${Math.round(data.main.temp)}${unitSymbol}</div>
        `;
    } catch {
        card.innerHTML = `<span class="error">Error</span>`;
    }
}
 
function loadDefaultCities() {
    cityCardsGrid.innerHTML = '';
    getRandomCities().forEach(city => {
        const card = document.createElement('div');
        card.classList.add('city-card');
        card.textContent = 'Loading...';
        card.addEventListener('click', () => {
            cityInput.value = city;
            getWeatherAndForecast(city);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        cityCardsGrid.appendChild(card);
        loadCityCard(city, card);
    });
}
 
loadDefaultCities();
 