#!/usr/bin/env node

import { createBackup } from '../backend/db/connection';
import { join } from 'path';
import * as fs from 'fs';

const backupDir = join(process.cwd(), 'database', 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = join(backupDir, `socialstoryai_${timestamp}.db`);

try {
  console.log('Creating database backup...');
  createBackup(backupPath);
  console.log(`✅ Backup created successfully: ${backupPath}`);
  
  const stats = fs.statSync(backupPath);
  console.log(`Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  const backupFiles = fs.readdirSync(backupDir)
    .filter((f: string) => f.endsWith('.db'))
    .map((f: string) => ({
      name: f,
      path: join(backupDir, f),
      time: fs.statSync(join(backupDir, f)).mtime.getTime(),
    }))
    .sort((a: any, b: any) => b.time - a.time);
  
  if (backupFiles.length > 7) {
    console.log('\nCleaning up old backups (keeping last 7)...');
    backupFiles.slice(7).forEach((file: any) => {
      fs.unlinkSync(file.path);
      console.log(`Deleted old backup: ${file.name}`);
    });
  }
  
  console.log(`\nTotal backups: ${Math.min(backupFiles.length, 7)}`);
  
} catch (error) {
  console.error('❌ Backup failed:', error);
  process.exit(1);
}
