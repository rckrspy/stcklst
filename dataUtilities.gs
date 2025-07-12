/**
 * Data Utilities - Phase 2
 * Comprehensive utility functions for data operations
 */

/**
 * Enhanced Ingredient Management Utilities
 */
class IngredientManager {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.ingredientsSheet = this.spreadsheet.getSheetByName('Enhanced_Ingredients');
  }
  
  /**
   * Get all ingredients with optional filtering
   */
  getIngredients(filters = {}) {
    if (!this.ingredientsSheet) {
      throw new Error('Enhanced_Ingredients sheet not found');
    }
    
    const data = this.ingredientsSheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const ingredients = data.slice(1).map(row => this.mapRowToObject(row, headers));
    
    return this.applyFilters(ingredients, filters);
  }
  
  /**
   * Get ingredients by category
   */
  getIngredientsByCategory(category) {
    return this.getIngredients({ category: category });
  }
  
  /**
   * Search ingredients by name or description
   */
  searchIngredients(searchTerm, additionalFilters = {}) {
    const allIngredients = this.getIngredients(additionalFilters);
    const term = searchTerm.toLowerCase();
    
    return allIngredients.filter(ingredient => 
      ingredient.Name.toLowerCase().includes(term) ||
      ingredient.Description.toLowerCase().includes(term) ||
      ingredient.Brand.toLowerCase().includes(term) ||
      ingredient.Taste_Profile.toLowerCase().includes(term)
    );
  }
  
  /**
   * Add new ingredient
   */
  addIngredient(ingredientData) {
    const newRow = this.createIngredientRow(ingredientData);
    this.ingredientsSheet.appendRow(newRow);
    
    return {
      success: true,
      message: `Ingredient "${ingredientData.name}" added successfully`,
      ingredientId: newRow[0],
      timestamp: new Date()
    };
  }
  
  /**
   * Update existing ingredient
   */
  updateIngredient(ingredientId, updates) {
    const rowIndex = this.findIngredientRowIndex(ingredientId);
    if (rowIndex === -1) {
      throw new Error(`Ingredient with ID ${ingredientId} not found`);
    }
    
    const headers = this.ingredientsSheet.getRange(1, 1, 1, this.ingredientsSheet.getLastColumn()).getValues()[0];
    
    // Update specific fields
    Object.entries(updates).forEach(([field, value]) => {
      const columnIndex = headers.indexOf(field);
      if (columnIndex !== -1) {
        this.ingredientsSheet.getRange(rowIndex + 1, columnIndex + 1).setValue(value);
      }
    });
    
    // Update timestamp
    const updatedDateColumn = headers.indexOf('Updated_Date');
    if (updatedDateColumn !== -1) {
      this.ingredientsSheet.getRange(rowIndex + 1, updatedDateColumn + 1).setValue(new Date());
    }
    
    return {
      success: true,
      message: `Ingredient ${ingredientId} updated successfully`,
      timestamp: new Date()
    };
  }
  
  /**
   * Delete ingredient
   */
  deleteIngredient(ingredientId) {
    const rowIndex = this.findIngredientRowIndex(ingredientId);
    if (rowIndex === -1) {
      throw new Error(`Ingredient with ID ${ingredientId} not found`);
    }
    
    this.ingredientsSheet.deleteRow(rowIndex + 1);
    
    return {
      success: true,
      message: `Ingredient ${ingredientId} deleted successfully`,
      timestamp: new Date()
    };
  }
  
  /**
   * Create ingredient row from data
   */
  createIngredientRow(data) {
    const now = new Date();
    
    return [
      generateIngredientId(),                    // Ingredient_ID
      data.name || '',                           // Name
      data.category || categorizeIngredient(data.name), // Category
      data.subcategory || determineSubcategory(data.name), // Subcategory
      data.brand || extractBrand(data.name),     // Brand
      data.countryOfOrigin || '',                // Country_of_Origin
      data.spiritsType || data.category,         // Spirits_Type
      data.spiritsStyle || data.subcategory,     // Spirits_Style
      data.abv || 0,                            // ABV
      data.tasteProfile || '',                   // Taste_Profile
      data.bodyStyle || 'Medium',                // Body_Style
      data.sku || '',                           // SKU
      data.sizeVolume || '',                    // Size_Volume
      data.description || '',                    // Description
      data.storageRequirements || 'Cool, dry place', // Storage_Requirements
      data.shelfLifeDays || 365,                // Shelf_Life_Days
      data.costPerUnit || 0,                    // Cost_Per_Unit
      data.supplierId || 'DEFAULT_SUPPLIER',    // Supplier_ID
      now,                                      // Created_Date
      now                                       // Updated_Date
    ];
  }
  
  /**
   * Apply filters to ingredients array
   */
  applyFilters(ingredients, filters) {
    let filtered = [...ingredients];
    
    if (filters.category) {
      filtered = filtered.filter(ing => ing.Category === filters.category);
    }
    
    if (filters.abvMin !== undefined) {
      filtered = filtered.filter(ing => ing.ABV >= filters.abvMin);
    }
    
    if (filters.abvMax !== undefined) {
      filtered = filtered.filter(ing => ing.ABV <= filters.abvMax);
    }
    
    if (filters.brand) {
      filtered = filtered.filter(ing => ing.Brand === filters.brand);
    }
    
    if (filters.country) {
      filtered = filtered.filter(ing => ing.Country_of_Origin === filters.country);
    }
    
    if (filters.supplier) {
      filtered = filtered.filter(ing => ing.Supplier_ID === filters.supplier);
    }
    
    return filtered;
  }
  
  /**
   * Find ingredient row index by ID
   */
  findIngredientRowIndex(ingredientId) {
    const data = this.ingredientsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ingredientId) {
        return i;
      }
    }
    
    return -1;
  }
  
  /**
   * Map row data to object
   */
  mapRowToObject(row, headers) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  }
}

