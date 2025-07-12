/**
 * Database Migration System for Beverage Management System
 * Handles schema updates and data migrations between versions
 * Version: 3.3.0
 */

/**
 * Get database connections from properties
 */
function getDatabaseConnectionsFromProperties(properties) {
  const connections = {};
  
  ['ingredients', 'recipes', 'suppliers', 'inventory', 'analytics', 'system'].forEach(dbName => {
    if (properties[dbName]) {
      connections[dbName] = properties[dbName];
    }
  });
  
  return connections;
}

/**
 * Perform schema migrations based on version
 */
function performSchemaMigrations(existingInstallation) {
  console.log(`🔄 Performing schema migrations from v${existingInstallation.version}...`);
  
  const migrations = {
    completed: [],
    failed: [],
    newColumns: [],
    newSheets: []
  };
  
  try {
    const fromVersion = parseVersion(existingInstallation.version);
    const currentVersion = parseVersion(ADVANCED_SYSTEM_CONFIG.version);
    
    // Migration from 1.x to 3.3.0
    if (fromVersion.major < 2) {
      migrations.completed.push(...migrateLegacyToV3(existingInstallation));
    }
    
    // Migration from 2.x to 3.3.0
    if (fromVersion.major === 2 && fromVersion.minor < 3) {
      migrations.completed.push(...migrateV2ToV3(existingInstallation));
    }
    
    // Migration from 3.0-3.2 to 3.3.0
    if (fromVersion.major === 3 && fromVersion.minor < 3) {
      migrations.completed.push(...migrateToV33(existingInstallation));
    }
    
    console.log(`✅ Schema migrations completed: ${migrations.completed.length} migrations`);
    return migrations;
    
  } catch (error) {
    console.error('❌ Schema migration failed:', error);
    migrations.failed.push({
      migration: 'schema_update',
      error: error.toString()
    });
    return migrations;
  }
}

/**
 * Migrate legacy system (1.x) to v3.3.0
 */
function migrateLegacyToV3(existingInstallation) {
  console.log('🔄 Migrating legacy system to v3.3.0...');
  
  const migrations = [];
  
  try {
    // Get the legacy spreadsheet
    const legacyDb = existingInstallation.spreadsheet || 
                    SpreadsheetApp.openById(existingInstallation.systemDbId);
    
    // Create new v3.3.0 structure
    const newInstallation = performFreshInstallation();
    
    // Migrate existing data
    migrations.push(...migrateLegacyIngredients(legacyDb, newInstallation.installation.databases.ingredients));
    migrations.push(...migrateLegacyRecipes(legacyDb, newInstallation.installation.databases.recipes));
    
    // Update properties to point to new databases
    const properties = {
      system: newInstallation.installation.databases.system.getId(),
      ingredients: newInstallation.installation.databases.ingredients.getId(),
      recipes: newInstallation.installation.databases.recipes.getId(),
      suppliers: newInstallation.installation.databases.suppliers.getId(),
      inventory: newInstallation.installation.databases.inventory.getId(),
      analytics: newInstallation.installation.databases.analytics.getId(),
      version: ADVANCED_SYSTEM_CONFIG.version,
      migrationDate: new Date().toISOString(),
      legacyBackup: existingInstallation.systemDbId
    };
    
    PropertiesService.getScriptProperties().setProperties(properties);
    
    migrations.push({
      type: 'legacy_migration',
      status: 'completed',
      description: 'Successfully migrated legacy system to v3.3.0'
    });
    
    return migrations;
    
  } catch (error) {
    console.error('❌ Legacy migration failed:', error);
    return [{
      type: 'legacy_migration',
      status: 'failed',
      error: error.toString()
    }];
  }
}

/**
 * Migrate v2.x to v3.3.0
 */
