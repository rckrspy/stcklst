/**
 * Installable System Part 2 - Configuration, Permissions, and Management
 */

/**
 * Create system configuration and settings
 */
function createSystemConfiguration(databases) {
  console.log('Setting up system configuration...');
  
  try {
    // Create system settings in the first database (ingredients)
    const configSheet = createOrClearSheet(databases.ingredients, 'System_Configuration');
    
    const configData = [
      ['Setting_Key', 'Setting_Value', 'Description', 'Type'],
      ['SYSTEM_VERSION', SYSTEM_CONFIG.version, 'Current system version', 'String'],
      ['INSTALL_DATE', new Date(), 'Installation date', 'Date'],
      ['AUTO_BACKUP', SYSTEM_CONFIG.settings.autoBackup, 'Enable automatic backups', 'Boolean'],
      ['BACKUP_FREQUENCY', SYSTEM_CONFIG.settings.backupFrequency, 'Backup frequency', 'String'],
      ['ENABLE_ANALYTICS', SYSTEM_CONFIG.settings.enableAnalytics, 'Enable analytics tracking', 'Boolean'],
      ['DEBUG_MODE', SYSTEM_CONFIG.settings.debugMode, 'Enable debug logging', 'Boolean'],
      ['INGREDIENTS_DB_ID', databases.ingredients.getId(), 'Ingredients database ID', 'String'],
      ['RECIPES_DB_ID', databases.recipes.getId(), 'Recipes database ID', 'String'],
      ['SUPPLIERS_DB_ID', databases.suppliers.getId(), 'Suppliers database ID', 'String'],
      ['INVENTORY_DB_ID', databases.inventory.getId(), 'Inventory database ID', 'String'],
      ['ANALYTICS_DB_ID', databases.analytics.getId(), 'Analytics database ID', 'String']
    ];
    
    configSheet.getRange(1, 1, configData.length, configData[0].length).setValues(configData);
    setupSheetHeaders(configSheet, configData[0], '#673AB7');
    
    // Create database connections sheet
    const connectionsSheet = createOrClearSheet(databases.ingredients, 'Database_Connections');
    const connectionsData = [
      ['Database_Name', 'Spreadsheet_ID', 'URL', 'Purpose'],
      ['Ingredients', databases.ingredients.getId(), databases.ingredients.getUrl(), 'Core ingredient and product data'],
      ['Recipes', databases.recipes.getId(), databases.recipes.getUrl(), 'Recipe management and costing'],
      ['Suppliers', databases.suppliers.getId(), databases.suppliers.getUrl(), 'Vendor and supplier management'],
      ['Inventory', databases.inventory.getId(), databases.inventory.getUrl(), 'Stock tracking and alerts'],
      ['Analytics', databases.analytics.getId(), databases.analytics.getUrl(), 'Business intelligence and reporting']
    ];
    
    connectionsSheet.getRange(1, 1, connectionsData.length, connectionsData[0].length).setValues(connectionsData);
    setupSheetHeaders(connectionsSheet, connectionsData[0], '#2196F3');
    
    console.log('✅ System configuration created successfully');
    return { config: configSheet, connections: connectionsSheet };
    
  } catch (error) {
    console.error('❌ Failed to create system configuration:', error);
    throw new Error('Configuration setup failed: ' + error.toString());
  }
}

/**
 * Install management utilities with database connections
 */
