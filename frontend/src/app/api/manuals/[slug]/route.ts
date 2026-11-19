import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = (slug || '').toLowerCase();

  const isQuickGuide = cleanSlug.includes('quick') || cleanSlug.includes('setup') || cleanSlug.includes('qsg');

  const fileName = isQuickGuide
    ? 'Butterfly TV Quick Setup Guide.pdf'
    : 'Butterfly Smart LED TV - User Manual.pdf';

  const downloadName = isQuickGuide
    ? 'Butterfly-TV-Quick-Setup-Guide.pdf'
    : 'Butterfly-Smart-LED-TV-User-Manual.pdf';

  const filePath = path.join(process.cwd(), 'public', 'manuals', fileName);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Manual PDF not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${downloadName}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
