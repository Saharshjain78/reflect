import express from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import { logger } from '../services/logger.js';
import { auditLog, getAuditLogs } from '../services/audit.js';
import { securityMonitor } from '../services/securityMonitor.js';
import { backupService } from '../services/backup.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// System health endpoint
router.get('/health', (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    auditLog('ADMIN_HEALTH_CHECK', {
      userId: req.user.userId,
      ip: req.ip
    });
    
    res.json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Security report endpoint
router.get('/security/report', (req, res) => {
  try {
    const report = securityMonitor.generateSecurityReport();
    
    auditLog('ADMIN_SECURITY_REPORT', {
      userId: req.user.userId,
      ip: req.ip
    });
    
    res.json(report);
  } catch (error) {
    logger.error('Security report error:', error);
    res.status(500).json({ error: 'Failed to generate security report' });
  }
});

// Audit logs endpoint
router.get('/audit', (req, res) => {
  try {
    const { event, startDate, endDate, limit = 100 } = req.query;
    
    const filters = {};
    if (event) filters.event = event;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const logs = getAuditLogs(filters).slice(0, parseInt(limit));
    
    auditLog('ADMIN_AUDIT_ACCESS', {
      userId: req.user.userId,
      ip: req.ip,
      filters,
      resultCount: logs.length
    });
    
    res.json({
      logs,
      total: logs.length,
      filters
    });
  } catch (error) {
    logger.error('Audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// System metrics endpoint
router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      application: {
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      }
    };
    
    auditLog('ADMIN_METRICS_ACCESS', {
      userId: req.user.userId,
      ip: req.ip
    });
    
    res.json(metrics);
  } catch (error) {
    logger.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Backup management endpoints
router.get('/backups', (req, res) => {
  try {
    const backups = backupService.listBackups();
    
    auditLog('ADMIN_BACKUP_LIST', {
      userId: req.user.userId,
      ip: req.ip,
      backupCount: backups.length
    });
    
    res.json({ backups });
  } catch (error) {
    logger.error('Backup list error:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

router.post('/backups', async (req, res) => {
  try {
    const backupFileName = await backupService.createBackup();
    
    auditLog('ADMIN_BACKUP_CREATED', {
      userId: req.user.userId,
      ip: req.ip,
      backupFileName
    });
    
    res.json({
      message: 'Backup created successfully',
      fileName: backupFileName
    });
  } catch (error) {
    logger.error('Backup creation error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

router.post('/backups/:fileName/restore', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    await backupService.restoreBackup(fileName);
    
    auditLog('ADMIN_BACKUP_RESTORED', {
      userId: req.user.userId,
      ip: req.ip,
      backupFileName: fileName
    });
    
    res.json({
      message: 'Backup restored successfully',
      fileName
    });
  } catch (error) {
    logger.error('Backup restoration error:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

export default router;