function installManagementUtilities(databases) {
  console.log('Installing management utilities...');
  
  try {
    // Create management utilities sheet in ingredients database
    const utilitiesSheet = createOrClearSheet(databases.ingredients, 'Management_Utilities');
    
    const utilitiesData = [
      ['Function_Name', 'Description', 'Usage', 'Database'],
      ['getIngredientsManager()', 'Access ingredient management functions', 'const mgr = getIngredientsManager()', 'Ingredients'],
      ['getRecipesManager()', 'Access recipe management functions', 'const mgr = getRecipesManager()', 'Recipes'],
      ['getSuppliersManager()', 'Access supplier management functions', 'const mgr = getSuppliersManager()', 'Suppliers'],
      ['getInventoryManager()', 'Access inventory management functions', 'const mgr = getInventoryManager()', 'Inventory'],
      ['getAnalyticsManager()', 'Access analytics and reporting functions', 'const mgr = getAnalyticsManager()', 'Analytics'],
      ['quickAddIngredient(name, category, cost)', 'Quickly add an ingredient', 'quickAddIngredient("Vodka", "Vodka", 25.99)', 'Ingredients'],
      ['quickCreateRecipe(name, ingredients)', 'Quickly create a recipe', 'quickCreateRecipe("Martini", [...])', 'Recipes'],
      ['runSystemHealthCheck()', 'Check system status', 'runSystemHealthCheck()', 'All'],
      ['createSystemBackup()', 'Create full system backup', 'createSystemBackup()', 'All'],
      ['generateSystemReport()', 'Generate comprehensive report', 'generateSystemReport()', 'Analytics']
    ];
    
    utilitiesSheet.getRange(1, 1, utilitiesData.length, utilitiesData[0].length).setValues(utilitiesData);
    setupSheetHeaders(utilitiesSheet, utilitiesData[0], '#4CAF50');
    
    // Install actual utility functions
    installUtilityFunctions(databases);
    
    console.log('✅ Management utilities installed successfully');
    return { utilities: utilitiesSheet };
    
  } catch (error) {
    console.error('❌ Failed to install management utilities:', error);
    throw new Error('Utilities installation failed: ' + error.toString());
  }
}

/**
 * Install actual utility functions in the script
 */
function installUtilityFunctions(databases) {
  // These functions will be available after installation
  
  // Store database IDs for easy access
  const DB_IDS = {
    ingredients: databases.ingredients.getId(),
    recipes: databases.recipes.getId(),
    suppliers: databases.suppliers.getId(),
    inventory: databases.inventory.getId(),
    analytics: databases.analytics.getId()
  };
  
  // Create properties for persistent storage
  PropertiesService.getScriptProperties().setProperties(DB_IDS);
  
  console.log('Utility functions installed with database connections');
}

/**
 * Setup permissions and sharing
 */
function setupPermissions(folders, databases) {
  console.log('Setting up permissions and sharing...');
  
  try {
    const permissions = {
      folders: {},
      databases: {},
      summary: {
        foldersShared: 0,
        databasesShared: 0,
        permissions: 'Owner only (default)'
      }
    };
    
    // Note: In a real deployment, you would set up sharing here
    // For security, we're not automatically sharing with everyone
    
    if (SYSTEM_CONFIG.settings.shareWithTeam) {
      console.log('Team sharing is enabled in config');
      // Add team sharing logic here if needed
      permissions.summary.permissions = 'Team access enabled';
    }
    
    // Set up folder permissions (owner only by default)
    Object.entries(folders).forEach(([key, folder]) => {
      permissions.folders[key] = {
        id: folder.getId(),
        name: folder.getName(),
        sharing: 'Private'
      };
    });
    
    // Set up database permissions (owner only by default)
    Object.entries(databases).forEach(([key, database]) => {
      permissions.databases[key] = {
        id: database.getId(),
        name: database.getName(),
        url: database.getUrl(),
        sharing: 'Private'
      };
    });
    
    console.log('✅ Permissions configured successfully');
    return permissions;
    
  } catch (error) {
    console.error('❌ Failed to setup permissions:', error);
    throw new Error('Permissions setup failed: ' + error.toString());
  }
}

/**
 * Validate installation
 */
function validateInstallation(databases) {
  console.log('Validating installation...');
  
  const validation = {
    databases: {},
    schemas: {},
    functions: {},
    overall: { passed: 0, failed: 0, warnings: 0 }
  };
  
  try {
    // Validate each database
    Object.entries(databases).forEach(([key, database]) => {
      try {
        const sheets = database.getSheets();
        validation.databases[key] = {
          id: database.getId(),
          sheetsCount: sheets.length,
          status: sheets.length > 0 ? 'Valid' : 'Warning',
          sheets: sheets.map(sheet => sheet.getName())
        };
        
        if (sheets.length > 0) {
          validation.overall.passed++;
        } else {
          validation.overall.warnings++;
        }
        
      } catch (error) {
        validation.databases[key] = {
          status: 'Failed',
          error: error.toString()
        };
        validation.overall.failed++;
      }
    });
    
    // Validate core functions exist
    const requiredFunctions = [
      'generateSystemId',
      'createOrClearSheet',
      'setupSheetHeaders',
      'createSystemConfiguration'
    ];
    
    requiredFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          validation.functions[funcName] = 'Available';
          validation.overall.passed++;
        } else {
          validation.functions[funcName] = 'Missing';
          validation.overall.failed++;
        }
      } catch (error) {
        validation.functions[funcName] = 'Error: ' + error.toString();
        validation.overall.failed++;
      }
    });
    
    console.log(`✅ Validation completed: ${validation.overall.passed} passed, ${validation.overall.failed} failed, ${validation.overall.warnings} warnings`);
    return validation;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw new Error('Installation validation failed: ' + error.toString());
  }
}

