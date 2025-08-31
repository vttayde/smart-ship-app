import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read the manifest file
    const fs = await import('fs');
    const path = await import('path');

    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');

    return new NextResponse(manifestContent, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Manifest not found',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 404 }
    );
  }
}
