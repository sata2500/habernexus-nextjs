import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createExportPackage } from '@/lib/data-transfer';
import { encryptData, verifySecretKey } from '@/lib/data-transfer/encryption';

/**
 * GET /api/admin/data-transfer/download/[code]
 * 
 * Downloads the encrypted export package.
 * Requires the secret key as a query parameter.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    const { code } = await params;
    const secretKey = request.nextUrl.searchParams.get('key');
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Şifreleme anahtarı gerekli' },
        { status: 400 }
      );
    }
    
    // Find transfer record
    const transfer = await prisma.dataTransfer.findUnique({
      where: { code },
    });
    
    if (!transfer) {
      return NextResponse.json(
        { error: 'Geçersiz aktarım kodu' },
        { status: 404 }
      );
    }
    
    // Check if expired
    if (new Date() > transfer.expiresAt) {
      return NextResponse.json(
        { error: 'Aktarım kodunun süresi dolmuş' },
        { status: 410 }
      );
    }
    
    // Check if already used
    if (transfer.status === 'used') {
      return NextResponse.json(
        { error: 'Bu aktarım kodu zaten kullanılmış' },
        { status: 410 }
      );
    }
    
    // Verify secret key
    if (!verifySecretKey(secretKey, transfer.secretKey)) {
      return NextResponse.json(
        { error: 'Geçersiz şifreleme anahtarı' },
        { status: 401 }
      );
    }
    
    // Re-create export package with current data
    const source = process.env.NEXT_PUBLIC_SITE_URL || 'localhost';
    const result = await createExportPackage(
      session.user.id as string,
      source
    );
    
    // Encrypt with the original secret key
    const encryptedData = await encryptData(
      JSON.stringify(result.package),
      secretKey
    );
    
    // Return as downloadable file
    const fileName = transfer.fileName || `habernexus-export-${code.slice(0, 8)}.enc`;
    
    return new NextResponse(encryptedData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': Buffer.byteLength(encryptedData, 'utf-8').toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Dosya indirilemedi' },
      { status: 500 }
    );
  }
}
