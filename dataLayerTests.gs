/**
 * Data Layer Tests - Phase 2
 * Comprehensive testing suite for the enhanced data layer
 */

/**
 * Test Suite Runner
 */
function runAllDataLayerTests() {
  console.log('🧪 Starting Data Layer Test Suite...');
  
  const testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    timestamp: new Date()
  };
  
  const tests = [
    testSchemaInitialization,
    testDataValidation,
    testIngredientManager,
    testRecipeManager,
    testSupplierManager,
    testDataMigration,
    testUtilityFunctions,
    testDataAnalytics
  ];
  
  tests.forEach(test => {
    try {
      console.log(`Running: ${test.name}`);
      test();
      testResults.passed++;
      console.log(`✅ ${test.name} passed`);
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({
        test: test.name,
        error: error.toString()
      });
      console.error(`❌ ${test.name} failed: ${error.toString()}`);
    }
  });
  
  console.log(`\n📊 Test Results: ${testResults.passed} passed, ${testResults.failed} failed`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.test}: ${error.error}`);
    });
  }
  
  return testResults;
}

/**
 * Test Schema Initialization
 */
function testSchemaInitialization() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Test that all required sheets exist or can be created
  const requiredSheets = [
    'Enhanced_Ingredients',
    'Recipes', 
    'Recipe_Ingredients',
    'Suppliers',
    'Inventory'
  ];
  
  requiredSheets.forEach(sheetName => {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      // Initialize the schema to create missing sheets
      initializeAllSchemas();
      sheet = spreadsheet.getSheetByName(sheetName);
    }
    
    if (!sheet) {
      throw new Error(`Required sheet '${sheetName}' not found and could not be created`);
    }
    
    // Verify sheet has headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.length === 0 || !headers[0]) {
      throw new Error(`Sheet '${sheetName}' has no headers`);
    }
  });
  
  console.log('Schema initialization test completed');
}

/**
 * Test Data Validation Rules
 */
function testDataValidation() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const ingredientsSheet = spreadsheet.getSheetByName('Enhanced_Ingredients');
  
  if (!ingredientsSheet) {
    throw new Error('Enhanced_Ingredients sheet not found');
  }
  
  // Test category validation (Column C)
  const categoryValidation = ingredientsSheet.getRange(2, 3).getDataValidation();
  if (!categoryValidation) {
    throw new Error('Category validation not found');
  }
  
  // Test ABV validation (Column I)
  const abvValidation = ingredientsSheet.getRange(2, 9).getDataValidation();
  if (!abvValidation) {
    throw new Error('ABV validation not found');
  }
  
  console.log('Data validation test completed');
}

/**
 * Test Ingredient Manager
 */
function testIngredientManager() {
  const manager = new IngredientManager();
  
  // Test adding ingredient
  const testIngredient = {
    name: 'Test Vodka Premium',
    category: 'Vodka',
    brand: 'Test Brand',
    costPerUnit: 35.99,
    abv: 40
  };
  
  const addResult = manager.addIngredient(testIngredient);
  if (!addResult.success) {
    throw new Error('Failed to add ingredient: ' + addResult.message);
  }
  
  const ingredientId = addResult.ingredientId;
  
  // Test searching ingredients
  const searchResults = manager.searchIngredients('Test Vodka');
  if (searchResults.length === 0) {
    throw new Error('Failed to find added ingredient in search');
  }
  
  // Test filtering by category
  const vodkaIngredients = manager.getIngredientsByCategory('Vodka');
  const foundIngredient = vodkaIngredients.find(ing => ing.Ingredient_ID === ingredientId);
  if (!foundIngredient) {
    throw new Error('Failed to find ingredient by category');
  }
  
  // Test updating ingredient
  const updateResult = manager.updateIngredient(ingredientId, {
    Cost_Per_Unit: 39.99,
    Description: 'Updated test ingredient'
  });
  if (!updateResult.success) {
    throw new Error('Failed to update ingredient: ' + updateResult.message);
  }
  
  // Test deleting ingredient
  const deleteResult = manager.deleteIngredient(ingredientId);
  if (!deleteResult.success) {
    throw new Error('Failed to delete ingredient: ' + deleteResult.message);
  }
  
  console.log('Ingredient Manager test completed');
}

/**
 * Test Recipe Manager
 */
function testRecipeManager() {
  const recipeManager = new RecipeManager();
  const ingredientManager = new IngredientManager();
  
  // First add test ingredients for the recipe
  const testIngredients = [
    {
      name: 'Test Gin Recipe',
      category: 'Gin',
      costPerUnit: 30.00
    },
    {
      name: 'Test Vermouth Recipe',
      category: 'Mixers & Modifiers',
      costPerUnit: 15.00
    }
  ];
  
  const ingredientIds = [];
  testIngredients.forEach(ingredient => {
    const result = ingredientManager.addIngredient(ingredient);
    if (result.success) {
      ingredientIds.push(result.ingredientId);
    }
  });
  
  // Test creating recipe
  const testRecipe = {
    name: 'Test Martini',
    description: 'A test martini recipe',
    category: 'Cocktail',
    difficulty: 'Intermediate',
    ingredients: [
      { name: 'Test Gin Recipe', quantity: 60, unit: 'ml' },
      { name: 'Test Vermouth Recipe', quantity: 10, unit: 'ml' }
    ]
  };
  
  const createResult = recipeManager.createRecipe(testRecipe);
  if (!createResult.success) {
    throw new Error('Failed to create recipe: ' + createResult.message);
  }
  
  const recipeId = createResult.recipeId;
  
  // Test getting recipe
  const retrievedRecipe = recipeManager.getRecipe(recipeId);
  if (!retrievedRecipe || retrievedRecipe.Recipe_ID !== recipeId) {
    throw new Error('Failed to retrieve created recipe');
  }
  
  // Test scaling recipe
  const scaledRecipe = recipeManager.scaleRecipe(recipeId, 2);
  if (scaledRecipe.servingSize !== 2) {
    throw new Error('Recipe scaling failed');
  }
  
  // Clean up - delete test ingredients
  ingredientIds.forEach(id => {
    try {
      ingredientManager.deleteIngredient(id);
    } catch (error) {
      console.warn('Failed to cleanup test ingredient:', id);
    }
  });
  
  console.log('Recipe Manager test completed');
}

/**
 * Test Supplier Manager
 */
function testSupplierManager() {
  const manager = new SupplierManager();
  
  // Test adding supplier
  const testSupplier = {
    companyName: 'Test Spirits Distributors',
    contactPerson: 'John Test',
    email: 'john@testspirits.com',
    phone: '555-0123',
    paymentTerms: 'Net 30',
    rating: 4
  };
  
  const addResult = manager.addSupplier(testSupplier);
  if (!addResult.success) {
    throw new Error('Failed to add supplier: ' + addResult.message);
  }
  
  // Test getting all suppliers
  const suppliers = manager.getAllSuppliers();
  const foundSupplier = suppliers.find(sup => sup.Supplier_ID === addResult.supplierId);
  if (!foundSupplier) {
    throw new Error('Failed to find added supplier');
  }
  
  console.log('Supplier Manager test completed');
}

/**
 * Test Data Migration
 */
function testDataMigration() {
  // Create a mock current data sheet for testing
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let testSheet = spreadsheet.getSheetByName('Test_Migration_Data');
  
  if (!testSheet) {
    testSheet = spreadsheet.insertSheet('Test_Migration_Data');
    
    // Add test data
    const testData = [
      ['Name', 'Category', 'Cost'],
      ['Test Migration Vodka', 'Vodka', 25.99],
      ['Test Migration Gin', 'Gin', 30.50],
      ['Test Migration Rum', 'Rum', 22.75]
    ];
    
    testSheet.getRange(1, 1, testData.length, testData[0].length).setValues(testData);
  }
  
  // Test backup creation
  const backupResult = backupCurrentData();
  if (!backupResult.success) {
    console.warn('Backup test failed, but migration test continues');
  }
  
  // Test field mapping
  const currentHeaders = ['Name', 'Category', 'Cost'];
  const enhancedHeaders = ['Ingredient_ID', 'Name', 'Category', 'Cost_Per_Unit'];
  const mapping = createFieldMapping(currentHeaders, enhancedHeaders);
  
  if (!mapping.Name || !mapping.Category) {
    throw new Error('Field mapping failed to create required mappings');
  }
  
  console.log('Data Migration test completed');
}

/**
 * Test Utility Functions
 */
function testUtilityFunctions() {
  // Test ID generation
  const ingredientId = generateIngredientId();
  if (!ingredientId || !ingredientId.startsWith('ING_')) {
    throw new Error('Ingredient ID generation failed');
  }
  
  // Test categorization
  const category = categorizeIngredient('Grey Goose Vodka');
  if (category !== 'Vodka') {
    throw new Error('Ingredient categorization failed');
  }
  
  // Test brand extraction
  const brand = extractBrand('Grey Goose Premium Vodka');
  if (brand !== 'Grey Goose') {
    throw new Error('Brand extraction failed');
  }
  
  // Test subcategory determination
  const subcategory = determineSubcategory('Premium Single Malt Scotch');
  if (!subcategory) {
    throw new Error('Subcategory determination failed');
  }
  
  console.log('Utility Functions test completed');
}

/**
 * Test Data Analytics
 */
function testDataAnalytics() {
  const analytics = new DataAnalytics();
  
  // Test system report generation
  const report = analytics.generateSystemReport();
  if (!report.timestamp || !report.ingredients || !report.recipes) {
    throw new Error('System report generation failed - missing required properties');
  }
  
  // Test ingredient stats
  const ingredientStats = analytics.getIngredientStats();
  if (typeof ingredientStats.totalIngredients !== 'number') {
    throw new Error('Ingredient stats failed - totalIngredients not a number');
  }
  
  // Test recipe stats
  const recipeStats = analytics.getRecipeStats();
  if (typeof recipeStats.totalRecipes !== 'number') {
    throw new Error('Recipe stats failed - totalRecipes not a number');
  }
  
  console.log('Data Analytics test completed');
}

/**
 * Test Specific Data Operations
 */
function testDataOperations() {
  // Test quick access functions
  const searchResults = quickSearchIngredients('vodka');
  if (!Array.isArray(searchResults)) {
    throw new Error('Quick search failed - not returning array');
  }
  
  const stats = quickSystemStats();
  if (!stats || !stats.timestamp) {
    throw new Error('Quick stats failed');
  }
  
  console.log('Data Operations test completed');
}

/**
 * Performance Testing
 */
function testPerformance() {
  const startTime = new Date().getTime();
  
  // Test large data operations
  const manager = new IngredientManager();
  const ingredients = manager.getIngredients();
  
  // Test search performance
  const searchStart = new Date().getTime();
  manager.searchIngredients('test');
  const searchTime = new Date().getTime() - searchStart;
  
  const totalTime = new Date().getTime() - startTime;
  
  console.log(`Performance test completed in ${totalTime}ms (search: ${searchTime}ms)`);
  
  if (totalTime > 10000) { // 10 seconds
    console.warn('Performance test took longer than expected');
  }
}

/**
 * Integration Test - Full Workflow
 */
function testFullWorkflow() {
  console.log('Testing full workflow integration...');
  
  const ingredientManager = new IngredientManager();
  const recipeManager = new RecipeManager();
  const supplierManager = new SupplierManager();
  
  // 1. Add supplier
  const supplier = supplierManager.addSupplier({
    companyName: 'Workflow Test Supplier',
    contactPerson: 'Test Contact'
  });
  
  // 2. Add ingredients
  const ingredient1 = ingredientManager.addIngredient({
    name: 'Workflow Test Gin',
    category: 'Gin',
    costPerUnit: 32.00,
    supplierId: supplier.supplierId
  });
  
  const ingredient2 = ingredientManager.addIngredient({
    name: 'Workflow Test Vermouth',
    category: 'Mixers & Modifiers',
    costPerUnit: 18.00,
    supplierId: supplier.supplierId
  });
  
  // 3. Create recipe
  const recipe = recipeManager.createRecipe({
    name: 'Workflow Test Martini',
    ingredients: [
      { name: 'Workflow Test Gin', quantity: 60, unit: 'ml' },
      { name: 'Workflow Test Vermouth', quantity: 10, unit: 'ml' }
    ]
  });
  
  // 4. Test analytics
  const analytics = new DataAnalytics();
  const report = analytics.generateSystemReport();
  
  if (!supplier.success || !ingredient1.success || !ingredient2.success || !recipe.success) {
    throw new Error('Full workflow test failed at one of the steps');
  }
  
  console.log('Full workflow integration test completed successfully');
}

/**
 * Run comprehensive test suite
 */
function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Data Layer Test Suite...\n');
  
  const overallStart = new Date().getTime();
  
  try {
    // Core functionality tests
    const coreResults = runAllDataLayerTests();
    
    // Additional specialized tests
    console.log('\n🔧 Running additional tests...');
    testDataOperations();
    testPerformance();
    testFullWorkflow();
    
    const totalTime = new Date().getTime() - overallStart;
    
    console.log(`\n🎉 All tests completed in ${totalTime}ms`);
    console.log(`📊 Final Results: ${coreResults.passed} passed, ${coreResults.failed} failed`);
    
    if (coreResults.failed === 0) {
      console.log('✅ All data layer tests PASSED! System is ready for Phase 3.');
    } else {
      console.log('❌ Some tests failed. Please review and fix before proceeding.');
    }
    
    return {
      success: coreResults.failed === 0,
      totalTests: coreResults.passed + coreResults.failed,
      passed: coreResults.passed,
      failed: coreResults.failed,
      executionTime: totalTime,
      errors: coreResults.errors
    };
    
  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}