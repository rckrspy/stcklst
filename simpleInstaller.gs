/**
 * Simple One-Click Installer for Beverage Management System v3.3.0
 * Easy-to-use functions for fresh installation or updates
 */

/**
 * 🚀 ONE-CLICK INSTALLER
 * Run this function to install or update your Beverage Management System
 * 
 * This function will:
 * - Detect if you have an existing system
 * - Perform fresh installation if none exists
 * - Update existing system to latest version
 * - Repair any issues found
 */
function installBeverageManagementSystem() {
  console.log('🍹 Welcome to Beverage Management System v3.3.0!');
  console.log('📦 Starting installation/update process...');
  
  try {
    // Use the advanced installer
    const result = installOrUpdateBeverageManagementSystem();
    
    if (result.success) {
      // Display success message with instructions
      showInstallationSuccess(result);
      return result;
    } else {
      // Display error information
      showInstallationError(result);
      return result;
    }
    
  } catch (error) {
    console.error('❌ Installation failed:', error);
    
    const errorResult = {
      success: false,
      error: error.toString(),
      message: 'Installation failed. Please try again or contact support.',
      troubleshooting: getTroubleshootingSteps()
    };
    
    showInstallationError(errorResult);
    return errorResult;
  }
}

/**
 * 🔄 FORCE FRESH INSTALLATION
 * Use this if you want to start completely fresh
 * WARNING: This will create new databases (existing data will be preserved but not connected)
 */
function forceFreshInstallation() {
  console.log('🆕 Starting forced fresh installation...');
  
  try {
    const result = performFreshInstallation();
    
    if (result.success) {
      showInstallationSuccess(result);
      return result;
    } else {
      showInstallationError(result);
      return result;
    }
    
  } catch (error) {
    console.error('❌ Fresh installation failed:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Fresh installation failed.'
    };
  }
}

/**
 * 🏥 SYSTEM HEALTH CHECK
 * Check if your system is working properly
 */
function checkSystemHealth() {
  console.log('🏥 Running system health check...');
  
  try {
    const health = runSystemHealthCheck();
    
    console.log('📊 Health Check Results:');
    console.log(`Overall Status: ${health.overall}`);
    
    if (health.issues && health.issues.length > 0) {
      console.log('⚠️ Issues Found:');
      health.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log('✅ No issues found!');
    }
    
    if (health.databases) {
      console.log('📊 Database Status:');
      Object.entries(health.databases).forEach(([dbName, dbInfo]) => {
        console.log(`• ${dbName}: ${dbInfo.status}`);
      });
    }
    
    return health;
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      overall: 'Error',
      error: error.toString()
    };
  }
}

/**
 * 💾 CREATE SYSTEM BACKUP
 * Create a backup of all your data
 */
