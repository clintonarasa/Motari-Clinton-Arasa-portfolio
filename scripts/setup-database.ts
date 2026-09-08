#!/usr/bin/env node
/**
 * Portfolio Database Setup Script
 * Run this to set up your Supabase database
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(color: keyof typeof colors, ...args: any[]) {
  console.log(colors[color], ...args, colors.reset);
}

async function runCommand(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => resolve(code === 0));
  });
}

async function checkSupabaseCLI(): Promise<boolean> {
  log('cyan', '\n📋 Checking for Supabase CLI...');
  try {
    const installed = await runCommand('supabase', ['--version']);
    if (installed) {
      log('green', '✅ Supabase CLI found');
      return true;
    }
  } catch (e) {
    /* */
  }
  log('yellow', '⚠️  Supabase CLI not found. Use: npx supabase@latest login');
  return false;
}

async function checkEnvFile(): Promise<boolean> {
  log('cyan', '\n📋 Checking .env file...');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    if (content.includes('SUPABASE_URL') && content.includes('SUPABASE_ANON_KEY')) {
      log('green', '✅ .env file configured');
      return true;
    }
  }
  log('red', '❌ .env file not properly configured');
  log('yellow', '   Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
  return false;
}

async function checkMigrationFile(): Promise<boolean> {
  log('cyan', '\n📋 Checking migration files...');
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir);
    const hasMigration = files.some(f => f.includes('portfolio_schema') || f.includes('20260406'));
    if (hasMigration) {
      log('green', '✅ Migration files found');
      return true;
    }
  }
  log('red', '❌ Migration files not found');
  return false;
}

async function setup(): Promise<void> {
  log('bright', '\n╔════════════════════════════════════════════════╗');
  log('bright', '║  🚀 Portfolio Database Setup Script            ║');
  log('bright', '║     Clinton Arasa - April 6, 2026             ║');
  log('bright', '╚════════════════════════════════════════════════╝');

  // Pre-flight checks
  log('bright', '\n🔍 Running pre-flight checks...');
  const cliOk = await checkSupabaseCLI();
  const envOk = await checkEnvFile();
  const migrationOk = await checkMigrationFile();

  if (!cliOk || !envOk || !migrationOk) {
    log('red', '\n❌ Setup cannot proceed. Please fix the issues above.');
    process.exit(1);
  }

  log('bright', '\n✨ All pre-flight checks passed!\n');

  // Interactive setup
  log('bright', '📝 Setup Steps:');
  log('cyan', '\n[1/4] Authenticate with Supabase');
  log('yellow', '   → Run: supabase login');
  log('yellow', '   → This will open a browser to authenticate');

  await confirmContinue('Have you authenticated with Supabase?');

  log('cyan', '\n[2/4] Link your project');
  log('yellow', '   → Run: supabase link --project-ref qacghdielhdpuyxlzgbk');
  log('yellow', '   → This links your local project to Supabase');

  await confirmContinue('Have you linked your project?');

  log('cyan', '\n[3/4] Push migrations');
  log('yellow', '   → Run: supabase db push');
  log('yellow', '   → This creates all database tables and policies');

  await confirmContinue('Have you pushed migrations?');

  log('cyan', '\n[4/4] Verify setup');
  log('yellow', '   → Check your Supabase dashboard');
  log('yellow', '   → You should see all 11 tables in Table Editor');

  await confirmContinue('Have you verified the tables exist?');

  log('bright', '\n╔════════════════════════════════════════════════╗');
  log('green', '║  ✨ Setup Complete!                            ║');
  log('bright', '╚════════════════════════════════════════════════╝');

  printNextSteps();
}

async function confirmContinue(message: string): Promise<void> {
  return new Promise((resolve) => {
    process.stdout.write(`\n${colors.yellow}${message} (yes/no): ${colors.reset}`);
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase();
      if (answer === 'yes' || answer === 'y') {
        resolve();
      } else {
        log('red', '❌ Setup cancelled');
        process.exit(1);
      }
    });
  });
}

function printNextSteps(): void {
  log('bright', '\n🎯 Next Steps:');
  log('cyan', '1. Test the connection:');
  log('yellow', '   → Import { testSupabaseInBrowser } from "@/integrations/supabase/diagnostics"');
  log('yellow', '   → Run in browser console: testSupabaseInBrowser()');

  log('cyan', '\n2. Connect admin pages:');
  log('yellow', '   → Use pre-built services from "@/integrations/supabase/services"');
  log('yellow', '   → Or use custom hooks from "@/hooks/useDatabase"');

  log('cyan', '\n3. Example: Adding skills to AdminSkills.tsx');
  log('yellow', '   → Import { skillsService } from "@/integrations/supabase/services"');
  log('yellow', '   → Use: await skillsService.getAll(userId)');

  log('cyan', '\n4. Set up auth in admin panel:');
  log('yellow', '   → Use { useAuthUser } from "@/hooks/useDatabase"');
  log('yellow', '   → Redirect to login if no user');

  log('cyan', '\n5. Enable real-time updates:');
  log('yellow', '   → Use supabase.from("table").on("*", callback).subscribe()');

  log('bright', '\n📚 Documentation:');
  log('yellow', '   → SUPABASE_SETUP_GUIDE.md');
  log('yellow', '   → DATABASE_SCHEMA.md');

  log('green', '\n✅ Your portfolio database is ready!\n');
}

// Run setup if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  // Handle stdin for Node.js
  process.stdin.setRawMode?.(false);
  setup().catch(log.red);
}