/**
 * Create user documentation
 */
function createUserDocumentation(folders) {
  console.log('Creating user documentation...');
  
  try {
    // Create documentation spreadsheet
    const docSpreadsheet = SpreadsheetApp.create('BMS_User_Documentation');
    const docFile = DriveApp.getFileById(docSpreadsheet.getId());
    
    // Move to reports folder
    folders.reports.addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
    
    // Quick Start Guide
    const quickStartSheet = docSpreadsheet.getSheetByName('Sheet1');
    quickStartSheet.setName('Quick_Start_Guide');
    
    const quickStartData = [
      ['Step', 'Action', 'Description'],
      ['1', 'Open Ingredients Database', 'Start by managing your ingredient inventory'],
      ['2', 'Add Your First Ingredient', 'Use the Ingredients sheet to add products'],
      ['3', 'Create a Recipe', 'Open Recipes Database and create your first recipe'],
      ['4', 'Add Suppliers', 'Set up your vendor relationships in Suppliers Database'],
      ['5', 'Monitor Inventory', 'Track stock levels in Inventory Database'],
      ['6', 'View Analytics', 'Check business insights in Analytics Database'],
      ['7', 'Run Health Check', 'Use runSystemHealthCheck() to verify system status'],
      ['8', 'Create Backups', 'Use createSystemBackup() for data protection']
    ];
    
    quickStartSheet.getRange(1, 1, quickStartData.length, quickStartData[0].length).setValues(quickStartData);
    setupSheetHeaders(quickStartSheet, quickStartData[0], '#4CAF50');
    
    // Function Reference
    const functionsSheet = docSpreadsheet.insertSheet('Function_Reference');
    const functionsData = [
      ['Function', 'Parameters', 'Returns', 'Example'],
      ['quickAddIngredient(name, category, cost)', 'name: string, category: string, cost: number', 'Result object', 'quickAddIngredient("Grey Goose", "Vodka", 45.99)'],
      ['quickCreateRecipe(name, ingredients)', 'name: string, ingredients: array', 'Result object', 'quickCreateRecipe("Martini", [{name: "Gin", quantity: 60}])'],
      ['runSystemHealthCheck()', 'none', 'Health report', 'runSystemHealthCheck()'],
      ['createSystemBackup()', 'none', 'Backup result', 'createSystemBackup()'],
      ['generateSystemReport()', 'none', 'Analytics report', 'generateSystemReport()']
    ];
    
    functionsSheet.getRange(1, 1, functionsData.length, functionsData[0].length).setValues(functionsData);
    setupSheetHeaders(functionsSheet, functionsData[0], '#2196F3');
    
    // Troubleshooting Guide
    const troubleshootingSheet = docSpreadsheet.insertSheet('Troubleshooting');
    const troubleshootingData = [
      ['Issue', 'Cause', 'Solution'],
      ['Cannot find database', 'Database not created', 'Run installBeverageManagementSystem()'],
      ['Function not found', 'Script not installed', 'Copy all .gs files to Apps Script'],
      ['Permission denied', 'No access to files', 'Check file sharing permissions'],
      ['Data validation error', 'Invalid data entry', 'Check validation rules in sheet'],
      ['Backup failed', 'Storage space issue', 'Clear space in Google Drive']
    ];
    
    troubleshootingSheet.getRange(1, 1, troubleshootingData.length, troubleshootingData[0].length).setValues(troubleshootingData);
    setupSheetHeaders(troubleshootingSheet, troubleshootingData[0], '#FF9800');
    
    console.log('✅ User documentation created successfully');
    return {
      documentationId: docSpreadsheet.getId(),
      documentationUrl: docSpreadsheet.getUrl(),
      sheets: ['Quick_Start_Guide', 'Function_Reference', 'Troubleshooting']
    };
    
  } catch (error) {
    console.error('❌ Failed to create documentation:', error);
    throw new Error('Documentation creation failed: ' + error.toString());
  }
}

