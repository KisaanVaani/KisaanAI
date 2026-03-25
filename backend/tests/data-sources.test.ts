import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFarmerContext, getWeatherForecast, getMarketPrices, getCropCalendar } from '../src/lib/data-sources';

describe('Data Sources', () => {
  describe('getFarmerContext', () => {
    it('should return farmer profile with all required fields', async () => {
      const profile = await getFarmerContext('farmer-001');
      
      expect(profile).toBeDefined();
      expect(profile.id).toBe('farmer-001');
      expect(profile.name).toBe('Rajesh');
      expect(profile.location).toBe('Pune, Maharashtra');
      expect(profile.soilHealth).toBe('Nitrogen deficient, pH 6.8');
      expect(profile.landSize).toBe('2 Hectares');
      expect(profile.farmingLanguage).toBe('hi-IN');
    });

    it('should return consistent data for same farmerId', async () => {
      const profile1 = await getFarmerContext('farmer-001');
      const profile2 = await getFarmerContext('farmer-001');
      
      expect(profile1).toEqual(profile2);
    });
  });

  describe('getWeatherForecast', () => {
    it('should return weather data with forecast summary', async () => {
      const weather = await getWeatherForecast('Pune, Maharashtra');
      
      expect(weather).toBeDefined();
      expect(weather.summary).toBeDefined();
      expect(typeof weather.summary).toBe('string');
      expect(weather.summary.length).toBeGreaterThan(0);
    });

    it('should include temperature and humidity', async () => {
      const weather = await getWeatherForecast('Pune, Maharashtra');
      
      expect(weather.temperature).toBeDefined();
      expect(weather.humidity).toBeDefined();
      expect(weather.temperature).toMatch(/\d+°C/);
      expect(weather.humidity).toMatch(/\d+%/);
    });
  });

  describe('getMarketPrices', () => {
    it('should return market data for known crops', async () => {
      const prices = await getMarketPrices('Arhar Dal', 'Pune');
      
      expect(prices).toBeDefined();
      expect(prices.msp).toBeDefined();
      expect(prices.currentMarket).toBeDefined();
      expect(prices.trend).toBeDefined();
    });

    it('should return default data for unknown crops', async () => {
      const prices = await getMarketPrices('UnknownCrop123', 'Pune');
      
      expect(prices.msp).toBe('N/A');
      expect(prices.currentMarket).toBe('N/A');
    });

    it('should distinguish between MSP and market price', async () => {
      const prices = await getMarketPrices('Soyabean', 'Pune');
      
      expect(prices.msp).toContain('₹');
      expect(prices.currentMarket).toContain('₹');
      // MSP and market price can differ
    });
  });

  describe('getCropCalendar', () => {
    it('should return crop calendar with recommendation', async () => {
      const calendar = await getCropCalendar('Arhar Dal', 'Kharif');
      
      expect(calendar).toBeDefined();
      expect(calendar.crop).toBe('Arhar Dal');
      expect(calendar.season).toBe('Kharif');
      expect(calendar.recommendation).toBeDefined();
    });

    it('should provide actionable advice', async () => {
      const calendar = await getCropCalendar('Arhar Dal', 'Kharif');
      
      expect(typeof calendar.recommendation).toBe('string');
      expect(calendar.recommendation.length).toBeGreaterThan(10);
    });
  });

  describe('Data Sources Performance', () => {
    it('should fetch all data sources within reasonable time', async () => {
      const startTime = Date.now();
      
      await Promise.all([
        getFarmerContext('farmer-001'),
        getWeatherForecast('Pune'),
        getMarketPrices('Arhar Dal', 'Pune'),
        getCropCalendar('Arhar Dal', 'Kharif')
      ]);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
