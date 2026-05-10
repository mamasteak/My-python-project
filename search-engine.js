// Shadowrun 2E Reference Search Engine
// Searches across all foundry-sr2 data files

let srData = {
    skills: [],
    spells: [],
    adeptPowers: [],
    cyberware: [],
    bioware: [],
    gear: [],
    vehicles: [],
    totems: [],
    programs: [],
    cyberdeck: []
};

let isDataLoaded = false;

// Load all foundry data files
async function loadShadowrunData() {
    console.log('Loading Shadowrun 2E data...');
    console.log('Current page URL:', window.location.href);
    console.log('Attempting to fetch from: data/skills.json');

    try {
        // Load skills
        const skillsResponse = await fetch('/My-python-project/data/skills.json');
        console.log('Skills fetch response:', skillsResponse.status, skillsResponse.ok);
        if (skillsResponse.ok) {
            try {
                const skillsData = await skillsResponse.json();
                srData.skills = Object.values(skillsData).map(skill => ({
                    name: skill.name,
                    type: 'Skill',
                    category: 'Skills',
                    data: skill
                }));
                console.log(`✓ Loaded ${srData.skills.length} skills`);
            } catch (e) {
                console.error('Error parsing skills.json:', e);
            }
        } else {
            console.error('Failed to load skills.json:', skillsResponse.status, skillsResponse.statusText);
        }

        // Load spells
        const spellsResponse = await fetch('/My-python-project/data/spells.json');
        if (spellsResponse.ok) {
            try {
                const spellsData = await spellsResponse.json();
                if (Array.isArray(spellsData)) {
                    srData.spells = spellsData.map(spell => ({
                        name: (spell.Name || '').trim(),
                        type: 'Spell',
                        category: 'Magic',
                        drain: spell.Drain || '---',
                        spellType: spell.Type || '---',
                        duration: spell.Duration || '---',
                        data: spell
                    }));
                }
                console.log(`✓ Loaded ${srData.spells.length} spells`);
            } catch (e) {
                console.error('Error parsing spells.json:', e);
            }
        }

        // Load adept powers
        const powersResponse = await fetch('/My-python-project/data/AdeptPowers.json');
        if (powersResponse.ok) {
            try {
                const powersData = await powersResponse.json();
                if (Array.isArray(powersData)) {
                    srData.adeptPowers = powersData.map(power => ({
                        name: power.Name,
                        type: 'Adept Power',
                        category: 'Magic',
                        cost: power.Cost || '---',
                        data: power
                    }));
                }
                console.log(`✓ Loaded ${srData.adeptPowers.length} adept powers`);
            } catch (e) {
                console.error('Error parsing AdeptPowers.json:', e);
            }
        }

        // Load cyberware
        const cyberResponse = await fetch('/My-python-project/data/cyberware.json');
        if (cyberResponse.ok) {
            const cyberData = await cyberResponse.json();
            let cyberCount = 0;
            try {
                Object.entries(cyberData).forEach(([category, items]) => {
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            srData.cyberware.push({
                                name: item.Name,
                                type: 'Cyberware',
                                category: category,
                                essence: item.EssCost || '---',
                                cost: item.Cost || '---',
                                streetIndex: item.StreetIndex || '---',
                                data: item
                            });
                            cyberCount++;
                        });
                    }
                });
                console.log(`✓ Loaded ${cyberCount} cyberware items`);
            } catch (e) {
                console.error('Error parsing cyberware.json:', e);
            }
        }

        // Load bioware
        const bioResponse = await fetch('/My-python-project/data/bioware.json');
        if (bioResponse.ok) {
            const bioData = await bioResponse.json();
            let bioCount = 0;
            try {
                Object.entries(bioData).forEach(([category, items]) => {
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            srData.bioware.push({
                                name: item.Name,
                                type: 'Bioware',
                                category: category,
                                bioIndex: item.BioIndex || '---',
                                cost: item.Cost || '---',
                                streetIndex: item.StreetIndex || '---',
                                data: item
                            });
                            bioCount++;
                        });
                    }
                });
                console.log(`✓ Loaded ${bioCount} bioware items`);
            } catch (e) {
                console.error('Error parsing bioware.json:', e);
            }
        }

        // Load gear
        const gearResponse = await fetch('/My-python-project/data/gear.json');
        if (gearResponse.ok) {
            const gearData = await gearResponse.json();
            let gearCount = 0;
            try {
                Object.entries(gearData).forEach(([category, categoryData]) => {
                    if (categoryData && Array.isArray(categoryData.entries)) {
                        categoryData.entries.forEach(item => {
                            srData.gear.push({
                                name: item.Name,
                                type: 'Gear',
                                category: category,
                                cost: item.Cost || '---',
                                availability: item.Availability || '---',
                                data: item
                            });
                            gearCount++;
                        });
                    }
                });
                console.log(`✓ Loaded ${gearCount} gear items`);
            } catch (e) {
                console.error('Error parsing gear.json:', e);
            }
        }

        // Load vehicles
        const vehiclesResponse = await fetch('/My-python-project/data/vehicles.json');
        if (vehiclesResponse.ok) {
            const vehiclesData = await vehiclesResponse.json();
            // vehicles.json is an array, not an object with categories
            srData.vehicles = vehiclesData.map(vehicle => ({
                name: vehicle.name,
                type: 'Vehicle',
                category: 'Vehicles',
                cost: vehicle['$Cost'] || vehicle.Cost,
                data: vehicle
            }));
            console.log(`✓ Loaded ${srData.vehicles.length} vehicles`);
        }

        // Load totems
        const totemResponse = await fetch('/My-python-project/data/totems.json');
        if (totemResponse.ok) {
            try {
                const totemData = await totemResponse.json();
                // totems.json has {"TOTEMS": [...]} structure
                if (totemData.TOTEMS && Array.isArray(totemData.TOTEMS)) {
                    srData.totems = totemData.TOTEMS.map(totem => ({
                        name: totem.name,
                        type: 'Totem',
                        category: 'Magic',
                        environment: totem.environment || '---',
                        data: totem
                    }));
                }
                console.log(`✓ Loaded ${srData.totems.length} totems`);
            } catch (e) {
                console.error('Error parsing totems.json:', e);
            }
        }

        // Load programs
        const programResponse = await fetch('/My-python-project/data/programs.json');
        if (programResponse.ok) {
            try {
                const programData = await programResponse.json();
                if (Array.isArray(programData)) {
                    srData.programs = programData.map(prog => ({
                        name: prog.Name,
                        type: 'Program',
                        category: 'Hacking',
                        data: prog
                    }));
                }
                console.log(`✓ Loaded ${srData.programs.length} programs`);
            } catch (e) {
                console.error('Error parsing programs.json:', e);
            }
        }

        // Load cyberdecks
        const cyberdeckResponse = await fetch('/My-python-project/data/cyberdeck.json');
        if (cyberdeckResponse.ok) {
            try {
                const cyberdeckData = await cyberdeckResponse.json();
                let cdCount = 0;
                Object.entries(cyberdeckData).forEach(([category, items]) => {
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            srData.cyberdeck.push({
                                name: item.Name,
                                type: 'Cyberdeck',
                                category: category,
                                cost: item.Cost || '---',
                                data: item
                            });
                            cdCount++;
                        });
                    }
                });
                console.log(`✓ Loaded ${cdCount} cyberdecks`);
            } catch (e) {
                console.error('Error parsing cyberdeck.json:', e);
            }
        }

        isDataLoaded = true;
        console.log('✓ All Shadowrun 2E data loaded successfully!');
        return true;
    } catch (error) {
        console.error('Error loading Shadowrun data:', error);
        // Show error message in UI
        document.getElementById('refResults').innerHTML = `<div style="padding: 12px; color: #ff0080; font-size: 9px;">ERROR: Data files not loading. Check console. Error: ${error.message}</div>`;
        return false;
    }
}

