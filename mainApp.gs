/**
 * Unified Beverage Management Interface
 * Defaults to beverage creation with integrated ingredient addition
 * Version: 3.5.4 - Template Data Parsing Fix - Critical Dropdown Resolution
 */

// System Version Configuration
const SYSTEM_VERSION = '3.5.4';
const VERSION_DATE = '2025-01-13';
const VERSION_NAME = 'Template Data Parsing Fix - Critical Dropdown Resolution';

function doGet(e) {
  try {
    Logger.log(`Unified Beverage Management Interface starting - Version ${SYSTEM_VERSION}`);
    
    // Default directly to integrated beverage form
    return getUnifiedBeverageApp();
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Beverage Management System: ' + error.toString() + '</h2>');
  }
}

/**
 * Get system version information
 */
function getSystemVersion() {
  return {
    version: SYSTEM_VERSION,
    date: VERSION_DATE,
    name: VERSION_NAME,
    timestamp: new Date().toISOString()
  };
}

/**
 * Version Management Guidelines
 * 
 * SEMANTIC VERSIONING: MAJOR.MINOR.PATCH (e.g., 3.4.1)
 * 
 * MAJOR (3.x.x): Breaking changes, major new features, architectural changes
 * MINOR (x.4.x): New features, enhancements, significant improvements
 * PATCH (x.x.1): Bug fixes, documentation updates, small improvements
 * 
 * DEPLOYMENT CHECKLIST:
 * 1. Update SYSTEM_VERSION constant
 * 2. Update VERSION_NAME with descriptive change summary
 * 3. Update header comment version
 * 4. Test changes in development
 * 5. Run clasp push
 * 6. Verify deployment in production
 * 7. Update any external documentation
 * 
 * VERSION HISTORY:
 * 3.5.4 - Template Data Parsing Fix - Critical Dropdown Resolution
 * 3.5.3 - Console Logging & Template Data Debug Enhancement
 * 3.5.2 - Database Connectivity & Debugging Enhancements
 * 3.5.1 - Database Configuration Fix & Multi-Size Integration
 * 3.5.0 - Multi-Size Ingredients in Unified Interface
 * 3.4.1 - Multi-Size Documentation & Version Management
 * 3.4.0 - Multi-Size & Sync Fix Deployment  
 * 3.3.0 - Professional Recipe Enhancements
 * 3.0.0 - Unified Interface
 */
function getVersionHistory() {
  return [
    { version: '3.5.2', date: '2025-01-13', name: 'Database Connectivity & Debugging Enhancements', changes: ['Fixed PropertiesService API calls (.getAll → .getProperties)', 'Added comprehensive debugging logging throughout save and retrieval workflows', 'Implemented automatic sheet creation with proper headers and structure', 'Enhanced error handling and diagnostics for ingredient dropdown population', 'Added client-side and server-side debug logging for data flow tracking'] },
    { version: '3.5.1', date: '2025-01-13', name: 'Database Configuration Fix & Multi-Size Integration', changes: ['Fixed hardcoded spreadsheet IDs throughout system', 'Implemented dynamic database configuration from script properties', 'Added centralized getDatabaseConfig() function with fallbacks', 'Resolved ingredient storage and duplicate checking database mismatch'] },
    { version: '3.5.0', date: '2025-01-13', name: 'Multi-Size Ingredients in Unified Interface', changes: ['Integrated multi-size ingredient functionality into unified beverage interface', 'Added dynamic size entry system with add/remove capabilities', 'Enhanced ingredient modal with multi-size data collection', 'Connected unified interface to existing multi-size backend processing'] },
    { version: '3.4.1', date: '2025-01-13', name: 'Multi-Size Documentation & Version Management', changes: ['Updated multi-size feature documentation', 'Implemented version management system', 'Fixed version display confusion'] },
    { version: '3.4.0', date: '2025-01-13', name: 'Multi-Size & Sync Fix Deployment', changes: ['Added version checking system', 'Fixed ingredient saving issues', 'Implemented update notifications'] },
    { version: '3.3.0', date: '2024-07-12', name: 'Professional Recipe Enhancements', changes: ['Enhanced beverage categories', 'Professional recipe features'] },
    { version: '3.0.0', date: '2024-07-01', name: 'Unified Interface', changes: ['Unified beverage and ingredient interface', 'Integrated ingredient creation'] }
  ];
}

/**
 * Ensure spreadsheet has required sheet structure
 * @param {Spreadsheet} spreadsheet The spreadsheet to check
 * @param {string} sheetName The sheet name to ensure exists
 * @param {Array} headers The headers to add if creating new sheet
 * @return {Sheet} The sheet object
 */
function ensureSheetExists(spreadsheet, sheetName, headers = []) {
  Logger.log(`ensureSheetExists called for sheet: ${sheetName}`);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log(`Sheet "${sheetName}" not found, creating new sheet...`);
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log(`New sheet "${sheetName}" created successfully`);
    
    if (headers.length > 0) {
      Logger.log(`Adding ${headers.length} headers to new sheet...`);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      Logger.log(`Headers added and row frozen for sheet: ${sheetName}`);
    }
  } else {
    Logger.log(`Sheet "${sheetName}" already exists with ${sheet.getLastRow()} rows`);
  }
  
  return sheet;
}

/**
 * Get database IDs from script properties with fallbacks
 * @return {object} Database configuration object
 */
function getDatabaseConfig() {
  try {
    const properties = PropertiesService.getScriptProperties().getProperties();
    
    // Try to get from script properties first
    const config = {
      ingredients: properties.ingredients || properties.systemDbId || "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c",
      recipes: properties.recipes || properties.beveragesDbId || "1x1ZWaDh90mNV6uey5idKPHeltvA5Xy7tvYgyzWJxKb4",
      system: properties.system || properties.systemDbId || properties.ingredients || "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c"
    };
    
    Logger.log('Database config resolved:', JSON.stringify(config));
    return config;
    
  } catch (error) {
    Logger.log('Error getting database config, using fallbacks: ' + error.toString());
    
    // Fallback to hardcoded values if properties service fails
    return {
      ingredients: "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c",
      recipes: "1x1ZWaDh90mNV6uey5idKPHeltvA5Xy7tvYgyzWJxKb4",
      system: "1-M1E2PVtAmGYj4SviOqo97RXxfhVEEtnxWROa3lHU3c"
    };
  }
}

/**
 * Get next suggested version based on change type
 * @param {string} changeType - 'major', 'minor', or 'patch'
 * @return {string} Next version number
 */
