import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createExportPackage } from '@/lib/data-transfer';

/**
 * POST /api/admin/data-transfer/export
 * 
 * Creates an export package with all data from the database.
 * Returns a transfer code and secret key for downloading.
 */
export async function POST() {
  try {
    const session = await auth();
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    // Get source domain from environment or default
    const source = process.env.NEXT_PUBLIC_SITE_URL || 'localhost';
    
    // Create export package
    const result = await createExportPackage(
      session.user.id as string,
      source
    );
    
    return NextResponse.json({
      success: true,
      code: result.code,
      secretKey: result.secretKey,
      expiresAt: result.expiresAt.toISOString(),
      fileName: `habernexus-export-${result.code.slice(0, 8)}.enc`,
      metadata: {
        tablesCount: result.package.metadata.tablesCount,
        recordsCount: result.package.metadata.recordsCount,
        createdAt: result.package.createdAt,
        source: result.package.source,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Veri aktarımı oluşturulamadı' },
      { status: 500 }
    );
  }
}
