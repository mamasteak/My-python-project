// Player Management UI - Character creation and player list
// Integrates with character-schema.js and character-storage.js

const PlayerUI = {
  currentTab: null,

  // Initialize player UI
  init() {
    console.log('📋 PlayerUI initializing...');
    this.setupTabToggle();
    this.renderPlayerTab();
  },

  // Setup tab toggle for player section
  setupTabToggle() {
    const playerTabBtn = document.getElementById('playerTabBtn');
    if (playerTabBtn) {
      playerTabBtn.addEventListener('click', () => {
        this.togglePlayerTab();
      });
      console.log('✓ Player tab toggle setup');
    }
  },

  // Toggle player tab visibility
  togglePlayerTab() {
    const playerContent = document.getElementById('playerContent');
    if (!playerContent) return;

    const isVisible = playerContent.style.display !== 'none';
    playerContent.style.display = isVisible ? 'none' : 'block';

    // Refresh player list when tab opens
    if (!isVisible) {
      this.renderPlayerList();
    }
  },

  // Render main player tab content
  renderPlayerTab() {
    const playerContent = document.getElementById('playerContent');
    if (!playerContent) return;

    playerContent.innerHTML = `
      <div class="player-tab-content">
        <div class="player-list-container">
          <h3 class="player-section-title">👥 Saved Characters</h3>
          <div id="playerListBox" class="player-list-box"></div>
        </div>

        <div class="player-actions">
          <button id="registerPlayerBtn" class="player-register-btn">
            ➕ Create New Player
          </button>
        </div>
      </div>
    `;

    // Attach event listeners
    document.getElementById('registerPlayerBtn').addEventListener('click', () => {
      this.showPlayerRegistrationModal();
    });

    // Initial render of player list
    this.renderPlayerList();

    console.log('✓ Player tab rendered');
  },

  // Render list of all saved players
  renderPlayerList() {
    const listBox = document.getElementById('playerListBox');
    if (!listBox) return;

    if (typeof CharacterStorage === 'undefined') {
      listBox.innerHTML = '<div class="player-list-empty">⚠️ Character storage not available</div>';
      return;
    }

    const characters = CharacterStorage.getAllCharacters();

    if (characters.length === 0) {
      listBox.innerHTML = '<div class="player-list-empty">📭 No characters created yet. Register a new player to get started!</div>';
      return;
    }

    let html = '<div class="player-list">';
    characters.forEach(char => {
      const balance = char.balance || 0;
      html += `
        <div class="player-item">
          <div class="player-info">
            <div class="player-name" onclick="PlayerUI.showCharacterSheet('${char.id}')" style="cursor: pointer; user-select: none;">${char.name}</div>
            <div class="player-meta">${char.metatype || 'Human'} • ¥${balance.toLocaleString()}</div>
          </div>
          <div class="player-actions-row">
            <button class="player-action-btn load-btn" onclick="PlayerUI.handleLoadPlayer('${char.id}')" title="Select this character">SELECT</button>
            <button class="player-action-btn export-btn" onclick="PlayerUI.handleExportPlayer('${char.id}')" title="Export as JSON">EXPORT</button>
            <button class="player-action-btn delete-btn" onclick="PlayerUI.handleDeletePlayer('${char.id}')" title="Delete this character">DELETE</button>
          </div>
        </div>
      `;
    });
    html += '</div>';

    listBox.innerHTML = html;
    console.log(`✓ Rendered ${characters.length} characters`);
  },

  // Show character creation modal
  showPlayerRegistrationModal() {
    if (typeof CharacterSchema === 'undefined') {
      alert('⚠️ Character system not ready');
      return;
    }

    const modalHTML = `
      <div id="playerRegisterModal" class="player-modal-overlay">
        <div class="player-modal">
          <div class="player-modal-header">
            <h2>Create New Player</h2>
            <button class="player-modal-close" onclick="PlayerUI.closeRegistrationModal()">✕</button>
          </div>

          <div class="player-modal-tabs">
            <button class="player-tab-btn active" onclick="PlayerUI.switchFormTab('details')">Details</button>
            <button class="player-tab-btn" onclick="PlayerUI.switchFormTab('attributes')">Attributes</button>
            <button class="player-tab-btn" onclick="PlayerUI.switchFormTab('magic')">Magic</button>
            <button class="player-tab-btn" onclick="PlayerUI.switchFormTab('adept')">Adept</button>
          </div>

          <form id="playerRegistrationForm" class="player-form">
            <!-- DETAILS TAB -->
            <div id="details" class="player-form-tab active">
              <div class="form-group">
                <label>Character Name *</label>
                <input type="text" name="charName" placeholder="Enter character name" required>
              </div>
              <div class="form-group">
                <label>Metatype</label>
                <select name="metatype">
                  <option value="human">Human</option>
                  <option value="elf">Elf</option>
                  <option value="dwarf">Dwarf</option>
                  <option value="orc">Orc</option>
                  <option value="troll">Troll</option>
                </select>
              </div>
              <div class="form-group">
                <label>Player Name</label>
                <input type="text" name="playerName" placeholder="Your name (optional)">
              </div>
            </div>

            <!-- ATTRIBUTES TAB -->
            <div id="attributes" class="player-form-tab">
              <div class="attributes-grid">
                <div class="form-group">
                  <label>Body</label>
                  <input type="number" name="body" min="1" max="10" value="3">
                </div>
                <div class="form-group">
                  <label>Quickness</label>
                  <input type="number" name="quickness" min="1" max="10" value="3">
                </div>
                <div class="form-group">
                  <label>Strength</label>
                  <input type="number" name="strength" min="1" max="10" value="3">
                </div>
                <div class="form-group">
                  <label>Charisma</label>
                  <input type="number" name="charisma" min="1" max="10" value="3">
                </div>
                <div class="form-group">
                  <label>Intelligence</label>
                  <input type="number" name="intelligence" min="1" max="10" value="3">
                </div>
                <div class="form-group">
                  <label>Willpower</label>
                  <input type="number" name="willpower" min="1" max="10" value="3">
                </div>
              </div>
            </div>

            <!-- MAGIC TAB -->
            <div id="magic" class="player-form-tab">
              <div class="form-group">
                <label>
                  <input type="checkbox" name="awakened"> Awakened Mage
                </label>
              </div>
              <div id="magicOptions" class="magic-options" style="display:none;">
                <div class="form-group">
                  <label>Tradition</label>
                  <select name="tradition">
                    <option value="">Select tradition...</option>
                    <option value="shamanism">Shamanism</option>
                    <option value="hermetic">Hermetic</option>
                    <option value="voodoo">Voodoo</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Magic Rating (0-6)</label>
                  <input type="number" name="magicRating" min="0" max="6" value="1">
                </div>
              </div>
            </div>

            <!-- ADEPT TAB -->
            <div id="adept" class="player-form-tab">
              <div class="form-group">
                <label>
                  <input type="checkbox" name="isAdept"> Adept
                </label>
              </div>
              <div id="adeptOptions" class="adept-options" style="display:none;">
                <div class="form-group">
                  <label>Power Points (0-10)</label>
                  <input type="number" name="powerPoints" min="0" max="10" value="0">
                </div>
              </div>
            </div>
          </form>

          <div class="player-modal-footer">
            <button class="player-btn-cancel" onclick="PlayerUI.closeRegistrationModal()">Cancel</button>
            <button class="player-btn-create" onclick="PlayerUI.handleCharacterCreation()">Create Player</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup toggle handlers with small delay to ensure DOM is ready
    setTimeout(() => {
      const awokenedCheckbox = document.querySelector('#playerRegisterModal input[name="awakened"]');
      const adeptCheckbox = document.querySelector('#playerRegisterModal input[name="isAdept"]');

      if (awokenedCheckbox) {
        awokenedCheckbox.addEventListener('change', (e) => {
          const magicOptions = document.getElementById('magicOptions');
          if (magicOptions) {
            magicOptions.style.display = e.target.checked ? 'block' : 'none';
          }
        });
      }

      if (adeptCheckbox) {
        adeptCheckbox.addEventListener('change', (e) => {
          const adeptOptions = document.getElementById('adeptOptions');
          if (adeptOptions) {
            adeptOptions.style.display = e.target.checked ? 'block' : 'none';
          }
        });
      }

      console.log('✓ Registration modal opened with toggle handlers');
    }, 50);
  },

  // Switch form tab
  switchFormTab(tabName) {
    document.querySelectorAll('.player-form-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.player-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const tabElement = document.getElementById(tabName);
    if (tabElement) {
      tabElement.classList.add('active');
    }

    // Mark the clicked button as active
    if (event && event.target) {
      event.target.classList.add('active');
    }
  },

  // Close registration modal
  closeRegistrationModal() {
    const modal = document.getElementById('playerRegisterModal');
    if (modal) {
      modal.remove();
    }
  },

  // Handle character creation
  handleCharacterCreation() {
    const form = document.getElementById('playerRegistrationForm');
    if (!form) {
      alert('⚠️ Form not found');
      return;
    }

    // Get form values safely
    const charName = (document.querySelector('input[name="charName"]')?.value || '').trim();
    if (!charName) {
      alert('⚠️ Please enter a character name');
      return;
    }

    const metatype = document.querySelector('select[name="metatype"]')?.value || 'human';
    const playerName = (document.querySelector('input[name="playerName"]')?.value || '').trim();

    // Create character via schema
    const character = CharacterSchema.createNewCharacter(charName, metatype);

    // Set attributes from form
    character.attributes.body.base = parseInt(document.querySelector('input[name="body"]')?.value || 3);
    character.attributes.quickness.base = parseInt(document.querySelector('input[name="quickness"]')?.value || 3);
    character.attributes.strength.base = parseInt(document.querySelector('input[name="strength"]')?.value || 3);
    character.attributes.charisma.base = parseInt(document.querySelector('input[name="charisma"]')?.value || 3);
    character.attributes.intelligence.base = parseInt(document.querySelector('input[name="intelligence"]')?.value || 3);
    character.attributes.willpower.base = parseInt(document.querySelector('input[name="willpower"]')?.value || 3);

    // Apply magic if awakened
    const awakenedCheck = document.querySelector('input[name="awakened"]');
    if (awakenedCheck?.checked) {
      character.magic.awakened = true;
      character.magic.tradition = document.querySelector('select[name="tradition"]')?.value || null;
      character.attributes.magic.base = parseInt(document.querySelector('input[name="magicRating"]')?.value || 1);
      character.attributes.magic.current = character.attributes.magic.base;
    }

    // Apply adept if selected
    const adeptCheck = document.querySelector('input[name="isAdept"]');
    if (adeptCheck?.checked) {
      character.adept.isAdept = true;
      character.adept.powerPoints = parseInt(document.querySelector('input[name="powerPoints"]')?.value || 0);
    }

    // Add player name if provided
    if (playerName) {
      character.details.player = playerName;
    }

    // Update modified attributes (copy from base)
    Object.keys(character.attributes).forEach(attr => {
      if (character.attributes[attr].base !== undefined && character.attributes[attr].modified === undefined) {
        character.attributes[attr].modified = character.attributes[attr].base;
      }
    });

    // Save character
    const result = CharacterStorage.saveCharacter(character);

    if (result.success) {
      console.log(`✓ Character "${charName}" created successfully`);

      // Auto-save to JSON file immediately
      CharacterStorage.downloadCharacterAsJSON(character);

      // Close modal
      this.closeRegistrationModal();

      // Refresh player list
      this.renderPlayerList();

      alert(`✅ Character "${charName}" created!\n✓ Saved to localStorage\n✓ Exported as ${charName}.json`);
    } else {
      alert(`❌ Failed to create character: ${result.errors ? result.errors.join(', ') : result.error}`);
    }
  },

  // Load/select player
  handleLoadPlayer(characterId) {
    const character = CharacterStorage.loadCharacter(characterId);
    if (!character) {
      alert('⚠️ Could not load character');
      return;
    }

    // Update global characters variable (used by shop system)
    if (typeof characters === 'undefined') {
      window.characters = {};
    }
    window.characters[character.id] = {
      id: character.id,
      name: character.name,
      balance: character.balance,
      metatype: character.metatype
    };

    // Update player select dropdown if it exists
    const playerSelect = document.getElementById('playerSelect');
    if (playerSelect) {
      playerSelect.value = character.id;
      // Trigger balance update
      if (typeof updatePlayerBalance === 'function') {
        updatePlayerBalance();
      }
    }

    alert(`✅ Loaded: ${character.name} (¥${character.balance.toLocaleString()})`);
    console.log(`✓ Loaded character: ${character.name}`);
  },

  // Delete player
  handleDeletePlayer(characterId) {
    const character = CharacterStorage.loadCharacter(characterId);
    if (!character) return;

    const confirmed = confirm(`Are you sure you want to delete "${character.name}"? This cannot be undone.`);
    if (!confirmed) return;

    const result = CharacterStorage.deleteCharacter(characterId);
    if (result.success) {
      this.renderPlayerList();
      alert(`✓ Character "${character.name}" deleted`);
      console.log(`✓ Deleted character: ${character.name}`);
    } else {
      alert(`❌ Failed to delete character: ${result.error}`);
    }
  },

  // Export player as JSON
  handleExportPlayer(characterId) {
    const character = CharacterStorage.loadCharacter(characterId);
    if (!character) return;

    CharacterStorage.downloadCharacterAsJSON(character);
    console.log(`✓ Exported character: ${character.name}`);
  },

  // Show character sheet display
  showCharacterSheet(characterId) {
    const character = CharacterStorage.loadCharacter(characterId);
    if (!character) {
      alert('⚠️ Could not load character');
      return;
    }

    const essence = character.attributes.essence.current || 6;
    const karma = character.karma.current || 0;

    const sheetHTML = `
      <div id="charSheetModal" class="char-sheet-overlay">
        <div class="char-sheet-modal" style="position: absolute; left: 100px; top: 50px;">
          <div class="char-sheet-header" style="cursor: move; background: linear-gradient(90deg, #00ff88 0%, #00d4ff 100%); user-select: none;">
            <h2>${character.name}</h2>
            <button class="char-sheet-close" onclick="PlayerUI.closeCharacterSheet()">✕</button>
          </div>

          <div class="char-sheet-tabs">
            <button class="char-sheet-tab-btn active" onclick="PlayerUI.switchSheetTab('overview')">Overview</button>
            <button class="char-sheet-tab-btn" onclick="PlayerUI.switchSheetTab('attributes')">Attributes</button>
            <button class="char-sheet-tab-btn" onclick="PlayerUI.switchSheetTab('skills')">Skills</button>
            <button class="char-sheet-tab-btn" onclick="PlayerUI.switchSheetTab('equipment')">Equipment</button>
          </div>

          <div class="char-sheet-content">
            <!-- OVERVIEW TAB -->
            <div id="sheet-overview" class="char-sheet-tab-content active">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px;">
                <div class="stat-block">
                  <div class="stat-label">Metatype</div>
                  <div class="stat-value">${character.metatype || 'Human'}</div>
                </div>
                <div class="stat-block">
                  <div class="stat-label">Balance</div>
                  <div class="stat-value">¥${character.balance.toLocaleString()}</div>
                </div>
                <div class="stat-block">
                  <div class="stat-label">Essence</div>
                  <div class="stat-value">${essence.toFixed(2)}/6</div>
                </div>
                <div class="stat-block">
                  <div class="stat-label">Karma</div>
                  <div class="stat-value">${karma}</div>
                </div>
                <div class="stat-block">
                  <div class="stat-label">Awakened</div>
                  <div class="stat-value">${character.magic.awakened ? '✓ Yes' : 'No'}</div>
                </div>
                <div class="stat-block">
                  <div class="stat-label">Adept</div>
                  <div class="stat-value">${character.adept.isAdept ? '✓ Yes' : 'No'}</div>
                </div>
              </div>
              ${character.details.biography ? `
                <div style="padding: 0 12px 12px 12px; border-top: 1px solid var(--secondary-neon); margin-top: 8px;">
                  <div style="color: var(--text-muted); font-size: 9px; margin-bottom: 4px;">BIOGRAPHY</div>
                  <div style="color: var(--text-bright); font-size: 10px; line-height: 1.4;">${character.details.biography}</div>
                </div>
              ` : ''}
            </div>

            <!-- ATTRIBUTES TAB -->
            <div id="sheet-attributes" class="char-sheet-tab-content">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px;">
                ${['body', 'quickness', 'strength', 'charisma', 'intelligence', 'willpower'].map(attr => {
                  const base = character.attributes[attr].base || 0;
                  const modified = character.attributes[attr].modified || base;
                  return `
                    <div class="attr-block">
                      <div class="attr-label">${attr.toUpperCase().substring(0, 3)}</div>
                      <div class="attr-display">
                        <span style="color: var(--primary-neon);">${modified}</span>
                        ${modified !== base ? `<span style="color: var(--text-muted); font-size: 8px;">(${base})</span>` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- SKILLS TAB -->
            <div id="sheet-skills" class="char-sheet-tab-content">
              ${character.skills.length > 0 ? `
                <div style="padding: 12px;">
                  ${character.skills.map(skill => `
                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--secondary-neon);">
                      <div style="color: var(--text-bright); font-size: 10px;">
                        <strong>${skill.baseName}</strong>${skill.concentration ? ` (${skill.concentration})` : ''}${skill.specialization ? ` [${skill.specialization}]` : ''}
                      </div>
                      <div style="color: var(--primary-neon); font-size: 10px; font-weight: bold;">${skill.ratings.base || 0}</div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="padding: 12px; color: var(--text-muted); font-size: 10px;">No skills added yet</div>
              `}
            </div>

            <!-- EQUIPMENT TAB -->
            <div id="sheet-equipment" class="char-sheet-tab-content">
              <div style="padding: 12px;">
                ${['weapons', 'armor', 'gear', 'cyberware', 'bioware'].map(equipType => {
                  const items = character.equipment[equipType] || [];
                  return items.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                      <div style="color: var(--primary-neon); font-size: 10px; font-weight: bold; margin-bottom: 4px;">${equipType.toUpperCase()}</div>
                      ${items.map(item => `
                        <div style="color: var(--text-bright); font-size: 9px; padding: 2px 0; padding-left: 12px;">• ${item.name || 'Unknown'}</div>
                      `).join('')}
                    </div>
                  ` : '';
                }).join('')}
                ${['weapons', 'armor', 'gear', 'cyberware', 'bioware'].every(t => (!character.equipment[t] || character.equipment[t].length === 0)) ? `
                  <div style="color: var(--text-muted); font-size: 10px;">No equipment</div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', sheetHTML);
    this.makeModalDraggable('charSheetModal');
    console.log(`✓ Opened character sheet: ${character.name}`);
  },

  // Switch sheet tabs
  switchSheetTab(tabName) {
    document.querySelectorAll('.char-sheet-tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.char-sheet-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const tabElement = document.getElementById(`sheet-${tabName}`);
    if (tabElement) {
      tabElement.classList.add('active');
    }

    event.target.classList.add('active');
  },

  // Close character sheet
  closeCharacterSheet() {
    const modal = document.getElementById('charSheetModal');
    if (modal) {
      modal.remove();
    }
  },

  // Make modal draggable
  makeModalDraggable(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const header = modal.querySelector('.char-sheet-header');
    if (!header) return;

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = modal.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      modal.style.left = Math.max(0, Math.min(x, window.innerWidth - modal.offsetWidth)) + 'px';
      modal.style.top = Math.max(0, Math.min(y, window.innerHeight - modal.offsetHeight)) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
};

// Auto-initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof CharacterStorage !== 'undefined' && typeof CharacterSchema !== 'undefined') {
      PlayerUI.init();
    } else {
      console.warn('⚠️ Character modules not available for PlayerUI');
    }
  });
} else {
  if (typeof CharacterStorage !== 'undefined' && typeof CharacterSchema !== 'undefined') {
    PlayerUI.init();
  }
}

console.log('✓ Player UI loaded');
