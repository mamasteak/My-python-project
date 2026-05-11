// Shop Engine for Bangkok Shadowrun Campaign
// Loads shop data from JSON files and generates inventory dynamically

let shopsDatabase = [];
let subDistrictsData = [];
let inventoryCache = {};
let srData = {};

// Load all data
async function initializeShopEngine() {
    try {
        console.log('🏪 Initializing Shop Engine...');

        // Load shops.json
        const shopsResponse = await fetch('./shops.json');
        const shopsJson = await shopsResponse.json();
        shopsDatabase = shopsJson.shops;
        console.log(`✓ Loaded ${shopsDatabase.length} shops`);

        // Load subdistricts.json
        const subResponse = await fetch('./subdistricts.json');
        subDistrictsData = await subResponse.json();
        console.log(`✓ Loaded ${subDistrictsData.length} subdistricts`);

        // Load SR2 data files for inventory
        await loadSR2Data();

        console.log('✓ Shop Engine initialized');
        return true;
    } catch (error) {
        console.error('Error initializing shop engine:', error);
        return false;
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
    subDistrictsData.forEach(sub => {
        if (!districts[sub.district]) {
            districts[sub.district] = [];
        }
        districts[sub.district].push(sub.subdistrict);
    });
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

    // Fetch items from SR2 data based on categories
    inventory_categories.forEach(category => {
        const items = extractItemsFromCategory(category);

        // Randomly select 5-10 items from this category
        const itemCount = Math.floor(Math.random() * 6) + 5;
        const selectedItems = items.sort(() => Math.random() - 0.5).slice(0, itemCount);

        selectedItems.forEach((item, index) => {
            inventory.push({
                id: inventory.length + 1,
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

    switch(category.toLowerCase()) {
        case 'bioware':
            if (srData.bioware && srData.bioware.STANDARD) {
                items.push(...srData.bioware.STANDARD);
            }
            break;

        case 'vehicles':
            if (srData.vehicles) {
                const vArray = Array.isArray(srData.vehicles) ? srData.vehicles : Object.values(srData.vehicles);
                items.push(...vArray.slice(0, 50));
            }
            break;

        case 'vehicle modifications':
            if (srData.vehicles) {
                const vArray = Array.isArray(srData.vehicles) ? srData.vehicles : Object.values(srData.vehicles);
                items.push(...vArray.slice(50, 100));
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
            if (srData.gear && srData.gear[capitalizeWords(category)]) {
                items.push(...srData.gear[capitalizeWords(category)].entries || []);
            }
            break;

        case 'programs':
            if (srData.programs) {
                const pArray = Array.isArray(srData.programs) ? srData.programs : Object.values(srData.programs);
                items.push(...pArray);
            }
            break;

        case 'cyberdecks':
            if (srData.cyberdeck) {
                const cArray = Array.isArray(srData.cyberdeck) ? srData.cyberdeck : Object.values(srData.cyberdeck);
                items.push(...cArray);
            }
            break;
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

console.log('Shop Engine ready');
