/**
 * Data Migration Functions - Phase 2
 * Migrate existing ingredients data to enhanced schema
 */

/**
 * Migrate existing ingredients from current system to enhanced schema
 */
function migrateExistingIngredients() {
  console.log('Starting data migration from current system to enhanced schema...');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get current ingredients sheet (assuming it exists)
    const currentSheet = spreadsheet.getSheetByName('Ingredients') || 
                        spreadsheet.getSheetByName('Sheet1') ||
                        spreadsheet.getSheets()[0]; // Fallback to first sheet
    
    if (!currentSheet) {
      throw new Error('No source sheet found for migration');
    }
    
    // Get enhanced ingredients sheet
    let enhancedSheet = spreadsheet.getSheetByName('Enhanced_Ingredients');
    if (!enhancedSheet) {
      console.log('Enhanced_Ingredients sheet not found, creating it...');
      enhancedSheet = initializeIngredientsSheet();
      setupDataValidation(enhancedSheet);
      applyConditionalFormatting(enhancedSheet);
    }
    
    // Get current data
    const currentData = currentSheet.getDataRange().getValues();
    if (currentData.length <= 1) {
      console.log('No data to migrate');
      return { success: true, message: 'No data to migrate', migratedCount: 0 };
    }
    
    const currentHeaders = currentData[0];
    console.log('Current headers found:', currentHeaders);
    
    // Define enhanced schema headers
    const enhancedHeaders = [
      'Ingredient_ID', 'Name', 'Category', 'Subcategory', 'Brand',
      'Country_of_Origin', 'Spirits_Type', 'Spirits_Style', 'ABV',
      'Taste_Profile', 'Body_Style', 'SKU', 'Size_Volume',
      'Description', 'Storage_Requirements', 'Shelf_Life_Days',
      'Cost_Per_Unit', 'Supplier_ID', 'Created_Date', 'Updated_Date'
    ];
    
    // Create mapping from current to enhanced schema
    const fieldMapping = createFieldMapping(currentHeaders, enhancedHeaders);
    console.log('Field mapping created:', fieldMapping);
    
    // Process and migrate data
    const enhancedData = [];
    let migratedCount = 0;
    
    for (let i = 1; i < currentData.length; i++) {
      const currentRow = currentData[i];
      
      // Skip empty rows
      if (currentRow.every(cell => !cell)) continue;
      
      const enhancedRow = migrateRow(currentRow, currentHeaders, enhancedHeaders, fieldMapping);
      enhancedData.push(enhancedRow);
      migratedCount++;
    }
    
    if (enhancedData.length > 0) {
      // Clear existing data (except headers)
      const lastRow = enhancedSheet.getLastRow();
      if (lastRow > 1) {
        enhancedSheet.getRange(2, 1, lastRow - 1, enhancedSheet.getLastColumn()).clear();
      }
      
      // Insert migrated data
      enhancedSheet.getRange(2, 1, enhancedData.length, enhancedHeaders.length)
        .setValues(enhancedData);
      
      console.log(`✅ Successfully migrated ${migratedCount} ingredients`);
    }
    
    return {
      success: true,
      message: `Successfully migrated ${migratedCount} ingredients to enhanced schema`,
      migratedCount: migratedCount,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date()
    };
  }
}

/**
 * Create field mapping between current and enhanced schemas
 */
function createFieldMapping(currentHeaders, enhancedHeaders) {
  const mapping = {};
  
  // Direct field mappings
  const directMappings = {
    'Name': 'Name',
    'Ingredient Name': 'Name',
    'name': 'Name',
    'Category': 'Category',
    'category': 'Category',
    'Brand': 'Brand',
    'brand': 'Brand',
    'ABV': 'ABV',
    'abv': 'ABV',
    'Cost': 'Cost_Per_Unit',
    'cost': 'Cost_Per_Unit',
    'Cost_Per_Unit': 'Cost_Per_Unit',
    'Unit_Cost': 'Cost_Per_Unit',
    'Price': 'Cost_Per_Unit',
    'Description': 'Description',
    'description': 'Description',
    'SKU': 'SKU',
    'sku': 'SKU',
    'Size': 'Size_Volume',
    'size': 'Size_Volume',
    'Volume': 'Size_Volume',
    'volume': 'Size_Volume'
  };
  
  // Find matching fields
  currentHeaders.forEach((currentHeader, index) => {
    if (directMappings[currentHeader]) {
      mapping[directMappings[currentHeader]] = {
        sourceIndex: index,
        sourceHeader: currentHeader
      };
    }
  });
  
  return mapping;
}

