/**
 * Advanced Beverage Management System Installer
 * Version: 3.3.0 - Professional Recipe Enhancements
 * Supports fresh installation, updates, and schema migrations
 * Date: 2024-07-12
 */

// System Configuration for Latest Build
const ADVANCED_SYSTEM_CONFIG = {
  systemName: 'Beverage Management System',
  version: '3.3.0',
  versionName: 'Professional Recipe Enhancements',
  buildDate: '2024-07-12',
  minimumRequiredVersion: '2.0.0',
  databases: {
    ingredients: 'BMS_Ingredients_Database_v3',
    recipes: 'BMS_Recipes_Database_v3', 
    suppliers: 'BMS_Suppliers_Database_v3',
    inventory: 'BMS_Inventory_Database_v3',
    analytics: 'BMS_Analytics_Database_v3',
    system: 'BMS_System_Configuration_v3'
  },
  features: {
    enhancedBeverageCategories: true,
    subcategoriesSupport: true,
    professionalIngredientsManagement: true,
    menuSummaryIntegration: true,
    preferredBrandTracking: true,
    precisionMeasurements: true,
    glassTypeReordering: true,
    serviceMethodIntegration: true
  }
};

/**
 * Master Installation & Update Function
 * Detects existing installation and performs appropriate action
 */
function installOrUpdateBeverageManagementSystem() {
  console.log(`🚀 Beverage Management System Installer v${ADVANCED_SYSTEM_CONFIG.version}`);
  console.log(`Build: ${ADVANCED_SYSTEM_CONFIG.versionName} (${ADVANCED_SYSTEM_CONFIG.buildDate})`);
  
  try {
    // Detect existing installation
    const existingInstallation = detectExistingInstallation();
    
    if (existingInstallation.found) {
      console.log(`📦 Existing installation detected: v${existingInstallation.version}`);
      
      // Check if update is needed
      if (isUpdateRequired(existingInstallation.version)) {
        console.log('⬆️ Update required. Starting update process...');
        return performSystemUpdate(existingInstallation);
      } else {
        console.log('✅ System is up to date. Performing health check...');
        return performHealthCheckAndRepair(existingInstallation);
      }
    } else {
      console.log('🆕 No existing installation found. Starting fresh installation...');
      return performFreshInstallation();
    }
    
  } catch (error) {
    console.error('❌ Installation/Update failed:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Installation or update failed. Please check logs and try again.',
      timestamp: new Date()
    };
  }
}

/**
 * Detect existing Beverage Management System installation
 */
function detectExistingInstallation() {
  console.log('🔍 Detecting existing installation...');
  
  try {
    // Check for system properties
    const properties = PropertiesService.getScriptProperties().getAll();
    
    // Look for system configuration database
    const systemDbId = properties.system || properties.ingredients;
    
    if (systemDbId) {
      try {
        const systemDb = SpreadsheetApp.openById(systemDbId);
        
        // Try to find system configuration
        let configSheet = systemDb.getSheetByName('System_Configuration');
        
        if (!configSheet) {
          // Check older format
          configSheet = systemDb.getSheetByName('database');
        }
        
        if (configSheet) {
          const version = findSystemVersion(configSheet);
          
          return {
            found: true,
            version: version || '2.0.0',
            systemDbId: systemDbId,
            properties: properties,
            databases: getDatabaseConnectionsFromProperties(properties)
          };
        }
      } catch (error) {
        console.warn('⚠️ Could not access system database:', error);
      }
    }
    
    // Check for legacy installations
    const legacyCheck = checkLegacyInstallation();
    if (legacyCheck.found) {
      return legacyCheck;
    }
    
    return { found: false };
    
  } catch (error) {
    console.warn('⚠️ Error detecting installation:', error);
    return { found: false };
  }
}

/**
 * Find system version from configuration sheet
 */
