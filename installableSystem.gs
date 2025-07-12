/**
 * Installable Beverage Management System - Complete Installation Package
 * Creates separate database spreadsheets and handles full system deployment
 */

/**
 * System Configuration
 */
const SYSTEM_CONFIG = {
  systemName: 'Beverage Management System',
  version: '2.0.0',
  databases: {
    ingredients: 'BMS_Ingredients_Database',
    recipes: 'BMS_Recipes_Database', 
    suppliers: 'BMS_Suppliers_Database',
    inventory: 'BMS_Inventory_Database',
    analytics: 'BMS_Analytics_Database'
  },
  folders: {
    main: 'Beverage Management System',
    databases: 'BMS Databases',
    backups: 'BMS Backups',
    reports: 'BMS Reports'
  },
  settings: {
    autoBackup: true,
    backupFrequency: 'daily',
    enableAnalytics: true,
    shareWithTeam: false,
    debugMode: false
  }
};

/**
 * Master Installation Function - One-Click Setup
 */
function installBeverageManagementSystem() {
  console.log(`🚀 Installing ${SYSTEM_CONFIG.systemName} v${SYSTEM_CONFIG.version}...`);
  
  try {
    const installation = {
      startTime: new Date(),
      status: 'Installing',
      components: {},
      databases: {},
      folders: {},
      settings: {}
    };
    
    // Step 1: Create folder structure
    console.log('📁 Creating folder structure...');
    installation.folders = createFolderStructure();
    
    // Step 2: Create database spreadsheets
    console.log('🗄️ Creating database spreadsheets...');
    installation.databases = createDatabaseSpreadsheets(installation.folders);
    
    // Step 3: Initialize all schemas
    console.log('📋 Initializing database schemas...');
    installation.components.schemas = initializeAllDatabaseSchemas(installation.databases);
    
    // Step 4: Setup system configuration
    console.log('⚙️ Setting up system configuration...');
    installation.settings = createSystemConfiguration(installation.databases);
    
    // Step 5: Create management functions
    console.log('🔧 Installing management utilities...');
    installation.components.utilities = installManagementUtilities(installation.databases);
    
    // Step 6: Setup permissions and sharing
    console.log('🔐 Configuring permissions...');
    installation.components.permissions = setupPermissions(installation.folders, installation.databases);
    
    // Step 7: Run validation tests
    console.log('✅ Running installation validation...');
    installation.components.validation = validateInstallation(installation.databases);
    
    // Step 8: Create user documentation
    console.log('📚 Creating documentation...');
    installation.components.documentation = createUserDocumentation(installation.folders);
    
    installation.endTime = new Date();
    installation.status = 'Completed';
    installation.installationTime = installation.endTime.getTime() - installation.startTime.getTime();
    
    console.log(`✅ Installation completed successfully in ${installation.installationTime}ms!`);
    
    // Create installation summary
    createInstallationSummary(installation);
    
    return {
      success: true,
      message: 'Beverage Management System installed successfully!',
      installation: installation,
      quickStart: getQuickStartInstructions(installation.databases)
    };
    
  } catch (error) {
    console.error('❌ Installation failed:', error);
    
    // Attempt cleanup on failure
    try {
      console.log('🧹 Attempting cleanup after failed installation...');
      cleanupFailedInstallation();
    } catch (cleanupError) {
      console.error('❌ Cleanup also failed:', cleanupError);
    }
    
    return {
      success: false,
      error: error.toString(),
      message: 'Installation failed. Please check logs and try again.'
    };
  }
}

/**
 * Create organized folder structure in Google Drive
 */
function createFolderStructure() {
  console.log('Creating folder structure...');
  
  const folders = {};
  
  try {
    // Create main system folder
    folders.main = createOrGetFolder(SYSTEM_CONFIG.folders.main);
    
    // Create subfolders
    folders.databases = createOrGetFolder(SYSTEM_CONFIG.folders.databases, folders.main);
    folders.backups = createOrGetFolder(SYSTEM_CONFIG.folders.backups, folders.main);
    folders.reports = createOrGetFolder(SYSTEM_CONFIG.folders.reports, folders.main);
    
    console.log('✅ Folder structure created successfully');
    return folders;
    
  } catch (error) {
    console.error('❌ Failed to create folder structure:', error);
    throw new Error('Folder creation failed: ' + error.toString());
  }
}

/**
 * Create or get existing folder
 */
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

/**
 * Create separate database spreadsheets
 */
