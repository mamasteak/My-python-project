// Shop Engine for Bangkok Shadowrun Campaign
// Loads shop data from JSON files and generates inventory dynamically

console.log('🏪 SHOP ENGINE SCRIPT LOADING...');

let shopsDatabase = [];
let subDistrictsData = [];
let inventoryCache = {};
let srData = {};

// Load all data
async function initializeShopEngine() {
    try {
        console.log('%c🏪 SHOP ENGINE INIT START', 'color: #00ff88; font-weight: bold');

        // Load shops.json
        console.log('%cSTEP 1: Loading shops.json', 'color: #00d4ff');
        let shopsResponse;
        try {
            shopsResponse = await fetch('./shops.json');
            console.log(`  Response status: ${shopsResponse.status}`);
            if (!shopsResponse.ok) throw new Error(`shops.json returned ${shopsResponse.status}`);
            const shopsJson = await shopsResponse.json();
            shopsDatabase = shopsJson.shops || [];
            console.log(`  ✓ Loaded ${shopsDatabase.length} shops`);
        } catch (e) {
            console.error(`  ❌ SHOPS LOAD FAILED:`, e.message);
            throw e;
        }

        // Load subdistricts.json
        console.log('%cSTEP 2: Loading subdistricts.json', 'color: #00d4ff');
        try {
            const subResponse = await fetch('./subdistricts.json');
            console.log(`  Response status: ${subResponse.status}`);
            if (!subResponse.ok) throw new Error(`subdistricts.json returned ${subResponse.status}`);
            const subJson = await subResponse.json();
            subDistrictsData = Array.isArray(subJson) ? subJson : subJson.subdistricts || [];
            console.log(`  ✓ Loaded ${subDistrictsData.length} subdistricts from file`);
        } catch (subError) {
            console.warn(`  ⚠️ FALLBACK: Extracting from shops:`, subError.message);
            const subDistrictSet = new Set();
            shopsDatabase.forEach(shop => {
                if (shop.subdistrict_thai) subDistrictSet.add(shop.subdistrict_thai);
            });
            subDistrictsData = Array.from(subDistrictSet).map((subdistrict) => {
                const matchingShop = shopsDatabase.find(s => s.subdistrict_thai === subdistrict);
                return {
                    subdistrict: subdistrict,
                    district: matchingShop ? matchingShop.district_thai : 'Unknown'
                };
            });
            console.log(`  ✓ Extracted ${subDistrictsData.length} subdistricts from shops`);
        }

        console.log('%cSTEP 3: Loading SR2 data', 'color: #00d4ff');
        await loadSR2Data();

        console.log('%c✓ SHOP ENGINE INITIALIZED SUCCESSFULLY', 'color: #00ff88; font-weight: bold');
        console.log(`  Shops: ${shopsDatabase.length}, Subdistricts: ${subDistrictsData.length}`);
        return true;
    } catch (error) {
        console.error('%c❌ SHOP ENGINE INIT FAILED', 'color: #ff0080; font-weight: bold');
        console.error(`  Error: ${error.message}`);
        console.error(`  Stack:`, error);
        throw error;
    }
}

// Load all SR2 JSON data files
async function loadSR2Data() {
    const dataFiles = [
        'skills', 'spells', 'AdeptPowers', 'cyberware', 'bioware',
        'gear', 'vehicles', 'drones', 'totems', 'programs',
        'VirtualRealityPrograms', 'cyberdeck', 'ranges'
    ];

    for (const file of dataFiles) {
        try {
            const response = await fetch(`./data/${file}.json`);
            if (response.ok) {
                srData[file] = await response.json();
            }
        } catch (error) {
            console.warn(`Could not load ${file}.json`);
        }
    }
    console.log('✓ Loaded SR2 data files');
}

// Get unique subdistricts for dropdown
function getUniqueSubDistricts() {
    const districts = {};

    if (!Array.isArray(subDistrictsData) || subDistrictsData.length === 0) {
        console.warn('⚠️ subDistrictsData is empty or invalid');
        return districts;
    }

    subDistrictsData.forEach(sub => {
        if (!sub || !sub.district) {
            console.warn('⚠️ Invalid subdistrict entry:', sub);
            return;
        }

        if (!districts[sub.district]) {
            districts[sub.district] = [];
        }

        if (sub.subdistrict) {
            districts[sub.district].push(sub.subdistrict);
        }
    });

    console.log(`Unique districts found: ${Object.keys(districts).length}`, Object.keys(districts).slice(0, 3));
    return districts;
}

// Get shops by district (Thai name)
function getShopsByDistrict(districtThai) {
    return shopsDatabase.filter(shop => shop.district_thai === districtThai);
}

// Get shop by name
function getShopByName(shopName) {
    return shopsDatabase.find(shop => shop.shop_name === shopName);
}

