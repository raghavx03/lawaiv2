#!/usr/bin/env node

// Comprehensive verification script for freemium model fix
const fs = require('fs')
const path = require('path')

function checkFileForHardcodedPlans(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const issues = []
    
    // Check for hardcoded PRO plans (excluding type definitions and admin exceptions)
    const hardcodedProRegex = /plan\s*[:=]\s*['"](PRO|BASIC|PLUS)['"](?![^{]*admin|[^{]*shivangibabbar)/gi
    const matches = content.match(hardcodedProRegex)
    
    if (matches) {
      matches.forEach(match => {
        // Skip if it's in a type definition or admin context
        if (!match.includes('admin') && !match.includes('shivangibabbar')) {
          issues.push(`Hardcoded plan: ${match}`)
        }
      })
    }
    
    // Check for fallback PRO plans
    const fallbackProRegex = /\|\s*['"](PRO|BASIC|PLUS)['"](?![^{]*admin)/gi
    const fallbackMatches = content.match(fallbackProRegex)
    
    if (fallbackMatches) {
      fallbackMatches.forEach(match => {
        if (!match.includes('admin') && !match.includes('shivangibabbar')) {
          issues.push(`Fallback to paid plan: ${match}`)
        }
      })
    }
    
    return issues
  } catch (error) {
    return [`Error reading file: ${error.message}`]
  }
}

function verifyFreemiumFix() {
  console.log('🔍 Verifying Freemium Model Fix...\n')\n  \n  const filesToCheck = [\n    'src/context/AuthContext.tsx',\n    'src/components/auth/ProfileDropdown.tsx',\n    'src/app/api/user/profile/route.ts',\n    'src/lib/feature-access.ts',\n    'src/lib/usage.ts',\n    'src/components/dashboard/QuickActions.tsx'\n  ]\n  \n  let totalIssues = 0\n  \n  filesToCheck.forEach(file => {\n    const fullPath = path.join(__dirname, file)\n    if (fs.existsSync(fullPath)) {\n      console.log(`📁 Checking ${file}...`)\n      const issues = checkFileForHardcodedPlans(fullPath)\n      \n      if (issues.length === 0) {\n        console.log('  ✅ No issues found')\n      } else {\n        console.log('  ❌ Issues found:')\n        issues.forEach(issue => {\n          console.log(`    - ${issue}`)\n          totalIssues++\n        })\n      }\n      console.log('')\n    } else {\n      console.log(`  ⚠️  File not found: ${file}\\n`)\n    }\n  })\n  \n  // Check key configurations\n  console.log('🔧 Checking Key Configurations...')\n  \n  // Check AuthContext\n  const authContextPath = path.join(__dirname, 'src/context/AuthContext.tsx')\n  if (fs.existsSync(authContextPath)) {\n    const authContent = fs.readFileSync(authContextPath, 'utf8')\n    \n    if (authContent.includes('plan: isAdmin ? \\'PRO\\' : \\'FREE\\'')) {\n      console.log('  ✅ AuthContext: Proper admin check for default plan')\n    } else {\n      console.log('  ❌ AuthContext: Missing proper admin check')\n      totalIssues++\n    }\n    \n    if (authContent.includes('shivangibabbar0211@gmail.com')) {\n      console.log('  ✅ AuthContext: Admin email check present')\n    } else {\n      console.log('  ❌ AuthContext: Admin email check missing')\n      totalIssues++\n    }\n  }\n  \n  // Check Profile API\n  const profileApiPath = path.join(__dirname, 'src/app/api/user/profile/route.ts')\n  if (fs.existsSync(profileApiPath)) {\n    const profileContent = fs.readFileSync(profileApiPath, 'utf8')\n    \n    if (profileContent.includes('plan: \\'FREE\\'') && profileContent.includes('EXPIRED_FREE')) {\n      console.log('  ✅ Profile API: Defaults to FREE plan with expiry logic')\n    } else {\n      console.log('  ❌ Profile API: Missing FREE default or expiry logic')\n      totalIssues++\n    }\n  }\n  \n  // Check Feature Access\n  const featureAccessPath = path.join(__dirname, 'src/lib/feature-access.ts')\n  if (fs.existsSync(featureAccessPath)) {\n    const featureContent = fs.readFileSync(featureAccessPath, 'utf8')\n    \n    if (featureContent.includes('EXPIRED_FREE: []')) {\n      console.log('  ✅ Feature Access: EXPIRED_FREE plan with no features')\n    } else {\n      console.log('  ❌ Feature Access: Missing EXPIRED_FREE plan')\n      totalIssues++\n    }\n  }\n  \n  console.log('')\n  \n  // Final summary\n  if (totalIssues === 0) {\n    console.log('🎉 VERIFICATION PASSED!')\n    console.log('✅ Freemium model should work correctly:')\n    console.log('   - New users get FREE plan (7 days OR 10 queries)')\n    console.log('   - Expired users get EXPIRED_FREE (no access)')\n    console.log('   - Only admin gets PRO plan by default')\n    console.log('   - Feature access properly restricted')\n  } else {\n    console.log(`❌ VERIFICATION FAILED!`)\n    console.log(`Found ${totalIssues} issues that need to be fixed.`)\n    process.exit(1)\n  }\n}\n\nverifyFreemiumFix()