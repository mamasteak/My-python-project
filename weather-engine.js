// Shadowrun 2E Bangkok Weather Engine
// Handles weather randomization, season logic, and game effects

let weatherData = null;
let currentWeather = null;
let currentSeason = null;
let currentTemperature = null;
let currentHumidity = null;

// Manual override tracking
let manualWeatherOverride = null; // Manually set weather condition
let manualTemperatureOverride = null; // Manually set temperature

// Load weather data from JSON file
async function loadWeatherData() {
    try {
        const response = await fetch('weather_data.json');
        weatherData = await response.json();
        console.log('Weather data loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading weather data:', error);
        return false;
    }
}

// Get current month (1-12)
function getCurrentMonth() {
    const now = new Date();
    return now.getMonth() + 1;
}

// Determine current season based on month
function determineSeason() {
    // Try to use in-game time from time-engine if available
    let month;
    if (typeof getCurrentGameMonth === 'function') {
        month = getCurrentGameMonth();
    } else {
        month = getCurrentMonth(); // fallback to real time
    }

    for (const [seasonKey, seasonData] of Object.entries(weatherData.seasons)) {
        if (seasonData.months.includes(month)) {
            currentSeason = {
                key: seasonKey,
                name: seasonData.name,
                description: seasonData.description,
                tempRange: seasonData.base_temperature_range,
                humidityRange: seasonData.humidity_range
            };
            return currentSeason;
        }
    }

    // Fallback to cool season if not found
    currentSeason = {
        key: 'cool_season',
        name: weatherData.seasons.cool_season.name,
        description: weatherData.seasons.cool_season.description,
        tempRange: weatherData.seasons.cool_season.base_temperature_range,
        humidityRange: weatherData.seasons.cool_season.humidity_range
    };
    return currentSeason;
}

// Generate random temperature based on current season
function generateTemperature() {
    if (!currentSeason) determineSeason();

    const [minTemp, maxTemp] = currentSeason.tempRange;
    const temp = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
    currentTemperature = temp;
    return temp;
}

// Generate random humidity based on current season
function generateHumidity() {
    if (!currentSeason) determineSeason();

    const [minHumidity, maxHumidity] = currentSeason.humidityRange;
    const humidity = Math.floor(Math.random() * (maxHumidity - minHumidity + 1)) + minHumidity;
    currentHumidity = humidity;
    return humidity;
}

// Select weather condition based on season probabilities
function selectWeatherCondition() {
    if (!currentSeason) determineSeason();

    const conditions = weatherData.weather_conditions;
    let totalWeight = 0;
    let weightedConditions = [];

    // Build weighted array based on current season
    for (const [conditionKey, conditionData] of Object.entries(conditions)) {
        const weight = conditionData.probability_weights[currentSeason.key] || 0;
        totalWeight += weight;

        for (let i = 0; i < weight; i++) {
            weightedConditions.push(conditionKey);
        }
    }

    // Pick random condition from weighted array
    const randomIndex = Math.floor(Math.random() * weightedConditions.length);
    const selectedConditionKey = weightedConditions[randomIndex];
    const selectedCondition = conditions[selectedConditionKey];

    return {
        key: selectedConditionKey,
        name: selectedCondition.name,
        description: selectedCondition.description,
        severity: selectedCondition.severity,
        narrative: selectedCondition.narrative,
        gameEffects: selectedCondition.game_effects
    };
}

// Generate complete random weather
function generateRandomWeather() {
    if (!weatherData) {
        console.error('Weather data not loaded. Call loadWeatherData() first.');
        return null;
    }

    // Determine season
    const season = determineSeason();

    // Generate temperature and humidity
    const temperature = generateTemperature();
    const humidity = generateHumidity();

    // Select weather condition
    const weather = selectWeatherCondition();

    // Compile complete weather object
    currentWeather = {
        season: season,
        weather: weather,
        temperature: temperature,
        humidity: humidity,
        timestamp: new Date(),
        displayString: `${weather.name} • ${temperature}°C • ${humidity}% humidity`
    };

    return currentWeather;
}

// Get current weather (or generate if not set)
function getCurrentWeather() {
    if (!currentWeather) {
        return generateRandomWeather();
    }
    return currentWeather;
}

// Get game effects for current weather
function getGameEffects() {
    if (!currentWeather) {
        getCurrentWeather();
    }
    return currentWeather.weather.gameEffects;
}

// Get weather narrative/description
function getWeatherNarrative() {
    if (!currentWeather) {
        getCurrentWeather();
    }
    return currentWeather.weather.narrative;
}

// Get weather modifier for specific action
function getWeatherModifier(actionType) {
    if (!currentWeather) {
        getCurrentWeather();
    }

    const modifiers = weatherData.weather_modifiers[actionType];
    if (!modifiers) {
        console.warn(`No modifiers found for action type: ${actionType}`);
        return 0;
    }

    const weatherKey = currentWeather.weather.key;
    return modifiers[weatherKey] || 0;
}

// Get all available action types
function getAvailableActionTypes() {
    if (!weatherData) return [];
    return Object.keys(weatherData.weather_modifiers);
}

// Format weather for display
function formatWeatherDisplay() {
    if (!currentWeather) {
        getCurrentWeather();
    }

    return {
        conditionName: currentWeather.weather.name,
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        seasonName: currentWeather.season.name,
        severity: currentWeather.weather.severity,
        shortDisplay: `${currentWeather.weather.name} • ${currentWeather.temperature}°C`,
        fullDisplay: currentWeather.displayString,
        narrative: currentWeather.weather.narrative
    };
}

