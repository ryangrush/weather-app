import './App.css';
import axios from 'axios';
import React, { Component } from 'react';

class App extends Component {
  state = {
    weather: ''
  }

  componentDidMount() {
    axios.get(`${process.env.REACT_APP_LAMBDA_URL}/weather?city=tulsa`)
    // axios.get('https://cisydiuhok.execute-api.us-east-1.amazonaws.com/call/weather?city=tulsa')
      .then((res) => {
        const weather = res.data;
        weather.main.temp_fahrenheit = Math.round((weather.main.temp - 273.15) * 1.8 + 32);

        this.setState({ weather });
      })
  }

  render() {
    if (!this.state.weather.weather) {
      return <span>Loading...</span>;
    }

    return (
      <div class="temp-wrapper">
        <div class="temp">
          <div class="temp-city">Tulsa, OK</div>
          
          <div class="temp-main">
            <div class="temp-left">
              <div>
                <span class="temp-fahrenheit">{this.state.weather.main.temp_fahrenheit}</span>
                <span class="temp-degree">&#x2109;</span>
              </div>
              <div class="temp-description">
                <span>{this.state.weather.weather[0].description}</span>
              </div>
            </div>
            <hr width="1" size="100" />
            <div class="temp-right">
              <span><img src={`http://openweathermap.org/img/wn/${this.state.weather.weather[0].icon}@4x.png`} alt="weather icon" /></span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;