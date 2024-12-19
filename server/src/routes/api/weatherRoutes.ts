import { Router } from 'express';
const router = Router();

// import HistoryService from '../../service/historyService.js';
import historyService from '../../service/historyService.js';
// import WeatherService from '../../service/weatherService.js';
import weatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { city } = req.body;
  console.log(req.body);
  if (!city || typeof city !== 'string') {
    return res.status(400).json({ message: 'City name is required' });
  }
  try {
    const weatherData = await weatherService.getWeatherForCity(city);
    await historyService.addCity(city);
    return res.json(weatherData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

// TODO: GET weather data from city name
router.get('/weather', async (req, res) => {
  const { city } = req.query;
  if (!city || typeof city !== 'string') {
    return res.status(400).json({ message: 'City name is required' });
  }
  try {
    const weatherData = await weatherService.getWeatherForCity(city);
    return res.json(weatherData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});


//TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    const cities = await historyService.getCities();
    res.json(cities);
  } catch (error) {
    console.log(error);
   res.status(500).json({ message: 'Server Error' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'City ID is required' });
  }
  try {
    await historyService.removeCity(id);
    return res.status(204).send(); 
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