function findSystemVersion(configSheet) {
  try {
    const data = configSheet.getDataRange().getValues();
    
    // Look for version in System_Configuration format
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'SYSTEM_VERSION') {
        return data[i][1];
      }
    }
    
    // Check for version in legacy database format
    const headers = data[0];
    const versionIndex = headers.findIndex(h => 
      String(h).toLowerCase().includes('version') || 
      String(h).toLowerCase().includes('system')
    );
    
    if (versionIndex !== -1 && data.length > 1) {
      return data[1][versionIndex] || '1.0.0';
    }
    
    return '2.0.0'; // Default for detected but unversioned systems
    
  } catch (error) {
    console.warn('⚠️ Could not determine version:', error);
    return '1.0.0';
  }
}

/**
 * Check for legacy installation patterns
 */
function checkLegacyInstallation() {
  try {
    // Look for common legacy spreadsheet names
    const legacyNames = [
      'Stock List',
      'Ingredient Database',
      'Beverage Database',
      'BMS_Ingredients_Database',
      'BMS_Recipes_Database'
    ];
    
    for (const name of legacyNames) {
      try {
        const files = DriveApp.getFilesByName(name);
        if (files.hasNext()) {
          const file = files.next();
          const spreadsheet = SpreadsheetApp.openById(file.getId());
          
          return {
            found: true,
            version: '1.0.0',
            legacy: true,
            systemDbId: file.getId(),
            spreadsheet: spreadsheet,
            migrationRequired: true
          };
        }
      } catch (error) {
        continue;
      }
    }
    
    return { found: false };
    
  } catch (error) {
    console.warn('⚠️ Error checking legacy installation:', error);
    return { found: false };
  }
}

/**
 * Check if update is required
 */
function isUpdateRequired(currentVersion) {
  try {
    const current = parseVersion(currentVersion);
    const latest = parseVersion(ADVANCED_SYSTEM_CONFIG.version);
    
    return current.major < latest.major || 
           current.minor < latest.minor || 
           current.patch < latest.patch;
    
  } catch (error) {
    console.warn('⚠️ Error comparing versions, assuming update needed:', error);
    return true;
  }
}

/**
 * Parse version string into components
 */
function parseVersion(versionString) {
  const parts = String(versionString).split('.');
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
    full: versionString
  };
}

/**
 * Perform fresh installation
 */
function performFreshInstallation() {
  console.log('🆕 Starting fresh installation...');
  
  const installation = {
    startTime: new Date(),
    type: 'fresh',
    version: ADVANCED_SYSTEM_CONFIG.version,
    status: 'Installing',
    components: {},
    databases: {},
    folders: {},
    settings: {}
  };
  
  try {
    // Step 1: Create enhanced folder structure
    console.log('📁 Creating folder structure...');
    installation.folders = createEnhancedFolderStructure();
    
    // Step 2: Create latest database schemas
    console.log('🗄️ Creating database spreadsheets with v3.3.0 schemas...');
    installation.databases = createLatestDatabaseSchemas(installation.folders);
    
    // Step 3: Initialize enhanced schemas
    console.log('📋 Initializing enhanced database schemas...');
    installation.components.schemas = initializeLatestSchemas(installation.databases);
    
    // Step 4: Setup advanced system configuration
    console.log('⚙️ Setting up advanced system configuration...');
    installation.settings = createAdvancedSystemConfiguration(installation.databases);
    
    // Step 5: Install latest management utilities
    console.log('🔧 Installing latest management utilities...');
    installation.components.utilities = installLatestUtilities(installation.databases);
    
    // Step 6: Create enhanced documentation
    console.log('📚 Creating enhanced documentation...');
    installation.components.documentation = createEnhancedDocumentation(installation.folders);
    
    // Step 7: Run comprehensive validation
    console.log('✅ Running comprehensive validation...');
    installation.components.validation = validateLatestInstallation(installation.databases);
    
    installation.endTime = new Date();
    installation.status = 'Completed';
    installation.installationTime = installation.endTime.getTime() - installation.startTime.getTime();
    
    // Store installation info
    storeInstallationInfo(installation);
    
    console.log(`✅ Fresh installation completed successfully in ${installation.installationTime}ms!`);
    
    return {
      success: true,
      type: 'fresh_installation',
      version: ADVANCED_SYSTEM_CONFIG.version,
      message: `Beverage Management System v${ADVANCED_SYSTEM_CONFIG.version} installed successfully!`,
      installation: installation,
      quickStart: getLatestQuickStartInstructions(installation.databases)
    };
    
  } catch (error) {
    console.error('❌ Fresh installation failed:', error);
    
    // Attempt cleanup
    try {
      cleanupFailedInstallation();
    } catch (cleanupError) {
      console.error('❌ Cleanup also failed:', cleanupError);
    }
    
    throw error;
  }
}

