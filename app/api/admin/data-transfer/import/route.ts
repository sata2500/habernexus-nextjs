import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  decryptAndValidatePackage,
  importDataFromPackage,
  verifySecretKey,
} from '@/lib/data-transfer';
import { markTransferAsUsed } from '@/lib/data-transfer/export';

/**
 * POST /api/admin/data-transfer/import
 * 
 * Imports data from an encrypted export package.
 * Accepts either:
 * 1. A transfer code and secret key (to fetch from another instance)
 * 2. An encrypted file content and secret key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { encryptedData, secretKey, code, clearExisting, skipUsers } = body;
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Şifreleme anahtarı gerekli' },
        { status: 400 }
      );
    }
    
    if (!encryptedData && !code) {
      return NextResponse.json(
        { error: 'Şifreli veri veya aktarım kodu gerekli' },
        { status: 400 }
      );
    }
    
    const dataToDecrypt = encryptedData;
    
    // If code is provided, verify it first
    if (code) {
      const transfer = await prisma.dataTransfer.findUnique({
        where: { code },
      });
      
      if (!transfer) {
        return NextResponse.json(
          { error: 'Geçersiz aktarım kodu' },
          { status: 404 }
        );
      }
      
      if (transfer.status === 'used') {
        return NextResponse.json(
          { error: 'Bu aktarım kodu zaten kullanılmış' },
          { status: 410 }
        );
      }
      
      if (new Date() > transfer.expiresAt) {
        return NextResponse.json(
          { error: 'Aktarım kodunun süresi dolmuş' },
          { status: 410 }
        );
      }
      
      if (!verifySecretKey(secretKey, transfer.secretKey)) {
        return NextResponse.json(
          { error: 'Geçersiz şifreleme anahtarı' },
          { status: 401 }
        );
      }
    }
    
    // Decrypt and validate the package
    const decryptResult = await decryptAndValidatePackage(dataToDecrypt, secretKey);
    
    if (!decryptResult.success || !decryptResult.package) {
      return NextResponse.json(
        { error: decryptResult.error || 'Şifre çözme başarısız' },
        { status: 400 }
      );
    }
    
    // Import the data
    const importResult = await importDataFromPackage(
      decryptResult.package,
      session.user.id as string,
      {
        clearExisting: clearExisting === true,
        skipUsers: skipUsers === true,
      }
    );
    
    if (!importResult.success) {
      return NextResponse.json(
        { error: importResult.error || 'İçe aktarma başarısız' },
        { status: 500 }
      );
    }
    
    // Mark transfer as used if code was provided
    if (code) {
      await markTransferAsUsed(code, session.user.id as string);
    }
    
    return NextResponse.json({
      success: true,
      tablesImported: importResult.tablesImported,
      recordsImported: importResult.recordsImported,
      details: importResult.details,
      message: `${importResult.recordsImported} kayıt başarıyla içe aktarıldı.`,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Veri içe aktarılamadı' },
      { status: 500 }
    );
  }
}
