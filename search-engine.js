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

    try {
        // Load skills
        const skillsResponse = await fetch('data/skills.json');
        if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            srData.skills = Object.values(skillsData).map(skill => ({
                name: skill.name,
                type: 'Skill',
                category: 'Skills',
                data: skill
            }));
            console.log(`✓ Loaded ${srData.skills.length} skills`);
        }

        // Load spells
        const spellsResponse = await fetch('data/spells.json');
        if (spellsResponse.ok) {
            const spellsData = await spellsResponse.json();
            srData.spells = spellsData.map(spell => ({
                name: spell.Name,
                type: 'Spell',
                category: 'Magic',
                drain: spell.Drain,
                spellType: spell.Type,
                duration: spell.Duration,
                data: spell
            }));
            console.log(`✓ Loaded ${srData.spells.length} spells`);
        }

        // Load adept powers
        const powersResponse = await fetch('data/AdeptPowers.json');
        if (powersResponse.ok) {
            const powersData = await powersResponse.json();
            srData.adeptPowers = powersData.map(power => ({
                name: power.Name,
                type: 'Adept Power',
                category: 'Magic',
                cost: power.Cost,
                data: power
            }));
            console.log(`✓ Loaded ${srData.adeptPowers.length} adept powers`);
        }

        // Load cyberware
        const cyberResponse = await fetch('data/cyberware.json');
        if (cyberResponse.ok) {
            const cyberData = await cyberResponse.json();
            let cyberCount = 0;
            Object.entries(cyberData).forEach(([category, items]) => {
                items.forEach(item => {
                    srData.cyberware.push({
                        name: item.Name,
                        type: 'Cyberware',
                        category: category,
                        essence: item.EssCost,
                        cost: item.Cost,
                        streetIndex: item.StreetIndex,
                        data: item
                    });
                    cyberCount++;
                });
            });
            console.log(`✓ Loaded ${cyberCount} cyberware items`);
        }

        // Load bioware
        const bioResponse = await fetch('data/bioware.json');
        if (bioResponse.ok) {
            const bioData = await bioResponse.json();
            let bioCount = 0;
            Object.entries(bioData).forEach(([category, items]) => {
                items.forEach(item => {
                    srData.bioware.push({
                        name: item.Name,
                        type: 'Bioware',
                        category: category,
                        bioIndex: item.BioIndex,
                        cost: item.Cost,
                        streetIndex: item.StreetIndex,
                        data: item
                    });
                    bioCount++;
                });
            });
            console.log(`✓ Loaded ${bioCount} bioware items`);
        }

        // Load gear
        const gearResponse = await fetch('data/gear.json');
        if (gearResponse.ok) {
            const gearData = await gearResponse.json();
            let gearCount = 0;
            Object.entries(gearData).forEach(([category, categoryData]) => {
                if (categoryData.entries) {
                    categoryData.entries.forEach(item => {
                        srData.gear.push({
                            name: item.Name,
                            type: 'Gear',
                            category: category,
                            cost: item.Cost,
                            availability: item.Availability,
                            data: item
                        });
                        gearCount++;
                    });
                }
            });
            console.log(`✓ Loaded ${gearCount} gear items`);
        }

        // Load vehicles
        const vehiclesResponse = await fetch('data/vehicles.json');
        if (vehiclesResponse.ok) {
            const vehiclesData = await vehiclesResponse.json();
            let vehicleCount = 0;
            Object.entries(vehiclesData).forEach(([category, items]) => {
                items.forEach(item => {
                    srData.vehicles.push({
                        name: item.Name,
                        type: 'Vehicle',
                        category: category,
                        cost: item.Cost,
                        data: item
                    });
                    vehicleCount++;
                });
            });
            console.log(`✓ Loaded ${vehicleCount} vehicles`);
        }

        // Load totems
        const totemResponse = await fetch('data/totems.json');
        if (totemResponse.ok) {
            const totemData = await totemResponse.json();
            srData.totems = totemData.map(totem => ({
                name: totem.Name,
                type: 'Totem',
                category: 'Magic',
                data: totem
            }));
            console.log(`✓ Loaded ${srData.totems.length} totems`);
        }

        // Load programs
        const programResponse = await fetch('data/programs.json');
        if (programResponse.ok) {
            const programData = await programResponse.json();
            srData.programs = programData.map(prog => ({
                name: prog.Name,
                type: 'Program',
                category: 'Hacking',
                data: prog
            }));
            console.log(`✓ Loaded ${srData.programs.length} programs`);
        }

        // Load cyberdecks
        const cyberdeckResponse = await fetch('data/cyberdeck.json');
        if (cyberdeckResponse.ok) {
            const cyberdeckData = await cyberdeckResponse.json();
            let cdCount = 0;
            Object.entries(cyberdeckData).forEach(([category, items]) => {
                items.forEach(item => {
                    srData.cyberdeck.push({
                        name: item.Name,
                        type: 'Cyberdeck',
                        category: category,
                        cost: item.Cost,
                        data: item
                    });
                    cdCount++;
                });
            });
            console.log(`✓ Loaded ${cdCount} cyberdecks`);
        }

        isDataLoaded = true;
        console.log('✓ All Shadowrun 2E data loaded successfully!');
        return true;
    } catch (error) {
        console.error('Error loading Shadowrun data:', error);
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

    let detailsHTML = `<div style="color: var(--primary-neon); font-size: 11px; font-weight: 600; margin-bottom: 12px;">${item.name}</div>`;
    detailsHTML += `<div style="color: var(--text-muted); font-size: 8px; margin-bottom: 8px;">TYPE: ${item.type} • CATEGORY: ${item.category}</div>`;
    detailsHTML += '<hr style="border: none; border-top: 1px solid rgba(0, 255, 136, 0.2); margin: 8px 0;">';
    detailsHTML += '<div style="font-size: 9px; color: var(--text-secondary); line-height: 1.6;">';

    // Display all attributes
    Object.entries(item.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            detailsHTML += `<div><span style="color: var(--text-muted);">${key}:</span> <span style="color: var(--primary-neon);">${value}</span></div>`;
        }
    });

    detailsHTML += '</div>';

    alert(`${item.name}\n\n${detailsHTML}`);
}

// Initialize on page load
window.addEventListener('load', async () => {
    // Load Shadowrun data after a small delay to ensure DOM is ready
    setTimeout(() => {
        loadShadowrunData();
    }, 500);
});