/**
 * Perform system update
 */
function performSystemUpdate(existingInstallation) {
  console.log(`⬆️ Updating from v${existingInstallation.version} to v${ADVANCED_SYSTEM_CONFIG.version}...`);
  
  const update = {
    startTime: new Date(),
    type: 'update',
    fromVersion: existingInstallation.version,
    toVersion: ADVANCED_SYSTEM_CONFIG.version,
    status: 'Updating',
    backups: {},
    migrations: {},
    newComponents: {}
  };
  
  try {
    // Step 1: Create backup before update
    console.log('💾 Creating backup before update...');
    update.backups = createPreUpdateBackup(existingInstallation);
    
    // Step 2: Perform database schema migrations
    console.log('🔄 Performing database schema migrations...');
    update.migrations = performSchemaMigrations(existingInstallation);
    
    // Step 3: Update system configuration
    console.log('⚙️ Updating system configuration...');
    update.newComponents.configuration = updateSystemConfiguration(existingInstallation);
    
    // Step 4: Add new features and components
    console.log('🆕 Adding new features and components...');
    update.newComponents.features = addNewFeatures(existingInstallation);
    
    // Step 5: Update management utilities
    console.log('🔧 Updating management utilities...');
    update.newComponents.utilities = updateManagementUtilities(existingInstallation);
    
    // Step 6: Validate updated system
    console.log('✅ Validating updated system...');
    update.validation = validateUpdatedSystem(existingInstallation);
    
    update.endTime = new Date();
    update.status = 'Completed';
    update.updateTime = update.endTime.getTime() - update.startTime.getTime();
    
    // Store update info
    storeUpdateInfo(update);
    
    console.log(`✅ System updated successfully in ${update.updateTime}ms!`);
    
    return {
      success: true,
      type: 'system_update',
      fromVersion: existingInstallation.version,
      toVersion: ADVANCED_SYSTEM_CONFIG.version,
      message: `System successfully updated to v${ADVANCED_SYSTEM_CONFIG.version}!`,
      update: update,
      newFeatures: getNewFeaturesDescription()
    };
    
  } catch (error) {
    console.error('❌ System update failed:', error);
    
    // Attempt rollback if backup exists
    if (update.backups) {
      try {
        console.log('🔄 Attempting to restore from backup...');
        restoreFromBackup(update.backups);
      } catch (rollbackError) {
        console.error('❌ Rollback also failed:', rollbackError);
      }
    }
    
    throw error;
  }
}

/**
 * Create enhanced folder structure for v3.3.0
 */
