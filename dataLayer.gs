/**
 * Core Data Layer Implementation - Phase 2
 * Enhanced Ingredients Schema Setup and Data Management
 */

/**
 * Initialize Enhanced Ingredients Sheet with proper schema
 */
function initializeIngredientsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Enhanced_Ingredients');
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet('Enhanced_Ingredients');
  }
  
  // Clear existing content
  sheet.clear();
  
  // Define enhanced ingredients schema headers
  const headers = [
    'Ingredient_ID',
    'Name', 
    'Category',
    'Subcategory',
    'Brand',
    'Country_of_Origin',
    'Spirits_Type',
    'Spirits_Style',
    'ABV',
    'Taste_Profile',
    'Body_Style',
    'SKU',
    'Size_Volume',
    'Description',
    'Storage_Requirements',
    'Shelf_Life_Days',
    'Cost_Per_Unit',
    'Supplier_ID',
    'Created_Date',
    'Updated_Date'
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('white');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  console.log('Enhanced Ingredients sheet initialized successfully');
  return sheet;
}

/**
 * Setup data validation rules for enhanced ingredients
 */
function setupDataValidation(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enhanced_Ingredients');
  }
  
  // Category dropdown validation (Column C)
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Vodka',
      'Tequila', 
      'Bourbon',
      'Scotch',
      'Gin',
      'Rum',
      'Liqueurs/Cordials/Schnapps',
      'Brandy & Cognac',
      'Mixers & Modifiers',
      'Fresh Ingredients',
      'Garnishes & Accessories',
      'Wine',
      'Beer',
      'Other'
    ])
    .setAllowInvalid(false)
    .setHelpText('Select a valid ingredient category')
    .build();
  
  sheet.getRange(2, 3, 1000, 1).setDataValidation(categoryRule);
  
  // ABV validation (Column I) - 0-100%
  const abvRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 100)
    .setAllowInvalid(false)
    .setHelpText('Enter ABV between 0-100%')
    .build();
  
  sheet.getRange(2, 9, 1000, 1).setDataValidation(abvRule);
  
  // Shelf Life validation (Column P) - positive numbers only
  const shelfLifeRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .setHelpText('Enter positive number of days')
    .build();
  
  sheet.getRange(2, 16, 1000, 1).setDataValidation(shelfLifeRule);
  
  // Cost validation (Column Q) - positive numbers only
  const costRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .setHelpText('Enter positive cost value')
    .build();
  
  sheet.getRange(2, 17, 1000, 1).setDataValidation(costRule);
  
  console.log('Data validation rules applied successfully');
}

/**
 * Apply conditional formatting to enhance data visualization
 */
function applyConditionalFormatting(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enhanced_Ingredients');
  }
  
  // Color code by category (Column C)
  const categoryColors = {
    'Vodka': '#E8F0FE',
    'Tequila': '#FEF7E0', 
    'Bourbon': '#F3E5F5',
    'Scotch': '#E1F5FE',
    'Gin': '#E8F5E8',
    'Rum': '#FFF3E0'
  };
  
  Object.entries(categoryColors).forEach(([category, color]) => {
    const rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(category)
      .setBackground(color)
      .setRanges([sheet.getRange(2, 1, 1000, 20)])
      .build();
    
    const rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  });
  
  console.log('Conditional formatting applied successfully');
}

/**
 * Generate unique ingredient ID
 */
