import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL not found',
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE')),
      });
    }

    // Parse the URL to check its format
    let urlParts;
    try {
      urlParts = new URL(dbUrl);
    } catch (e) {
      return NextResponse.json({
        error: 'Invalid URL format',
        dbUrl: dbUrl,
        parseError: e instanceof Error ? e.message : String(e),
      });
    }

    return NextResponse.json({
      status: 'URL Analysis',
      protocol: urlParts.protocol,
      hostname: urlParts.hostname,
      pathname: urlParts.pathname,
      searchParams: urlParts.searchParams.toString(),
      isValidPostgres: urlParts.protocol === 'postgresql:',
      fullUrl: dbUrl,
      urlLength: dbUrl.length,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
