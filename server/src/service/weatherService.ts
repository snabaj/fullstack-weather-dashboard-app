import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  temp: number;
  description: string;
  icon: string;
  date: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  forecast: Weather[];

  constructor(city: string, temp: number, description: string, icon: string, date: string, feelsLike: number, humidity: number, windSpeed: number, forecast: Weather[],) {
    this.city = city;
    this.temp = temp;
    this.description = description;
    this.icon = icon;
    this.date = date;
    this.feelsLike = feelsLike;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.forecast = forecast;
}
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private cityName?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(`${this.baseURL}/geo/1.0/direct?q=${query}&appid=${this.apiKey}`);
      if (!response.ok) throw new Error('Error fetching location data');
      const data = await response.json();
      return data[0]; // Assuming the first result is most relevant
    } catch (error) {
      console.log('Error in fetchLocationData:', error);
      throw error;
    }
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private async buildGeocodeQuery(): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`);
      if (!response.ok) throw new Error('Error fetching geocode data');
      const data = await response.json();
  
      // Assuming the first result is most relevant
      if (data.length === 0) throw new Error('No geocode data found for the city');
      return `${data[0].lat},${data[0].lon}`; // Return as a "lat,lon" string
    } catch (error) {
      console.log('Error in buildGeocodeQuery:', error);
      throw error; // Re-throw error to let caller handle it
    }
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
      return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {//fetch and destructure location data
    this.cityName = city;//set city name
    const locationData = await this.fetchLocationData(city);//fetch location data
    const geocodeQuery = await this.buildGeocodeQuery();//build geocode query
    const [lat, lon] = geocodeQuery.split(',').map(Number);//destructure geocode query
    return { lat, lon };
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    try {
      const response = await fetch(weatherQuery);
      if (!response.ok) throw new Error('Error fetching weather data');
      return await response.json();
    } catch (error) {
      console.log('Error in fetchWeatherData:', error);
      throw error;
    }
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const weather = response.weather[0] || {};
    return new Weather(
      response.name || 'Unknown',
      response.main.temp || 0,
      weather.description || 'Unknown',
      weather.icon || '',
      new Date(response.dt * 1000).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }),
      response.main?.feels_like || 0,
      response.main?.humidity || 0,
      response.wind?.speed || 0,
      [] // Placeholder for forecast data
    );
  }

  // TODO: Complete buildForecastArray method
  // Convert the date to a human-readable format in a format like 12/31/2021 and no time displayed
  //filter out duplicate days so that you dont have 40+ days displaying

    private buildForecastArray(forecastData: any[]) {
      const uniqueDates = new Set<string>(); // To store unique dates
      const forecast = forecastData
        .filter((data) => {
          const date = new Date(data.dt * 1000);
          const today = new Date();
          return date.getDate() !== today.getDate(); //ensures only future dates are displayed
        })
        .map((data) => {
          const formattedDate = new Date(data.dt * 1000).toLocaleDateString('en-US', { //formats the date as mm/dd/yyyy
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
          });

          if (uniqueDates.has(formattedDate)) { //checks for duplicate dates
            return null; // Skip duplicates
          }
          uniqueDates.add(formattedDate); // Add the date to the set
          const weather = data.weather[0] || {}; // Get the first weather object
          return new Weather(
            this.cityName || 'Unknown',
            data.main.temp || 0,
            weather.description || 'Unknown',
            weather.icon || '',
            formattedDate,
            data.main?.feels_like || 0,
            data.main?.humidity || 0,
            data.wind?.speed || 0,
            []
          );
        })
        .filter((item) => item !== null); // Remove null entries
      return forecast.slice(0, 5); // Limit the result to 5 unique days
    }



  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);

    const forecastQuery = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
    const forecastResponse = await fetch(forecastQuery);
    const forecastData = await forecastResponse.json();

    currentWeather.forecast = this.buildForecastArray(forecastData.list);
    return currentWeather;
}
}

export default new WeatherService();
