/**
 * Enhanced Data Structure Implementation for Beverage Management System
 * Phase 2: Core Data Layer
 */

/**
 * Initialize Enhanced Ingredients Sheet with proper schema
 */
function initializeIngredientsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or get Enhanced_Ingredients sheet
  let sheet = ss.getSheetByName('Enhanced_Ingredients');
  if (!sheet) {
    sheet = ss.insertSheet('Enhanced_Ingredients');
  }
  
  // Clear existing content
  sheet.clear();
  
  // Define enhanced headers
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
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setWrap(true);
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Setup data validation
  setupIngredientsDataValidation(sheet);
  
  // Apply conditional formatting
  applyIngredientsConditionalFormatting(sheet);
  
  console.log('Enhanced Ingredients sheet initialized successfully');
  return sheet;
}

/**
 * Setup data validation for Enhanced Ingredients sheet
 */
function setupIngredientsDataValidation(sheet) {
  // Category dropdown validation
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
      'Wines',
      'Beers',
      'Non-Alcoholic'
    ])
    .setAllowInvalid(false)
    .setHelpText('Select a valid category')
    .build();
  
  sheet.getRange(2, 3, 1000, 1).setDataValidation(categoryRule);
  
  // ABV validation (0-100%)
  const abvRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(0, 100)
    .setAllowInvalid(false)
    .setHelpText('Enter ABV between 0-100%')
    .build();
  
  sheet.getRange(2, 9, 1000, 1).setDataValidation(abvRule);
  
  // Cost validation (positive numbers only)
  const costRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .setHelpText('Enter a positive cost value')
    .build();
  
  sheet.getRange(2, 17, 1000, 1).setDataValidation(costRule);
  
  // Shelf life validation (positive integers)
  const shelfLifeRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setAllowInvalid(false)
    .setHelpText('Enter shelf life in days')
    .build();
  
  sheet.getRange(2, 16, 1000, 1).setDataValidation(shelfLifeRule);
}

/**
 * Apply conditional formatting to Enhanced Ingredients sheet
 */
function applyIngredientsConditionalFormatting(sheet) {
  const maxRows = 1000;
  
  // Highlight expired items (shelf life < 30 days)
  const expiredRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange(2, 1, maxRows, 20)])
    .whenFormulaSatisfied('=AND($P2<>"", $P2<30)')
    .setBackground('#ffebee')
    .build();
  
  // Highlight high-cost items (>$50)
  const highCostRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange(2, 17, maxRows, 1)])
    .whenNumberGreaterThan(50)
    .setBackground('#fff3e0')
    .build();
  
  // Highlight alcoholic beverages
  const alcoholicRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange(2, 9, maxRows, 1)])
    .whenNumberGreaterThan(0)
    .setBackground('#e8f5e8')
    .build();
  
  const rules = sheet.getConditionalFormatRules();
  rules.push(expiredRule, highCostRule, alcoholicRule);
  sheet.setConditionalFormatRules(rules);
}

/**
 * Initialize Recipes Sheet
 */
function initializeRecipesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let sheet = ss.getSheetByName('Recipes');
  if (!sheet) {
    sheet = ss.insertSheet('Recipes');
  }
  
  sheet.clear();
  
  const headers = [
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
    'Version',
    'Active'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  sheet.setFrozenRows(1);
  setupRecipesDataValidation(sheet);
  
  console.log('Recipes sheet initialized successfully');
  return sheet;
}

/**
 * Setup data validation for Recipes sheet
 */
function setupRecipesDataValidation(sheet) {
  // Category validation
  const categoryRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Cocktail',
      'Mocktail', 
      'Shot',
      'Punch',
      'Hot Drink',
      'Frozen Drink',
      'Wine Cocktail',
      'Beer Cocktail',
      'Specialty'
    ])
    .build();
  
  sheet.getRange(2, 4, 1000, 1).setDataValidation(categoryRule);
  
  // Difficulty validation
  const difficultyRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .build();
  
  sheet.getRange(2, 5, 1000, 1).setDataValidation(difficultyRule);
  
  // Alcoholic boolean validation
  const alcoholicRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'])
    .build();
  
  sheet.getRange(2, 9, 1000, 1).setDataValidation(alcoholicRule);
  
  // Active boolean validation
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'])
    .build();
  
  sheet.getRange(2, 15, 1000, 1).setDataValidation(activeRule);
}

/**
 * Initialize Recipe_Ingredients relationship sheet
 */
function initializeRecipeIngredientsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let sheet = ss.getSheetByName('Recipe_Ingredients');
  if (!sheet) {
    sheet = ss.insertSheet('Recipe_Ingredients');
  }
  
  sheet.clear();
  
  const headers = [
    'Relationship_ID',
    'Recipe_ID',
    'Ingredient_ID', 
    'Quantity',
    'Unit',
    'Preparation_Method',
    'Substitution_Allowed',
    'Garnish_Flag',
    'Critical_Ingredient',
    'Cost_Contribution',
    'Order_Sequence'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#ff9800');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  sheet.setFrozenRows(1);
  setupRecipeIngredientsDataValidation(sheet);
  
  console.log('Recipe_Ingredients sheet initialized successfully');
  return sheet;
}

