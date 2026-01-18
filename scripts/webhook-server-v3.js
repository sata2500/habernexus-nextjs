#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * HaberNexus - Webhook Server for Auto-Deployment (v3.0)
 * 
 * Bu script, GitHub'dan gelen webhook isteklerini dinler ve
 * otomatik deployment işlemini tetikler.
 * 
 * v3.0 Yenilikler:
 * - Admin panel üzerinden yönetilebilir ayarlar
 * - Veritabanından ayar okuma desteği
 * - Dinamik açma/kapama
 * - Gelişmiş API endpoint'leri
 * - Deployment geçmişi kaydı
 * 
 * Kullanım:
 *   node webhook-server-v3.js
 *   veya PM2 ile: pm2 start webhook-server-v3.js --name habernexus-webhook
 */

const http = require('http');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Prisma client
let prisma;
try {
    prisma = new PrismaClient();
} catch (error) {
    console.error('Prisma client initialization failed:', error.message);
    prisma = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// YAPILANDIRMA
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    port: process.env.WEBHOOK_PORT || 9000,
    secret: process.env.WEBHOOK_SECRET || '',
    installDir: process.env.INSTALL_DIR || '/var/www/habernexus',
    logDir: process.env.LOG_DIR || '/var/log/habernexus',
    deployScript: 'auto-deploy.sh',
    // Varsayılan ayarlar (veritabanından okunamazsa kullanılır)
    defaults: {
        webhookEnabled: true,
        autoDeployEnabled: true,
        cooldownPeriod: 60000,
        allowedBranches: ['master', 'main'],
        backupBeforeDeploy: true,
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DURUM YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════════════

let state = {
    isDeploying: false,
    lastDeployTime: 0,
    deployCount: 0,
    lastError: null,
    settings: { ...CONFIG.defaults },
};

// ═══════════════════════════════════════════════════════════════════════════
// AYAR YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Veritabanından ayarları yükle
 */
async function loadSettings() {
    if (!prisma) {
        log('warn', 'Prisma client not available, using default settings');
        return;
    }

    try {
        const settings = await prisma.deploymentSettings.findMany();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        state.settings = {
            webhookEnabled: settingsMap['webhook_enabled'] !== 'false',
            autoDeployEnabled: settingsMap['auto_deploy_enabled'] !== 'false',
            cooldownPeriod: parseInt(settingsMap['cooldown_period'] || '60') * 1000,
            allowedBranches: (settingsMap['allowed_branches'] || 'master,main').split(',').map(b => b.trim()),
            backupBeforeDeploy: settingsMap['backup_before_deploy'] !== 'false',
            webhookSecret: settingsMap['webhook_secret'] || CONFIG.secret,
        };

        log('info', 'Settings loaded from database', state.settings);
    } catch (error) {
        log('error', 'Failed to load settings from database', { error: error.message });
    }
}

/**
 * Ayarları periyodik olarak yenile
 */
function startSettingsRefresh() {
    // Her 30 saniyede bir ayarları yenile
    setInterval(async () => {
        await loadSettings();
    }, 30000);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPLOYMENT GEÇMİŞİ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Deployment kaydı oluştur
 */
async function createDeploymentRecord(type, toVersion, triggeredBy) {
    if (!prisma) return null;

    try {
        let fromVersion = 'unknown';
        try {
            fromVersion = execSync('git rev-parse --short HEAD', { 
                cwd: CONFIG.installDir, 
                encoding: 'utf-8' 
            }).trim();
        } catch {
            // Ignore
        }

        const record = await prisma.deploymentHistory.create({
            data: {
                type,
                status: 'pending',
                fromVersion,
                toVersion,
                triggeredBy,
            }
        });
        return record.id;
    } catch (error) {
        log('error', 'Failed to create deployment record', { error: error.message });
        return null;
    }
}

/**
 * Deployment kaydını güncelle
 */
async function updateDeploymentRecord(id, status, logs, errorMessage = null) {
    if (!prisma || !id) return;

    try {
        const startRecord = await prisma.deploymentHistory.findUnique({ where: { id } });
        const duration = startRecord 
            ? Math.round((Date.now() - new Date(startRecord.startedAt).getTime()) / 1000)
            : null;

        await prisma.deploymentHistory.update({
            where: { id },
            data: {
                status,
                completedAt: new Date(),
                duration,
                logs: JSON.stringify(logs),
                errorMessage,
            }
        });
    } catch (error) {
        log('error', 'Failed to update deployment record', { error: error.message });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log dosyasına ve konsola yaz
 */
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data }),
    };
    
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    
    // Log dosyasına yaz
    try {
        const logFile = path.join(CONFIG.logDir, 'webhook.log');
        fs.mkdirSync(CONFIG.logDir, { recursive: true });
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (err) {
        console.error('Log yazma hatası:', err.message);
    }
}

/**
 * Webhook imzasını doğrula (GitHub X-Hub-Signature-256)
 */
function verifySignature(payload, signature) {
    const secret = state.settings.webhookSecret || CONFIG.secret;
    
    if (!secret) {
        log('warn', 'WEBHOOK_SECRET tanımlanmamış, imza doğrulaması atlanıyor');
        return true;
    }
    
    if (!signature) {
        log('error', 'İmza başlığı eksik (X-Hub-Signature-256)');
        return false;
    }
    
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (err) {
        log('error', 'İmza doğrulama hatası', { error: err.message });
        return false;
    }
}

/**
 * Request body'yi oku
 */
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 1048576) {
                reject(new Error('Request body too large'));
            }
        });
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

