import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTransferStatus } from '@/lib/data-transfer';

/**
 * GET /api/admin/data-transfer/status/[code]
 * 
 * Gets the status of a data transfer.
 */
export async function GET(
  _request: Request,
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
    
    const status = await getTransferStatus(code);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Aktarım bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Durum kontrol edilemedi' },
      { status: 500 }
    );
  }
}
