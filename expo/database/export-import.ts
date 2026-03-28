#!/usr/bin/env node

console.error('❌ Export/Import utility is not compatible with Supabase.');
console.error('');
console.error('Please use Supabase Dashboard for database backups and migrations:');
console.error('1. Go to your Supabase project dashboard');
console.error('2. Navigate to Database > Backups for automated backups');
console.error('3. Use SQL Editor for manual exports/imports');
console.error('');
console.error('For more information, visit: https://supabase.com/docs/guides/platform/backups');

process.exit(1);