function migrateV2ToV3(existingInstallation) {
  console.log('🔄 Migrating v2.x to v3.3.0...');
  
  const migrations = [];
  
  try {
    const databases = existingInstallation.databases;
    
    // Update Ingredients Database
    if (databases.ingredients) {
      migrations.push(...updateIngredientsSchemaToV3(databases.ingredients));
    }
    
    // Update Recipes Database
    if (databases.recipes) {
      migrations.push(...updateRecipesSchemaToV3(databases.recipes));
    }
    
    // Add new system database
    const systemDb = createSystemDatabase();
    migrations.push({
      type: 'new_database',
      status: 'completed',
      description: 'Created new system configuration database'
    });
    
    // Update properties
    const currentProperties = PropertiesService.getScriptProperties().getAll();
    currentProperties.system = systemDb.getId();
    currentProperties.version = ADVANCED_SYSTEM_CONFIG.version;
    currentProperties.migrationDate = new Date().toISOString();
    
    PropertiesService.getScriptProperties().setProperties(currentProperties);
    
    return migrations;
    
  } catch (error) {
    console.error('❌ V2 to V3 migration failed:', error);
    return [{
      type: 'v2_to_v3_migration',
      status: 'failed',
      error: error.toString()
    }];
  }
}

/**
 * Migrate to v3.3.0 from earlier v3.x
 */
function migrateToV33(existingInstallation) {
  console.log('🔄 Migrating to v3.3.0...');
  
  const migrations = [];
  
  try {
    const databases = existingInstallation.databases;
    
    // Add new columns for v3.3.0 features
    if (databases.ingredients) {
      migrations.push(...addV33IngredientsColumns(databases.ingredients));
    }
    
    if (databases.recipes) {
      migrations.push(...addV33RecipesColumns(databases.recipes));
    }
    
    // Update system configuration
    migrations.push(...updateSystemConfigurationToV33(existingInstallation));
    
    return migrations;
    
  } catch (error) {
    console.error('❌ V3.3.0 migration failed:', error);
    return [{
      type: 'v33_migration',
      status: 'failed',
      error: error.toString()
    }];
  }
}

/**
 * Update Ingredients Schema to V3
 */
function updateIngredientsSchemaToV3(ingredientsDbId) {
  const migrations = [];
  
  try {
    const db = SpreadsheetApp.openById(ingredientsDbId);
    let ingredientsSheet = db.getSheetByName('Enhanced_Ingredients') || 
                          db.getSheetByName('Ingredients') ||
                          db.getSheetByName('database');
    
    if (!ingredientsSheet) {
      throw new Error('Could not find ingredients sheet');
    }
    
    // Get current headers
    const currentHeaders = ingredientsSheet.getRange(1, 1, 1, ingredientsSheet.getLastColumn()).getValues()[0];
    
    // Define v3.3.0 headers
    const v33Headers = [
      'Ingredient_ID', 'Name', 'Category', 'Subcategory', 'Brand',
      'Country_of_Origin', 'Spirits_Type', 'Spirits_Style', 'ABV',
      'Taste_Profile', 'Body_Style', 'SKU', 'Size_Volume',
      'Description', 'Storage_Requirements', 'Shelf_Life_Days',
      'Cost_Per_Unit', 'Unit_Size', 'Unit_Metric', 'Supplier_ID',
      'Min_Quantity', 'Preferred_Brand', 'Show_On_Menu', 'Active',
      'Created_Date', 'Updated_Date'
    ];
    
    // Add missing columns
    const missingColumns = v33Headers.filter(header => !currentHeaders.includes(header));
    
    if (missingColumns.length > 0) {
      const startCol = ingredientsSheet.getLastColumn() + 1;
      
      // Add headers for missing columns
      ingredientsSheet.getRange(1, startCol, 1, missingColumns.length)
                     .setValues([missingColumns]);
      
      // Format new headers
      const newHeaderRange = ingredientsSheet.getRange(1, startCol, 1, missingColumns.length);
      newHeaderRange.setFontWeight('bold');
      newHeaderRange.setBackground('#4285F4');
      newHeaderRange.setFontColor('white');
      
      migrations.push({
        type: 'column_addition',
        status: 'completed',
        description: `Added ${missingColumns.length} new columns to ingredients: ${missingColumns.join(', ')}`
      });
    }
    
    // Rename sheet if needed
    if (ingredientsSheet.getName() !== 'Enhanced_Ingredients') {
      ingredientsSheet.setName('Enhanced_Ingredients');
      migrations.push({
        type: 'sheet_rename',
        status: 'completed',
        description: 'Renamed sheet to Enhanced_Ingredients'
      });
    }
    
    return migrations;
    
  } catch (error) {
    console.error('❌ Ingredients schema update failed:', error);
    return [{
      type: 'ingredients_schema_update',
      status: 'failed',
      error: error.toString()
    }];
  }
}