/**
 * Migrate a single row from current to enhanced schema
 */
function migrateRow(currentRow, currentHeaders, enhancedHeaders, fieldMapping) {
  const enhancedRow = new Array(enhancedHeaders.length);
  const now = new Date();
  
  // Fill enhanced row with data
  enhancedHeaders.forEach((enhancedHeader, index) => {
    switch (enhancedHeader) {
      case 'Ingredient_ID':
        enhancedRow[index] = generateIngredientId();
        break;
        
      case 'Name':
        enhancedRow[index] = getFieldValue(currentRow, fieldMapping, 'Name') || 'Unknown';
        break;
        
      case 'Category':
        const currentCategory = getFieldValue(currentRow, fieldMapping, 'Category');
        enhancedRow[index] = currentCategory || categorizeIngredient(enhancedRow[1] || '');
        break;
        
      case 'Subcategory':
        enhancedRow[index] = determineSubcategory(enhancedRow[1] || '', enhancedRow[2] || '');
        break;
        
      case 'Brand':
        const currentBrand = getFieldValue(currentRow, fieldMapping, 'Brand');
        enhancedRow[index] = currentBrand || extractBrand(enhancedRow[1] || '');
        break;
        
      case 'ABV':
        const currentABV = getFieldValue(currentRow, fieldMapping, 'ABV');
        enhancedRow[index] = currentABV || inferABVFromCategory(enhancedRow[2]);
        break;
        
      case 'Cost_Per_Unit':
        enhancedRow[index] = getFieldValue(currentRow, fieldMapping, 'Cost_Per_Unit') || 0;
        break;
        
      case 'Description':
        enhancedRow[index] = getFieldValue(currentRow, fieldMapping, 'Description') || '';
        break;
        
      case 'SKU':
        enhancedRow[index] = getFieldValue(currentRow, fieldMapping, 'SKU') || '';
        break;
        
      case 'Size_Volume':
        enhancedRow[index] = getFieldValue(currentRow, fieldMapping, 'Size_Volume') || '';
        break;
        
      case 'Country_of_Origin':
        enhancedRow[index] = inferCountryFromBrand(enhancedRow[4]) || '';
        break;
        
      case 'Spirits_Type':
        enhancedRow[index] = enhancedRow[2] || ''; // Use category as spirits type
        break;
        
      case 'Spirits_Style':
        enhancedRow[index] = enhancedRow[3] || ''; // Use subcategory as style
        break;
        
      case 'Taste_Profile':
        enhancedRow[index] = inferTasteProfile(enhancedRow[2], enhancedRow[4]) || '';
        break;
        
      case 'Body_Style':
        enhancedRow[index] = inferBodyStyle(enhancedRow[2]) || '';
        break;
        
      case 'Storage_Requirements':
        enhancedRow[index] = inferStorageRequirements(enhancedRow[2]) || 'Cool, dry place';
        break;
        
      case 'Shelf_Life_Days':
        enhancedRow[index] = inferShelfLife(enhancedRow[2]) || 365;
        break;
        
      case 'Supplier_ID':
        enhancedRow[index] = 'DEFAULT_SUPPLIER';
        break;
        
      case 'Created_Date':
        enhancedRow[index] = now;
        break;
        
      case 'Updated_Date':
        enhancedRow[index] = now;
        break;
        
      default:
        enhancedRow[index] = '';
    }
  });
  
  return enhancedRow;
}

/**
 * Get field value from current row using mapping
 */
function getFieldValue(currentRow, fieldMapping, enhancedField) {
  const mapping = fieldMapping[enhancedField];
  if (mapping && mapping.sourceIndex < currentRow.length) {
    return currentRow[mapping.sourceIndex];
  }
  return null;
}

/**
 * Infer ABV based on category
 */
function inferABVFromCategory(category) {
  const abvDefaults = {
    'Vodka': 40,
    'Tequila': 40,
    'Bourbon': 40,
    'Scotch': 40,
    'Gin': 40,
    'Rum': 40,
    'Liqueurs/Cordials/Schnapps': 20,
    'Brandy & Cognac': 40,
    'Wine': 12,
    'Beer': 5,
    'Mixers & Modifiers': 0,
    'Fresh Ingredients': 0,
    'Garnishes & Accessories': 0
  };
  
  return abvDefaults[category] || 0;
}

