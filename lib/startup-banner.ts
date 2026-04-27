// Startup banner for clean console output
import { config } from './config';

let hasShownBanner = false;

export function showStartupBanner() {
  if (hasShownBanner) return;
  hasShownBanner = true;

  console.log('\n');
  console.log('🔥 ════════════════════════════════════════════════════════════');
  console.log('   ARIA - AI-Powered Postmortem Generator');
  console.log('   Production-Ready | Clean Logs | Auto-Detection Enabled');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`📊 Database: ${config.postgres.database}@${config.postgres.host}`);
  console.log(`🔐 Auth: Email/Password (Multi-user with RBAC)`);
  console.log(`🤖 Auto-Detection: ${config.features.slack ? 'Enabled ✅' : 'Disabled'}`);
  console.log(`🐛 Debug Mode: ${config.debug ? 'ON (verbose logs)' : 'OFF (clean logs)'}\n`);
  console.log('Ready! Visit: http://localhost:3000');
  console.log('════════════════════════════════════════════════════════════\n');
}