function createEnhancedFolderStructure() {
  console.log('Creating enhanced folder structure...');
  
  const folders = {};
  
  try {
    // Create main system folder with version
    folders.main = createOrGetFolder(`${ADVANCED_SYSTEM_CONFIG.systemName} v${ADVANCED_SYSTEM_CONFIG.version}`);
    
    // Create enhanced subfolders
    folders.databases = createOrGetFolder('Databases', folders.main);
    folders.backups = createOrGetFolder('Backups', folders.main);
    folders.reports = createOrGetFolder('Reports', folders.main);
    folders.documentation = createOrGetFolder('Documentation', folders.main);
    folders.templates = createOrGetFolder('Templates', folders.main);
    folders.imports = createOrGetFolder('Import_Export', folders.main);
    
    console.log('✅ Enhanced folder structure created successfully');
    return folders;
    
  } catch (error) {
    console.error('❌ Failed to create enhanced folder structure:', error);
    throw new Error('Enhanced folder creation failed: ' + error.toString());
  }
}

/**
 * Create latest database schemas with v3.3.0 enhancements
 */
function createLatestDatabaseSchemas(folders) {
  console.log('Creating latest database schemas...');
  
  const databases = {};
  
  try {
    // Create Enhanced Ingredients Database
    databases.ingredients = createDatabase(
      ADVANCED_SYSTEM_CONFIG.databases.ingredients,
      folders.databases,
      'Enhanced ingredients with professional categorization and brand tracking'
    );
    
    // Create Enhanced Recipes Database  
    databases.recipes = createDatabase(
      ADVANCED_SYSTEM_CONFIG.databases.recipes,
      folders.databases,
      'Professional recipe management with subcategories and menu integration'
    );
    
    // Create Enhanced Suppliers Database
    databases.suppliers = createDatabase(
      ADVANCED_SYSTEM_CONFIG.databases.suppliers,
      folders.databases,
      'Advanced supplier management with performance tracking'
    );
    
    // Create Enhanced Inventory Database
    databases.inventory = createDatabase(
      ADVANCED_SYSTEM_CONFIG.databases.inventory,
      folders.databases,
      'Professional inventory tracking with precision measurements'
    );
    
    // Create Enhanced Analytics Database
    databases.analytics = createDatabase(
      ADVANCED_SYSTEM_CONFIG.databases.analytics,
      folders.databases,
      'Advanced business analytics with menu integration insights'
    );
    
    // Create System Configuration Database
    databases.system = createDatabase(
      ADVANCED_SYSTEM_CONFIG.databases.system,
      folders.databases,
      'System configuration and management database'
    );
    
    console.log('✅ All latest database schemas created successfully');
    return databases;
    
  } catch (error) {
    console.error('❌ Failed to create latest database schemas:', error);
    throw new Error('Latest database creation failed: ' + error.toString());
  }
}

/**
 * Initialize enhanced schemas for v3.3.0
 */
function initializeLatestSchemas(databases) {
  console.log('Initializing latest enhanced schemas...');
  
  const schemas = {};
  
  try {
    // Initialize Enhanced Ingredients Database
    schemas.ingredients = initializeEnhancedIngredientsDatabase(databases.ingredients);
    
    // Initialize Enhanced Recipes Database
    schemas.recipes = initializeEnhancedRecipesDatabase(databases.recipes);
    
    // Initialize Enhanced Suppliers Database
    schemas.suppliers = initializeEnhancedSuppliersDatabase(databases.suppliers);
    
    // Initialize Enhanced Inventory Database
    schemas.inventory = initializeEnhancedInventoryDatabase(databases.inventory);
    
    // Initialize Enhanced Analytics Database
    schemas.analytics = initializeEnhancedAnalyticsDatabase(databases.analytics);
    
    // Initialize System Configuration Database
    schemas.system = initializeSystemConfigurationDatabase(databases.system);
    
    console.log('✅ All latest enhanced schemas initialized successfully');
    return schemas;
    
  } catch (error) {
    console.error('❌ Failed to initialize latest schemas:', error);
    throw new Error('Latest schema initialization failed: ' + error.toString());
  }
}

/**
 * Initialize Enhanced Ingredients Database with v3.3.0 features
 */