/**
 * Infer country of origin from brand
 */
function inferCountryFromBrand(brand) {
  const countryMappings = {
    'Grey Goose': 'France',
    'Belvedere': 'Poland',
    'Absolut': 'Sweden',
    'Smirnoff': 'UK',
    'Patron': 'Mexico',
    'Don Julio': 'Mexico',
    'Jack Daniels': 'USA',
    'Jameson': 'Ireland',
    'Macallan': 'Scotland',
    'Glenlivet': 'Scotland',
    'Tanqueray': 'UK',
    'Bombay': 'UK',
    'Bacardi': 'Puerto Rico'
  };
  
  return countryMappings[brand] || '';
}

/**
 * Infer taste profile based on category and brand
 */
function inferTasteProfile(category, brand) {
  const profiles = {
    'Vodka': 'Clean, neutral',
    'Tequila': 'Agave, earthy',
    'Bourbon': 'Sweet, vanilla, oak',
    'Scotch': 'Smoky, complex',
    'Gin': 'Juniper, botanical',
    'Rum': 'Sweet, molasses',
    'Liqueurs/Cordials/Schnapps': 'Sweet, flavored'
  };
  
  return profiles[category] || '';
}

/**
 * Infer body style based on category
 */
function inferBodyStyle(category) {
  const bodyStyles = {
    'Vodka': 'Light',
    'Tequila': 'Medium',
    'Bourbon': 'Full',
    'Scotch': 'Full',
    'Gin': 'Light',
    'Rum': 'Medium',
    'Liqueurs/Cordials/Schnapps': 'Medium'
  };
  
  return bodyStyles[category] || 'Medium';
}

/**
 * Infer storage requirements based on category
 */
function inferStorageRequirements(category) {
  const requirements = {
    'Fresh Ingredients': 'Refrigerated',
    'Wine': 'Cool, dark, horizontal',
    'Beer': 'Refrigerated, upright'
  };
  
  return requirements[category] || 'Cool, dry place, upright';
}

/**
 * Infer shelf life based on category
 */
function inferShelfLife(category) {
  const shelfLives = {
    'Fresh Ingredients': 7,
    'Wine': 1825, // 5 years
    'Beer': 180,  // 6 months
    'Liqueurs/Cordials/Schnapps': 730 // 2 years
  };
  
  return shelfLives[category] || 365; // Default 1 year
}

/**
 * Backup current data before migration
 */
function backupCurrentData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const currentSheet = spreadsheet.getSheetByName('Ingredients') || 
                        spreadsheet.getSheetByName('Sheet1');
    
    if (!currentSheet) {
      return { success: false, message: 'No source sheet found to backup' };
    }
    
    // Create backup sheet
    const timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd_HH-mm-ss');
    const backupName = `Ingredients_Backup_${timestamp}`;
    
    const backupSheet = currentSheet.copyTo(spreadsheet);
    backupSheet.setName(backupName);
    
    console.log(`✅ Backup created: ${backupName}`);
    return {
      success: true,
      message: `Backup created successfully: ${backupName}`,
      backupSheetName: backupName
    };
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Complete migration process with backup
 */
function completeMigrationWithBackup() {
  console.log('Starting complete migration process with backup...');
  
  try {
    // Step 1: Create backup
    const backupResult = backupCurrentData();
    if (!backupResult.success) {
      throw new Error('Backup failed: ' + backupResult.error || backupResult.message);
    }
    
    // Step 2: Initialize enhanced schemas
    const initResult = initializeAllSchemas();
    if (!initResult.success) {
      throw new Error('Schema initialization failed: ' + initResult.error);
    }
    
    // Step 3: Migrate data
    const migrationResult = migrateExistingIngredients();
    if (!migrationResult.success) {
      throw new Error('Migration failed: ' + migrationResult.error);
    }
    
    console.log('✅ Complete migration process finished successfully!');
    
    return {
      success: true,
      message: 'Complete migration finished successfully',
      backup: backupResult,
      initialization: initResult,
      migration: migrationResult,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('❌ Complete migration process failed:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date()
    };
  }
}