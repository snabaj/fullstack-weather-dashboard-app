import { Router } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import historyService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';
import weatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/weather', async (req, res) => {
  const { city } = req.body;
// TODO: GET weather data from city name
try {
  const weatherData = await weatherService.getWeatherForCity(city);
  // TODO: save city to search history
  await historyService.addCity(city);
  res.json(weatherData);
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server Error' });
}
});


// TODO: GET search history
router.get('/history', async (req, res) => {
  try {
    const cities = await historyService.getCities();
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await historyService.removeCity(id);
    res.json({ message: 'City removed from history' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