// Get environmental hazards for current weather
function getEnvironmentalHazards() {
    if (!currentWeather) {
        getCurrentWeather();
    }

    const hazards = [];
    const currentSeverity = currentWeather.weather.severity;

    for (const [hazardKey, hazardData] of Object.entries(weatherData.environmental_hazards)) {
        if (currentSeverity >= hazardData.severity_threshold) {
            // Check temperature threshold if it exists
            if (hazardData.temperature_threshold && currentWeather.temperature < hazardData.temperature_threshold) {
                continue;
            }
            hazards.push({
                name: hazardData.name,
                description: hazardData.description,
                effects: hazardData.effects
            });
        }
    }

    return hazards;
}

// Generate weather report with all details
function generateWeatherReport() {
    if (!currentWeather) {
        getCurrentWeather();
    }

    const display = formatWeatherDisplay();
    const hazards = getEnvironmentalHazards();
    const modifiers = {};

    for (const actionType of getAvailableActionTypes()) {
        modifiers[actionType] = getWeatherModifier(actionType);
    }

    return {
        display: display,
        hazards: hazards,
        modifiers: modifiers,
        season: currentWeather.season,
        gameEffects: currentWeather.weather.gameEffects
    };
}

// Set weather manually (from dropdown selection)
function setWeatherManually(weatherConditionKey) {
    if (!weatherData) {
        console.error('Weather data not loaded');
        return false;
    }

    const conditions = weatherData.weather_conditions;
    const condition = conditions[weatherConditionKey];

    if (!condition) {
        console.error(`Weather condition not found: ${weatherConditionKey}`);
        return false;
    }

    // Create manual weather object
    manualWeatherOverride = {
        key: weatherConditionKey,
        name: condition.name,
        description: condition.description,
        severity: condition.severity,
        narrative: condition.narrative,
        gameEffects: condition.game_effects
    };

    // Update current weather with manual override
    if (!currentWeather) {
        currentWeather = {};
    }
    currentWeather.weather = manualWeatherOverride;

    // Lock weather for 2 in-game hours
    if (typeof lockWeather === 'function') {
        lockWeather();
    }

    console.log(`Weather manually set to: ${condition.name}`);
    return true;
}

// Set temperature manually
function setTemperatureManually(tempValue) {
    const temp = parseInt(tempValue);

    if (isNaN(temp) || temp < -50 || temp > 50) {
        console.error('Invalid temperature. Range: -50 to 50°C');
        return false;
    }

    manualTemperatureOverride = temp;
    currentTemperature = temp;

    // Lock temperature for 2 in-game hours
    if (typeof lockTemperature === 'function') {
        lockTemperature();
    }

    console.log(`Temperature manually set to: ${temp}°C`);
    return true;
}

// Clear manual weather override
function clearWeatherOverride() {
    manualWeatherOverride = null;
    console.log('Weather manual override cleared');
    return true;
}

// Clear manual temperature override
function clearTemperatureOverride() {
    manualTemperatureOverride = null;
    console.log('Temperature manual override cleared');
    return true;
}

// Check if weather is manually overridden and if lock has expired
function checkAndApplyWeatherOverride() {
    if (typeof checkLockExpiry === 'function') {
        checkLockExpiry();
    }

    // If weather is no longer locked, clear override
    if (manualWeatherOverride && typeof isWeatherLocked === 'function') {
        if (!isWeatherLocked()) {
            clearWeatherOverride();
        }
    }
}

// Check if temperature is manually overridden and if lock has expired
function checkAndApplyTemperatureOverride() {
    if (typeof checkLockExpiry === 'function') {
        checkLockExpiry();
    }

    // If temperature is no longer locked, clear override
    if (manualTemperatureOverride && typeof isTemperatureLocked === 'function') {
        if (!isTemperatureLocked()) {
            clearTemperatureOverride();
        }
    }
}

// Get list of all weather conditions for dropdown
function getAllWeatherConditions() {
    if (!weatherData) return [];

    const conditions = [];
    for (const [key, data] of Object.entries(weatherData.weather_conditions)) {
        conditions.push({
            key: key,
            name: data.name
        });
    }
    return conditions;
}

// Regenerate weather (for time passage simulation) - respects manual overrides
function regenerateWeather() {
    // Check if locks have expired
    if (typeof checkLockExpiry === 'function') {
        checkLockExpiry();
    }

    // If weather is still locked (manual override active), don't regenerate
    if (manualWeatherOverride && typeof isWeatherLocked === 'function' && isWeatherLocked()) {
        console.log('Weather is locked - keeping manual override');
        return currentWeather;
    }

    // If temperature is still locked (manual override active), keep it
    if (manualTemperatureOverride && typeof isTemperatureLocked === 'function' && isTemperatureLocked()) {
        console.log('Temperature is locked - keeping manual override');
        // Regenerate weather but keep temperature
        currentWeather = null;
        const newWeather = generateRandomWeather();
        currentTemperature = manualTemperatureOverride;
        return newWeather;
    }

    // If no locks, generate completely new weather
    currentWeather = null;
    return generateRandomWeather();
}

// Initialize weather engine on load
document.addEventListener('DOMContentLoaded', async () => {
    const loaded = await loadWeatherData();
    if (loaded) {
        generateRandomWeather();
        console.log('Weather engine initialized:', currentWeather);
    }
});