function initializeEnhancedIngredientsDatabase(spreadsheet) {
  // Enhanced Ingredients Sheet with new columns
  const ingredientsSheet = createOrClearSheet(spreadsheet, 'Enhanced_Ingredients');
  const ingredientsHeaders = [
    'Ingredient_ID', 'Name', 'Category', 'Subcategory', 'Brand',
    'Country_of_Origin', 'Spirits_Type', 'Spirits_Style', 'ABV',
    'Taste_Profile', 'Body_Style', 'SKU', 'Size_Volume',
    'Description', 'Storage_Requirements', 'Shelf_Life_Days',
    'Cost_Per_Unit', 'Unit_Size', 'Unit_Metric', 'Supplier_ID',
    'Min_Quantity', 'Preferred_Brand', 'Show_On_Menu', 'Active',
    'Created_Date', 'Updated_Date'
  ];
  
  setupSheetHeaders(ingredientsSheet, ingredientsHeaders, '#4285F4');
  setupEnhancedIngredientsValidation(ingredientsSheet);
  
  // Enhanced Categories Reference with Subcategories
  const categoriesSheet = createOrClearSheet(spreadsheet, 'Enhanced_Categories');
  const categoriesData = [
    ['Category', 'Subcategory', 'Typical_ABV', 'Storage_Type', 'Professional_Grade'],
    ['Vodka', 'Premium', 40, 'Room Temperature', 'Professional'],
    ['Vodka', 'Flavored', 35, 'Room Temperature', 'Standard'],
    ['Vodka', 'Craft', 40, 'Room Temperature', 'Professional'],
    ['Tequila', 'Blanco', 40, 'Room Temperature', 'Professional'],
    ['Tequila', 'Reposado', 40, 'Room Temperature', 'Professional'],
    ['Tequila', 'Añejo', 40, 'Room Temperature', 'Premium'],
    ['Bourbon', 'Straight', 40, 'Room Temperature', 'Professional'],
    ['Bourbon', 'Small Batch', 43, 'Room Temperature', 'Premium'],
    ['Scotch', 'Single Malt', 40, 'Room Temperature', 'Premium'],
    ['Scotch', 'Blended', 40, 'Room Temperature', 'Professional'],
    ['Gin', 'London Dry', 40, 'Room Temperature', 'Professional'],
    ['Gin', 'Contemporary', 40, 'Room Temperature', 'Premium'],
    ['Rum', 'White', 40, 'Room Temperature', 'Standard'],
    ['Rum', 'Dark', 40, 'Room Temperature', 'Professional'],
    ['Rum', 'Aged', 40, 'Room Temperature', 'Premium']
  ];
  
  categoriesSheet.getRange(1, 1, categoriesData.length, categoriesData[0].length).setValues(categoriesData);
  setupSheetHeaders(categoriesSheet, categoriesData[0], '#34A853');
  
  // Brand Preferences Sheet
  const brandsSheet = createOrClearSheet(spreadsheet, 'Brand_Preferences');
  const brandsHeaders = [
    'Brand_ID', 'Brand_Name', 'Category', 'Quality_Tier', 'Cost_Tier',
    'Preferred_For_Menu', 'Supplier_ID', 'Notes'
  ];
  
  setupSheetHeaders(brandsSheet, brandsHeaders, '#FF9800');
  
  return { 
    ingredients: ingredientsSheet, 
    categories: categoriesSheet,
    brands: brandsSheet 
  };
}

/**
 * Initialize Enhanced Recipes Database with v3.3.0 features
 */
