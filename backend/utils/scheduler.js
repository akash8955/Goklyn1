const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const { log } = console;

// Clean up temporary uploads directory
const cleanTempUploads = async () => {
  try {
    const tempDir = path.join(__dirname, '../uploads/temp');
    
    // Check if directory exists
    try {
      await fs.access(tempDir);
    } catch (err) {
      // Directory doesn't exist, nothing to clean
      return;
    }

    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 1 day
      if (now - stats.mtimeMs > oneDay) {
        await fs.unlink(filePath);
        log(`Deleted temporary file: ${filePath}`);
      }
    }
  } catch (error) {
    log('Error cleaning up temporary uploads:', error);
  }
};

// Database backup function
const backupDatabase = async () => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.gz`);
    
    // Create backups directory if it doesn't exist
    try {
      await fs.access(backupDir);
    } catch (err) {
      await fs.mkdir(backupDir, { recursive: true });
    }

    // Run mongodump command
    const { stdout, stderr } = await execAsync(
      `mongodump --uri="${process.env.DATABASE}" --archive=${backupPath} --gzip`
    );
    
    log(`Database backup created at: ${backupPath}`);
    
    // Clean up old backups (keep last 7 days)
    const files = await fs.readdir(backupDir);
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    for (const file of files) {
      if (!file.startsWith('backup-')) continue;
      
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > sevenDays) {
        await fs.unlink(filePath);
        log(`Deleted old backup: ${filePath}`);
      }
    }
  } catch (error) {
    log('Error creating database backup:', error);
  }
};

// Initialize all scheduled jobs
const initScheduledJobs = () => {
  try {
    // Clean up temp uploads every 6 hours
    cron.schedule('0 */6 * * *', cleanTempUploads);
    
    // Create database backup every day at midnight
    cron.schedule('0 0 * * *', backupDatabase);
    
    log('Scheduled jobs initialized');
  } catch (error) {
    log('Error initializing scheduled jobs:', error);
  }
};

module.exports = {
  initScheduledJobs,
  cleanTempUploads,
  backupDatabase
};
