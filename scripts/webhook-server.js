#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * HaberNexus - Webhook Server for Auto-Deployment
 * 
 * Bu script, GitHub'dan gelen webhook isteklerini dinler ve
 * otomatik deployment işlemini tetikler.
 * 
 * Kullanım:
 *   node webhook-server.js
 *   veya PM2 ile: pm2 start webhook-server.js --name habernexus-webhook
 */

const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// YAPILANDIRMA
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    port: process.env.WEBHOOK_PORT || 9000,
    secret: process.env.WEBHOOK_SECRET || '',
    installDir: process.env.INSTALL_DIR || '/var/www/habernexus',
    logDir: process.env.LOG_DIR || '/var/log/habernexus',
    allowedBranches: ['master', 'main'],
    deployScript: 'auto-deploy.sh',
    cooldownPeriod: 60000, // 60 saniye - ardışık deploy'ları engelle
};

// ═══════════════════════════════════════════════════════════════════════════
// DURUM YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════════════

let state = {
    isDeploying: false,
    lastDeployTime: 0,
    deployCount: 0,
    lastError: null,
};

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
 * Webhook imzasını doğrula
 */
function verifySignature(payload, signature) {
    if (!CONFIG.secret) {
        log('warn', 'WEBHOOK_SECRET tanımlanmamış, imza doğrulaması atlanıyor');
        return true;
    }
    
    if (!signature) {
        log('error', 'İmza başlığı eksik');
        return false;
    }
    
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', CONFIG.secret)
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
            // 1MB limit
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
function runDeploy(payload) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(CONFIG.installDir, 'scripts', CONFIG.deployScript);
        
        log('info', 'Deployment başlatılıyor', { script: scriptPath });
        
        const deploy = spawn('bash', [scriptPath], {
            cwd: CONFIG.installDir,
            env: {
                ...process.env,
                DEPLOY_SHA: payload.sha || '',
                DEPLOY_REF: payload.ref || '',
                DEPLOY_PUSHER: payload.pusher || '',
                DEPLOY_REPOSITORY: payload.repository || '',
            },
        });
        
        let stdout = '';
        let stderr = '';
        
        deploy.stdout.on('data', (data) => {
            stdout += data.toString();
            process.stdout.write(data);
        });
        
        deploy.stderr.on('data', (data) => {
            stderr += data.toString();
            process.stderr.write(data);
        });
        
        deploy.on('close', (code) => {
            if (code === 0) {
                log('info', 'Deployment başarıyla tamamlandı');
                resolve({ success: true, stdout, stderr });
            } else {
                log('error', 'Deployment başarısız', { code, stderr });
                reject(new Error(`Deployment failed with code ${code}`));
            }
        });
        
        deploy.on('error', (err) => {
            log('error', 'Deployment script çalıştırılamadı', { error: err.message });
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
            uptime: process.uptime(),
            isDeploying: state.isDeploying,
            deployCount: state.deployCount,
            lastDeployTime: state.lastDeployTime ? new Date(state.lastDeployTime).toISOString() : null,
        });
    }
    
    // Status endpoint
    if (req.method === 'GET' && req.url === '/status') {
        return sendResponse(res, 200, {
            ...state,
            config: {
                port: CONFIG.port,
                installDir: CONFIG.installDir,
                allowedBranches: CONFIG.allowedBranches,
                secretConfigured: !!CONFIG.secret,
            },
        });
    }
    
    // Webhook endpoint
    if (req.method === 'POST' && (req.url === '/webhook' || req.url === '/deploy')) {
        try {
            const body = await readBody(req);
            const signature = req.headers['x-hub-signature-256'];
            const event = req.headers['x-github-event'] || 'push';
            
            log('info', 'Webhook isteği alındı', { event, url: req.url });
            
            // İmza doğrulama
            if (!verifySignature(body, signature)) {
                log('warn', 'Geçersiz imza');
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
                log('info', 'Ping event alındı');
                return sendResponse(res, 200, { message: 'pong' });
            }
            
            // Push event kontrolü
            if (event !== 'push' && payload.action !== 'deploy') {
                log('info', 'Event türü desteklenmiyor', { event });
                return sendResponse(res, 200, { message: 'Event ignored', event });
            }
            
            // Branch kontrolü
            const ref = payload.ref || '';
            const branch = ref.replace('refs/heads/', '');
            
            if (!CONFIG.allowedBranches.includes(branch) && payload.action !== 'deploy') {
                log('info', 'Branch deployment için uygun değil', { branch });
                return sendResponse(res, 200, { message: 'Branch ignored', branch });
            }
            
            // Cooldown kontrolü
            const now = Date.now();
            if (now - state.lastDeployTime < CONFIG.cooldownPeriod) {
                const remaining = Math.ceil((CONFIG.cooldownPeriod - (now - state.lastDeployTime)) / 1000);
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
            
            // Deployment başlat
            state.isDeploying = true;
            state.lastDeployTime = now;
            
            // Hemen yanıt ver, deployment arka planda devam etsin
            sendResponse(res, 202, { 
                message: 'Deployment started',
                sha: payload.sha,
                branch,
            });
            
            // Deployment'ı arka planda çalıştır
            try {
                await runDeploy(payload);
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

server.listen(CONFIG.port, '0.0.0.0', () => {
    log('info', `Webhook sunucusu başlatıldı`, { 
        port: CONFIG.port,
        installDir: CONFIG.installDir,
        secretConfigured: !!CONFIG.secret,
    });
    
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   HaberNexus Webhook Server                                               ║
║                                                                           ║
║   Port: ${CONFIG.port}                                                          ║
║   Install Dir: ${CONFIG.installDir.padEnd(40)}        ║
║   Secret: ${CONFIG.secret ? 'Configured ✓' : 'Not configured ⚠'}                                              ║
║                                                                           ║
║   Endpoints:                                                              ║
║   - GET  /health  - Health check                                          ║
║   - GET  /status  - Detailed status                                       ║
║   - POST /webhook - GitHub webhook endpoint                               ║
║   - POST /deploy  - Manual deploy trigger                                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('info', 'SIGTERM sinyali alındı, sunucu kapatılıyor...');
    server.close(() => {
        log('info', 'Sunucu kapatıldı');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('info', 'SIGINT sinyali alındı, sunucu kapatılıyor...');
    server.close(() => {
        log('info', 'Sunucu kapatıldı');
        process.exit(0);
    });
});