function initializeEnhancedRecipesDatabase(spreadsheet) {
  // Enhanced Recipes Sheet
  const recipesSheet = createOrClearSheet(spreadsheet, 'Recipes');
  const recipesHeaders = [
    'Recipe_ID', 'Name', 'Description', 'Category', 'Subcategory',
    'Difficulty', 'Serving_Size', 'Prep_Time_Minutes', 'Total_Cost', 
    'Alcoholic', 'Dietary_Tags', 'Instructions', 'Ice_Type', 'Build_Method', 
    'Popularity_Rating', 'Glass_Type', 'Service_Method', 'Created_Date', 
    'Updated_Date', 'Version', 'Active'
  ];
  
  setupSheetHeaders(recipesSheet, recipesHeaders, '#34A853');
  
  // Enhanced Recipe Ingredients Relationship Sheet
  const recipeIngredientsSheet = createOrClearSheet(spreadsheet, 'Recipe_Ingredients');
  const relationshipHeaders = [
    'Relationship_ID', 'Recipe_ID', 'Ingredient_ID', 'Quantity', 'Unit',
    'Preferred_Brand', 'Preparation_Method', 'Substitution_Allowed', 'Garnish_Flag',
    'Critical_Ingredient', 'Cost_Contribution', 'Order_Sequence', 'Show_On_Menu',
    'Min_Quantity', 'Notes'
  ];
  
  setupSheetHeaders(recipeIngredientsSheet, relationshipHeaders, '#FF9800');
  
  // Enhanced Recipe Categories with Subcategories
  const recipeCategoriesSheet = createOrClearSheet(spreadsheet, 'Recipe_Categories');
  const categoriesData = [
    ['Category', 'Subcategory', 'Description', 'Typical_Prep_Time', 'Difficulty_Level'],
    ['Cocktail', 'Classic Cocktail', 'Traditional well-known cocktails', 5, 'Intermediate'],
    ['Cocktail', 'Modern / Craft Cocktail', 'Contemporary and artisanal cocktails', 8, 'Advanced'],
    ['Cocktail', 'Tiki Cocktail', 'Polynesian-inspired tropical cocktails', 10, 'Advanced'],
    ['Cocktail', 'Seasonal Cocktail', 'Season-specific cocktails', 6, 'Intermediate'],
    ['Zero-Proof Cocktail', 'Classic Zero-Proof', 'Non-alcoholic versions of classics', 4, 'Easy'],
    ['Zero-Proof Cocktail', 'Innovative Zero-Proof', 'Creative non-alcoholic cocktails', 6, 'Intermediate'],
    ['Zero-Proof Cocktail', 'Functional Beverage', 'Health-focused non-alcoholic drinks', 3, 'Easy'],
    ['Mixed Drink', 'Simple Mixed Drink', '2-3 ingredient combinations', 2, 'Easy'],
    ['Mixed Drink', 'Complex Mixed Drink', 'Multi-ingredient mixed drinks', 5, 'Intermediate'],
    ['Mixed Drink', 'Batched Mixed Drink', 'Large format mixed drinks', 15, 'Intermediate']
  ];
  
  recipeCategoriesSheet.getRange(1, 1, categoriesData.length, categoriesData[0].length).setValues(categoriesData);
  setupSheetHeaders(recipeCategoriesSheet, categoriesData[0], '#9C27B0');
  
  // Menu Integration Sheet
  const menuSheet = createOrClearSheet(spreadsheet, 'Menu_Integration');
  const menuHeaders = [
    'Menu_Item_ID', 'Recipe_ID', 'Menu_Name', 'Menu_Description', 
    'Menu_Price', 'Menu_Category', 'Available', 'Featured'
  ];
  
  setupSheetHeaders(menuSheet, menuHeaders, '#E91E63');
  
  return { 
    recipes: recipesSheet, 
    recipeIngredients: recipeIngredientsSheet,
    categories: recipeCategoriesSheet,
    menu: menuSheet
  };
}

/**
 * Store installation information
 */
