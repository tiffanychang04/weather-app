import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './App.css';
import backgroundImage from './bluesky.jpg'; // Import the background image
import searchIcon from './searchicon.png';  // Import the search icon
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L from 'leaflet';


function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [city, setCity] = useState("Philadelphia");  // Default city
  const [searchCity, setSearchCity] = useState("");  // City entered by user
  const [isSearching, setIsSearching] = useState(false);  // Toggle search input

  // Fetch weather data for current and forecast
  const fetchWeatherData = async (city) => {
    const apiKey = "86d08b8d9e5fb65b20fb99c7c8e86e27";  // Replace with your OpenWeatherMap API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
    const apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(apiUrl),
        axios.get(apiForecastUrl)
      ]);

      setWeatherData(weatherResponse.data);
      setHourlyData(forecastResponse.data.list.slice(0, 8));  // Get the next 8 periods (3-hour intervals)

    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  // Handle user submitting a new city
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity) {
      setCity(searchCity);
      setIsSearching(false);  // Close the search bar after submitting
    }
  };

  // Function to convert UTC time to the local timezone of the weather location
  const convertToLocalTime = (utcSeconds, timezoneOffset) => {
    const localTime = new Date((utcSeconds + timezoneOffset) * 1000);
    return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mapping weather description to Icons8 icons
  const getWeatherIcon = (description) => {
    if (description.includes("clear")) return "https://img.icons8.com/ios-glyphs/300/ffffff/sun--v1.png";
    if (description.includes("clouds")) return "https://img.icons8.com/ios-glyphs/300/ffffff/partly-cloudy-day--v1.png";
    if (description.includes("rain")) return "https://img.icons8.com/ios-glyphs/300/ffffff/partly-cloudy-rain--v1.png";
    if (description.includes("storm")) return "https://img.icons8.com/ios-glyphs/300/ffffff/chance-of-storm.png";
    if (description.includes("fog")) return "https://img.icons8.com/ios-glyphs/300/ffffff/fog-day.png";
    if (description.includes("sunrise")) return "https://img.icons8.com/ios-glyphs/300/ffffff/sunrise.png";
    if (description.includes("sunset")) return "https://img.icons8.com/ios-glyphs/300/ffffff/sunset.png";
    return "https://img.icons8.com/ios-glyphs/300/ffffff/sun--v1.png";  // Default: sunny icon
  };

  if (!weatherData) return <div>Loading...</div>;

  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const description = weatherData.weather[0].description;
  const weatherIcon = getWeatherIcon(description);  // Get the correct weather icon
  const location = weatherData.name;
  const timezoneOffset = weatherData.timezone;  // Get the timezone offset in seconds from UTC

  // Get sunrise and sunset times in local time
  const sunriseTime = convertToLocalTime(weatherData.sys.sunrise, 0);
  const sunsetTime = convertToLocalTime(weatherData.sys.sunset, 0);

  return (
    <div className="weather-app">
      <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }}></div>

      {/* Location and Search Icon */}
      <div className="location-header">
        <h1>{location}</h1>
        <img
          src={searchIcon}
          alt="search"
          className="search-icon"
          onClick={() => setIsSearching(!isSearching)}  // Toggle the search input
        />
      </div>

      {/* Search input */}
      {isSearching && (
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Enter city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      )}

      {/* Weather Header */}
      <div className="weather-header">
        <div className="weather-info">
          <img src={weatherIcon} alt={description} className="weather-icon" />
          <div className="temperature-info">
            <h2>{temp}°F</h2>
            <p>Feels like {feelsLike}°F</p>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="hourly-forecast">
        <h2>HOURLY FORECAST</h2>
        <hr className="divider" />
        {hourlyData.map((hour, index) => {
          const temp = Math.round(hour.main.temp);
          const timeWidth = 80; // Width of the time element (fixed at 80px)
          const leftPosition = timeWidth; // Start the line after the time
          const lineWidth = (temp - 40) * 3.5; // Calculate the width dynamically based on temperature
          
          return (
            <div className="hourly-item" key={index}>
              <p className="time">
                {convertToLocalTime(new Date(hour.dt_txt).getTime() / 1000, timezoneOffset)}
              </p>
              
              {/* Horizontal line between time and temp */}
              <div
                className="line"
                style={{
                  position: 'absolute',
                  left: `${leftPosition}px`, // Line starts after the time element
                  top: '50%', // Center the line vertically
                  width: `${lineWidth}px`, // Dynamic line width based on temperature
                  height: '1.5px',
                  backgroundColor: 'white',
                  opacity: 0.5,
                }}
              ></div>

              <p
                className="temp"
                style={{
                  position: 'absolute',
                  left: `${leftPosition + lineWidth+7}px`, // Position the temp relative to the line
                }}
              >
                {temp}°F
              </p>

              <img
                src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                alt={hour.weather[0].description}
                className="hourly-weather-icon"
              />
            </div>
          );
        })}

      </div>


      {/* Two side-by-side panels */}
      <div className="info-panels">
        {/* Precipitation Panel */}
        <div className="precipitation-panel">
          <h2>PRECIPITATION MAP</h2>
          <hr />  {/* Horizontal bar under the header */}
          {/* Precipitation Map using Leaflet.js */}
          <MapContainer center={[weatherData.coord.lat, weatherData.coord.lon]} zoom={10} style={{ height: "150px", width: "100%" }}>
            <TileLayer
              url={`https://tile.openweathermap.org/map/precipitation_new/2/1/1.png?appid=86d08b8d9e5fb65b20fb99c7c8e86e27`}  // OpenWeatherMap precipitation layer
            />
            <Marker position={[weatherData.coord.lat, weatherData.coord.lon]}>
              <Popup>{weatherData.name}</Popup>
            </Marker>

            {/* Marker with city name label */}
            <Marker 
              position={[weatherData.coord.lat, weatherData.coord.lon]}
              icon={L.divIcon({
                className: 'city-label',
                html: `<div>${weatherData.name}</div>`,  // Dynamically use weatherData.name if needed
                iconAnchor: [37, 60],  // Adjust anchor point to position the label correctly
              })}
            />
          </MapContainer>
        </div>

        {/* Sunrise/Sunset Panel */}
        <div className="sunrise-sunset-panel">
          <h2>SUNRISE & SUNSET</h2>
          <hr /> {/* Horizontal bar under the header */}
          <div className="sun-times">
            <div className="sunrise-time">
              <img
                src="https://img.icons8.com/ios-glyphs/500/ffffff/sunrise.png"
                alt="sunrise icon"
                className="sun-icon"
              />
              <p>
                <span>Sunrise:</span> <br />
                <span className="bold-time">{sunriseTime}</span>
              </p>
            </div>
            <div className="sunset-time">
              <img
                src="https://img.icons8.com/ios-glyphs/500/ffffff/sunset.png"
                alt="sunset icon"
                className="sun-icon"
              />
              <p>
                <span>Sunset:</span> <br />
                <span className="bold-time">{sunsetTime}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;