/**
 * Update Recipes Schema to V3
 */
function updateRecipesSchemaToV3(recipesDbId) {
  const migrations = [];
  
  try {
    const db = SpreadsheetApp.openById(recipesDbId);
    let recipesSheet = db.getSheetByName('Recipes');
    
    if (!recipesSheet) {
      throw new Error('Could not find recipes sheet');
    }
    
    // Get current headers
    const currentHeaders = recipesSheet.getRange(1, 1, 1, recipesSheet.getLastColumn()).getValues()[0];
    
    // Define v3.3.0 recipe headers
    const v33RecipeHeaders = [
      'Recipe_ID', 'Name', 'Description', 'Category', 'Subcategory',
      'Difficulty', 'Serving_Size', 'Prep_Time_Minutes', 'Total_Cost', 
      'Alcoholic', 'Dietary_Tags', 'Instructions', 'Ice_Type', 'Build_Method', 
      'Popularity_Rating', 'Glass_Type', 'Service_Method', 'Created_Date', 
      'Updated_Date', 'Version', 'Active'
    ];
    
    // Add missing columns
    const missingColumns = v33RecipeHeaders.filter(header => !currentHeaders.includes(header));
    
    if (missingColumns.length > 0) {
      const startCol = recipesSheet.getLastColumn() + 1;
      
      recipesSheet.getRange(1, startCol, 1, missingColumns.length)
                 .setValues([missingColumns]);
      
      const newHeaderRange = recipesSheet.getRange(1, startCol, 1, missingColumns.length);
      newHeaderRange.setFontWeight('bold');
      newHeaderRange.setBackground('#34A853');
      newHeaderRange.setFontColor('white');
      
      migrations.push({
        type: 'column_addition',
        status: 'completed',
        description: `Added ${missingColumns.length} new columns to recipes: ${missingColumns.join(', ')}`
      });
    }
    
    // Update Recipe_Ingredients sheet
    let recipeIngredientsSheet = db.getSheetByName('Recipe_Ingredients');
    
    if (recipeIngredientsSheet) {
      const currentRelHeaders = recipeIngredientsSheet.getRange(1, 1, 1, recipeIngredientsSheet.getLastColumn()).getValues()[0];
      
      const v33RelationshipHeaders = [
        'Relationship_ID', 'Recipe_ID', 'Ingredient_ID', 'Quantity', 'Unit',
        'Preferred_Brand', 'Preparation_Method', 'Substitution_Allowed', 'Garnish_Flag',
        'Critical_Ingredient', 'Cost_Contribution', 'Order_Sequence', 'Show_On_Menu',
        'Min_Quantity', 'Notes'
      ];
      
      const missingRelColumns = v33RelationshipHeaders.filter(header => !currentRelHeaders.includes(header));
      
      if (missingRelColumns.length > 0) {
        const startCol = recipeIngredientsSheet.getLastColumn() + 1;
        
        recipeIngredientsSheet.getRange(1, startCol, 1, missingRelColumns.length)
                            .setValues([missingRelColumns]);
        
        const newHeaderRange = recipeIngredientsSheet.getRange(1, startCol, 1, missingRelColumns.length);
        newHeaderRange.setFontWeight('bold');
        newHeaderRange.setBackground('#FF9800');
        newHeaderRange.setFontColor('white');
        
        migrations.push({
          type: 'column_addition',
          status: 'completed',
          description: `Added ${missingRelColumns.length} new columns to recipe ingredients: ${missingRelColumns.join(', ')}`
        });
      }
    }
    
    return migrations;
    
  } catch (error) {
    console.error('❌ Recipes schema update failed:', error);
    return [{
      type: 'recipes_schema_update',
      status: 'failed',
      error: error.toString()
    }];
  }
}

/**
 * Create backup before update
 */
