import { logger } from './logger.js';
import { auditLog, getAuditLogs } from './audit.js';
import cron from 'node-cron';

class SecurityMonitor {
  constructor() {
    this.suspiciousIPs = new Map();
    this.failedAttempts = new Map();
    this.alertThresholds = {
      failedLogins: 5,
      suspiciousRequests: 10,
      timeWindow: 15 * 60 * 1000 // 15 minutes
    };
  }
  
  trackFailedLogin(ip, userId) {
    const key = `${ip}:${userId}`;
    const now = Date.now();
    
    if (!this.failedAttempts.has(key)) {
      this.failedAttempts.set(key, []);
    }
    
    const attempts = this.failedAttempts.get(key);
    attempts.push(now);
    
    // Remove old attempts outside time window
    const validAttempts = attempts.filter(
      time => now - time < this.alertThresholds.timeWindow
    );
    
    this.failedAttempts.set(key, validAttempts);
    
    // Check if threshold exceeded
    if (validAttempts.length >= this.alertThresholds.failedLogins) {
      this.triggerSecurityAlert('MULTIPLE_FAILED_LOGINS', {
        ip,
        userId,
        attempts: validAttempts.length,
        timeWindow: this.alertThresholds.timeWindow
      });
    }
  }
  
  trackSuspiciousActivity(ip, activity) {
    const now = Date.now();
    
    if (!this.suspiciousIPs.has(ip)) {
      this.suspiciousIPs.set(ip, []);
    }
    
    const activities = this.suspiciousIPs.get(ip);
    activities.push({ activity, timestamp: now });
    
    // Remove old activities
    const validActivities = activities.filter(
      item => now - item.timestamp < this.alertThresholds.timeWindow
    );
    
    this.suspiciousIPs.set(ip, validActivities);
    
    // Check if threshold exceeded
    if (validActivities.length >= this.alertThresholds.suspiciousRequests) {
      this.triggerSecurityAlert('SUSPICIOUS_IP_ACTIVITY', {
        ip,
        activities: validActivities.length,
        timeWindow: this.alertThresholds.timeWindow
      });
    }
  }
  
  triggerSecurityAlert(type, data) {
    logger.error('SECURITY_ALERT', {
      type,
      data,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL'
    });
    
    auditLog('SECURITY_ALERT', {
      type,
      data,
      severity: 'CRITICAL'
    });
    
    // In a real application, you would:
    // - Send email/SMS alerts to administrators
    // - Integrate with security incident response systems
    // - Automatically block suspicious IPs
    // - Trigger additional monitoring
  }
  
  generateSecurityReport() {
    const logs = getAuditLogs({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    });
    
    const report = {
      timestamp: new Date().toISOString(),
      period: '24 hours',
      summary: {
        totalRequests: logs.filter(log => log.event === 'REQUEST').length,
        authFailures: logs.filter(log => log.event === 'AUTH_FAILURE').length,
        unauthorizedAccess: logs.filter(log => log.event === 'UNAUTHORIZED_ACCESS').length,
        errors: logs.filter(log => log.event === 'ERROR').length,
        securityAlerts: logs.filter(log => log.event === 'SECURITY_ALERT').length
      },
      topIPs: this.getTopIPs(logs),
      suspiciousActivities: logs.filter(log => 
        ['AUTH_FAILURE', 'UNAUTHORIZED_ACCESS', 'SECURITY_ALERT'].includes(log.event)
      ).slice(0, 10)
    };
    
    return report;
  }
  
  getTopIPs(logs) {
    const ipCounts = {};
    
    logs.forEach(log => {
      if (log.ip) {
        ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1;
      }
    });
    
    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, requests: count }));
  }
}

const securityMonitor = new SecurityMonitor();

export const startSecurityMonitoring = () => {
  logger.info('Starting security monitoring...');
  
  // Generate daily security reports
  cron.schedule('0 0 * * *', () => {
    const report = securityMonitor.generateSecurityReport();
    logger.info('Daily security report generated', report);
    
    auditLog('SECURITY_REPORT', report);
  });
  
  // Clean up old tracking data every hour
  cron.schedule('0 * * * *', () => {
    securityMonitor.failedAttempts.clear();
    securityMonitor.suspiciousIPs.clear();
    logger.info('Security monitoring data cleaned up');
  });
};

export { securityMonitor };