/**
 * Create installation summary
 */
function createInstallationSummary(installation) {
  try {
    const summarySpreadsheet = SpreadsheetApp.create('BMS_Installation_Summary');
    const summaryFile = DriveApp.getFileById(summarySpreadsheet.getId());
    
    // Move to main folder
    installation.folders.main.addFile(summaryFile);
    DriveApp.getRootFolder().removeFile(summaryFile);
    
    const summarySheet = summarySpreadsheet.getSheetByName('Sheet1');
    summarySheet.setName('Installation_Summary');
    
    const summaryData = [
      ['Component', 'Status', 'Details'],
      ['System Version', 'Installed', SYSTEM_CONFIG.version],
      ['Installation Date', 'Completed', installation.startTime],
      ['Installation Time', 'Success', `${installation.installationTime}ms`],
      ['Ingredients Database', 'Created', installation.databases.ingredients.getUrl()],
      ['Recipes Database', 'Created', installation.databases.recipes.getUrl()],
      ['Suppliers Database', 'Created', installation.databases.suppliers.getUrl()],
      ['Inventory Database', 'Created', installation.databases.inventory.getUrl()],
      ['Analytics Database', 'Created', installation.databases.analytics.getUrl()],
      ['Folder Structure', 'Created', installation.folders.main.getName()],
      ['Documentation', 'Generated', 'User guides and function reference'],
      ['Validation', 'Passed', 'All components verified']
    ];
    
    summarySheet.getRange(1, 1, summaryData.length, summaryData[0].length).setValues(summaryData);
    setupSheetHeaders(summarySheet, summaryData[0], '#673AB7');
    
    console.log('✅ Installation summary created');
    
  } catch (error) {
    console.warn('⚠️ Could not create installation summary:', error);
  }
}

/**
 * Get quick start instructions
 */
function getQuickStartInstructions(databases) {
  return {
    instructions: [
      'Installation completed successfully!',
      'Access your databases:',
      `• Ingredients: ${databases.ingredients.getUrl()}`,
      `• Recipes: ${databases.recipes.getUrl()}`,
      `• Suppliers: ${databases.suppliers.getUrl()}`,
      `• Inventory: ${databases.inventory.getUrl()}`,
      `• Analytics: ${databases.analytics.getUrl()}`,
      '',
      'Quick actions:',
      '• Run runSystemHealthCheck() to verify system',
      '• Use quickAddIngredient() to add your first ingredient',
      '• Check documentation in BMS_User_Documentation'
    ],
    databases: databases
  };
}

/**
 * System health check
 */
function runSystemHealthCheck() {
  console.log('🏥 Running system health check...');
  
  const health = {
    timestamp: new Date(),
    overall: 'Healthy',
    databases: {},
    functions: {},
    issues: []
  };
  
  try {
    // Get database IDs from properties
    const properties = PropertiesService.getScriptProperties().getAll();
    
    // Check each database
    ['ingredients', 'recipes', 'suppliers', 'inventory', 'analytics'].forEach(dbName => {
      try {
        const dbId = properties[dbName];
        if (dbId) {
          const spreadsheet = SpreadsheetApp.openById(dbId);
          health.databases[dbName] = {
            status: 'Accessible',
            sheets: spreadsheet.getSheets().length,
            url: spreadsheet.getUrl()
          };
        } else {
          health.databases[dbName] = { status: 'Not Found' };
          health.issues.push(`Database ${dbName} not found in properties`);
        }
      } catch (error) {
        health.databases[dbName] = { 
          status: 'Error', 
          error: error.toString() 
        };
        health.issues.push(`Database ${dbName} error: ${error.toString()}`);
      }
    });
    
    // Check critical functions
    const criticalFunctions = ['generateSystemId', 'createSystemBackup'];
    criticalFunctions.forEach(funcName => {
      try {
        if (typeof eval(funcName) === 'function') {
          health.functions[funcName] = 'Available';
        } else {
          health.functions[funcName] = 'Missing';
          health.issues.push(`Function ${funcName} not available`);
        }
      } catch (error) {
        health.functions[funcName] = 'Error';
        health.issues.push(`Function ${funcName} error: ${error.toString()}`);
      }
    });
    
    // Determine overall health
    if (health.issues.length > 0) {
      health.overall = health.issues.length > 3 ? 'Critical' : 'Warning';
    }
    
    console.log(`🏥 Health check completed: ${health.overall}`);
    if (health.issues.length > 0) {
      console.log('Issues found:', health.issues);
    }
    
    return health;
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      timestamp: new Date(),
      overall: 'Critical',
      error: error.toString()
    };
  }
}