function backupSystem() {
  console.log('💾 Creating system backup...');
  
  try {
    const backup = createSystemBackup();
    
    if (backup.success) {
      console.log('✅ Backup created successfully!');
      console.log(`📁 Backup folder: ${backup.backupFolder}`);
      
      if (backup.databases) {
        console.log('📊 Backed up databases:');
        Object.entries(backup.databases).forEach(([dbName, dbInfo]) => {
          if (dbInfo.status === 'Success') {
            console.log(`✅ ${dbName}: ${dbInfo.backupUrl}`);
          } else {
            console.log(`❌ ${dbName}: ${dbInfo.error || 'Failed'}`);
          }
        });
      }
    } else {
      console.log('❌ Backup failed:', backup.error);
    }
    
    return backup;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 📋 GET SYSTEM INFO
 * Display information about your current system
 */
function getSystemInfo() {
  console.log('📋 Getting system information...');
  
  try {
    const properties = PropertiesService.getScriptProperties().getAll();
    const info = {
      version: properties.version || 'Unknown',
      installationType: properties.installationType || 'Unknown',
      installationDate: properties.installationDate || 'Unknown',
      databases: {},
      features: ADVANCED_SYSTEM_CONFIG.features
    };
    
    // Get database information
    ['ingredients', 'recipes', 'suppliers', 'inventory', 'analytics', 'system'].forEach(dbName => {
      if (properties[dbName]) {
        try {
          const db = SpreadsheetApp.openById(properties[dbName]);
          info.databases[dbName] = {
            id: properties[dbName],
            name: db.getName(),
            url: db.getUrl(),
            sheets: db.getSheets().length
          };
        } catch (error) {
          info.databases[dbName] = {
            id: properties[dbName],
            status: 'Error accessing database',
            error: error.toString()
          };
        }
      } else {
        info.databases[dbName] = 'Not configured';
      }
    });
    
    // Display information
    console.log('📊 System Information:');
    console.log(`Version: ${info.version}`);
    console.log(`Installation Type: ${info.installationType}`);
    console.log(`Installation Date: ${info.installationDate}`);
    console.log('');
    
    console.log('🗄️ Databases:');
    Object.entries(info.databases).forEach(([dbName, dbInfo]) => {
      if (typeof dbInfo === 'object' && dbInfo.name) {
        console.log(`• ${dbName}: ${dbInfo.name} (${dbInfo.sheets} sheets)`);
        console.log(`  URL: ${dbInfo.url}`);
      } else {
        console.log(`• ${dbName}: ${dbInfo}`);
      }
    });
    
    console.log('');
    console.log('🚀 Available Features:');
    Object.entries(info.features).forEach(([feature, enabled]) => {
      console.log(`• ${feature}: ${enabled ? '✅ Enabled' : '❌ Disabled'}`);
    });
    
    return info;
    
  } catch (error) {
    console.error('❌ Error getting system info:', error);
    return {
      error: error.toString()
    };
  }
}

/**
 * 🔗 GET QUICK ACCESS LINKS
 * Get direct links to all your databases
 */
function getQuickAccessLinks() {
  console.log('🔗 Getting quick access links...');
  
  try {
    const properties = PropertiesService.getScriptProperties().getAll();
    const links = {};
    
    ['ingredients', 'recipes', 'suppliers', 'inventory', 'analytics', 'system'].forEach(dbName => {
      if (properties[dbName]) {
        try {
          const db = SpreadsheetApp.openById(properties[dbName]);
          links[dbName] = {
            name: db.getName(),
            url: db.getUrl()
          };
        } catch (error) {
          links[dbName] = {
            error: 'Cannot access database'
          };
        }
      }
    });
    
    console.log('🔗 Quick Access Links:');
    Object.entries(links).forEach(([dbName, dbInfo]) => {
      if (dbInfo.url) {
        console.log(`🍹 ${dbName.charAt(0).toUpperCase() + dbName.slice(1)}: ${dbInfo.url}`);
      } else {
        console.log(`❌ ${dbName}: ${dbInfo.error || 'Not available'}`);
      }
    });
    
    return links;
    
  } catch (error) {
    console.error('❌ Error getting links:', error);
    return { error: error.toString() };
  }
}

/**
 * Display installation success message
 */
function showInstallationSuccess(result) {
  console.log('');
  console.log('🎉🍹 INSTALLATION SUCCESSFUL! 🍹🎉');
  console.log('═'.repeat(50));
  
  if (result.type === 'fresh_installation') {
    console.log('✅ Fresh installation completed successfully!');
  } else if (result.type === 'system_update') {
    console.log(`✅ System updated from v${result.fromVersion} to v${result.toVersion}!`);
  } else if (result.type === 'health_check_repair') {
    console.log('✅ System health check and repair completed!');
  }
  
  console.log(`📦 Version: ${result.version || ADVANCED_SYSTEM_CONFIG.version}`);
  console.log('');
  
  console.log('🚀 Next Steps:');
  console.log('1. Run getQuickAccessLinks() to get direct links to your databases');
  console.log('2. Run getSystemInfo() to see your system configuration');
  console.log('3. Run checkSystemHealth() to verify everything is working');
  console.log('4. Start adding ingredients and creating recipes!');
  console.log('');
  
  console.log('📚 Need Help?');
  console.log('• Check the documentation in your BMS folder');
  console.log('• Run getTroubleshootingSteps() for common solutions');
  console.log('• Use the web interface for easy recipe creation');
  console.log('');
  
  if (result.newFeatures) {
    console.log('🆕 New Features in v3.3.0:');
    result.newFeatures.newFeatures.forEach((feature, index) => {
      console.log(`${index + 1}. ${feature}`);
    });
    console.log('');
  }
  
  console.log('═'.repeat(50));
}

/**
 * Display installation error message
 */
function showInstallationError(result) {
  console.log('');
  console.log('❌ INSTALLATION FAILED');
  console.log('═'.repeat(50));
  console.log(`Error: ${result.error || result.message}`);
  console.log('');
  
  console.log('🔧 Troubleshooting Steps:');
  const troubleshooting = getTroubleshootingSteps();
  troubleshooting.forEach((step, index) => {
    console.log(`${index + 1}. ${step}`);
  });
  
  console.log('');
  console.log('💡 Quick Fixes:');
  console.log('• Try running forceFreshInstallation() for a clean start');
  console.log('• Run checkSystemHealth() to identify specific issues');
  console.log('• Make sure you have sufficient Google Drive storage space');
  console.log('• Check that you have permission to create files in Google Drive');
  console.log('═'.repeat(50));
}

/**
 * Get troubleshooting steps
 */
function getTroubleshootingSteps() {
  return [
    'Check that you have sufficient Google Drive storage space',
    'Verify you have permission to create files and folders in Google Drive', 
    'Try running the installation again (temporary issues often resolve)',
    'Run forceFreshInstallation() if you want to start completely fresh',
    'Check the Google Apps Script execution logs for detailed error information',
    'Make sure no other scripts are running that might conflict',
    'If migrating from an old version, ensure the old databases are accessible',
    'Try clearing your browser cache and running the installation again'
  ];
}

/**
 * 📖 SHOW INSTALLATION GUIDE
 * Display step-by-step installation guide
 */
function showInstallationGuide() {
  console.log('📖 BEVERAGE MANAGEMENT SYSTEM v3.3.0');
  console.log('Installation Guide');
  console.log('═'.repeat(50));
  console.log('');
  
  console.log('🚀 QUICK START:');
  console.log('Run this command to install or update:');
  console.log('   installBeverageManagementSystem()');
  console.log('');
  
  console.log('📋 WHAT THIS SYSTEM INCLUDES:');
  console.log('• Enhanced ingredient management with brand tracking');
  console.log('• Professional recipe creation with subcategories');
  console.log('• Menu integration and summary features');
  console.log('• Precision measurements (1/16th increments)');
  console.log('• Advanced supplier and inventory management');
  console.log('• Business analytics and reporting');
  console.log('• Automatic backup and health monitoring');
  console.log('');
  
  console.log('🔧 AVAILABLE FUNCTIONS:');
  console.log('• installBeverageManagementSystem() - Main installer');
  console.log('• forceFreshInstallation() - Clean installation');
  console.log('• checkSystemHealth() - Health check');
  console.log('• backupSystem() - Create backup');
  console.log('• getSystemInfo() - System information');
  console.log('• getQuickAccessLinks() - Database links');
  console.log('');
  
  console.log('💡 TIPS:');
  console.log('• Installation typically takes 30-60 seconds');
  console.log('• All your data will be organized in Google Sheets');
  console.log('• The system supports both individual and team use');
  console.log('• Regular backups are recommended');
  console.log('');
  
  console.log('🆘 NEED HELP?');
  console.log('Run getTroubleshootingSteps() for common solutions');
  console.log('═'.repeat(50));
}

// Auto-display guide when file is loaded
showInstallationGuide();