function storeInstallationInfo(installation) {
  try {
    const properties = {
      system: installation.databases.system.getId(),
      ingredients: installation.databases.ingredients.getId(),
      recipes: installation.databases.recipes.getId(),
      suppliers: installation.databases.suppliers.getId(),
      inventory: installation.databases.inventory.getId(),
      analytics: installation.databases.analytics.getId(),
      version: ADVANCED_SYSTEM_CONFIG.version,
      installationType: installation.type,
      installationDate: installation.startTime.toISOString()
    };
    
    PropertiesService.getScriptProperties().setProperties(properties);
    
    // Also store in system database
    const systemDb = installation.databases.system;
    const configSheet = systemDb.getSheetByName('Installation_Log') || 
                       systemDb.insertSheet('Installation_Log');
    
    const logEntry = [
      new Date(),
      installation.type,
      ADVANCED_SYSTEM_CONFIG.version,
      installation.installationTime,
      'Success',
      JSON.stringify(installation.components)
    ];
    
    if (configSheet.getLastRow() === 0) {
      const headers = ['Timestamp', 'Type', 'Version', 'Duration_ms', 'Status', 'Details'];
      configSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      setupSheetHeaders(configSheet, headers, '#673AB7');
    }
    
    configSheet.appendRow(logEntry);
    
  } catch (error) {
    console.warn('⚠️ Could not store installation info:', error);
  }
}

/**
 * Get new features description for v3.3.0
 */
function getNewFeaturesDescription() {
  return {
    version: ADVANCED_SYSTEM_CONFIG.version,
    versionName: ADVANCED_SYSTEM_CONFIG.versionName,
    newFeatures: [
      '🏷️ Enhanced beverage categories with professional subcategories',
      '🥃 Advanced ingredient management with preferred brand tracking',
      '📏 Precision measurements with 1/16th increments',
      '🍸 Improved glass type and service method integration',
      '📋 Enhanced menu summary with prominent display',
      '🔄 Optimized form field ordering for better workflow',
      '⚙️ Advanced system configuration and migration support',
      '📊 Professional-grade analytics and reporting capabilities'
    ],
    improvements: [
      'Better user interface with logical field ordering',
      'Enhanced data validation and error handling',
      'Improved performance and reliability',
      'Professional beverage industry standards compliance',
      'Advanced backup and recovery capabilities'
    ]
  };
}

// Helper function to create or get folder (reuse from original)
function createOrGetFolder(name, parentFolder = null) {
  try {
    let folders;
    
    if (parentFolder) {
      folders = parentFolder.getFoldersByName(name);
    } else {
      folders = DriveApp.getFoldersByName(name);
    }
    
    if (folders.hasNext()) {
      return folders.next();
    } else {
      if (parentFolder) {
        return parentFolder.createFolder(name);
      } else {
        return DriveApp.createFolder(name);
      }
    }
  } catch (error) {
    throw new Error(`Failed to create/get folder ${name}: ${error.toString()}`);
  }
}

// Helper function to create database (reuse from original)
function createDatabase(name, folder, description) {
  try {
    // Check if database already exists
    const existingFiles = folder.getFilesByName(name);
    if (existingFiles.hasNext()) {
      const existingFile = existingFiles.next();
      console.log(`📋 Using existing database: ${name}`);
      return SpreadsheetApp.openById(existingFile.getId());
    }
    
    // Create new spreadsheet
    const spreadsheet = SpreadsheetApp.create(name);
    const file = DriveApp.getFileById(spreadsheet.getId());
    
    // Move to proper folder
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
    
    // Set description
    file.setDescription(description);
    
    console.log(`✅ Created database: ${name}`);
    return spreadsheet;
    
  } catch (error) {
    throw new Error(`Failed to create database ${name}: ${error.toString()}`);
  }
}

// Helper function to create or clear sheet (reuse from original)
function createOrClearSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  return sheet;
}

// Helper function to setup sheet headers (reuse from original)
function setupSheetHeaders(sheet, headers, color) {
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground(color);
  headerRange.setFontColor('white');
  headerRange.setWrap(true);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Add alternating row colors
  const dataRange = sheet.getRange(2, 1, 1000, headers.length);
  dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
}