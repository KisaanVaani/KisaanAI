import { describe, it, expect } from 'vitest';
import { textToSpeech, speechToText } from '../src/lib/sarvam';

describe('Sarvam AI Integration', () => {
  describe('textToSpeech', () => {
    it('should return null when API key is missing', async () => {
      const result = await textToSpeech('Test text');
      expect(result).toBeNull();
    });
  });

  describe('speechToText', () => {
    it('should accept audio blob input', async () => {
      const audioBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      const result = await speechToText(audioBlob);
      expect(result).toBeDefined();
    });

    it('should accept string input', async () => {
      const result = await speechToText('base64-audio-string');
      expect(result).toBeDefined();
    });

    it('should return transcribed text', async () => {
      const result = await speechToText('audio-data');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