/**
 * Recipe Management Utilities
 */
class RecipeManager {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.recipesSheet = this.spreadsheet.getSheetByName('Recipes');
    this.recipeIngredientsSheet = this.spreadsheet.getSheetByName('Recipe_Ingredients');
    this.ingredientManager = new IngredientManager();
  }
  
  /**
   * Create new recipe
   */
  createRecipe(recipeData) {
    const recipeId = this.generateRecipeId();
    const totalCost = this.calculateTotalCost(recipeData.ingredients);
    
    // Create recipe entry
    const recipeRow = [
      recipeId,
      recipeData.name,
      recipeData.description || '',
      recipeData.category || 'Cocktail',
      recipeData.difficulty || 'Intermediate',
      recipeData.servingSize || 1,
      recipeData.prepTime || 5,
      totalCost,
      recipeData.alcoholic || true,
      recipeData.dietaryTags || '',
      recipeData.instructions || '',
      new Date(),
      new Date(),
      '1.0'
    ];
    
    this.recipesSheet.appendRow(recipeRow);
    
    // Create ingredient relationships
    this.createIngredientRelationships(recipeId, recipeData.ingredients);
    
    return {
      success: true,
      recipeId: recipeId,
      totalCost: totalCost,
      message: `Recipe "${recipeData.name}" created successfully`
    };
  }
  
  /**
   * Get recipe by ID
   */
  getRecipe(recipeId) {
    const recipes = this.getAllRecipes();
    const recipe = recipes.find(r => r.Recipe_ID === recipeId);
    
    if (recipe) {
      recipe.ingredients = this.getRecipeIngredients(recipeId);
    }
    
    return recipe;
  }
  
  /**
   * Get all recipes
   */
  getAllRecipes() {
    const data = this.recipesSheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    return data.slice(1).map(row => this.mapRowToObject(row, headers));
  }
  
  /**
   * Get recipe ingredients
   */
  getRecipeIngredients(recipeId) {
    const data = this.recipeIngredientsSheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const ingredients = data.slice(1)
      .filter(row => row[0] === recipeId)
      .map(row => this.mapRowToObject(row, headers));
    
    // Enrich with ingredient details
    return ingredients.map(ingredient => {
      const ingredientDetails = this.ingredientManager.getIngredients({ Ingredient_ID: ingredient.Ingredient_ID })[0];
      return {
        ...ingredient,
        ingredientDetails: ingredientDetails
      };
    });
  }
  
  /**
   * Scale recipe
   */
  scaleRecipe(recipeId, multiplier) {
    const recipe = this.getRecipe(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }
    
    const scaledIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      Quantity: ingredient.Quantity * multiplier,
      Cost_Contribution: ingredient.Cost_Contribution * multiplier
    }));
    
    return {
      ...recipe,
      servingSize: recipe.Serving_Size * multiplier,
      ingredients: scaledIngredients,
      totalCost: scaledIngredients.reduce((sum, ing) => sum + ing.Cost_Contribution, 0)
    };
  }
  
  /**
   * Calculate total recipe cost
   */
  calculateTotalCost(ingredients) {
    let totalCost = 0;
    
    ingredients.forEach(ingredient => {
      const ingredientData = this.ingredientManager.searchIngredients(ingredient.name)[0];
      if (ingredientData) {
        const cost = (ingredientData.Cost_Per_Unit / 1000) * ingredient.quantity; // Assuming cost per ml
        totalCost += cost;
      }
    });
    
    return totalCost;
  }
  
  /**
   * Create ingredient relationships
   */
  createIngredientRelationships(recipeId, ingredients) {
    ingredients.forEach(ingredient => {
      const ingredientData = this.ingredientManager.searchIngredients(ingredient.name)[0];
      const ingredientId = ingredientData ? ingredientData.Ingredient_ID : null;
      
      if (ingredientId) {
        const cost = (ingredientData.Cost_Per_Unit / 1000) * ingredient.quantity;
        
        const relationshipRow = [
          recipeId,
          ingredientId,
          ingredient.quantity,
          ingredient.unit || 'ml',
          ingredient.preparation || '',
          ingredient.substitutionAllowed || false,
          ingredient.garnish || false,
          ingredient.critical || true,
          cost
        ];
        
        this.recipeIngredientsSheet.appendRow(relationshipRow);
      }
    });
  }
  
  /**
   * Generate unique recipe ID
   */
  generateRecipeId() {
    const timestamp = new Date().getTime().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP_${timestamp}_${random}`;
  }
  
  /**
   * Map row to object
   */
  mapRowToObject(row, headers) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  }
}

/**
 * Supplier Management Utilities
 */
class SupplierManager {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.suppliersSheet = this.spreadsheet.getSheetByName('Suppliers');
  }
  
  /**
   * Add new supplier
   */
  addSupplier(supplierData) {
    const supplierId = this.generateSupplierId();
    
    const supplierRow = [
      supplierId,
      supplierData.companyName,
      supplierData.contactPerson || '',
      supplierData.phone || '',
      supplierData.email || '',
      supplierData.address || '',
      supplierData.paymentTerms || 'Net 30',
      supplierData.deliverySchedule || 'Weekly',
      supplierData.minimumOrder || 0,
      supplierData.preferredStatus || false,
      supplierData.rating || 5,
      new Date(),
      new Date()
    ];
    
    this.suppliersSheet.appendRow(supplierRow);
    
    return {
      success: true,
      supplierId: supplierId,
      message: `Supplier "${supplierData.companyName}" added successfully`
    };
  }
  
  /**
   * Get all suppliers
   */
  getAllSuppliers() {
    const data = this.suppliersSheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    return data.slice(1).map(row => this.mapRowToObject(row, headers));
  }
  
  /**
   * Generate supplier ID
   */
  generateSupplierId() {
    const timestamp = new Date().getTime().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SUP_${timestamp}_${random}`;
  }
  
  /**
   * Map row to object
   */
  mapRowToObject(row, headers) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  }
}