// Generate inventory for a shop based on its type and categories
function generateShopInventory(shop) {
    if (inventoryCache[shop.id]) {
        return inventoryCache[shop.id];
    }

    const inventory = [];
    const inventory_categories = shop.inventory_categories || [];

    if (inventory_categories.length === 0) {
        console.warn(`⚠️ Shop "${shop.shop_name}" has no inventory categories defined`);
        inventoryCache[shop.id] = inventory;
        return inventory;
    }

    // Fetch items from SR2 data based on categories
    inventory_categories.forEach(category => {
        const items = extractItemsFromCategory(category);

        if (items.length === 0) {
            console.warn(`⚠️ No items found for category "${category}" in shop "${shop.shop_name}"`);
            return;
        }

        // Randomly select 5-10 items from this category
        const itemCount = Math.floor(Math.random() * 6) + 5;
        const selectedItems = items.sort(() => Math.random() - 0.5).slice(0, itemCount);

        selectedItems.forEach((item, index) => {
            inventory.push({
                id: String(inventory.length + 1),
                name: item.name || item.Name || 'Unknown Item',
                price: parseInt(item.price || item.Cost || item.cost || item.Price || 1000),
                stock: Math.floor(Math.random() * 15) + 3,
                category: category,
                availability: item.availability || item.Availability || 'Street',
                street_index: item.street_index || item.StreetIndex || 1,
                description: item.description || item.Description || ''
            });
        });
    });

    // Cache the inventory
    inventoryCache[shop.id] = inventory;
    return inventory;
}

// Extract items from SR2 data by category
function extractItemsFromCategory(category) {
    const items = [];
    const categoryLower = category.toLowerCase().trim();

    try {
        switch(categoryLower) {
            case 'bioware':
                if (srData.bioware && srData.bioware.STANDARD) {
                    items.push(...srData.bioware.STANDARD);
                } else {
                    console.debug(`Bioware data not available or missing STANDARD property`);
                }
                break;

            case 'vehicles':
                if (srData.vehicles) {
                    const vArray = Array.isArray(srData.vehicles) ? srData.vehicles : Object.values(srData.vehicles);
                    items.push(...vArray.slice(0, 50));
                } else {
                    console.debug(`Vehicles data not available`);
                }
                break;

            case 'vehicle modifications':
                if (srData.vehicles) {
                    const vArray = Array.isArray(srData.vehicles) ? srData.vehicles : Object.values(srData.vehicles);
                    items.push(...vArray.slice(50, 100));
                } else {
                    console.debug(`Vehicles data not available for modifications`);
                }
                break;

            case 'cyberware':
            case 'firearms':
            case 'ammunition':
            case 'explosives':
            case 'edged weapon':
            case 'clothing and armor':
            case 'surveillance and security':
            case 'drugs':
            case 'lifestyle':
            case 'magical equipment':
            case 'stuff with ratings':
                if (srData.gear) {
                    const capitalizedCategory = capitalizeWords(category);
                    const categoryData = srData.gear[capitalizedCategory];
                    if (categoryData) {
                        items.push(...(categoryData.entries || categoryData || []));
                    } else {
                        console.debug(`Category "${capitalizedCategory}" not found in gear data`);
                    }
                } else {
                    console.debug(`Gear data not available`);
                }
                break;

            case 'programs':
                if (srData.programs) {
                    const pArray = Array.isArray(srData.programs) ? srData.programs : Object.values(srData.programs);
                    items.push(...pArray);
                } else {
                    console.debug(`Programs data not available`);
                }
                break;

            case 'cyberdecks':
                if (srData.cyberdeck) {
                    const cArray = Array.isArray(srData.cyberdeck) ? srData.cyberdeck : Object.values(srData.cyberdeck);
                    items.push(...cArray);
                } else {
                    console.debug(`Cyberdecks data not available`);
                }
                break;

            default:
                console.warn(`⚠️ Unknown inventory category: "${category}"`);
        }
    } catch (error) {
        console.error(`Error extracting items from category "${category}":`, error);
    }

    return items;
}

// Capitalize words (for category matching)
function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Default playable characters
const defaultCharacters = {
    jax: { name: 'Jax', balance: 50000 },
    noi: { name: 'Noi', balance: 35000 },
    roux: { name: 'Roux', balance: 45000 },
    jazz: { name: 'Jazz', balance: 40000 }
};

// Get playable characters
function getCharacters() {
    return defaultCharacters;
}

// Format currency
function formatCurrency(amount) {
    return '¥' + amount.toLocaleString();
}

// Search shop by multiple criteria
function searchShops(query) {
    const lowerQuery = query.toLowerCase();
    return shopsDatabase.filter(shop =>
        shop.shop_name.toLowerCase().includes(lowerQuery) ||
        shop.shop_type.toLowerCase().includes(lowerQuery) ||
        shop.subdistrict_thai.includes(query) ||
        shop.npc_vendor.toLowerCase().includes(lowerQuery)
    );
}

// Export for use in HTML
console.log('🏪 EXPORTING SHOP ENGINE...');
window.ShopEngine = {
    initialize: initializeShopEngine,
    getUniqueSubDistricts,
    getShopsByDistrict,
    getShopByName,
    generateShopInventory,
    getCharacters,
    formatCurrency,
    searchShops,
    shopsDatabase,
    subDistrictsData,
    srData
};

console.log('✓ Shop Engine ready');
