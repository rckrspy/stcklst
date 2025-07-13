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
 * Determine subcategory based on ingredient analysis and category
 */
function determineSubcategory(ingredientName, category = '') {
  const name = ingredientName.toLowerCase();
  const cat = category.toLowerCase();
  
  // Whiskey subcategories
  if (cat.includes('whiskey') || cat.includes('whisky')) {
    if (name.includes('bourbon')) return 'Bourbon';
    if (name.includes('scotch') || name.includes('single malt') || name.includes('islay') || name.includes('speyside')) return 'Scotch';
    if (name.includes('rye')) return 'Rye Whiskey';
    if (name.includes('irish') || name.includes('jameson') || name.includes('bushmills')) return 'Irish Whiskey';
    if (name.includes('canadian') || name.includes('crown royal') || name.includes('canadian club')) return 'Canadian Whisky';
    if (name.includes('japanese') || name.includes('nikka') || name.includes('hibiki') || name.includes('yamazaki')) return 'Japanese Whisky';
    return 'Other Whiskey';
  }
  
  // Tequila subcategories
  if (cat.includes('tequila')) {
    if (name.includes('blanco') || name.includes('silver') || name.includes('plata')) return 'Tequila (Blanco/Silver)';
    if (name.includes('reposado')) return 'Tequila (Reposado)';
    if (name.includes('añejo') || name.includes('anejo')) return 'Tequila (Añejo)';
    return 'Tequila (Blanco/Silver)'; // Default for tequila
  }
  
  // Gin subcategories
  if (cat.includes('gin')) {
    if (name.includes('london dry') || name.includes('tanqueray') || name.includes('bombay')) return 'London Dry Gin';
    if (name.includes('flavored') || name.includes('cucumber') || name.includes('elderflower') || name.includes('pink')) return 'Flavored Gin';
    return 'Other Gin';
  }
  
  // Rum subcategories
  if (cat.includes('rum')) {
    if (name.includes('white') || name.includes('light') || name.includes('silver') || name.includes('bacardi')) return 'Light Rum';
    if (name.includes('dark') || name.includes('black') || name.includes('goslings')) return 'Dark Rum';
    if (name.includes('spiced') || name.includes('captain morgan') || name.includes('sailor jerry')) return 'Spiced Rum';
    if (name.includes('aged') || name.includes('premium') || name.includes('reserve')) return 'Aged Rum';
    return 'Other Rum';
  }
  
  // Brandy & Cognac subcategories
  if (cat.includes('brandy') || cat.includes('cognac')) {
    if (name.includes('cognac') || name.includes('hennessy') || name.includes('remy martin')) return 'Cognac';
    if (name.includes('brandy')) return 'Brandy';
    return 'Other Brandy';
  }
  
  // Aperitifs, Amari & Vermouths subcategories
  if (cat.includes('aperitif') || cat.includes('amari') || cat.includes('vermouth')) {
    if (name.includes('aperitif') || name.includes('aperol') || name.includes('campari')) return 'Aperitif (e.g., Aperol, Campari)';
    if (name.includes('amaro') || name.includes('fernet') || name.includes('averna')) return 'Amaro';
    if (name.includes('vermouth') || name.includes('dolin') || name.includes('carpano')) return 'Vermouth';
    return 'Aperitif (e.g., Aperol, Campari)'; // Default
  }
  
  // Liqueurs, Cordials & Schnapps subcategories
  if (cat.includes('liqueur') || cat.includes('cordial') || cat.includes('schnapps')) {
    if (name.includes('herbal') || name.includes('chartreuse') || name.includes('benedictine')) return 'Herbal Liqueur';
    if (name.includes('coffee') || name.includes('kahlua') || name.includes('tia maria')) return 'Coffee Liqueur';
    if (name.includes('fruit') || name.includes('cherry') || name.includes('peach') || name.includes('apple')) return 'Fruit Liqueur';
    if (name.includes('schnapps')) return 'Schnapps';
    return 'Other Liqueur';
  }
  
  // Other Spirits subcategories
  if (cat.includes('other spirits')) {
    if (name.includes('mezcal')) return 'Mezcal';
    if (name.includes('soju')) return 'Soju';
    if (name.includes('sake')) return 'Sake';
    if (name.includes('absinthe')) return 'Absinthe';
    return 'Other Spirits';
  }
  
  // Mixers & Modifiers subcategories
  if (cat.includes('mixer') || cat.includes('modifier')) {
    if (name.includes('cola') || name.includes('tonic') || name.includes('club soda') || name.includes('ginger beer') || name.includes('ginger ale')) return 'Sodas (e.g., Cola, Club Soda, Tonic, Ginger Beer)';
    if (name.includes('juice') || name.includes('orange') || name.includes('cranberry') || name.includes('pineapple') || name.includes('grapefruit')) return 'Juices (e.g., Orange, Cranberry, Pineapple, Grapefruit)';
    if (name.includes('syrup') || name.includes('simple syrup') || name.includes('grenadine') || name.includes('agave')) return 'Syrups (e.g., Simple Syrup, Agave, Grenadine)';
    if (name.includes('energy drink') || name.includes('mixer')) return 'Other Mixers';
    if (name.includes('bitter')) return 'Bitters';
    return 'Other Modifiers';
  }
  
  // Ready-to-Drink (RTD) Beverages subcategories
  if (cat.includes('ready-to-drink') || cat.includes('rtd')) {
    if (name.includes('canned cocktail') || name.includes('premixed cocktail')) return 'Canned Cocktails';
    if (name.includes('hard seltzer') || name.includes('seltzer') || name.includes('white claw') || name.includes('truly')) return 'Canned Hard Seltzers';
    if (name.includes('canned wine') || name.includes('wine can')) return 'Canned Wine';
    return 'Other RTDs';
  }
  
  // Fresh Ingredients subcategories
  if (cat.includes('fresh')) {
    if (name.includes('lime')) return 'Limes';
    if (name.includes('lemon')) return 'Lemons';
    if (name.includes('orange')) return 'Oranges';
    if (name.includes('grapefruit')) return 'Grapefruit';
    if (name.includes('citrus')) return 'Other Citrus';
    if (name.includes('mint')) return 'Mint';
    if (name.includes('basil')) return 'Basil';
    if (name.includes('rosemary')) return 'Rosemary';
    if (name.includes('herb')) return 'Other Herbs';
    if (name.includes('berry') || name.includes('strawberry') || name.includes('blueberry')) return 'Berries';
    if (name.includes('cucumber')) return 'Cucumber';
    return 'Other Produce';
  }
  
  // Garnishes & Accessories subcategories
  if (cat.includes('garnish') || cat.includes('accessor')) {
    if (name.includes('slice') || name.includes('wedge') || name.includes('wheel')) return 'Citrus Slices / Wedges';
    if (name.includes('olive')) return 'Olives';
    if (name.includes('cherry') || name.includes('maraschino')) return 'Cherries';
    if (name.includes('pick')) return 'Cocktail Picks';
    if (name.includes('stirrer') || name.includes('straw')) return 'Stirrers';
    if (name.includes('napkin')) return 'Napkins';
    if (name.includes('coaster')) return 'Coasters';
    return 'Other Garnishes';
  }
  
  // Wine subcategories
  if (cat.includes('wine')) {
    if (name.includes('red') || name.includes('cabernet') || name.includes('merlot') || name.includes('pinot noir')) return 'Red Wine';
    if (name.includes('white') || name.includes('chardonnay') || name.includes('sauvignon blanc') || name.includes('pinot grigio')) return 'White Wine';
    if (name.includes('rosé') || name.includes('rose')) return 'Rosé';
    if (name.includes('sparkling') || name.includes('champagne') || name.includes('prosecco') || name.includes('cava')) return 'Sparkling Wine';
    return 'White Wine'; // Default
  }
  
  // Beer & Other Fermented subcategories
  if (cat.includes('beer') || cat.includes('fermented')) {
    if (name.includes('lager') || name.includes('light') || name.includes('corona') || name.includes('budweiser')) return 'Light Lager';
    if (name.includes('ipa') || name.includes('pale ale') || name.includes('hoppy')) return 'India Pale Ale (IPA)';
    if (name.includes('stout') || name.includes('porter') || name.includes('guinness')) return 'Stout / Porter';
    if (name.includes('sour') || name.includes('gose') || name.includes('lambic')) return 'Sour';
    if (name.includes('cider') || name.includes('angry orchard')) return 'Cider';
    return 'Other Beer';
  }
  
  // Other category subcategories
  if (cat.includes('other')) {
    if (name.includes('still water') || name.includes('bottled water')) return 'Still Water';
    if (name.includes('sparkling water') || name.includes('soda water') || name.includes('perrier')) return 'Sparkling Water';
    if (name.includes('coffee') || name.includes('tea') || name.includes('espresso')) return 'Coffee / Tea';
    return 'Other Non-Alcoholic';
  }
  
  // Default fallback
  return '';
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