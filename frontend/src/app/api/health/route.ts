import { NextResponse } from 'next/server';

function isConfigured(value?: string): boolean {
  if (!value) return false;
  const v = value.trim();
  if (!v) return false;
  if (v.includes('your_')) return false;
  return true;
}

function maskSecret(value?: string): string {
  if (!value) return 'not_set';
  const v = value.trim();
  if (!v) return 'not_set';
  if (v.length <= 8) return 'configured';
  return `${v.slice(0, 4)}...${v.slice(-4)}`;
}

export async function GET() {
  const checks = {
    required: {
      MISTRAL_API_KEY: {
        configured: isConfigured(process.env.MISTRAL_API_KEY),
        preview: maskSecret(process.env.MISTRAL_API_KEY),
      },
    },
    optional: {
      SARVAM_API_KEY: {
        configured: isConfigured(process.env.SARVAM_API_KEY),
        preview: maskSecret(process.env.SARVAM_API_KEY),
      },
      DATABASE_URL: {
        configured: isConfigured(process.env.DATABASE_URL),
        preview: process.env.DATABASE_URL ? 'configured' : 'not_set',
      },
      WEATHER_API_KEY: {
        configured: isConfigured(process.env.WEATHER_API_KEY),
        preview: maskSecret(process.env.WEATHER_API_KEY),
      },
      TOMORROW_IO_API_KEY: {
        configured: isConfigured(process.env.TOMORROW_IO_API_KEY),
        preview: maskSecret(process.env.TOMORROW_IO_API_KEY),
      },
      OPEN_METEO_ENABLED: {
        configured: (process.env.OPEN_METEO_ENABLED || '').toLowerCase() === 'true',
        preview: process.env.OPEN_METEO_ENABLED || 'not_set',
      },
    },
  };

  const missingRequired = Object.entries(checks.required)
    .filter(([, value]) => !value.configured)
    .map(([key]) => key);

  const ready = missingRequired.length === 0;

  return NextResponse.json(
    {
      ok: ready,
      service: 'kisaanai-frontend-api',
      timestamp: new Date().toISOString(),
      ready,
      missingRequired,
      checks,
    },
    { status: ready ? 200 : 503 }
  );
}