function createDatabaseSpreadsheets(folders) {
  console.log('Creating database spreadsheets...');
  
  const databases = {};
  
  try {
    // Create Ingredients Database
    databases.ingredients = createDatabase(
      SYSTEM_CONFIG.databases.ingredients,
      folders.databases,
      'Ingredients and inventory tracking database'
    );
    
    // Create Recipes Database  
    databases.recipes = createDatabase(
      SYSTEM_CONFIG.databases.recipes,
      folders.databases,
      'Recipe management and costing database'
    );
    
    // Create Suppliers Database
    databases.suppliers = createDatabase(
      SYSTEM_CONFIG.databases.suppliers,
      folders.databases,
      'Supplier and vendor management database'
    );
    
    // Create Inventory Database
    databases.inventory = createDatabase(
      SYSTEM_CONFIG.databases.inventory,
      folders.databases,
      'Stock tracking and inventory management database'
    );
    
    // Create Analytics Database
    databases.analytics = createDatabase(
      SYSTEM_CONFIG.databases.analytics,
      folders.databases,
      'Business analytics and reporting database'
    );
    
    console.log('✅ All database spreadsheets created successfully');
    return databases;
    
  } catch (error) {
    console.error('❌ Failed to create database spreadsheets:', error);
    throw new Error('Database creation failed: ' + error.toString());
  }
}

/**
 * Create individual database spreadsheet
 */
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

/**
 * Initialize all database schemas in their respective spreadsheets
 */
function initializeAllDatabaseSchemas(databases) {
  console.log('Initializing database schemas...');
  
  const schemas = {};
  
  try {
    // Initialize Ingredients Database
    schemas.ingredients = initializeIngredientsDatabase(databases.ingredients);
    
    // Initialize Recipes Database
    schemas.recipes = initializeRecipesDatabase(databases.recipes);
    
    // Initialize Suppliers Database
    schemas.suppliers = initializeSuppliersDatabase(databases.suppliers);
    
    // Initialize Inventory Database
    schemas.inventory = initializeInventoryDatabase(databases.inventory);
    
    // Initialize Analytics Database
    schemas.analytics = initializeAnalyticsDatabase(databases.analytics);
    
    console.log('✅ All database schemas initialized successfully');
    return schemas;
    
  } catch (error) {
    console.error('❌ Failed to initialize schemas:', error);
    throw new Error('Schema initialization failed: ' + error.toString());
  }
}

/**
 * Initialize Ingredients Database Schema
 */
function initializeIngredientsDatabase(spreadsheet) {
  // Enhanced Ingredients Sheet
  const ingredientsSheet = createOrClearSheet(spreadsheet, 'Ingredients');
  const ingredientsHeaders = [
    'Ingredient_ID', 'Name', 'Category', 'Subcategory', 'Brand',
    'Country_of_Origin', 'Spirits_Type', 'Spirits_Style', 'ABV',
    'Taste_Profile', 'Body_Style', 'SKU', 'Size_Volume',
    'Description', 'Storage_Requirements', 'Shelf_Life_Days',
    'Cost_Per_Unit', 'Supplier_ID', 'Created_Date', 'Updated_Date'
  ];
  
  setupSheetHeaders(ingredientsSheet, ingredientsHeaders, '#4285F4');
  setupIngredientsValidation(ingredientsSheet);
  
  // Categories Reference Sheet
  const categoriesSheet = createOrClearSheet(spreadsheet, 'Categories_Reference');
  const categoriesData = [
    ['Category', 'Subcategory', 'Typical_ABV', 'Storage_Type'],
    ['Vodka', 'Premium', 40, 'Room Temperature'],
    ['Vodka', 'Flavored', 35, 'Room Temperature'],
    ['Tequila', 'Blanco', 40, 'Room Temperature'],
    ['Tequila', 'Reposado', 40, 'Room Temperature'],
    ['Bourbon', 'Straight', 40, 'Room Temperature'],
    ['Scotch', 'Single Malt', 40, 'Room Temperature'],
    ['Gin', 'London Dry', 40, 'Room Temperature'],
    ['Rum', 'White', 40, 'Room Temperature'],
    ['Rum', 'Dark', 40, 'Room Temperature'],
    ['Liqueurs/Cordials/Schnapps', 'Cream', 17, 'Refrigerated'],
    ['Wine', 'Red', 13, 'Cool Storage'],
    ['Beer', 'Lager', 5, 'Refrigerated']
  ];
  
  categoriesSheet.getRange(1, 1, categoriesData.length, categoriesData[0].length).setValues(categoriesData);
  setupSheetHeaders(categoriesSheet, categoriesData[0], '#34A853');
  
  return { ingredients: ingredientsSheet, categories: categoriesSheet };
}