// Perform search across all data
function performSearch(query) {
    if (!isDataLoaded) {
        document.getElementById('refResults').innerHTML = '<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 9px;">Loading data... Please wait.</div>';
        return;
    }

    if (!query || query.trim().length === 0) {
        document.getElementById('refResults').innerHTML = '<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 9px;">Type to search for skills, spells, equipment, cyberware, and more...</div>';
        return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search all data categories
    results.push(...srData.skills.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.spells.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.adeptPowers.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.cyberware.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.bioware.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.gear.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.vehicles.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.totems.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.programs.filter(item => item.name.toLowerCase().includes(lowerQuery)));
    results.push(...srData.cyberdeck.filter(item => item.name.toLowerCase().includes(lowerQuery)));

    displaySearchResults(results, query);
}

// Display search results
function displaySearchResults(results, query) {
    const resultsDiv = document.getElementById('refResults');

    if (results.length === 0) {
        resultsDiv.innerHTML = `<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 9px;">No results found for "${query}"</div>`;
        return;
    }

    let html = `<div style="padding: 8px; font-size: 8px; color: var(--text-muted); border-bottom: 1px solid rgba(0, 255, 136, 0.2);">RESULTS: ${results.length} found</div>`;
    html += '<div style="overflow-y: auto;">';

    results.forEach((item, index) => {
        const cost = item.cost || item.essence || item.bioIndex || '---';
        const costLabel = item.type === 'Spell' ? item.drain : (item.type === 'Adept Power' ? item.cost + ' pts' : cost + '¥');

        html += `
            <div onclick="showItemDetails(${index})" style="padding: 6px 8px; border-bottom: 1px solid rgba(0, 255, 136, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: var(--text-secondary); transition: all 0.2s;">
                <div>
                    <div style="color: var(--primary-neon); font-weight: 600;">${item.name}</div>
                    <div style="font-size: 8px; color: var(--text-muted);">${item.type} • ${item.category}</div>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                    <div style="color: var(--primary-neon);">${costLabel}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Show item details in modal
function showItemDetails(index) {
    const results = [];
    results.push(...srData.skills);
    results.push(...srData.spells);
    results.push(...srData.adeptPowers);
    results.push(...srData.cyberware);
    results.push(...srData.bioware);
    results.push(...srData.gear);
    results.push(...srData.vehicles);
    results.push(...srData.totems);
    results.push(...srData.programs);
    results.push(...srData.cyberdeck);

    const item = results[index];
    if (!item) return;

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid var(--primary-neon);
        border-radius: 4px;
        padding: 20px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    `;

    // Build details text
    let detailsText = `${item.name}\n`;
    detailsText += `${item.type} • ${item.category}\n`;
    detailsText += '─'.repeat(40) + '\n\n';

    // Display all attributes in readable format
    Object.entries(item.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            detailsText += `${key}: ${value}\n`;
        }
    });

    modal.innerHTML = `
        <div style="color: var(--primary-neon); font-size: 13px; font-weight: 600; margin-bottom: 12px;">${item.name}</div>
        <div style="color: var(--text-muted); font-size: 9px; margin-bottom: 12px;">${item.type} • ${item.category}</div>
        <div style="border-top: 1px solid rgba(0, 255, 136, 0.2); margin-bottom: 12px;"></div>
        <div style="font-size: 9px; color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap; font-family: 'IBM Plex Mono', monospace;">
            ${detailsText}
        </div>
        <div style="margin-top: 16px; text-align: center;">
            <button onclick="this.closest('div').closest('div').parentElement.remove()"
                    style="padding: 6px 16px; background: rgba(0, 255, 136, 0.1); border: 1px solid var(--primary-neon); color: var(--primary-neon); cursor: pointer; border-radius: 2px; font-size: 9px;">
                CLOSE
            </button>
        </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // Close on overlay click
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    };
}

// Initialize on page load
window.addEventListener('load', async () => {
    // Load Shadowrun data after a small delay to ensure DOM is ready
    setTimeout(() => {
        loadShadowrunData();
    }, 500);
});