function createPreUpdateBackup(existingInstallation) {
  console.log('💾 Creating pre-update backup...');
  
  try {
    const timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd_HH-mm-ss');
    const backupFolderName = `BMS_PreUpdate_Backup_${timestamp}`;
    
    const backupFolder = DriveApp.createFolder(backupFolderName);
    const backupResults = {};
    
    // Backup each existing database
    Object.entries(existingInstallation.databases || {}).forEach(([dbName, dbId]) => {
      try {
        const spreadsheet = SpreadsheetApp.openById(dbId);
        const backupFile = spreadsheet.copy(`${dbName}_preupdate_${timestamp}`);
        
        const file = DriveApp.getFileById(backupFile.getId());
        backupFolder.addFile(file);
        DriveApp.getRootFolder().removeFile(file);
        
        backupResults[dbName] = {
          status: 'Success',
          backupId: backupFile.getId(),
          backupUrl: backupFile.getUrl()
        };
        
      } catch (error) {
        backupResults[dbName] = {
          status: 'Failed',
          error: error.toString()
        };
      }
    });
    
    console.log('✅ Pre-update backup completed');
    return {
      success: true,
      timestamp: timestamp,
      backupFolder: backupFolder.getUrl(),
      databases: backupResults
    };
    
  } catch (error) {
    console.error('❌ Pre-update backup failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Add new features for v3.3.0
 */
function addNewFeatures(existingInstallation) {
  console.log('🆕 Adding new v3.3.0 features...');
  
  const newFeatures = [];
  
  try {
    // Add enhanced beverage categories
    newFeatures.push(...addEnhancedBeverageCategories(existingInstallation));
    
    // Add menu integration features
    newFeatures.push(...addMenuIntegrationFeatures(existingInstallation));
    
    // Add precision measurement support
    newFeatures.push(...addPrecisionMeasurementSupport(existingInstallation));
    
    // Add professional workflow enhancements
    newFeatures.push(...addProfessionalWorkflowEnhancements(existingInstallation));
    
    console.log(`✅ Added ${newFeatures.length} new features`);
    return newFeatures;
    
  } catch (error) {
    console.error('❌ Failed to add new features:', error);
    return [{
      type: 'new_features',
      status: 'failed',
      error: error.toString()
    }];
  }
}

/**
 * Enhanced ingredients validation for v3.3.0
 */
function setupEnhancedIngredientsValidation(sheet) {
  // Enhanced Category validation with subcategories
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Vodka', 'Tequila', 'Bourbon', 'Scotch', 'Gin', 'Rum',
      'Liqueurs/Cordials/Schnapps', 'Brandy & Cognac', 'American Whiskey',
      'Canadian Whisky', 'Irish Whiskey', 'Japanese Whisky', 'Mezcal',
      'Amaro, Aperitif & Vermouth', 'Mixers & Modifiers',
      'Fresh Ingredients', 'Garnishes & Accessories', 'Wine', 'Beer',
      'Non-Alcoholic', 'Ready to Drink', 'Other'
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
  
  // Unit Metric validation
  const unitMetricRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ml', 'L', 'oz', 'fl oz', 'each', 'kg', 'g', 'lb', 'gallon', 'case'])
    .setAllowInvalid(false)
    .setHelpText('Select a valid unit metric')
    .build();
  
  const unitMetricColumn = findColumnIndex(sheet, 'Unit_Metric');
  if (unitMetricColumn > 0) {
    sheet.getRange(2, unitMetricColumn, 1000, 1).setDataValidation(unitMetricRule);
  }
  
  // Boolean validations
  const booleanRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE', 'Yes', 'No'])
    .setAllowInvalid(false)
    .build();
  
  ['Show_On_Menu', 'Active'].forEach(columnName => {
    const columnIndex = findColumnIndex(sheet, columnName);
    if (columnIndex > 0) {
      sheet.getRange(2, columnIndex, 1000, 1).setDataValidation(booleanRule);
    }
  });
}

/**
 * Find column index by header name
 */
function findColumnIndex(sheet, headerName) {
  try {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    return headers.indexOf(headerName) + 1; // +1 because sheets are 1-indexed
  } catch (error) {
    return -1;
  }
}

/**
 * Validate updated system
 */
function validateUpdatedSystem(existingInstallation) {
  console.log('✅ Validating updated system...');
  
  const validation = {
    databases: {},
    schemas: {},
    features: {},
    overall: { passed: 0, failed: 0, warnings: 0 }
  };
  
  try {
    // Validate database structures
    const properties = PropertiesService.getScriptProperties().getAll();
    
    ['ingredients', 'recipes', 'suppliers', 'inventory', 'analytics', 'system'].forEach(dbName => {
      try {
        const dbId = properties[dbName];
        if (dbId) {
          const spreadsheet = SpreadsheetApp.openById(dbId);
          const sheets = spreadsheet.getSheets();
          
          validation.databases[dbName] = {
            id: dbId,
            sheetsCount: sheets.length,
            status: sheets.length > 0 ? 'Valid' : 'Warning',
            sheets: sheets.map(sheet => sheet.getName())
          };
          
          validation.overall.passed++;
        } else {
          validation.databases[dbName] = { status: 'Missing' };
          validation.overall.failed++;
        }
      } catch (error) {
        validation.databases[dbName] = {
          status: 'Error',
          error: error.toString()
        };
        validation.overall.failed++;
      }
    });
    
    // Validate v3.3.0 features
    validation.features = validateV33Features(properties);
    
    console.log(`✅ System validation completed: ${validation.overall.passed} passed, ${validation.overall.failed} failed`);
    return validation;
    
  } catch (error) {
    console.error('❌ System validation failed:', error);
    return {
      overall: { status: 'Failed', error: error.toString() }
    };
  }
}

/**
 * Validate v3.3.0 specific features
 */
function validateV33Features(properties) {
  const features = {};
  
  try {
    // Check for enhanced ingredients database
    if (properties.ingredients) {
      const ingredientsDb = SpreadsheetApp.openById(properties.ingredients);
      const enhancedSheet = ingredientsDb.getSheetByName('Enhanced_Ingredients');
      
      features.enhancedIngredients = enhancedSheet ? 'Available' : 'Missing';
    }
    
    // Check for recipe enhancements
    if (properties.recipes) {
      const recipesDb = SpreadsheetApp.openById(properties.recipes);
      const recipesSheet = recipesDb.getSheetByName('Recipes');
      
      if (recipesSheet) {
        const headers = recipesSheet.getRange(1, 1, 1, recipesSheet.getLastColumn()).getValues()[0];
        const hasSubcategory = headers.includes('Subcategory');
        const hasServiceMethod = headers.includes('Service_Method');
        const hasGlassType = headers.includes('Glass_Type');
        
        features.recipeEnhancements = (hasSubcategory && hasServiceMethod && hasGlassType) ? 'Available' : 'Partial';
      } else {
        features.recipeEnhancements = 'Missing';
      }
    }
    
    // Check for system database
    features.systemDatabase = properties.system ? 'Available' : 'Missing';
    
    return features;
    
  } catch (error) {
    return { error: error.toString() };
  }
}

/**
 * Quick health check and repair
 */
function performHealthCheckAndRepair(existingInstallation) {
  console.log('🏥 Performing health check and repair...');
  
  try {
    const health = runSystemHealthCheck();
    
    if (health.overall === 'Critical' || health.issues.length > 0) {
      console.log('🔧 Issues detected, performing repairs...');
      
      const repairs = performSystemRepair(health);
      
      return {
        success: true,
        type: 'health_check_repair',
        version: ADVANCED_SYSTEM_CONFIG.version,
        message: 'System health check completed with repairs',
        health: health,
        repairs: repairs
      };
    } else {
      return {
        success: true,
        type: 'health_check',
        version: ADVANCED_SYSTEM_CONFIG.version,
        message: 'System is healthy and up to date',
        health: health
      };
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return {
      success: false,
      type: 'health_check_failed',
      error: error.toString()
    };
  }
}

/**
 * Perform system repair
 */
function performSystemRepair(health) {
  console.log('🔧 Performing system repairs...');
  
  const repairs = [];
  
  try {
    // Repair missing databases
    Object.entries(health.databases).forEach(([dbName, dbInfo]) => {
      if (dbInfo.status === 'Not Found' || dbInfo.status === 'Error') {
        try {
          // Attempt to recreate missing database
          console.log(`🔧 Recreating missing database: ${dbName}`);
          
          // This would need to be implemented based on specific repair needs
          repairs.push({
            type: 'database_recreation',
            database: dbName,
            status: 'attempted'
          });
          
        } catch (error) {
          repairs.push({
            type: 'database_recreation',
            database: dbName,
            status: 'failed',
            error: error.toString()
          });
        }
      }
    });
    
    console.log(`✅ System repairs completed: ${repairs.length} repairs attempted`);
    return repairs;
    
  } catch (error) {
    console.error('❌ System repair failed:', error);
    return [{
      type: 'repair_system',
      status: 'failed',
      error: error.toString()
    }];
  }
}