/**
 * JSON yanıt gönder
 */
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

/**
 * Deployment scriptini çalıştır
 */
async function runDeploy(payload, deploymentId) {
    const logs = [];
    
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(CONFIG.installDir, 'scripts', CONFIG.deployScript);
        
        log('info', 'Deployment başlatılıyor', { script: scriptPath });
        logs.push(`[${new Date().toISOString()}] Deployment başlatılıyor`);
        
        // Update status to running
        if (deploymentId) {
            prisma?.deploymentHistory.update({
                where: { id: deploymentId },
                data: { status: 'running' }
            }).catch(() => {});
        }
        
        const deploy = spawn('bash', [scriptPath], {
            cwd: CONFIG.installDir,
            env: {
                ...process.env,
                DEPLOY_SHA: payload.after || '',
                DEPLOY_REF: payload.ref || '',
                DEPLOY_PUSHER: payload.pusher?.name || 'unknown',
                DEPLOY_REPOSITORY: payload.repository?.full_name || '',
            },
        });
        
        let stdout = '';
        let stderr = '';
        
        deploy.stdout.on('data', (data) => {
            const line = data.toString();
            stdout += line;
            logs.push(line.trim());
            process.stdout.write(data);
        });
        
        deploy.stderr.on('data', (data) => {
            const line = data.toString();
            stderr += line;
            logs.push(`[ERROR] ${line.trim()}`);
            process.stderr.write(data);
        });
        
        deploy.on('close', async (code) => {
            if (code === 0) {
                log('info', 'Deployment başarıyla tamamlandı');
                logs.push(`[${new Date().toISOString()}] Deployment başarıyla tamamlandı`);
                await updateDeploymentRecord(deploymentId, 'success', logs);
                resolve({ success: true, stdout, stderr, logs });
            } else {
                const errorMsg = `Deployment failed with code ${code}`;
                log('error', 'Deployment başarısız', { code, stderr });
                logs.push(`[${new Date().toISOString()}] ${errorMsg}`);
                await updateDeploymentRecord(deploymentId, 'failed', logs, errorMsg);
                reject(new Error(errorMsg));
            }
        });
        
        deploy.on('error', async (err) => {
            log('error', 'Deployment script çalıştırılamadı', { error: err.message });
            logs.push(`[${new Date().toISOString()}] Script error: ${err.message}`);
            await updateDeploymentRecord(deploymentId, 'failed', logs, err.message);
            reject(err);
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP SUNUCUSU
// ═══════════════════════════════════════════════════════════════════════════

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256, X-GitHub-Event');
    
    // OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // Health check endpoint
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
        return sendResponse(res, 200, {
            status: 'ok',
            service: 'habernexus-webhook',
            version: '3.0.0',
            uptime: process.uptime(),
            isDeploying: state.isDeploying,
            deployCount: state.deployCount,
            lastDeployTime: state.lastDeployTime ? new Date(state.lastDeployTime).toISOString() : null,
            settings: {
                webhookEnabled: state.settings.webhookEnabled,
                autoDeployEnabled: state.settings.autoDeployEnabled,
                cooldownPeriod: state.settings.cooldownPeriod / 1000,
                allowedBranches: state.settings.allowedBranches,
            }
        });
    }
    
    // Status endpoint
    if (req.method === 'GET' && req.url === '/status') {
        return sendResponse(res, 200, {
            ...state,
            config: {
                port: CONFIG.port,
                installDir: CONFIG.installDir,
                webhookSystem: 'GitHub Repository Webhook (v3.0)',
            },
        });
    }

    // Settings endpoint - GET
    if (req.method === 'GET' && req.url === '/settings') {
        return sendResponse(res, 200, {
            success: true,
            settings: state.settings,
        });
    }

    // Settings endpoint - PUT (reload settings)
    if (req.method === 'PUT' && req.url === '/settings/reload') {
        await loadSettings();
        return sendResponse(res, 200, {
            success: true,
            message: 'Settings reloaded',
            settings: state.settings,
        });
    }
    
    // Webhook endpoint (GitHub'dan gelen istekler)
    if (req.method === 'POST' && req.url === '/webhook') {
        // Webhook aktif mi kontrol et
        if (!state.settings.webhookEnabled) {
            log('info', 'Webhook devre dışı, istek reddedildi');
            return sendResponse(res, 503, { 
                error: 'Webhook disabled',
                message: 'Webhook is currently disabled via admin panel',
            });
        }

        try {
            const body = await readBody(req);
            const signature = req.headers['x-hub-signature-256'];
            const event = req.headers['x-github-event'] || 'push';
            
            log('info', 'Webhook isteği alındı', { event, url: req.url });
            
            // İmza doğrulama
            if (!verifySignature(body, signature)) {
                log('warn', 'Geçersiz imza - istek reddedildi');
                return sendResponse(res, 401, { error: 'Invalid signature' });
            }
            
            // Payload parse
            let payload;
            try {
                payload = JSON.parse(body);
            } catch {
                log('error', 'Geçersiz JSON payload');
                return sendResponse(res, 400, { error: 'Invalid JSON' });
            }
            
            // Ping event
            if (event === 'ping') {
                log('info', 'Ping event alındı - webhook bağlantısı başarılı');
                return sendResponse(res, 200, { message: 'pong', version: '3.0.0' });
            }
            
            // Push event kontrolü
            if (event !== 'push') {
                log('info', 'Event türü desteklenmiyor', { event });
                return sendResponse(res, 200, { message: 'Event ignored', event });
            }

            // Auto-deploy aktif mi kontrol et
            if (!state.settings.autoDeployEnabled) {
                log('info', 'Auto-deploy devre dışı, istek işlenmedi');
                return sendResponse(res, 200, { 
                    message: 'Auto-deploy disabled',
                    note: 'Push received but auto-deploy is disabled',
                });
            }
            
            // Branch kontrolü
            const ref = payload.ref || '';
            const branch = ref.replace('refs/heads/', '');
            
            if (!state.settings.allowedBranches.includes(branch)) {
                log('info', 'Branch deployment için uygun değil', { branch });
                return sendResponse(res, 200, { message: 'Branch ignored', branch });
            }
            
            // Cooldown kontrolü
            const now = Date.now();
            if (now - state.lastDeployTime < state.settings.cooldownPeriod) {
                const remaining = Math.ceil((state.settings.cooldownPeriod - (now - state.lastDeployTime)) / 1000);
                log('warn', 'Cooldown süresi içinde', { remaining });
                return sendResponse(res, 429, { 
                    error: 'Too many requests', 
                    message: `Please wait ${remaining} seconds`,
                    retryAfter: remaining,
                });
            }
            
            // Zaten deployment yapılıyor mu?
            if (state.isDeploying) {
                log('warn', 'Deployment zaten devam ediyor');
                return sendResponse(res, 409, { 
                    error: 'Deployment in progress',
                    message: 'Another deployment is already running',
                });
            }
            
            // Deployment kaydı oluştur
            const deploymentId = await createDeploymentRecord(
                'auto',
                payload.after?.substring(0, 8) || branch,
                payload.pusher?.name || 'github-webhook'
            );
            
            // Deployment başlat
            state.isDeploying = true;
            state.lastDeployTime = now;
            
            // Hemen yanıt ver
            sendResponse(res, 202, { 
                message: 'Deployment started',
                deploymentId,
                sha: payload.after,
                branch,
                pusher: payload.pusher?.name,
            });
            
            // Deployment'ı arka planda çalıştır
            try {
                await runDeploy(payload, deploymentId);
                state.deployCount++;
                state.lastError = null;
            } catch (err) {
                state.lastError = err.message;
                log('error', 'Deployment hatası', { error: err.message });
            } finally {
                state.isDeploying = false;
            }
            
        } catch (err) {
            log('error', 'Webhook işleme hatası', { error: err.message });
            return sendResponse(res, 500, { error: 'Internal server error' });
        }
        return;
    }
    
    // 404 for other routes
    sendResponse(res, 404, { error: 'Not found' });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUNUCUYU BAŞLAT
// ═══════════════════════════════════════════════════════════════════════════

async function start() {
    // Ayarları yükle
    await loadSettings();
    
    // Periyodik ayar yenileme başlat
    startSettingsRefresh();
    
    server.listen(CONFIG.port, '0.0.0.0', () => {
        log('info', `Webhook sunucusu başlatıldı`, { 
            port: CONFIG.port,
            installDir: CONFIG.installDir,
            webhookSystem: 'GitHub Repository Webhook v3.0',
        });
        
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   HaberNexus Webhook Server v3.0                                          ║
║   (Admin Panel Managed)                                                   ║
║                                                                           ║
║   Port: ${CONFIG.port}                                                          ║
║   Install Dir: ${CONFIG.installDir.padEnd(40)}        ║
║   Webhook Enabled: ${state.settings.webhookEnabled ? 'Yes ✓' : 'No ✗'}                                            ║
║   Auto-Deploy: ${state.settings.autoDeployEnabled ? 'Yes ✓' : 'No ✗'}                                                ║
║                                                                           ║
║   Endpoints:                                                              ║
║   - GET  /health           - Health check                                 ║
║   - GET  /status           - Detailed status                              ║
║   - GET  /settings         - Current settings                             ║
║   - PUT  /settings/reload  - Reload settings from DB                      ║
║   - POST /webhook          - GitHub webhook endpoint                      ║
║                                                                           ║
║   Settings are managed via Admin Panel:                                   ║
║   https://habernexus.com/admin/surum-yonetimi                             ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
        `);
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    log('info', 'SIGTERM sinyali alındı, sunucu kapatılıyor...');
    if (prisma) await prisma.$disconnect();
    server.close(() => {
        log('info', 'Sunucu kapatıldı');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    log('info', 'SIGINT sinyali alındı, sunucu kapatılıyor...');
    if (prisma) await prisma.$disconnect();
    server.close(() => {
        log('info', 'Sunucu kapatıldı');
        process.exit(0);
    });
});

// Başlat
start().catch(err => {
    console.error('Startup error:', err);
    process.exit(1);
});