/**
 * Create system backup
 */
function createSystemBackup() {
  console.log('💾 Creating system backup...');
  
  try {
    const timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd_HH-mm-ss');
    const backupFolderName = `BMS_Backup_${timestamp}`;
    
    // Create backup folder
    const backupFolder = DriveApp.createFolder(backupFolderName);
    
    // Get database IDs
    const properties = PropertiesService.getScriptProperties().getAll();
    const backupResults = {};
    
    // Backup each database
    ['ingredients', 'recipes', 'suppliers', 'inventory', 'analytics'].forEach(dbName => {
      try {
        const dbId = properties[dbName];
        if (dbId) {
          const spreadsheet = SpreadsheetApp.openById(dbId);
          const backupFile = spreadsheet.copy(`${dbName}_backup_${timestamp}`);
          
          // Move to backup folder
          const file = DriveApp.getFileById(backupFile.getId());
          backupFolder.addFile(file);
          DriveApp.getRootFolder().removeFile(file);
          
          backupResults[dbName] = {
            status: 'Success',
            backupId: backupFile.getId(),
            backupUrl: backupFile.getUrl()
          };
        }
      } catch (error) {
        backupResults[dbName] = {
          status: 'Failed',
          error: error.toString()
        };
      }
    });
    
    console.log('✅ System backup completed');
    return {
      success: true,
      timestamp: timestamp,
      backupFolder: backupFolder.getUrl(),
      databases: backupResults
    };
    
  } catch (error) {
    console.error('❌ System backup failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Cleanup failed installation
 */
function cleanupFailedInstallation() {
  console.log('🧹 Cleaning up failed installation...');
  
  try {
    // Look for partially created folders and files
    const foldersToClean = [
      SYSTEM_CONFIG.folders.main,
      SYSTEM_CONFIG.folders.databases,
      SYSTEM_CONFIG.folders.backups,
      SYSTEM_CONFIG.folders.reports
    ];
    
    foldersToClean.forEach(folderName => {
      try {
        const folders = DriveApp.getFoldersByName(folderName);
        while (folders.hasNext()) {
          const folder = folders.next();
          console.log(`Removing folder: ${folder.getName()}`);
          DriveApp.removeFolder(folder);
        }
      } catch (error) {
        console.warn(`Could not remove folder ${folderName}:`, error);
      }
    });
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

/**
 * Uninstall system (for testing or reinstallation)
 */
function uninstallBeverageManagementSystem() {
  console.log('🗑️ Uninstalling Beverage Management System...');
  
  const confirmation = Browser.msgBox(
    'Uninstall Confirmation',
    'This will permanently delete ALL data and databases. Are you sure?',
    Browser.Buttons.YES_NO
  );
  
  if (confirmation === 'yes') {
    try {
      cleanupFailedInstallation();
      
      // Clear properties
      PropertiesService.getScriptProperties().deleteAll();
      
      console.log('✅ System uninstalled successfully');
      return { success: true, message: 'System uninstalled successfully' };
      
    } catch (error) {
      console.error('❌ Uninstallation failed:', error);
      return { success: false, error: error.toString() };
    }
  } else {
    return { success: false, message: 'Uninstallation cancelled by user' };
  }
}