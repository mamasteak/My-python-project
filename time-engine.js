// Shadowrun 2E Bangkok Time Engine
// Manages in-game date, time, season tracking, and calendar

let gameStartDate = new Date(2050, 0, 1); // January 1, 2050 - Shadowrun timeline
let currentGameTime = new Date(gameStartDate);

// Time mode settings
let timeMode = 'ROLEPLAY'; // COMBAT, TRAVEL, ROLEPLAY
let autoTickEnabled = false;
let autoTickInterval = null;

// Lock tracking for weather and temperature
let weatherLockedAt = null; // timestamp when weather was manually set
let temperatureLockedAt = null; // timestamp when temperature was manually set

// Mode durations (in milliseconds - represents in-game time)
const modeSpeeds = {
    COMBAT: 6000, // 6 seconds in-game per tick
    TRAVEL: 3600000, // 1 hour in-game per tick
    ROLEPLAY: 0 // no auto-tick
};

const lockDuration = 7200000; // 2 hours in in-game milliseconds

// Get current in-game date
function getCurrentGameDate() {
    return new Date(currentGameTime);
}

// Get current in-game time as formatted string
function getFormattedGameTime() {
    const hours = String(currentGameTime.getHours()).padStart(2, '0');
    const minutes = String(currentGameTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Get current in-game date as formatted string
function getFormattedGameDate() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = dayNames[currentGameTime.getDay()];
    const monthName = monthNames[currentGameTime.getMonth()];
    const date = currentGameTime.getDate();
    const year = currentGameTime.getFullYear();

    return `${dayName}, ${monthName} ${date}, ${year}`;
}

// Get current month (1-12)
function getCurrentGameMonth() {
    return currentGameTime.getMonth() + 1;
}

// Get current year
function getCurrentGameYear() {
    return currentGameTime.getFullYear();
}

// Advance game time by hours and minutes
function advanceGameTime(hours = 0, minutes = 0) {
    currentGameTime.setHours(currentGameTime.getHours() + hours);
    currentGameTime.setMinutes(currentGameTime.getMinutes() + minutes);

    // Trigger weather regeneration when time advances (if weather-engine is loaded)
    if (typeof regenerateWeather === 'function') {
        try {
            regenerateWeather();
            console.log('Weather regenerated for new game time');
        } catch (error) {
            console.error('Error regenerating weather:', error);
        }
    } else {
        console.log('Weather engine not loaded yet');
    }

    console.log(`Game time advanced: ${getFormattedGameTime()} on ${getFormattedGameDate()}`);
    return currentGameTime;
}

// Get time display object for UI
function getTimeDisplay() {
    return {
        time: getFormattedGameTime(),
        date: getFormattedGameDate(),
        month: getCurrentGameMonth(),
        year: getCurrentGameYear(),
        dayOfWeek: currentGameTime.getDay(),
        dayOfMonth: currentGameTime.getDate()
    };
}

// Set game time manually from time input (hours and minutes)
function setTimeManually(hours, minutes) {
    currentGameTime.setHours(parseInt(hours) || 0);
    currentGameTime.setMinutes(parseInt(minutes) || 0);

    if (typeof regenerateWeather === 'function') {
        try {
            regenerateWeather();
        } catch (error) {
            console.error('Error regenerating weather:', error);
        }
    }

    console.log(`Game time manually set to: ${getFormattedGameTime()}`);
    return currentGameTime;
}

// Reset game time to start
function resetGameTime() {
    currentGameTime = new Date(gameStartDate);

    if (typeof regenerateWeather === 'function') {
        try {
            regenerateWeather();
        } catch (error) {
            console.error('Error regenerating weather:', error);
        }
    }

    console.log('Game time reset to start');
    return currentGameTime;
}

// Set game time to specific date (useful for jumping to specific campaign points)
function setGameTime(year, month, day, hours = 0, minutes = 0) {
    currentGameTime = new Date(year, month - 1, day, hours, minutes);

    if (typeof regenerateWeather === 'function') {
        try {
            regenerateWeather();
        } catch (error) {
            console.error('Error regenerating weather:', error);
        }
    }

    console.log(`Game time set to: ${getFormattedGameTime()} on ${getFormattedGameDate()}`);
    return currentGameTime;
}

// Get elapsed in-game time since start
function getElapsedGameTime() {
    const elapsed = currentGameTime - gameStartDate;
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    return {
        days,
        hours,
        minutes,
        totalHours: days * 24 + hours,
        totalMinutes: days * 24 * 60 + hours * 60 + minutes
    };
}

// Quick advance functions for common time jumps
function advanceBy10Minutes() {
    return advanceGameTime(0, 10);
}

function advanceBy30Minutes() {
    return advanceGameTime(0, 30);
}

function advanceBy1Hour() {
    return advanceGameTime(1, 0);
}

function advanceBy6Hours() {
    return advanceGameTime(6, 0);
}

function advanceBy1Day() {
    return advanceGameTime(24, 0);
}

function advanceBy1Week() {
    return advanceGameTime(168, 0); // 7 days * 24 hours
}

// Set time mode (COMBAT, TRAVEL, ROLEPLAY)
function setTimeMode(mode) {
    if (!['COMBAT', 'TRAVEL', 'ROLEPLAY'].includes(mode)) {
        console.error('Invalid mode. Use COMBAT, TRAVEL, or ROLEPLAY');
        return false;
    }
    timeMode = mode;
    console.log(`Time mode set to: ${timeMode}`);

    // Stop auto-tick if switching to ROLEPLAY
    if (mode === 'ROLEPLAY') {
        stopAutoTick();
    }

    return true;
}

// Get current time mode
function getCurrentTimeMode() {
    return timeMode;
}

// Start auto-tick
function startAutoTick() {
    if (timeMode === 'ROLEPLAY') {
        console.warn('Cannot auto-tick in ROLEPLAY mode');
        return false;
    }

    if (autoTickInterval) {
        console.warn('Auto-tick already running');
        return false;
    }

    autoTickEnabled = true;
    const tickSpeed = modeSpeeds[timeMode];

    autoTickInterval = setInterval(() => {
        advanceGameTime(0, tickSpeed / 60000); // Convert ms to minutes
        console.log(`Auto-tick: ${getFormattedGameTime()}`);
    }, 1000); // Tick every real second (represents mode duration)

    console.log(`Auto-tick started in ${timeMode} mode`);
    return true;
}

// Stop auto-tick
function stopAutoTick() {
    if (autoTickInterval) {
        clearInterval(autoTickInterval);
        autoTickInterval = null;
    }
    autoTickEnabled = false;
    console.log('Auto-tick stopped');
    return true;
}

// Toggle auto-tick
function toggleAutoTick() {
    if (autoTickEnabled) {
        stopAutoTick();
    } else {
        startAutoTick();
    }
    return autoTickEnabled;
}

// Check if weather/temp locks have expired (2 hours passed)
function checkLockExpiry() {
    const now = currentGameTime.getTime();

    // Check weather lock
    if (weatherLockedAt && (now - weatherLockedAt) >= lockDuration) {
        weatherLockedAt = null;
        console.log('Weather lock expired - auto-regenerating');
        if (typeof regenerateWeather === 'function') {
            regenerateWeather();
        }
    }

    // Check temperature lock
    if (temperatureLockedAt && (now - temperatureLockedAt) >= lockDuration) {
        temperatureLockedAt = null;
        console.log('Temperature lock expired');
    }
}

// Lock weather (called when manually set)
function lockWeather() {
    weatherLockedAt = currentGameTime.getTime();
    console.log('Weather locked for 2 in-game hours');
}

// Lock temperature (called when manually set)
function lockTemperature() {
    temperatureLockedAt = currentGameTime.getTime();
    console.log('Temperature locked for 2 in-game hours');
}

// Check if weather is locked
function isWeatherLocked() {
    return weatherLockedAt !== null;
}

// Check if temperature is locked
function isTemperatureLocked() {
    return temperatureLockedAt !== null;
}

// Initialize time engine on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Time engine initialized');
    console.log(`Game start date: ${getFormattedGameDate()}`);
});
