import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dataSources from '../src/lib/data-sources';
import { getContextualPrompt } from '../src/lib/orchestrator';

vi.mock('../src/lib/data-sources');

describe('Orchestrator Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataSources.getFarmerContext).mockResolvedValue({
      id: 'farmer-001',
      name: 'Rajesh',
      location: 'Pune, Maharashtra',
      soilHealth: 'Nitrogen deficient, pH 6.8',
      landSize: '2 Hectares',
      farmingLanguage: 'hi-IN'
    });

    vi.mocked(dataSources.getWeatherForecast).mockResolvedValue({
      summary: 'Light rainfall expected in 48 hours',
      temperature: '28°C',
      humidity: '80%'
    });

    vi.mocked(dataSources.getMarketPrices).mockResolvedValue({
      msp: '₹7,000/qtl',
      currentMarket: '₹7,300/qtl',
      trend: 'Rising'
    });

    vi.mocked(dataSources.getCropCalendar).mockResolvedValue({
      crop: 'Arhar Dal',
      season: 'Kharif',
      recommendation: 'Ideal sowing window. Treat seeds with Rhizobium.'
    });
  });

  describe('getContextualPrompt', () => {
    it('should generate contextual prompt with all data sources', async () => {
      const prompt = await getContextualPrompt('farmer-001', 'What should I do today?');
      
      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('should include farmer name in prompt', async () => {
      const prompt = await getContextualPrompt('farmer-001', 'What should I do today?');
      
      expect(prompt).toContain('Rajesh');
    });

    it('should include location context', async () => {
      const prompt = await getContextualPrompt('farmer-001', 'What should I do today?');
      
      expect(prompt).toContain('Pune, Maharashtra');
    });

    it('should include weather forecast', async () => {
      const prompt = await getContextualPrompt('farmer-001', 'What should I do today?');
      
      expect(prompt).toContain('Light rainfall');
    });

    it('should include market prices', async () => {
      const prompt = await getContextualPrompt('farmer-001', 'What should I do today?');
      
      expect(prompt).toContain('₹7,000/qtl');
    });

    it('should include crop calendar information', async () => {
      const prompt = await getContextualPrompt('farmer-001', 'What should I do today?');
      
      expect(prompt).toContain('Arhar Dal');
    });

    it('should call all data sources exactly once', async () => {
      await getContextualPrompt('farmer-001', 'What should I do today?');
      
      expect(dataSources.getFarmerContext).toHaveBeenCalledTimes(1);
      expect(dataSources.getWeatherForecast).toHaveBeenCalledTimes(1);
      expect(dataSources.getMarketPrices).toHaveBeenCalledTimes(1);
      expect(dataSources.getCropCalendar).toHaveBeenCalledTimes(1);
    });
  });
});
