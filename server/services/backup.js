import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { logger } from './logger.js';
import { encryptionService } from './encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BackupService {
  constructor() {
    this.backupDir = join(__dirname, '../backups');
    this.ensureBackupDirectory();
  }
  
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }
  
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.json`;
      const backupPath = join(this.backupDir, backupFileName);
      
      // In a real application, this would backup your database
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          // This would contain your actual data
          users: [],
          journalEntries: [],
          achievements: []
        }
      };
      
      // Encrypt the backup
      const encryptedBackup = encryptionService.encrypt(JSON.stringify(backupData));
      
      fs.writeFileSync(backupPath, encryptedBackup);
      
      logger.info('Backup created successfully', {
        fileName: backupFileName,
        path: backupPath,
        size: fs.statSync(backupPath).size
      });
      
      // Clean up old backups (keep last 30 days)
      this.cleanupOldBackups();
      
      return backupFileName;
    } catch (error) {
      logger.error('Backup creation failed', error);
      throw error;
    }
  }
  
  cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      files.forEach(file => {
        const filePath = join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          logger.info('Old backup deleted', { fileName: file });
        }
      });
    } catch (error) {
      logger.error('Backup cleanup failed', error);
    }
  }
  
  async restoreBackup(backupFileName) {
    try {
      const backupPath = join(this.backupDir, backupFileName);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }
      
      const encryptedData = fs.readFileSync(backupPath, 'utf8');
      const decryptedData = encryptionService.decrypt(encryptedData);
      const backupData = JSON.parse(decryptedData);
      
      // In a real application, this would restore to your database
      logger.info('Backup restored successfully', {
        fileName: backupFileName,
        timestamp: backupData.timestamp
      });
      
      return backupData;
    } catch (error) {
      logger.error('Backup restoration failed', error);
      throw error;
    }
  }
  
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      
      return files
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => {
          const filePath = join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            fileName: file,
            size: stats.size,
            created: stats.mtime,
            age: Date.now() - stats.mtime.getTime()
          };
        })
        .sort((a, b) => b.created - a.created);
    } catch (error) {
      logger.error('Failed to list backups', error);
      return [];
    }
  }
}

const backupService = new BackupService();

export const startBackupScheduler = () => {
  logger.info('Starting backup scheduler...');
  
  // Create daily backups at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      await backupService.createBackup();
      logger.info('Scheduled backup completed');
    } catch (error) {
      logger.error('Scheduled backup failed', error);
    }
  });
  
  // Create weekly full backups on Sundays at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    try {
      await backupService.createBackup();
      logger.info('Weekly full backup completed');
    } catch (error) {
      logger.error('Weekly backup failed', error);
    }
  });
};

export { backupService };