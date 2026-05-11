// Stock Manager for Bangkok Shop System
// Handles inventory persistence, availability modifiers, and monthly restocking

const AVAILABILITY_MODIFIERS = {
  'Street': { price: 1.0, qty: 1.0 },
  'Legal': { price: 1.2, qty: 0.8 },
  'Restricted': { price: 1.5, qty: 0.5 },
  'Black Market': { price: 2.5, qty: 0.3 }
};

// Get availability from item with fallback for different field names
function getAvailability(item) {
  return item.availability ||
         item.Availability ||
         item.availabilityRating ||
         item.AvailabilityRating ||
         'Street';
}

// Apply availability-based price and quantity modifiers
function applyAvailabilityModifiers(item) {
  const availability = getAvailability(item);
  const modifier = AVAILABILITY_MODIFIERS[availability] || AVAILABILITY_MODIFIERS['Street'];

  return {
    ...item,
    availability: availability,
    price: Math.ceil(item.price * modifier.price),
    stock: Math.max(1, Math.ceil(item.stock * modifier.qty))
  };
}

// Get shop inventory from localStorage cache
function getShopInventoryFromCache(shopId, monthId) {
  const key = `shop_inventory_${shopId}_${monthId}`;
  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : null;
}

// Save shop inventory to localStorage cache
function saveShopInventoryToCache(shopId, monthId, inventory) {
  const key = `shop_inventory_${shopId}_${monthId}`;
  localStorage.setItem(key, JSON.stringify(inventory));
}

// Get shop inventory - from cache if exists, otherwise generate and cache it
function getShopInventory(shop, currentMonth) {
  const cached = getShopInventoryFromCache(shop.id, currentMonth);
  if (cached) {
    return cached;
  }

  // Generate new inventory
  const inventory = ShopEngine.generateShopInventory(shop);
  const modifiedInventory = inventory.map(applyAvailabilityModifiers);
  saveShopInventoryToCache(shop.id, currentMonth, modifiedInventory);
  return modifiedInventory;
}

// Update shop inventory in cache after purchases
function updateShopInventory(shopId, currentMonth, inventory) {
  saveShopInventoryToCache(shopId, currentMonth, inventory);
}

// Restock all shops for a new month
function restockAllShops(newMonth) {
  if (!ShopEngine.shopsDatabase) {
    console.warn('ShopEngine not initialized yet');
    return;
  }

  const shops = ShopEngine.shopsDatabase;
  shops.forEach(shop => {
    const newInventory = ShopEngine.generateShopInventory(shop);
    const modifiedInventory = newInventory.map(applyAvailabilityModifiers);
    saveShopInventoryToCache(shop.id, newMonth, modifiedInventory);
  });

  console.log('🏪 All shops restocked for month ' + newMonth);
}

// Initialize stock manager
async function initializeStockManager() {
  // Wait for TimeEngine to be available
  if (typeof TimeEngine === 'undefined') {
    console.warn('TimeEngine not available yet');
    return;
  }

  // Monitor for month changes
  let lastMonth = TimeEngine.getCurrentMonth ? TimeEngine.getCurrentMonth() : null;

  // Check for month changes every second
  setInterval(() => {
    if (typeof TimeEngine === 'undefined' || !TimeEngine.getCurrentMonth) {
      return;
    }

    const currentMonth = TimeEngine.getCurrentMonth();
    if (currentMonth && currentMonth !== lastMonth) {
      console.log('📅 Month changed from ' + lastMonth + ' to ' + currentMonth);
      restockAllShops(currentMonth);
      lastMonth = currentMonth;
    }
  }, 1000);
}

// Export for use in HTML
window.StockManager = {
  getShopInventory,
  updateShopInventory,
  restockAllShops,
  initializeStockManager,
  getAvailability,
  applyAvailabilityModifiers
};

console.log('Stock Manager ready');