/**
 * Initialize Recipes Database Schema
 */
function initializeRecipesDatabase(spreadsheet) {
  // Recipes Sheet
  const recipesSheet = createOrClearSheet(spreadsheet, 'Recipes');
  const recipesHeaders = [
    'Recipe_ID', 'Recipe_Name', 'Description', 'Category',
    'Difficulty_Level', 'Serving_Size', 'Prep_Time_Minutes',
    'Cost_Per_Serving', 'Alcoholic', 'Dietary_Tags',
    'Instructions', 'Created_Date', 'Updated_Date', 'Version'
  ];
  
  setupSheetHeaders(recipesSheet, recipesHeaders, '#34A853');
  
  // Recipe Ingredients Relationship Sheet
  const recipeIngredientsSheet = createOrClearSheet(spreadsheet, 'Recipe_Ingredients');
  const relationshipHeaders = [
    'Recipe_ID', 'Ingredient_ID', 'Quantity', 'Unit',
    'Preparation_Method', 'Substitution_Allowed', 'Garnish_Flag',
    'Critical_Ingredient', 'Cost_Contribution'
  ];
  
  setupSheetHeaders(recipeIngredientsSheet, relationshipHeaders, '#FF9800');
  
  // Recipe Categories Reference
  const recipeCategoriesSheet = createOrClearSheet(spreadsheet, 'Recipe_Categories');
  const categoriesData = [
    ['Category', 'Description', 'Typical_Prep_Time', 'Difficulty_Level'],
    ['Cocktail', 'Mixed alcoholic beverages', 5, 'Intermediate'],
    ['Mocktail', 'Non-alcoholic mixed drinks', 3, 'Easy'],
    ['Shot', 'Single serving spirits', 1, 'Easy'],
    ['Punch', 'Large batch mixed drinks', 10, 'Intermediate'],
    ['Coffee', 'Coffee-based beverages', 7, 'Intermediate'],
    ['Specialty', 'Unique or complex recipes', 15, 'Advanced']
  ];
  
  recipeCategoriesSheet.getRange(1, 1, categoriesData.length, categoriesData[0].length).setValues(categoriesData);
  setupSheetHeaders(recipeCategoriesSheet, categoriesData[0], '#9C27B0');
  
  return { 
    recipes: recipesSheet, 
    recipeIngredients: recipeIngredientsSheet,
    categories: recipeCategoriesSheet 
  };
}

/**
 * Initialize Suppliers Database Schema
 */
function initializeSuppliersDatabase(spreadsheet) {
  // Suppliers Sheet
  const suppliersSheet = createOrClearSheet(spreadsheet, 'Suppliers');
  const suppliersHeaders = [
    'Supplier_ID', 'Company_Name', 'Contact_Person', 'Phone',
    'Email', 'Address', 'Payment_Terms', 'Delivery_Schedule',
    'Minimum_Order', 'Preferred_Status', 'Rating',
    'Created_Date', 'Updated_Date'
  ];
  
  setupSheetHeaders(suppliersSheet, suppliersHeaders, '#FF9800');
  
  // Purchase Orders Sheet
  const purchaseOrdersSheet = createOrClearSheet(spreadsheet, 'Purchase_Orders');
  const poHeaders = [
    'PO_ID', 'Supplier_ID', 'Order_Date', 'Expected_Delivery',
    'Status', 'Total_Amount', 'Items_Count', 'Created_By',
    'Approved_By', 'Received_Date', 'Notes'
  ];
  
  setupSheetHeaders(purchaseOrdersSheet, poHeaders, '#E91E63');
  
  // Supplier Performance Sheet
  const performanceSheet = createOrClearSheet(spreadsheet, 'Supplier_Performance');
  const performanceHeaders = [
    'Supplier_ID', 'Month_Year', 'Orders_Count', 'On_Time_Delivery_Rate',
    'Quality_Rating', 'Cost_Rating', 'Service_Rating',
    'Total_Spend', 'Issues_Count', 'Overall_Score'
  ];
  
  setupSheetHeaders(performanceSheet, performanceHeaders, '#607D8B');
  
  return { 
    suppliers: suppliersSheet, 
    purchaseOrders: purchaseOrdersSheet,
    performance: performanceSheet 
  };
}