/**
 * Setup data validation for Recipe_Ingredients sheet
 */
function setupRecipeIngredientsDataValidation(sheet) {
  // Unit validation
  const unitRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'ml', 'oz', 'cl', 'l', 'cup', 'tbsp', 'tsp', 
      'dash', 'splash', 'drop', 'piece', 'slice',
      'wedge', 'twist', 'sprig', 'leaf', 'gram', 'kg'
    ])
    .build();
  
  sheet.getRange(2, 5, 1000, 1).setDataValidation(unitRule);
  
  // Boolean validations
  const booleanRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'])
    .build();
  
  sheet.getRange(2, 7, 1000, 1).setDataValidation(booleanRule); // Substitution_Allowed
  sheet.getRange(2, 8, 1000, 1).setDataValidation(booleanRule); // Garnish_Flag
  sheet.getRange(2, 9, 1000, 1).setDataValidation(booleanRule); // Critical_Ingredient
}

/**
 * Initialize Suppliers sheet
 */
function initializeSuppliersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let sheet = ss.getSheetByName('Suppliers');
  if (!sheet) {
    sheet = ss.insertSheet('Suppliers');
  }
  
  sheet.clear();
  
  const headers = [
    'Supplier_ID',
    'Company_Name',
    'Contact_Person',
    'Phone',
    'Email',
    'Address',
    'City',
    'State',
    'Zip_Code',
    'Payment_Terms',
    'Delivery_Schedule',
    'Minimum_Order',
    'Preferred_Status',
    'Rating',
    'Created_Date',
    'Last_Contact_Date'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#9c27b0');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  sheet.setFrozenRows(1);
  setupSuppliersDataValidation(sheet);
  
  console.log('Suppliers sheet initialized successfully');
  return sheet;
}

/**
 * Setup data validation for Suppliers sheet
 */
function setupSuppliersDataValidation(sheet) {
  // Rating validation (1-5 stars)
  const ratingRule = SpreadsheetApp.newDataValidation()
    .requireNumberBetween(1, 5)
    .build();
  
  sheet.getRange(2, 14, 1000, 1).setDataValidation(ratingRule);
  
  // Preferred status validation
  const preferredRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Preferred', 'Standard', 'Backup', 'Inactive'])
    .build();
  
  sheet.getRange(2, 13, 1000, 1).setDataValidation(preferredRule);
}

/**
 * Initialize Inventory sheet
 */
function initializeInventorySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let sheet = ss.getSheetByName('Inventory');
  if (!sheet) {
    sheet = ss.insertSheet('Inventory');
  }
  
  sheet.clear();
  
  const headers = [
    'Inventory_ID',
    'Ingredient_ID',
    'Supplier_ID',
    'Current_Stock',
    'Unit',
    'Reorder_Point',
    'Reorder_Quantity',
    'Last_Order_Date',
    'Cost_Per_Unit',
    'Expiration_Date',
    'Location',
    'Status',
    'Last_Updated'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#795548');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  sheet.setFrozenRows(1);
  setupInventoryDataValidation(sheet);
  
  console.log('Inventory sheet initialized successfully');
  return sheet;
}

/**
 * Setup data validation for Inventory sheet
 */
function setupInventoryDataValidation(sheet) {
  // Status validation
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['In Stock', 'Low Stock', 'Out of Stock', 'Expired', 'Damaged'])
    .build();
  
  sheet.getRange(2, 12, 1000, 1).setDataValidation(statusRule);
  
  // Unit validation
  const unitRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ml', 'oz', 'l', 'bottle', 'case', 'kg', 'g', 'piece'])
    .build();
  
  sheet.getRange(2, 5, 1000, 1).setDataValidation(unitRule);
}

/**
 * Initialize all data structures at once
 */
function initializeAllDataStructures() {
  console.log('Starting data structure initialization...');
  
  try {
    initializeIngredientsSheet();
    initializeRecipesSheet();
    initializeRecipeIngredientsSheet();
    initializeSuppliersSheet();
    initializeInventorySheet();
    
    console.log('All data structures initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing data structures:', error);
    return false;
  }
}

/**
 * Generate unique IDs for records
 */
function generateIngredientId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `ING_${timestamp}_${random}`;
}

function generateRecipeId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `RCP_${timestamp}_${random}`;
}

function generateSupplierId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `SUP_${timestamp}_${random}`;
}

function generateInventoryId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `INV_${timestamp}_${random}`;
}

function generateRelationshipId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `REL_${timestamp}_${random}`;
}