document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "18f723e11f065066628a92e4c28a0de7"; 
  const defaultCity = "Ghaziabad"; 
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${defaultCity}&appid=${API_KEY}&units=metric`;

  // Fetch weather data for default city on page load
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      updateWeatherCard(data);
    })
    .catch(error => {
      console.error("Error fetching weather data:", error);
      document.getElementById("weatherDescription").textContent = "Unable to fetch weather details.";
    });

  // Handle search button click
  const searchBtn = document.querySelector(".btn-outline-dark");
  const searchInput = document.querySelector(".form-control");

  searchBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const city = searchInput.value.trim();
    if (city) {
      const searchUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
      fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          updateWeatherCard(data);
        })
        .catch(error => {
          console.error("Error fetching weather data:", error);
          document.getElementById("weatherDescription").textContent = "City not found.";
        });
    } else {
      alert("Please enter a city name.");
    }
  });

  // Current Location Button
  const currentLocationBtn = document.getElementById("currentLocationBtn");

  currentLocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeatherByLocation(position.coords.latitude, position.coords.longitude),
        () => alert("Unable to access location.")
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });

  // Function to fetch weather by location
  function fetchWeatherByLocation(latitude, longitude) {
    const locationUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    fetch(locationUrl)
      .then(response => response.json())
      .then(data => {
        updateWeatherCard(data);
      })
      .catch(error => {
        console.error("Error fetching weather data:", error);
        document.getElementById("weatherDescription").textContent = "Unable to fetch weather data for your location.";
      });
  }

  // Function to update the weather card
  function updateWeatherCard(data) {
    const weatherImage = document.getElementById("weatherImage");
    const weatherTitle = document.getElementById("weatherTitle");
    const weatherDescription = document.getElementById("weatherDescription");
    const humidity = document.getElementById("humidity");
    const pressure = document.getElementById("pressure");
    const minTemp = document.getElementById("minTemp");
    const maxTemp = document.getElementById("maxTemp");
    const sunrise = document.getElementById("sunrise");
    const sunset = document.getElementById("sunset");
    const temp = document.getElementById('temp')
    const windSpeed = document.getElementById('windSpeed')
  

    // Extracting data safely using optional chaining
    const weatherMain = data.weather[0]?.main || "N/A"; 
    const weathertemp = data.main?.temp || "N/A"; 
    const weatherDescriptionText = data.weather[0]?.description || "N/A"; 
    const weatherHumidity = data.main?.humidity || "N/A"; 
    const weatherPressure = data.main?.pressure || "N/A"; 
    const weatherMinTemp = data.main?.temp_min || "N/A"; 
    const weatherMaxTemp = data.main?.temp_max || "N/A"; 
    const weatherSunrise = new Date(data.sys?.sunrise * 1000).toLocaleTimeString() || "N/A"; 
    const weatherSunset = new Date(data.sys?.sunset * 1000).toLocaleTimeString() || "N/A"; 

    // Update UI
    weatherTitle.textContent = `${data.name}, ${data.sys?.country}`;
    weatherDescription.textContent = `It's currently ${weatherDescriptionText.toLowerCase()} in your location.`;

    if (weatherMain === "Rain") {
      weatherImage.src = "images/Rain.jpg"; 
    } else if (weatherMain === "Clear") {
      weatherImage.src = "images/Clear.jpg"; 
    } else if (weatherMain === "Haze") {
      weatherImage.src = "images/haze.jpg"; 
    } else {
      weatherImage.src = "images/other.jpg"; 
    }

  

    humidity.textContent = `${weatherHumidity}%`;
    pressure.textContent = `${weatherPressure} hPa`;
    minTemp.textContent = `${weatherMinTemp+1.5} °C`;
    maxTemp.textContent = `${weatherMaxTemp} °C`;
    sunrise.textContent = weatherSunrise;
    sunset.textContent = weatherSunset;
    temp.textContent=`${weathertemp} °C`
  }
});

let forecastChart; // Declare the chart instance globally

const forecastModal = document.getElementById('forecastModal');

// Fetch forecast data
function fetchWeatherForecast(city) {
  const apiKey = "18f723e11f065066628a92e4c28a0de7";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  // Fetch the weather data
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const forecast = data.list.slice(0, 5); // Get the first 5 forecast entries
      let forecastContent = '';
      const labels = [];
      const temps = [];
      const iconUrl = 'https://openweathermap.org/img/wn/';

      forecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        const temp = item.main.temp;
        const description = item.weather[0].description;
        const icon = item.weather[0].icon;

        labels.push(date.toLocaleString());
        temps.push(temp);

        forecastContent += `
          <div class="forecast-card">
            <div class="d-flex justify-content-between align-items-center">
              <h6>${date.toLocaleString()}</h6>
              <img src="${iconUrl}${icon}@2x.png" alt="${description}" width="40" height="40">
            </div>
            <p class="temp">${temp}°C</p>
            <p class="description">${description}</p>
          </div>
        `;
      });

      const cityNameElement = document.getElementById('cityName');
      cityNameElement.textContent = `${city} Weather Forecast`;

      const forecastDetails = document.getElementById('forecastDetails');
      forecastDetails.innerHTML = forecastContent;

      // Destroy the existing chart if it exists
      if (forecastChart) {
        forecastChart.destroy();
      }

      // Create a new chart
      const ctx = document.getElementById('forecastChart').getContext('2d');
      forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Temperature (°C)',
            data: temps,
            borderColor: '#4bc0c0',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date & Time'
              },
              ticks: {
                maxRotation: 0,
              }
            },
            y: {
              title: {
                display: true,
                text: 'Temp (°C)'
              },
              min: Math.min(...temps) - 2,
              max: Math.max(...temps) + 2
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 20,
              }
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return tooltipItem.raw + '°C';
                }
              }
            }
          }
        }
      });
    })
    .catch(error => {
      const forecastDetails = document.getElementById('forecastDetails');
      forecastDetails.innerHTML = "Error fetching forecast data.";
      console.error("Error fetching forecast:", error);
    });
}

forecastModal.addEventListener('show.bs.modal', function (event) {
  const city = document.getElementById('weatherTitle').textContent.split(',')[0];
  fetchWeatherForecast(city);
});