/**
 * Initialize Inventory Database Schema
 */
function initializeInventoryDatabase(spreadsheet) {
  // Current Inventory Sheet
  const inventorySheet = createOrClearSheet(spreadsheet, 'Current_Inventory');
  const inventoryHeaders = [
    'Ingredient_ID', 'Supplier_ID', 'Current_Stock', 'Reorder_Point',
    'Reorder_Quantity', 'Last_Order_Date', 'Cost_Per_Unit',
    'Expiration_Date', 'Location', 'Status', 'Updated_Date'
  ];
  
  setupSheetHeaders(inventorySheet, inventoryHeaders, '#9C27B0');
  
  // Stock Movements Sheet
  const movementsSheet = createOrClearSheet(spreadsheet, 'Stock_Movements');
  const movementsHeaders = [
    'Movement_ID', 'Ingredient_ID', 'Movement_Type', 'Quantity',
    'Unit_Cost', 'Reference_ID', 'Date', 'Notes', 'User'
  ];
  
  setupSheetHeaders(movementsSheet, movementsHeaders, '#795548');
  
  // Low Stock Alerts Sheet
  const alertsSheet = createOrClearSheet(spreadsheet, 'Low_Stock_Alerts');
  const alertsHeaders = [
    'Alert_ID', 'Ingredient_ID', 'Current_Stock', 'Reorder_Point',
    'Days_Until_Stockout', 'Priority', 'Status', 'Created_Date'
  ];
  
  setupSheetHeaders(alertsSheet, alertsHeaders, '#F44336');
  
  return { 
    inventory: inventorySheet, 
    movements: movementsSheet,
    alerts: alertsSheet 
  };
}

/**
 * Initialize Analytics Database Schema
 */
function initializeAnalyticsDatabase(spreadsheet) {
  // Usage Analytics Sheet
  const usageSheet = createOrClearSheet(spreadsheet, 'Usage_Analytics');
  const usageHeaders = [
    'Date', 'Ingredient_ID', 'Recipe_ID', 'Quantity_Used',
    'Cost', 'Revenue', 'Profit_Margin', 'Customer_Count'
  ];
  
  setupSheetHeaders(usageSheet, usageHeaders, '#3F51B5');
  
  // Cost Analysis Sheet
  const costSheet = createOrClearSheet(spreadsheet, 'Cost_Analysis');
  const costHeaders = [
    'Period', 'Category', 'Total_Cost', 'Average_Cost_Per_Unit',
    'Volume_Purchased', 'Top_Supplier', 'Cost_Variance'
  ];
  
  setupSheetHeaders(costSheet, costHeaders, '#009688');
  
  // Performance Metrics Sheet
  const metricsSheet = createOrClearSheet(spreadsheet, 'Performance_Metrics');
  const metricsHeaders = [
    'Metric_Date', 'Total_Ingredients', 'Total_Recipes', 'Total_Suppliers',
    'Inventory_Value', 'Monthly_Spend', 'Top_Category', 'Alert_Count'
  ];
  
  setupSheetHeaders(metricsSheet, metricsHeaders, '#FF5722');
  
  return { 
    usage: usageSheet, 
    cost: costSheet,
    metrics: metricsSheet 
  };
}

/**
 * Create or clear sheet helper
 */
function createOrClearSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  return sheet;
}

/**
 * Setup sheet headers with formatting
 */
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

/**
 * Setup validation for ingredients sheet
 */
function setupIngredientsValidation(sheet) {
  // Category validation
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Vodka', 'Tequila', 'Bourbon', 'Scotch', 'Gin', 'Rum',
      'Liqueurs/Cordials/Schnapps', 'Brandy & Cognac', 'Mixers & Modifiers',
      'Fresh Ingredients', 'Garnishes & Accessories', 'Wine', 'Beer', 'Other'
    ])
    .setAllowInvalid(false)
    .setHelpText('Select a valid ingredient category')
    .build();
  
  sheet.getRange(2, 3, 1000, 1).setDataValidation(categoryRule);
  
  // ABV validation
  const abvRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 100)
    .setAllowInvalid(false)
    .setHelpText('Enter ABV between 0-100%')
    .build();
  
  sheet.getRange(2, 9, 1000, 1).setDataValidation(abvRule);
}

/**
 * Generate unique system IDs
 */
function generateSystemId(prefix) {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}_${timestamp}_${random}`;
}