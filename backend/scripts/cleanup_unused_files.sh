#!/bin/bash
# Script to remove unused test/debug scripts

echo "🧹 Cleaning up unused test/debug scripts..."

# Remove test scripts
rm -f scripts/test_*.js
echo "✅ Removed test scripts"

# Remove debug scripts
rm -f scripts/debug_*.js
echo "✅ Removed debug scripts"

# Remove check scripts (one-time use)
rm -f scripts/check_*.js
echo "✅ Removed check scripts"

# Remove fix scripts (one-time use, already run)
rm -f scripts/fix_*.js
rm -f scripts/auto_fix_*.js
rm -f scripts/manual_update_*.js
rm -f scripts/update_transactions_*.js
echo "✅ Removed fix scripts"

# Remove setup scripts (one-time use)
rm -f scripts/setup_*.js
echo "✅ Removed setup scripts"

# Keep migration scripts for reference
# Keep essential scripts: create_*.js, run_*.js

echo "✅ Cleanup complete!"
echo "📋 Remaining scripts:"
ls -1 scripts/