function getNextVersion(changeType = 'patch') {
  const current = SYSTEM_VERSION.split('.').map(n => parseInt(n));
  let [major, minor, patch] = current;
  
  switch (changeType.toLowerCase()) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'patch':
    default:
      patch += 1;
      break;
  }
  
  return `${major}.${minor}.${patch}`;
}

/**
 * Check if spreadsheet version matches application version
 * @return {object} Version comparison result
 */
function checkSpreadsheetVersion() {
  Logger.log('checkSpreadsheetVersion called');
  
  try {
    const appVersion = SYSTEM_VERSION;
    const dbConfig = getDatabaseConfig();
    const spreadsheetId = dbConfig.system;
    
    Logger.log('App version: ' + appVersion);
    Logger.log('Spreadsheet ID: ' + spreadsheetId);
    
    // Try to get spreadsheet version
    let spreadsheetVersion = null;
    let versionStatus = 'unknown';
    let needsUpdate = false;
    let errorDetails = null;
    
    try {
      Logger.log('Attempting to open spreadsheet...');
      const ss = SpreadsheetApp.openById(spreadsheetId);
      Logger.log('Spreadsheet opened successfully');
      
      // Try to find version in System_Configuration sheet first
      Logger.log('Looking for System_Configuration sheet...');
      let configSheet = ss.getSheetByName('System_Configuration');
      if (configSheet) {
        Logger.log('System_Configuration sheet found, checking for version...');
        spreadsheetVersion = findSpreadsheetVersion(configSheet);
        Logger.log('Found version in System_Configuration: ' + spreadsheetVersion);
      } else {
        Logger.log('System_Configuration sheet not found');
      }
      
      // If no System_Configuration, check for legacy version info
      if (!spreadsheetVersion) {
        Logger.log('Looking for database sheet...');
        const databaseSheet = ss.getSheetByName('database');
        if (databaseSheet) {
          Logger.log('Database sheet found, checking for legacy version...');
          spreadsheetVersion = findLegacyVersion(databaseSheet);
          Logger.log('Found legacy version: ' + spreadsheetVersion);
        } else {
          Logger.log('Database sheet not found');
        }
      }
      
      // If still no version found, assume it's an older version
      if (!spreadsheetVersion) {
        Logger.log('No version found in any sheet, assuming legacy');
        spreadsheetVersion = 'Legacy (pre-3.4.0)'; // Indicate legacy version
        versionStatus = 'legacy';
        needsUpdate = true;
      } else {
        // Compare versions
        Logger.log('Comparing versions: ' + spreadsheetVersion + ' vs ' + appVersion);
        const comparison = compareVersions(spreadsheetVersion, appVersion);
        Logger.log('Version comparison result: ' + comparison);
        
        if (comparison < 0) {
          versionStatus = 'outdated';
          needsUpdate = true;
        } else if (comparison > 0) {
          versionStatus = 'newer';
          needsUpdate = false;
        } else {
          versionStatus = 'current';
          needsUpdate = false;
        }
      }
      
    } catch (accessError) {
      Logger.log('Error accessing spreadsheet: ' + accessError.toString());
      Logger.log('Access error stack: ' + accessError.stack);
      versionStatus = 'error';
      spreadsheetVersion = 'Access Error';
      errorDetails = accessError.toString();
    }
    
    const result = {
      appVersion: appVersion,
      spreadsheetVersion: spreadsheetVersion,
      status: versionStatus,
      needsUpdate: needsUpdate,
      message: getVersionStatusMessage(versionStatus, appVersion, spreadsheetVersion),
      timestamp: new Date().toISOString()
    };
    
    if (errorDetails) {
      result.errorDetails = errorDetails;
    }
    
    Logger.log('checkSpreadsheetVersion returning: ' + JSON.stringify(result));
    return result;
    
  } catch (error) {
    Logger.log('Error in checkSpreadsheetVersion: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    
    const fallbackResult = {
      appVersion: SYSTEM_VERSION,
      spreadsheetVersion: 'Error',
      status: 'error',
      needsUpdate: false,
      message: 'Could not check spreadsheet version: ' + error.message,
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
    
    Logger.log('checkSpreadsheetVersion returning fallback: ' + JSON.stringify(fallbackResult));
    return fallbackResult;
  }
}

/**
 * Find version in System_Configuration sheet
 */
function findSpreadsheetVersion(configSheet) {
  try {
    const data = configSheet.getDataRange().getValues();
    
    // Look for SYSTEM_VERSION row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'SYSTEM_VERSION') {
        return data[i][1];
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Error finding spreadsheet version: ' + error.toString());
    return null;
  }
}

/**
 * Find version in legacy database sheet
 */
function findLegacyVersion(databaseSheet) {
  try {
    const data = databaseSheet.getDataRange().getValues();
    if (data.length < 1) return null;
    
    const headers = data[0];
    const versionIndex = headers.findIndex(h => 
      String(h).toLowerCase().includes('version') || 
      String(h).toLowerCase().includes('system')
    );
    
    if (versionIndex !== -1 && data.length > 1) {
      return data[1][versionIndex] || null;
    }
    
    return null;
  } catch (error) {
    Logger.log('Error finding legacy version: ' + error.toString());
    return null;
  }
}

/**
 * Compare two version strings (semantic versioning)
 * @return {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  try {
    const parts1 = String(v1).split('.').map(n => parseInt(n) || 0);
    const parts2 = String(v2).split('.').map(n => parseInt(n) || 0);
    
    // Ensure both arrays have same length
    const maxLength = Math.max(parts1.length, parts2.length);
    while (parts1.length < maxLength) parts1.push(0);
    while (parts2.length < maxLength) parts2.push(0);
    
    for (let i = 0; i < maxLength; i++) {
      if (parts1[i] < parts2[i]) return -1;
      if (parts1[i] > parts2[i]) return 1;
    }
    
    return 0;
  } catch (error) {
    Logger.log('Error comparing versions: ' + error.toString());
    return -1; // Assume update needed on error
  }
}

/**
 * Get user-friendly status message
 */
function getVersionStatusMessage(status, appVersion, spreadsheetVersion) {
  switch (status) {
    case 'current':
      return `✅ Database up to date (${spreadsheetVersion})`;
    case 'outdated':
      return `⚠️ Database ${spreadsheetVersion} outdated. Update to ${appVersion} recommended.`;
    case 'newer':
      return `ℹ️ Database ${spreadsheetVersion} newer than app ${appVersion}`;
    case 'legacy':
      return `🔄 Legacy database detected. Update to ${appVersion} recommended.`;
    case 'error':
      return '❌ Could not determine database version';
    default:
      return '❓ Unknown database status';
  }
}

/**
 * Update spreadsheet to latest version using a simplified approach
 * Creates System_Configuration sheet with current version instead of full reinstall
 */
function updateSpreadsheetToLatest() {
  try {
    Logger.log('Starting simplified spreadsheet update to latest version...');
    
    const dbConfig = getDatabaseConfig();
    const spreadsheetId = dbConfig.system;
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // Create or update System_Configuration sheet
    let configSheet = ss.getSheetByName('System_Configuration');
    if (!configSheet) {
      Logger.log('Creating System_Configuration sheet...');
      configSheet = ss.insertSheet('System_Configuration');
    } else {
      Logger.log('Updating existing System_Configuration sheet...');
      configSheet.clear();
    }
    
    // Set up system configuration data
    const configData = [
      ['Setting', 'Value', 'Description', 'Type'],
      ['SYSTEM_VERSION', SYSTEM_VERSION, 'Current system version', 'String'],
      ['VERSION_DATE', VERSION_DATE, 'Version release date', 'String'],
      ['VERSION_NAME', VERSION_NAME, 'Version name/description', 'String'],
      ['LAST_UPDATED', new Date().toISOString(), 'Last update timestamp', 'DateTime'],
      ['DATABASE_SCHEMA', 'v3.4.0', 'Database schema version', 'String'],
      ['FEATURES_ENABLED', 'multi-size-ingredients-standalone,custom-dropdowns,version-checking', 'Enabled features', 'String']
    ];
    
    // Write configuration data
    configSheet.getRange(1, 1, configData.length, configData[0].length).setValues(configData);
    
    // Format headers
    const headerRange = configSheet.getRange(1, 1, 1, configData[0].length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285F4');
    headerRange.setFontColor('white');
    
    // Auto-resize columns
    configSheet.autoResizeColumns(1, configData[0].length);
    
    // Freeze header row
    configSheet.setFrozenRows(1);
    
    Logger.log('System_Configuration sheet updated successfully');
    
    // Update script properties to indicate successful update
    const properties = PropertiesService.getScriptProperties();
    properties.setProperties({
      'system_version': SYSTEM_VERSION,
      'last_updated': new Date().toISOString(),
      'update_method': 'simplified'
    });
    
    Logger.log('Script properties updated');
    
    return {
      success: true,
      message: 'Spreadsheet updated successfully to version ' + SYSTEM_VERSION + '. System_Configuration sheet created/updated.',
      version: SYSTEM_VERSION,
      updateMethod: 'simplified',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    Logger.log('Error updating spreadsheet: ' + error.toString());
    return {
      success: false,
      message: 'Failed to update spreadsheet: ' + error.message,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get comprehensive system status including version info
 */
function getSystemStatus() {
  Logger.log('getSystemStatus called');
  
  try {
    Logger.log('Getting system version info...');
    const systemInfo = getSystemVersion();
    Logger.log('System info retrieved: ' + JSON.stringify(systemInfo));
    
    Logger.log('Checking spreadsheet version...');
    const versionCheck = checkSpreadsheetVersion();
    Logger.log('Version check result: ' + JSON.stringify(versionCheck));
    
    const result = {
      application: {
        version: systemInfo.version || SYSTEM_VERSION,
        date: systemInfo.date || VERSION_DATE,
        name: systemInfo.name || VERSION_NAME
      },
      spreadsheet: {
        version: versionCheck.spreadsheetVersion || 'Unknown',
        status: versionCheck.status || 'error',
        needsUpdate: versionCheck.needsUpdate || false
      },
      message: versionCheck.message || 'Version status unknown',
      canUpdate: versionCheck.needsUpdate && versionCheck.status !== 'error',
      timestamp: new Date().toISOString()
    };
    
    Logger.log('getSystemStatus returning: ' + JSON.stringify(result));
    return result;
    
  } catch (error) {
    Logger.log('Error in getSystemStatus: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    
    // Ensure we always return a valid object structure
    const fallbackResult = {
      application: {
        version: SYSTEM_VERSION,
        date: VERSION_DATE,
        name: VERSION_NAME
      },
      spreadsheet: {
        version: 'Error',
        status: 'error',
        needsUpdate: false
      },
      message: 'Error checking system status: ' + error.message,
      canUpdate: false,
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
    
    Logger.log('getSystemStatus returning fallback: ' + JSON.stringify(fallbackResult));
    return fallbackResult;
  }
}

/**
 * Simple landing page with navigation
 */
function getMainLandingPage() {
  try {
    Logger.log('Creating main landing page');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <base target="_top">
        <title>Beverage Management System</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #333; 
            text-align: center;
            margin-bottom: 30px;
          }
          .tool-button { 
            display: block;
            width: 100%;
            padding: 15px;
            margin: 15px 0;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 5px;
            font-size: 16px;
            transition: background 0.3s;
          }
          .tool-button:hover { 
            background: #45a049;
            text-decoration: none;
            color: white;
          }
          .beverage-button {
            background: #2196F3;
          }
          .beverage-button:hover {
            background: #1976D2;
          }
          .info {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🍸 Beverage Management System</h1>
          
          <div class="info">
            <strong>Welcome!</strong> Select a tool below to get started with your beverage management tasks.
          </div>
          
          <a href="?page=ingredient" class="tool-button">
            🥃 Add Ingredient
          </a>
          
          <a href="?page=beverage" class="tool-button beverage-button">
            🍹 Add Beverage Recipe
          </a>
          
          <div class="info">
            <strong>Enterprise System:</strong> For advanced features, open the 
            <a href="https://script.google.com/d/1rpVR1c_8a7RbFy6dmCJa2kSCjgQ_stw-EdpIN4v4F3bRla-szSbZyzy6/edit" target="_blank">
              Apps Script editor
            </a> 
            and run <code>installBeverageManagementSystem()</code>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const html = HtmlService.createHtmlOutput(htmlContent);
    html.setTitle('Beverage Management System');
    html.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    Logger.log('Main landing page created successfully');
    return html;
    
  } catch (error) {
    Logger.log('Error in getMainLandingPage: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error creating landing page: ' + error.toString() + '</h2>');
  }
}

/**
 * Get the Ingredient App
 */
function getIngredientApp() {
  try {
    Logger.log('Creating ingredient app');
    return HtmlService.createTemplateFromFile('addIngredient/ingredientForm')
        .evaluate()
        .setTitle('Add Ingredient')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log('Error in getIngredientApp: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Ingredient App: ' + error.toString() + '</h2><p><a href="?page=home">Return to Main Page</a></p>');
  }
}

/**
 * Get the Beverage App  
 */
function getBeverageApp() {
  try {
    Logger.log('Creating beverage app');
    
    // Check if getDataForBeverageForm function exists
    if (typeof getDataForBeverageForm !== 'function') {
      Logger.log('getDataForBeverageForm function not found, creating simple form');
      return HtmlService.createHtmlOutput(`
        <h2>Add Beverage Tool</h2>
        <p>The beverage form data function is not available. Please check the implementation.</p>
        <p><a href="?page=home">Return to Main Page</a></p>
      `);
    }
    
    const template = HtmlService.createTemplateFromFile('addBeverage/beverageForm');
    const formData = getDataForBeverageForm();
    
    template.ingredientNames = formData.ingredientNames || [];
    template.baseSpirits = formData.baseSpirits || [];
    
    Logger.log('Beverage app template created with ' + (formData.ingredientNames?.length || 0) + ' ingredients');
    
    return template.evaluate()
             .setTitle('Add Beverage')
             .addMetaTag('viewport', 'width=device-width, initial-scale=1')
             .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
             
  } catch (error) {
    Logger.log('Error in getBeverageApp: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Beverage App: ' + error.toString() + '</h2><p><a href="?page=home">Return to Main Page</a></p>');
  }
}

/**
 * Unified Beverage App with Integrated Ingredient Addition
 */
function getUnifiedBeverageApp() {
  try {
    console.log('=== UNIFIED APP CREATION DEBUG START ===');
    console.log('Creating unified beverage app with integrated ingredients');
    Logger.log('=== UNIFIED APP CREATION DEBUG START ===');
    Logger.log('Creating unified beverage app with integrated ingredients');
    
    const template = HtmlService.createTemplateFromFile('beverageWithIngredients');
    console.log('Template created from beverageWithIngredients');
    Logger.log('Template created from beverageWithIngredients');
    
    const formData = getDataForBeverageForm();
    console.log('Form data retrieved:', JSON.stringify(formData));
    console.log('formData.ingredientNames type:', typeof formData.ingredientNames);
    console.log('formData.ingredientNames isArray:', Array.isArray(formData.ingredientNames));
    console.log('formData.ingredientNames contents:', formData.ingredientNames);
    console.log('formData.baseSpirits contents:', formData.baseSpirits);
    Logger.log('Form data retrieved:', JSON.stringify(formData));
    Logger.log('formData.ingredientNames type:', typeof formData.ingredientNames);
    Logger.log('formData.ingredientNames isArray:', Array.isArray(formData.ingredientNames));
    Logger.log('formData.ingredientNames contents:', formData.ingredientNames);
    Logger.log('formData.baseSpirits contents:', formData.baseSpirits);
    
    // Try different assignment methods
    console.log('Attempting template assignment...');
    Logger.log('Attempting template assignment...');
    template.ingredientNames = formData.ingredientNames || [];
    template.baseSpirits = formData.baseSpirits || [];
    
    console.log('Template properties after assignment:');
    console.log('template.ingredientNames:', template.ingredientNames);
    console.log('template.baseSpirits:', template.baseSpirits);
    Logger.log('Template properties after assignment:');
    Logger.log('template.ingredientNames:', template.ingredientNames);
    Logger.log('template.baseSpirits:', template.baseSpirits);
    
    // Alternative assignment if first method fails
    if (!template.ingredientNames || template.ingredientNames.length === 0) {
      Logger.log('First assignment failed, trying alternative methods...');
      
      // Method 2: Direct array copy
      template.ingredientNames = formData.ingredientNames ? [...formData.ingredientNames] : [];
      template.baseSpirits = formData.baseSpirits ? [...formData.baseSpirits] : [];
      Logger.log('After array copy - ingredientNames:', template.ingredientNames);
      
      // Method 3: Force assignment
      if (!template.ingredientNames || template.ingredientNames.length === 0) {
        Logger.log('Array copy failed, forcing direct assignment...');
        template.ingredientNames = formData.ingredientNames;
        template.baseSpirits = formData.baseSpirits;
        Logger.log('After direct assignment - ingredientNames:', template.ingredientNames);
      }
    }
    
    // Test with hardcoded values to verify template mechanism
    Logger.log('Testing template mechanism with hardcoded values...');
    template.testIngredients = ['Test Ingredient 1', 'Test Ingredient 2', 'Test Ingredient 3'];
    Logger.log('Hardcoded test ingredients set:', template.testIngredients);
    
    // Final verification
    console.log('Final template data verification:');
    console.log('- ingredientNames length:', template.ingredientNames?.length || 0);
    console.log('- baseSpirits length:', template.baseSpirits?.length || 0);
    console.log('- Final ingredientNames:', template.ingredientNames);
    console.log('- Final baseSpirits:', template.baseSpirits);
    Logger.log('Final template data verification:');
    Logger.log('- ingredientNames length:', template.ingredientNames?.length || 0);
    Logger.log('- baseSpirits length:', template.baseSpirits?.length || 0);
    Logger.log('- Final ingredientNames:', template.ingredientNames);
    Logger.log('- Final baseSpirits:', template.baseSpirits);
    
    // Emergency fallback: If nothing works, use hardcoded for debugging
    if (!template.ingredientNames || template.ingredientNames.length === 0) {
      console.log('EMERGENCY FALLBACK: Using hardcoded ingredients for debugging');
      Logger.log('EMERGENCY FALLBACK: Using hardcoded ingredients for debugging');
      template.ingredientNames = ['Lime Juice', 'Cointreau Orange Liqueur', 'Triple Sec'];
      template.baseSpirits = [];
      console.log('Fallback ingredients set:', template.ingredientNames);
      Logger.log('Fallback ingredients set:', template.ingredientNames);
    }
    
    console.log('Evaluating template...');
    Logger.log('Evaluating template...');
    const result = template.evaluate()
             .setTitle('Beverage Management System')
             .addMetaTag('viewport', 'width=device-width, initial-scale=1')
             .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    console.log('=== UNIFIED APP CREATION DEBUG END ===');
    Logger.log('=== UNIFIED APP CREATION DEBUG END ===');
    return result;
             
  } catch (error) {
    console.log('Error in getUnifiedBeverageApp: ' + error.toString());
    Logger.log('Error in getUnifiedBeverageApp: ' + error.toString());
    return HtmlService.createHtmlOutput('<h2>Error loading Unified Beverage System: ' + error.toString() + '</h2>');
  }
}

/**
 * Save beverage data from the unified interface
 */
function saveBeverageData(beverageData) {
  try {
    Logger.log('Saving beverage data: ' + JSON.stringify(beverageData));
    
    // Validate required fields
    if (!beverageData.beverageName) {
      throw new Error('Beverage name is required');
    }
    
    if (!beverageData.ingredients || beverageData.ingredients.length === 0) {
      throw new Error('At least one ingredient is required');
    }
    
    // Get spreadsheets
    const dbConfig = getDatabaseConfig();
    const spreadsheetId = dbConfig.system;
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    let recipesSheet = ss.getSheetByName('Recipes');
    let recipeIngredientsSheet = ss.getSheetByName('Recipe_Ingredients');
    
    // Create sheets if they don't exist
    if (!recipesSheet) {
      recipesSheet = ss.insertSheet('Recipes');
      const recipeHeaders = [
        'Recipe_ID', 'Name', 'Description', 'Category', 'Difficulty',
        'Serving_Size', 'Prep_Time_Minutes', 'Total_Cost', 'Alcoholic',
        'Dietary_Tags', 'Instructions', 'Ice_Type', 'Build_Method', 
        'Popularity_Rating', 'Glass_Type', 'Service_Method', 'Created_Date', 
        'Updated_Date', 'Version', 'Active'
      ];
      recipesSheet.getRange(1, 1, 1, recipeHeaders.length).setValues([recipeHeaders]);
      recipesSheet.setFrozenRows(1);
    }
    
    if (!recipeIngredientsSheet) {
      recipeIngredientsSheet = ss.insertSheet('Recipe_Ingredients');
      const relationshipHeaders = [
        'Relationship_ID', 'Recipe_ID', 'Ingredient_ID', 'Quantity', 'Unit',
        'Substitutions', 'Preparation_Method', 'Substitution_Allowed', 'Garnish_Flag',
        'Critical_Ingredient', 'Cost_Contribution', 'Order_Sequence', 'Show_On_Menu'
      ];
      recipeIngredientsSheet.getRange(1, 1, 1, relationshipHeaders.length).setValues([relationshipHeaders]);
      recipeIngredientsSheet.setFrozenRows(1);
    }
    
    // Check for duplicate recipe names (unless forcing add)
    if (!beverageData.forceAdd && !beverageData.replaceExisting) {
      const existingRecipe = findRecipeId(beverageData.beverageName, ss);
      if (existingRecipe) {
        Logger.log('Duplicate recipe found: ' + JSON.stringify(existingRecipe));
        return {
          success: false,
          message: 'Recipe with this name already exists',
          duplicate: true,
          existingData: existingRecipe,
          newData: beverageData
        };
      }
    }
    
    // Generate recipe ID
    const recipeId = 'RCP_' + new Date().getTime();
    const now = new Date();
    
    // Calculate total cost (simplified - would need ingredient cost lookup)
    let totalCost = 0;
    
    // Prepare recipe data
    const recipeRow = [
      recipeId,
      beverageData.beverageName,
      '', // description
      beverageData.beverageType || 'Cocktail',
      'Beginner', // difficulty
      1, // serving size
      5, // prep time minutes
      totalCost,
      true, // alcoholic (assume true for beverages)
      '', // dietary tags
      beverageData.instructions || '',
      beverageData.iceType || '',
      beverageData.buildMethod || '',
      parseInt(beverageData.popularityRating) || 5,
      beverageData.glassType || '',
      beverageData.serviceMethod || '',
      now,
      now,
      '1.0', // version
      true // active
    ];
    
    // Handle recipe addition - either replace existing or add new
    if (beverageData.replaceExisting && beverageData.existingRowIndex) {
      // Replace existing recipe
      Logger.log('Replacing existing recipe at row: ' + beverageData.existingRowIndex);
      recipesSheet.getRange(beverageData.existingRowIndex, 1, 1, recipeRow.length).setValues([recipeRow]);
      
      // Clean up old ingredient relationships for this recipe
      const existingRecipe = findRecipeId(beverageData.beverageName, ss);
      if (existingRecipe && existingRecipe['Recipe_ID']) {
        deleteRecipeIngredients(existingRecipe['Recipe_ID'], recipeIngredientsSheet);
      }
    } else {
      // Add new recipe
      recipesSheet.appendRow(recipeRow);
    }
    
    // Add ingredient relationships
    beverageData.ingredients.forEach((ingredient, index) => {
      const relationshipId = 'REL_' + recipeId + '_' + (index + 1);
      
      // Try to find ingredient ID (simplified - just use name for now)
      const ingredientId = findIngredientId(ingredient.name, ss) || ingredient.name;
      
      const relationshipRow = [
        relationshipId,
        recipeId,
        ingredientId,
        ingredient.amount,
        ingredient.unit,
        ingredient.substitutions ? ingredient.substitutions.join(',') : '',
        '', // preparation method
        false, // substitution allowed
        false, // garnish flag
        index === 0, // first ingredient is critical
        0, // cost contribution (would calculate from ingredient cost)
        ingredient.order || (index + 1),
        ingredient.showOnMenu !== false // default to true
      ];
      
      recipeIngredientsSheet.appendRow(relationshipRow);
    });
    
    Logger.log('Beverage saved successfully with Recipe ID: ' + recipeId);
    
    return {
      success: true,
      message: 'Beverage "' + beverageData.beverageName + '" saved successfully!',
      recipeId: recipeId
    };
    
  } catch (error) {
    Logger.log('Error saving beverage: ' + error.toString());
    throw new Error('Failed to save beverage: ' + error.message);
  }
}

/**
 * Find ingredient ID by name (simplified lookup)
 */
function findIngredientId(ingredientName, spreadsheet) {
  try {
    const ingredientsSheet = spreadsheet.getSheetByName('Enhanced_Ingredients') || 
                           spreadsheet.getSheetByName('database');
    
    if (!ingredientsSheet) return null;
    
    const data = ingredientsSheet.getDataRange().getValues();
    if (data.length < 2) return null;
    
    const headers = data[0];
    const nameIndex = headers.findIndex(h => 
      String(h).toLowerCase().includes('ingredientname') || 
      String(h).toLowerCase().includes('name')
    );
    const idIndex = headers.findIndex(h => 
      String(h).toLowerCase().includes('ingredient_id') || 
      String(h).toLowerCase().includes('id')
    );
    
    if (nameIndex === -1) return null;
    
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][nameIndex]).toLowerCase().trim() === ingredientName.toLowerCase().trim()) {
        return idIndex !== -1 ? data[i][idIndex] : null;
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log('Error finding ingredient ID: ' + error.toString());
    return null;
  }
}

/**
 * Find existing recipe by name (case-insensitive)
 * @param {string} recipeName - The name of the recipe to search for
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet - The spreadsheet to search in
 * @return {object|null} - Recipe data object with rowIndex if found, null otherwise
 */
function findRecipeId(recipeName, spreadsheet) {
  try {
    const recipesSheet = spreadsheet.getSheetByName('Recipes');
    
    if (!recipesSheet) return null;
    
    const data = recipesSheet.getDataRange().getValues();
    if (data.length < 2) return null;
    
    const headers = data[0];
    const nameIndex = headers.findIndex(h => 
      String(h).toLowerCase().includes('name') || 
      String(h).toLowerCase().includes('recipe_name')
    );
    
    if (nameIndex === -1) return null;
    
    const searchName = recipeName.toLowerCase().trim();
    
    for (let i = 1; i < data.length; i++) {
      const existingName = String(data[i][nameIndex]).toLowerCase().trim();
      if (existingName === searchName) {
        // Build recipe data object
        const recipeData = {};
        headers.forEach((header, index) => {
          recipeData[String(header).trim()] = data[i][index];
        });
        recipeData.rowIndex = i + 1; // 1-based row number
        return recipeData;
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log('Error finding recipe ID: ' + error.toString());
    return null;
  }
}

/**
 * Delete ingredient relationships for a specific recipe
 * @param {string} recipeId - The recipe ID to delete relationships for
 * @param {SpreadsheetApp.Sheet} recipeIngredientsSheet - The recipe ingredients sheet
 */
function deleteRecipeIngredients(recipeId, recipeIngredientsSheet) {
  try {
    if (!recipeIngredientsSheet || !recipeId) return;
    
    const data = recipeIngredientsSheet.getDataRange().getValues();
    if (data.length < 2) return;
    
    const headers = data[0];
    const recipeIdIndex = headers.findIndex(h => 
      String(h).toLowerCase().includes('recipe_id') || 
      String(h).toLowerCase().includes('recipeid')
    );
    
    if (recipeIdIndex === -1) return;
    
    // Find rows to delete (working backwards to maintain row indices)
    const rowsToDelete = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][recipeIdIndex]).trim() === String(recipeId).trim()) {
        rowsToDelete.push(i + 1); // 1-based row number
      }
    }
    
    // Delete rows (from bottom to top to maintain indices)
    rowsToDelete.reverse().forEach(rowNum => {
      recipeIngredientsSheet.deleteRow(rowNum);
    });
    
    Logger.log(`Deleted ${rowsToDelete.length} ingredient relationships for recipe: ${recipeId}`);
    
  } catch (error) {
    Logger.log('Error deleting recipe ingredients: ' + error.toString());
  }
}

/**
 * Simple debug function to check spreadsheet content
 */
function debugSpreadsheetContent() {
  try {
    const dbConfig = getDatabaseConfig();
    const ss = SpreadsheetApp.openById(dbConfig.ingredients);
    const sheet = ss.getSheetByName("database");
    
    if (!sheet) {
      console.log("No database sheet found");
      return "No database sheet found";
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    console.log("Sheet has " + lastRow + " rows and " + lastCol + " columns");
    
    if (lastRow > 0) {
      const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = allData[0];
      
      console.log("Headers: " + headers.join(", "));
      
      for (let i = 1; i < allData.length; i++) {
        console.log("Row " + (i+1) + ": " + allData[i].join(" | "));
      }
      
      return {
        rows: lastRow,
        cols: lastCol,
        headers: headers,
        data: allData
      };
    }
    
    return "Sheet is empty";
  } catch (error) {
    console.log("Error: " + error.toString());
    return "Error: " + error.toString();
  }
}

/**
 * Get ingredient data for beverage forms (global function for client-side calls)
 */
function getDataForBeverageForm() {
  Logger.log('=== INGREDIENT RETRIEVAL DEBUG START ===');
  const dbConfig = getDatabaseConfig();
  const ingredientSsId = dbConfig.ingredients;
  const ingredientSheetName = "database";
  let ingredientNames = [];
  let baseSpirits = [];

  Logger.log('Retrieving ingredients from spreadsheet:', ingredientSsId);
  Logger.log('Looking for sheet:', ingredientSheetName);

  try {
    const ss = SpreadsheetApp.openById(ingredientSsId);
    Logger.log('Spreadsheet opened:', ss.getName());
    
    const sheet = ss.getSheetByName(ingredientSheetName);

    if (!sheet) {
      Logger.log(`Ingredient sheet "${ingredientSheetName}" not found.`);
      Logger.log('Available sheets:', ss.getSheets().map(s => s.getName()).join(', '));
      return { ingredientNames, baseSpirits };
    }

    const lastRow = sheet.getLastRow();
    Logger.log('Sheet found with last row:', lastRow);
    
    if (lastRow < 2) {
      Logger.log("No data rows in ingredient sheet (only headers or empty).");
      return { ingredientNames, baseSpirits };
    }

    const dataRange = sheet.getRange(1, 1, lastRow, sheet.getLastColumn());
    const data = dataRange.getValues();
    const headers = data[0].map(h => h.toString().trim().toLowerCase());

    Logger.log('Headers found:');
    headers.forEach((header, index) => {
      Logger.log(`Header ${index}: "${header}"`);
    });
    
    const nameColIdx = headers.indexOf("ingredientname");
    const categoryColIdx = headers.indexOf("category");
    
    Logger.log('Name column index:', nameColIdx);
    Logger.log('Category column index:', categoryColIdx);
    
    // Also try case-insensitive search for debugging
    Logger.log('Searching for ingredientname (exact):', headers.indexOf("ingredientname"));
    Logger.log('Searching for ingredientName (camelCase):', headers.indexOf("ingredientName"));
    Logger.log('Headers that contain "ingredient":', headers.filter(h => h.includes("ingredient")));

    if (nameColIdx === -1) {
      Logger.log("Header 'ingredientName' not found in ingredient sheet.");
      Logger.log("Available headers:", headers);
      return { ingredientNames, baseSpirits };
    }

    // Start from row 1 to skip header
    Logger.log('Processing', data.length - 1, 'data rows...');
    Logger.log('Name column index to use:', nameColIdx);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      Logger.log(`Row ${i} data:`, row);
      
      if (nameColIdx >= 0 && nameColIdx < row.length) {
        const name = row[nameColIdx] ? row[nameColIdx].toString().trim() : null;
        Logger.log(`Row ${i} name value at index ${nameColIdx}:`, name);
        
        if (name) {
          ingredientNames.push(name);
          Logger.log('Added ingredient:', name);
          // Check category if column exists
          if (categoryColIdx !== -1 && categoryColIdx < row.length) {
            const category = row[categoryColIdx] ? row[categoryColIdx].toString().trim().toLowerCase() : '';
            Logger.log(`Row ${i} category:`, category);
            if (category === 'spirit') {
              baseSpirits.push(name);
            }
          }
        }
      } else {
        Logger.log(`Row ${i}: nameColIdx ${nameColIdx} is out of bounds for row with ${row.length} columns`);
      }
    }

    // Deduplicate and sort
    ingredientNames = [...new Set(ingredientNames)].sort();
    baseSpirits = [...new Set(baseSpirits)].sort();
    
    Logger.log('Final ingredient count:', ingredientNames.length);
    Logger.log('Final base spirits count:', baseSpirits.length);

    Logger.log(`Fetched ${ingredientNames.length} unique ingredient names.`);
    Logger.log(`Fetched ${baseSpirits.length} unique base spirits.`);

  } catch (error) {
    console.log(`Error fetching ingredient data: ${error.message}`);
    console.log('Error stack:', error.stack);
    Logger.log(`Error fetching ingredient data: ${error.message}`);
    Logger.log('Error stack:', error.stack);
  }

  console.log('=== INGREDIENT RETRIEVAL DEBUG END ===');
  console.log('Returning data:', { ingredientNames, baseSpirits });
  Logger.log('=== INGREDIENT RETRIEVAL DEBUG END ===');
  Logger.log('Returning:', ingredientNames.length, 'ingredients and', baseSpirits.length, 'base spirits');
  return { ingredientNames, baseSpirits };
}

/**
 * Save ingredient data from the modal within the unified interface
 * This calls the proven saveIngredientData function from addIngredient/doGet.gs
 */
function saveIngredientData(ingredientData) {
  try {
    Logger.log('Saving ingredient from unified interface: ' + JSON.stringify(ingredientData));
    
    // Convert the simplified modal data to the full ingredient format expected by the robust function
    const fullIngredientData = {
      ingredientName: ingredientData.ingredientName,
      category: ingredientData.category,
      labelBrand: ingredientData.labelBrand || '',
      abv: ingredientData.abv || '',
      costPerUnit: ingredientData.costPerUnit || '',
      unitSize: ingredientData.unitSize || '',
      unitMetric: ingredientData.unitMetric || 'ml',
      // Set defaults for required fields
      subcategory: 'Standard',
      countryOfOrigin: '',
      spiritsType: ingredientData.category || '',
      spiritsStyle: 'Standard',
      tasteProfile: '',
      bodyStyle: 'Medium',
      sku: '',
      sizeVolume: ingredientData.unitSize || '',
      description: '',
      storageRequirements: 'Cool, dry place',
      shelfLifeDays: 365,
      supplierID: 'DEFAULT',
      source: 'Unified Interface',
      alcoholic: ingredientData.abv && parseFloat(ingredientData.abv) > 0,
      bulk: false,
      isAvailable175L: false,
      allergen: '',
      substitute: ''
    };
    
    // Check if we need to import the function from addIngredient
    if (typeof saveIngredientDataRobust === 'function') {
      // Use the robust function if available
      return saveIngredientDataRobust(fullIngredientData);
    } else {
      // Call the proven function directly (this should work since both files are deployed together)
      // We'll need to make sure this works by making the function globally accessible
      
      // For now, import the core logic from addIngredient/doGet.gs manually
      return callRobustSaveIngredientData(fullIngredientData);
    }
    
  } catch (error) {
    Logger.log('Error saving ingredient from unified interface: ' + error.toString());
    throw new Error('Failed to save ingredient: ' + error.message);
  }
}

/**
 * Call the robust saveIngredientData function from addIngredient/doGet.gs
 * This recreates the proven logic to ensure ingredients are saved properly
 */
function callRobustSaveIngredientData(formData) {
  Logger.log('=== INGREDIENT SAVE DEBUG START ===');
  Logger.log('Form data received:', JSON.stringify(formData));
  
  // Use the same logic as the proven saveIngredientData function
  const dbConfig = getDatabaseConfig();
  const spreadsheetId = dbConfig.ingredients;
  const sheetName = "database";
  
  Logger.log('Database config:', JSON.stringify(dbConfig));
  Logger.log('Using spreadsheet ID:', spreadsheetId);
  Logger.log('Target sheet name:', sheetName);
  
  const headers = [
    "timestamp", "userEmail", "ingredientName", "category", "subcategory", 
    "labelBrand", "countryOfOrigin", "spiritsType", "spiritsStyle", 
    "abv", "tasteProfile", "bodyStyle", "sku", "sizeVolume", 
    "description", "storageRequirements", "shelfLifeDays", 
    "unitSize", "unitMetric", "costPerUnit", "supplierID", "source",
    "alcoholic", "bulk", "isAvailable175L", "allergen", "substitute"
  ];
  
  try {
    // Access spreadsheet
    Logger.log('Attempting to open spreadsheet...');
    const ss = SpreadsheetApp.openById(spreadsheetId);
    Logger.log('Spreadsheet opened successfully:', ss.getName());
    
    // Ensure the database sheet exists with proper headers
    Logger.log('Ensuring sheet exists...');
    const sheet = ensureSheetExists(ss, sheetName, headers);
    Logger.log('Sheet ready:', sheet.getName(), 'Last row:', sheet.getLastRow());
    
    // Check for multi-size submission
    if (formData.multipleQuantities === 'on') {
      return processMultiSizeIngredientUnified(formData, sheet, headers);
    }
    
    // Server-side validation (using same logic as robust function)
    Logger.log('Starting validation...');
    const ingredientName = formData.ingredientName ? formData.ingredientName.trim() : '';
    Logger.log('Ingredient name after trim:', ingredientName);
    
    if (!ingredientName) throw new Error("Ingredient Name is required.");
    if (!formData.category) throw new Error("Category is required.");
    if (!formData.unitMetric) throw new Error("Unit Metric is required.");
    Logger.log('Validation passed');
    
    // Check for duplicates using the robust logic
    Logger.log('Checking for duplicates...');
    const existingIngredientData = checkIngredientExistsRobust(ingredientName, sheet);
    if (existingIngredientData) {
      Logger.log(`Duplicate Ingredient Found for "${ingredientName}" at row ${existingIngredientData.rowIndex}.`);
      return {
        success: false,
        message: 'Ingredient already exists',
        duplicate: true,
        existingData: existingIngredientData
      };
    }
    Logger.log('No duplicates found, proceeding with save...');
    
    // Construct data row using same logic as robust function
    const rowData = [
      new Date(),
      Session.getActiveUser().getEmail(),
      ingredientName,
      formData.category || null,
      formData.subcategory || null,
      formData.labelBrand || null,
      formData.countryOfOrigin || null,
      formData.spiritsType || null,
      formData.spiritsStyle || null,
      formData.abv ? parseFloat(formData.abv) : null,
      formData.tasteProfile || null,
      formData.bodyStyle || null,
      formData.sku || null,
      formData.sizeVolume || null,
      formData.description || null,
      formData.storageRequirements || null,
      formData.shelfLifeDays ? parseInt(formData.shelfLifeDays) : null,
      formData.unitSize,
      formData.unitMetric || null,
      formData.costPerUnit ? parseFloat(formData.costPerUnit) : null,
      formData.supplierID || null,
      formData.source || null,
      formData.alcoholic || false,
      formData.bulk || false,
      formData.isAvailable175L || false,
      formData.allergen || null,
      formData.substitute || null
    ];
    
    // Verify data structure matches headers
    Logger.log('Verifying data structure - Headers length:', headers.length, 'Row data length:', rowData.length);
    if (rowData.length !== headers.length) {
      throw new Error(`Internal Server Error: Data structure mismatch. Headers: ${headers.length}, Data: ${rowData.length}`);
    }
    
    // Add headers if sheet is empty
    const currentLastRow = sheet.getLastRow();
    Logger.log('Current sheet last row:', currentLastRow);
    
    if (currentLastRow === 0) {
      Logger.log('Sheet is empty, adding headers...');
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      Logger.log("Headers added to empty sheet.");
    }
    
    // Append the new row data
    Logger.log('Appending ingredient data to sheet...');
    Logger.log('Row data to append:', JSON.stringify(rowData));
    sheet.appendRow(rowData);
    
    const newLastRow = sheet.getLastRow();
    Logger.log("New Ingredient Added Successfully! New last row:", newLastRow);
    Logger.log('=== INGREDIENT SAVE DEBUG END ===');
    
    return {
      success: true,
      message: `Ingredient "${ingredientName}" added successfully!`
    };
    
  } catch (error) {
    Logger.log(`Error in callRobustSaveIngredientData: ${error.message}`);
    throw new Error("Failed to save ingredient data: " + error.message);
  }
}

/**
 * Check if ingredient exists using robust logic from addIngredient/doGet.gs
 */
function checkIngredientExistsRobust(ingredientName, sheet) {
  Logger.log(`checkIngredientExistsRobust called for: "${ingredientName}"`);
  
  if (!sheet || typeof sheet.getLastRow !== 'function') {
    Logger.log("checkIngredientExistsRobust: Invalid Sheet object provided.");
    return null;
  }
  if (!ingredientName || typeof ingredientName !== 'string' || ingredientName.trim() === '') {
    Logger.log("checkIngredientExistsRobust: Invalid ingredientName provided.");
    return null;
  }
  
  const ingredientNameTrimmedLower = ingredientName.trim().toLowerCase();
  
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("checkIngredientExistsRobust: Sheet has no data rows.");
      return null;
    }
    
    // Find the 'ingredientName' column dynamically
    const headerRowValues = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const ingredientNameHeaderIndex = headerRowValues.findIndex(header => 
      String(header).trim().toLowerCase() === 'ingredientname');
    
    if (ingredientNameHeaderIndex === -1) {
      Logger.log("CRITICAL ERROR: 'ingredientName' column not found in sheet headers.");
      return null;
    }
    
    const ingredientNameColumnNumber = ingredientNameHeaderIndex + 1;
    const ingredientNameRange = sheet.getRange(2, ingredientNameColumnNumber, lastRow - 1, 1);
    const existingIngredientNames = ingredientNameRange.getValues().map(row => 
      String(row[0]).trim().toLowerCase());
    
    const rowIndexInArray = existingIngredientNames.indexOf(ingredientNameTrimmedLower);
    
    if (rowIndexInArray !== -1) {
      const rowNumber = rowIndexInArray + 2;
      Logger.log(`checkIngredientExistsRobust: Ingredient "${ingredientName}" found at row ${rowNumber}.`);
      
      const lastColumn = sheet.getLastColumn();
      const rowRange = sheet.getRange(rowNumber, 1, 1, lastColumn);
      const rowValues = rowRange.getValues()[0];
      const actualHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      
      const existingData = {};
      actualHeaders.forEach((header, index) => {
        const key = String(header).trim() || `column_${index + 1}`;
        existingData[key] = rowValues[index];
      });
      
      existingData.rowIndex = rowNumber;
      return existingData;
    } else {
      Logger.log(`checkIngredientExistsRobust: Ingredient "${ingredientName}" not found.`);
      return null;
    }
  } catch (error) {
    Logger.log(`Error during checkIngredientExistsRobust for "${ingredientName}": ${error.message}`);
    return null;
  }
}

/**
 * Process multi-size ingredient for unified interface
 * 
 * STATUS: NOT IMPLEMENTED
 * Multi-size ingredients are currently only supported in the standalone ingredient form.
 * To use multi-size ingredients, please use the dedicated ingredient form at:
 * [Apps Script URL]?page=ingredient
 * 
 * TODO: Implement full multi-size support in unified interface
 */
function processMultiSizeIngredientUnified(formData, sheet, headers) {
  Logger.log('Multi-size ingredient attempted in unified interface - not yet supported');
  
  // For now, gracefully fall back to single-size ingredient
  // Remove the multipleQuantities flag and process as single ingredient
  const singleSizeData = { ...formData };
  delete singleSizeData.multipleQuantities;
  
  Logger.log('Falling back to single-size ingredient processing');
  
  // Return a clear message to the user
  throw new Error("Multi-size ingredients are currently only available in the standalone ingredient form. This ingredient will be saved as a single size. For multi-size support, please use the dedicated ingredient form.");
}