/**
 * Data Analytics Utilities
 */
class DataAnalytics {
  constructor() {
    this.ingredientManager = new IngredientManager();
    this.recipeManager = new RecipeManager();
    this.supplierManager = new SupplierManager();
  }
  
  /**
   * Get ingredient statistics
   */
  getIngredientStats() {
    const ingredients = this.ingredientManager.getIngredients();
    
    const stats = {
      totalIngredients: ingredients.length,
      categoryCounts: {},
      averageCost: 0,
      totalValue: 0,
      topBrands: {}
    };
    
    ingredients.forEach(ingredient => {
      // Category counts
      stats.categoryCounts[ingredient.Category] = (stats.categoryCounts[ingredient.Category] || 0) + 1;
      
      // Cost calculations
      const cost = parseFloat(ingredient.Cost_Per_Unit) || 0;
      stats.totalValue += cost;
      
      // Brand counts
      stats.topBrands[ingredient.Brand] = (stats.topBrands[ingredient.Brand] || 0) + 1;
    });
    
    stats.averageCost = stats.totalValue / ingredients.length;
    
    return stats;
  }
  
  /**
   * Get recipe statistics
   */
  getRecipeStats() {
    const recipes = this.recipeManager.getAllRecipes();
    
    const stats = {
      totalRecipes: recipes.length,
      categoryCounts: {},
      averageCost: 0,
      totalCost: 0,
      averagePrepTime: 0
    };
    
    recipes.forEach(recipe => {
      stats.categoryCounts[recipe.Category] = (stats.categoryCounts[recipe.Category] || 0) + 1;
      
      const cost = parseFloat(recipe.Cost_Per_Serving) || 0;
      stats.totalCost += cost;
      
      const prepTime = parseFloat(recipe.Prep_Time_Minutes) || 0;
      stats.averagePrepTime += prepTime;
    });
    
    if (recipes.length > 0) {
      stats.averageCost = stats.totalCost / recipes.length;
      stats.averagePrepTime = stats.averagePrepTime / recipes.length;
    }
    
    return stats;
  }
  
  /**
   * Generate comprehensive system report
   */
  generateSystemReport() {
    return {
      timestamp: new Date(),
      ingredients: this.getIngredientStats(),
      recipes: this.getRecipeStats(),
      suppliers: {
        totalSuppliers: this.supplierManager.getAllSuppliers().length
      }
    };
  }
}

/**
 * Export utilities for external use
 */
function getIngredientManager() {
  return new IngredientManager();
}

function getRecipeManager() {
  return new RecipeManager();
}

function getSupplierManager() {
  return new SupplierManager();
}

function getDataAnalytics() {
  return new DataAnalytics();
}

/**
 * Quick access functions for common operations
 */
function quickAddIngredient(name, category, cost) {
  const manager = new IngredientManager();
  return manager.addIngredient({
    name: name,
    category: category,
    costPerUnit: cost
  });
}

function quickSearchIngredients(searchTerm) {
  const manager = new IngredientManager();
  return manager.searchIngredients(searchTerm);
}

function quickCreateRecipe(name, ingredients) {
  const manager = new RecipeManager();
  return manager.createRecipe({
    name: name,
    ingredients: ingredients
  });
}

function quickSystemStats() {
  const analytics = new DataAnalytics();
  return analytics.generateSystemReport();
}