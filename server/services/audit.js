import { logger } from './logger.js';
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AUDIT_LOG_FILE = join(__dirname, '../logs/audit.log');

// Ensure audit log directory exists
const auditDir = dirname(AUDIT_LOG_FILE);
if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

export const auditLog = (event, data) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...data
  };
  
  // Log to main logger
  logger.info('AUDIT', auditEntry);
  
  // Also write to dedicated audit log file
  const auditLine = JSON.stringify(auditEntry) + '\n';
  fs.appendFileSync(AUDIT_LOG_FILE, auditLine);
  
  // Check for suspicious activities
  checkSuspiciousActivity(event, data);
};

const checkSuspiciousActivity = (event, data) => {
  const suspiciousEvents = [
    'AUTH_FAILURE',
    'UNAUTHORIZED_ACCESS',
    'MULTIPLE_LOGIN_ATTEMPTS',
    'SUSPICIOUS_REQUEST_PATTERN'
  ];
  
  if (suspiciousEvents.includes(event)) {
    logger.warn('SUSPICIOUS_ACTIVITY', {
      event,
      data,
      severity: 'HIGH'
    });
    
    // In a real application, you might want to:
    // - Send alerts to administrators
    // - Temporarily block the IP
    // - Trigger additional security measures
  }
};

export const getAuditLogs = (filters = {}) => {
  try {
    const logs = fs.readFileSync(AUDIT_LOG_FILE, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
    
    // Apply filters
    let filteredLogs = logs;
    
    if (filters.event) {
      filteredLogs = filteredLogs.filter(log => log.event === filters.event);
    }
    
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.endDate)
      );
    }
    
    return filteredLogs.reverse(); // Most recent first
  } catch (error) {
    logger.error('Error reading audit logs:', error);
    return [];
  }
};