function generateIngredientId() {
  const timestamp = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ING_${timestamp}_${random}`;
}

/**
 * Initialize Recipe Management Schema
 */
function initializeRecipeSchema() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Recipes sheet
  let recipesSheet = spreadsheet.getSheetByName('Recipes');
  if (!recipesSheet) {
    recipesSheet = spreadsheet.insertSheet('Recipes');
  }
  recipesSheet.clear();
  
  const recipeHeaders = [
    'Recipe_ID',
    'Recipe_Name',
    'Description',
    'Category',
    'Difficulty_Level',
    'Serving_Size',
    'Prep_Time_Minutes',
    'Cost_Per_Serving',
    'Alcoholic',
    'Dietary_Tags',
    'Instructions',
    'Created_Date',
    'Updated_Date',
    'Version'
  ];
  
  recipesSheet.getRange(1, 1, 1, recipeHeaders.length).setValues([recipeHeaders]);
  
  // Create Recipe_Ingredients relationship sheet
  let recipeIngredientsSheet = spreadsheet.getSheetByName('Recipe_Ingredients');
  if (!recipeIngredientsSheet) {
    recipeIngredientsSheet = spreadsheet.insertSheet('Recipe_Ingredients');
  }
  recipeIngredientsSheet.clear();
  
  const relationshipHeaders = [
    'Recipe_ID',
    'Ingredient_ID',
    'Quantity',
    'Unit',
    'Preparation_Method',
    'Substitution_Allowed',
    'Garnish_Flag',
    'Critical_Ingredient',
    'Cost_Contribution'
  ];
  
  recipeIngredientsSheet.getRange(1, 1, 1, relationshipHeaders.length).setValues([relationshipHeaders]);
  
  // Format both sheets
  [recipesSheet, recipeIngredientsSheet].forEach(sheet => {
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#34A853');
    headerRange.setFontColor('white');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, sheet.getLastColumn());
  });
  
  console.log('Recipe schema initialized successfully');
}

/**
 * Initialize Supplier Management Schema
 */
function initializeSupplierSchema() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  let suppliersSheet = spreadsheet.getSheetByName('Suppliers');
  if (!suppliersSheet) {
    suppliersSheet = spreadsheet.insertSheet('Suppliers');
  }
  suppliersSheet.clear();
  
  const supplierHeaders = [
    'Supplier_ID',
    'Company_Name',
    'Contact_Person',
    'Phone',
    'Email',
    'Address',
    'Payment_Terms',
    'Delivery_Schedule',
    'Minimum_Order',
    'Preferred_Status',
    'Rating',
    'Created_Date',
    'Updated_Date'
  ];
  
  suppliersSheet.getRange(1, 1, 1, supplierHeaders.length).setValues([supplierHeaders]);
  
  // Format headers
  const headerRange = suppliersSheet.getRange(1, 1, 1, supplierHeaders.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#FF9800');
  headerRange.setFontColor('white');
  suppliersSheet.setFrozenRows(1);
  suppliersSheet.autoResizeColumns(1, supplierHeaders.length);
  
  console.log('Supplier schema initialized successfully');
}

/**
 * Initialize Inventory Tracking Schema
 */
function initializeInventorySchema() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  let inventorySheet = spreadsheet.getSheetByName('Inventory');
  if (!inventorySheet) {
    inventorySheet = spreadsheet.insertSheet('Inventory');
  }
  inventorySheet.clear();
  
  const inventoryHeaders = [
    'Ingredient_ID',
    'Supplier_ID',
    'Current_Stock',
    'Reorder_Point',
    'Reorder_Quantity',
    'Last_Order_Date',
    'Cost_Per_Unit',
    'Expiration_Date',
    'Location',
    'Status',
    'Updated_Date'
  ];
  
  inventorySheet.getRange(1, 1, 1, inventoryHeaders.length).setValues([inventoryHeaders]);
  
  // Format headers
  const headerRange = inventorySheet.getRange(1, 1, 1, inventoryHeaders.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#9C27B0');
  headerRange.setFontColor('white');
  inventorySheet.setFrozenRows(1);
  inventorySheet.autoResizeColumns(1, inventoryHeaders.length);
  
  console.log('Inventory schema initialized successfully');
}

/**
 * Utility function to map row data to object
 */
function mapRowToObject(row, headers) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

/**
 * Categorize ingredient based on name analysis
 */
function categorizeIngredient(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  // Vodka patterns
  if (name.includes('vodka')) return 'Vodka';
  
  // Tequila patterns
  if (name.includes('tequila') || name.includes('mezcal')) return 'Tequila';
  
  // Bourbon patterns
  if (name.includes('bourbon') || name.includes('whiskey') || name.includes('whisky')) return 'Bourbon';
  
  // Scotch patterns
  if (name.includes('scotch') || name.includes('single malt')) return 'Scotch';
  
  // Gin patterns
  if (name.includes('gin')) return 'Gin';
  
  // Rum patterns
  if (name.includes('rum')) return 'Rum';
  
  // Liqueurs patterns
  if (name.includes('liqueur') || name.includes('cordial') || name.includes('schnapps') || 
      name.includes('amaretto') || name.includes('baileys') || name.includes('kahlua')) {
    return 'Liqueurs/Cordials/Schnapps';
  }
  
  // Brandy patterns
  if (name.includes('brandy') || name.includes('cognac') || name.includes('armagnac')) {
    return 'Brandy & Cognac';
  }
  
  // Mixers patterns
  if (name.includes('vermouth') || name.includes('bitters') || name.includes('syrup') ||
      name.includes('juice') || name.includes('soda') || name.includes('tonic')) {
    return 'Mixers & Modifiers';
  }
  
  // Fresh ingredients
  if (name.includes('lime') || name.includes('lemon') || name.includes('mint') ||
      name.includes('basil') || name.includes('cucumber')) {
    return 'Fresh Ingredients';
  }
  
  // Default category
  return 'Other';
}

/**
 * Determine subcategory based on ingredient analysis
 */
function determineSubcategory(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  // Vodka subcategories
  if (name.includes('premium') || name.includes('ultra')) return 'Premium';
  if (name.includes('flavored') || name.includes('vanilla') || name.includes('citrus')) return 'Flavored';
  
  // Whiskey subcategories
  if (name.includes('single malt')) return 'Single Malt';
  if (name.includes('blend')) return 'Blended';
  if (name.includes('rye')) return 'Rye';
  
  // Default
  return 'Standard';
}

/**
 * Extract brand from ingredient name
 */
function extractBrand(ingredientName) {
  // Common brand patterns
  const brands = [
    'Grey Goose', 'Belvedere', 'Absolut', 'Smirnoff',
    'Patron', 'Don Julio', 'Herradura',
    'Jack Daniels', 'Jameson', 'Macallan', 'Glenlivet',
    'Tanqueray', 'Bombay', 'Hendricks',
    'Bacardi', 'Captain Morgan', 'Mount Gay'
  ];
  
  const name = ingredientName;
  for (const brand of brands) {
    if (name.includes(brand)) {
      return brand;
    }
  }
  
  // Extract first word as potential brand
  return name.split(' ')[0];
}

/**
 * Master initialization function - runs all schema setups
 */
function initializeAllSchemas() {
  console.log('Starting comprehensive data layer initialization...');
  
  try {
    // Initialize all schemas
    const ingredientsSheet = initializeIngredientsSheet();
    setupDataValidation(ingredientsSheet);
    applyConditionalFormatting(ingredientsSheet);
    
    initializeRecipeSchema();
    initializeSupplierSchema();
    initializeInventorySchema();
    
    console.log('✅ All data schemas initialized successfully!');
    
    // Return summary
    return {
      success: true,
      message: 'All data layer schemas have been initialized successfully',
      schemas: ['Enhanced_Ingredients', 'Recipes', 'Recipe_Ingredients', 'Suppliers', 'Inventory'],
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error initializing schemas:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date()
    };
  }
}