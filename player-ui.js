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

  // Render main player tab content - 3 column layout
  renderPlayerTab() {
    const playerContent = document.getElementById('playerContent');
    if (!playerContent) return;

    playerContent.innerHTML = `
      <div class="player-tab-content-3col">
        <!-- LEFT BOX: Load & List -->
        <div class="player-box-left">
          <h3 class="player-section-title">📂 LOAD CHARACTER</h3>
          <div class="player-load-section">
            <input type="file" id="charFileInput" accept=".json" style="display: none;">
            <button class="player-btn-file" onclick="document.getElementById('charFileInput').click()">📥 Import JSON File</button>
          </div>

          <h3 class="player-section-title" style="margin-top: 20px;">👥 SAVED CHARACTERS</h3>
          <div id="playerListBox" class="player-list-box-compact"></div>
        </div>

        <!-- MIDDLE BOX: Character Maker -->
        <div class="player-box-middle">
          <h3 class="player-section-title">⚔️ CHARACTER MAKER</h3>
          <div id="charMakerForm" class="char-maker-form"></div>
        </div>

        <!-- RIGHT BOX: Preview/Details -->
        <div class="player-box-right">
          <h3 class="player-section-title">📋 PREVIEW</h3>
          <div id="charPreview" class="char-preview-box">
            <div style="color: var(--text-muted); padding: 12px; text-align: center;">Build character to see preview...</div>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners
    const fileInput = document.getElementById('charFileInput');
    fileInput.addEventListener('change', (e) => this.handleFileImport(e));

    // Initialize character maker form
    this.initInlineCharacterMaker();

    // Initial render of player list
    this.renderPlayerListCompact();

    console.log('✓ Player tab rendered with 3-column layout');
  },

  // Render compact player list for left box
  renderPlayerListCompact() {
    const listBox = document.getElementById('playerListBox');
    if (!listBox) return;

    if (typeof CharacterStorage === 'undefined') {
      listBox.innerHTML = '<div class="player-list-empty">⚠️ Character storage unavailable</div>';
      return;
    }

    const characters = CharacterStorage.getAllCharacters();

    if (characters.length === 0) {
      listBox.innerHTML = '<div class="player-list-empty">📭 No characters saved</div>';
      return;
    }

    let html = '<div class="player-list-compact">';
    characters.forEach(char => {
      const balance = char.balance || 0;
      html += `
        <div class="player-item-compact" onclick="PlayerUI.loadCharToMaker('${char.id}')">
          <div class="player-name-compact">${char.name}</div>
          <div class="player-meta-compact">${char.metatype || 'Human'} • ¥${balance.toLocaleString()}</div>
        </div>
      `;
    });
    html += '</div>';

    listBox.innerHTML = html;
    console.log(`✓ Rendered ${characters.length} characters in compact list`);
  },

  // Initialize inline character maker form
  initInlineCharacterMaker() {
    const form = document.getElementById('charMakerForm');
    if (!form) return;

    const formHTML = `
      <div class="maker-form-inline">
        <!-- Basics Section -->
        <div class="maker-form-section">
          <div class="maker-label">Name *</div>
          <input type="text" id="inlineCharName" class="maker-input" placeholder="Character name" required>
        </div>

        <div class="maker-form-row">
          <div class="maker-form-section">
            <div class="maker-label">Metatype</div>
            <select id="inlineMetatype" class="maker-input">
              <option value="human">Human</option>
              <option value="elf">Elf</option>
              <option value="dwarf">Dwarf</option>
              <option value="orc">Orc</option>
              <option value="troll">Troll</option>
            </select>
          </div>
          <div class="maker-form-section">
            <div class="maker-label">Balance (¥)</div>
            <input type="number" id="inlineBalance" class="maker-input" value="50000" min="0">
          </div>
        </div>

        <!-- Attributes Section -->
        <div class="maker-form-section">
          <div class="maker-label">ATTRIBUTES</div>
          <div class="maker-attrs-inline">
            <div class="attr-inline"><label>BOD</label><input type="number" id="inlineBody" min="1" max="10" value="3"></div>
            <div class="attr-inline"><label>QCK</label><input type="number" id="inlineQuickness" min="1" max="10" value="3"></div>
            <div class="attr-inline"><label>STR</label><input type="number" id="inlineStrength" min="1" max="10" value="3"></div>
            <div class="attr-inline"><label>CHA</label><input type="number" id="inlineCharisma" min="1" max="10" value="3"></div>
            <div class="attr-inline"><label>INT</label><input type="number" id="inlineIntelligence" min="1" max="10" value="3"></div>
            <div class="attr-inline"><label>WIL</label><input type="number" id="inlineWillpower" min="1" max="10" value="3"></div>
          </div>
        </div>

        <!-- Magic/Adept -->
        <div class="maker-form-row">
          <div class="maker-form-section">
            <label class="maker-checkbox">
              <input type="checkbox" id="inlineAwakened"> Awakened
            </label>
            <div id="inlineMagicOpts" style="display: none; margin-top: 6px;">
              <input type="text" id="inlineTradition" class="maker-input" placeholder="Tradition" style="font-size: 9px; padding: 4px;">
              <input type="number" id="inlineMagicRating" class="maker-input" min="0" max="6" value="1" placeholder="Rating" style="font-size: 9px; padding: 4px; margin-top: 4px;">
            </div>
          </div>
          <div class="maker-form-section">
            <label class="maker-checkbox">
              <input type="checkbox" id="inlineAdept"> Adept
            </label>
            <div id="inlineAdeptOpts" style="display: none; margin-top: 6px;">
              <input type="number" id="inlinePowerPoints" class="maker-input" min="0" max="10" value="0" placeholder="Power Pts" style="font-size: 9px; padding: 4px;">
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="maker-form-section">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="maker-label">SKILLS</div>
            <button onclick="PlayerUI.addInlineSkill()" style="font-size: 9px; padding: 4px 8px;">+ Add</button>
          </div>
          <div id="inlineSkillsList" style="max-height: 100px; overflow-y: auto;"></div>
        </div>

        <!-- Save Button -->
        <button onclick="PlayerUI.saveCharacterInline()" class="player-btn-save-inline" style="width: 100%; margin-top: 12px;">💾 SAVE & EXPORT JSON</button>
      </div>
    `;

    form.innerHTML = formHTML;

    // Setup toggle handlers
    document.getElementById('inlineAwakened').addEventListener('change', (e) => {
      document.getElementById('inlineMagicOpts').style.display = e.target.checked ? 'block' : 'none';
    });

    document.getElementById('inlineAdept').addEventListener('change', (e) => {
      document.getElementById('inlineAdeptOpts').style.display = e.target.checked ? 'block' : 'none';
    });

    console.log('✓ Inline character maker initialized');
  },

  // Add inline skill row
  addInlineSkill() {
    const list = document.getElementById('inlineSkillsList');
    const skillId = 'inlineSkill_' + Date.now();
    const html = `
      <div id="${skillId}" style="display: flex; gap: 4px; margin-bottom: 4px; font-size: 9px;">
        <input type="text" placeholder="Skill" class="maker-input inline-skill-name" style="flex: 1; padding: 4px;">
        <input type="number" placeholder="Lvl" min="0" max="6" value="1" style="width: 40px; padding: 4px;">
        <button onclick="document.getElementById('${skillId}').remove()" style="padding: 4px 6px; width: 24px;">✕</button>
      </div>
    `;
    list.insertAdjacentHTML('beforeend', html);
  },

  // Load character to maker
  loadCharToMaker(characterId) {
    const character = CharacterStorage.loadCharacter(characterId);
    if (!character) return;

    document.getElementById('inlineCharName').value = character.name;
    document.getElementById('inlineMetatype').value = character.metatype || 'human';
    document.getElementById('inlineBalance').value = character.balance;
    document.getElementById('inlineBody').value = character.attributes.body.base || 3;
    document.getElementById('inlineQuickness').value = character.attributes.quickness.base || 3;
    document.getElementById('inlineStrength').value = character.attributes.strength.base || 3;
    document.getElementById('inlineCharisma').value = character.attributes.charisma.base || 3;
    document.getElementById('inlineIntelligence').value = character.attributes.intelligence.base || 3;
    document.getElementById('inlineWillpower').value = character.attributes.willpower.base || 3;

    if (character.magic.awakened) {
      document.getElementById('inlineAwakened').checked = true;
      document.getElementById('inlineMagicOpts').style.display = 'block';
      document.getElementById('inlineTradition').value = character.magic.tradition || '';
      document.getElementById('inlineMagicRating').value = character.attributes.magic.base || 1;
    }

    if (character.adept.isAdept) {
      document.getElementById('inlineAdept').checked = true;
      document.getElementById('inlineAdeptOpts').style.display = 'block';
      document.getElementById('inlinePowerPoints').value = character.adept.powerPoints || 0;
    }

    this.updateCharPreview();
    console.log(`✓ Loaded character "${character.name}" to maker`);
  },

  // Save character inline
  saveCharacterInline() {
    const charName = document.getElementById('inlineCharName').value.trim();
    if (!charName) {
      alert('⚠️ Please enter character name');
      return;
    }

    const character = CharacterSchema.createNewCharacter(charName, document.getElementById('inlineMetatype').value);

    // Set basics
    character.balance = parseInt(document.getElementById('inlineBalance').value) || 50000;

    // Set attributes
    character.attributes.body.base = parseInt(document.getElementById('inlineBody').value) || 3;
    character.attributes.quickness.base = parseInt(document.getElementById('inlineQuickness').value) || 3;
    character.attributes.strength.base = parseInt(document.getElementById('inlineStrength').value) || 3;
    character.attributes.charisma.base = parseInt(document.getElementById('inlineCharisma').value) || 3;
    character.attributes.intelligence.base = parseInt(document.getElementById('inlineIntelligence').value) || 3;
    character.attributes.willpower.base = parseInt(document.getElementById('inlineWillpower').value) || 3;

    // Copy to modified
    Object.keys(character.attributes).forEach(attr => {
      if (character.attributes[attr].base) {
        character.attributes[attr].modified = character.attributes[attr].base;
      }
    });

    // Magic
    if (document.getElementById('inlineAwakened').checked) {
      character.magic.awakened = true;
      character.magic.tradition = document.getElementById('inlineTradition').value || null;
      character.attributes.magic.base = parseInt(document.getElementById('inlineMagicRating').value) || 1;
      character.attributes.magic.current = character.attributes.magic.base;
    }

    // Adept
    if (document.getElementById('inlineAdept').checked) {
      character.adept.isAdept = true;
      character.adept.powerPoints = parseInt(document.getElementById('inlinePowerPoints').value) || 0;
    }

    // Skills
    document.querySelectorAll('.inline-skill-name').forEach(input => {
      const name = input.value.trim();
      if (name) {
        const rating = input.parentElement.querySelector('input[type="number"]').value;
        character.skills.push({
          id: 'skill_' + Date.now() + '_' + Math.random(),
          baseName: name,
          concentration: '',
          specialization: '',
          ratings: { base: parseInt(rating) || 0, concentration: 0, specialization: 0 }
        });
      }
    });

    // Save
    const result = CharacterStorage.saveCharacter(character);

    if (result.success) {
      CharacterStorage.downloadCharacterAsJSON(character);
      this.renderPlayerListCompact();
      this.updateCharPreview();
      alert(`✅ Character "${charName}" saved!\n✓ JSON exported: ${charName}.json`);
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  },

  // Update character preview
  updateCharPreview() {
    const charName = document.getElementById('inlineCharName').value || '[No name]';
    const metatype = document.getElementById('inlineMetatype').value;
    const balance = parseInt(document.getElementById('inlineBalance').value) || 0;

    let preview = `
      <div style="padding: 12px; color: var(--text-bright); font-size: 10px;">
        <div style="color: var(--primary-neon); font-size: 12px; font-weight: bold; margin-bottom: 8px;">
          ${charName}
        </div>
        <div style="margin-bottom: 8px;">
          <div style="color: var(--text-muted); font-size: 9px;">METATYPE</div>
          <div style="color: var(--tertiary-neon);">${metatype}</div>
        </div>
        <div style="margin-bottom: 8px;">
          <div style="color: var(--text-muted); font-size: 9px;">BALANCE</div>
          <div style="color: var(--primary-neon);">¥${balance.toLocaleString()}</div>
        </div>
        <div style="margin-bottom: 8px;">
          <div style="color: var(--text-muted); font-size: 9px;">ATTRIBUTES</div>
          <div style="line-height: 1.4;">
            BOD: ${document.getElementById('inlineBody').value} •
            QCK: ${document.getElementById('inlineQuickness').value} •
            STR: ${document.getElementById('inlineStrength').value}<br>
            CHA: ${document.getElementById('inlineCharisma').value} •
            INT: ${document.getElementById('inlineIntelligence').value} •
            WIL: ${document.getElementById('inlineWillpower').value}
          </div>
        </div>
        ${document.getElementById('inlineAwakened')?.checked ? `
          <div style="margin-bottom: 8px;">
            <div style="color: var(--text-muted); font-size: 9px;">✨ AWAKENED</div>
            <div>Magic Rating: ${document.getElementById('inlineMagicRating').value}</div>
          </div>
        ` : ''}
        ${document.getElementById('inlineAdept')?.checked ? `
          <div style="margin-bottom: 8px;">
            <div style="color: var(--text-muted); font-size: 9px;">⚡ ADEPT</div>
            <div>Power Points: ${document.getElementById('inlinePowerPoints').value}</div>
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('charPreview').innerHTML = preview;
  },

  // Handle file import
  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const charData = JSON.parse(e.target.result);
        const result = CharacterStorage.importCharacterFromJSON(JSON.stringify(charData));

        if (result.success) {
          const saved = CharacterStorage.saveCharacter(result.character);
          if (saved.success) {
            this.renderPlayerListCompact();
            this.loadCharToMaker(result.character.id);
            alert(`✅ Character imported: ${result.character.name}`);
          }
        }
      } catch (err) {
        alert(`❌ Error importing file: ${err.message}`);
      }
    };
    reader.readAsText(file);
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

  // Show full character maker
  showFullCharacterMaker() {
    if (typeof CharacterSchema === 'undefined') {
      alert('⚠️ Character system not ready');
      return;
    }

    const charMakerHTML = `
      <div id="charMakerOverlay" class="char-maker-overlay">
        <div class="char-maker-modal">
          <div class="char-maker-header">
            <h2>⚔️ FULL CHARACTER MAKER</h2>
            <button class="char-maker-close" onclick="PlayerUI.closeCharacterMaker()">✕</button>
          </div>

          <div class="char-maker-tabs">
            <button class="char-maker-tab-btn active" onclick="PlayerUI.switchMakerTab('basics')">Basics</button>
            <button class="char-maker-tab-btn" onclick="PlayerUI.switchMakerTab('attributes')">Attributes</button>
            <button class="char-maker-tab-btn" onclick="PlayerUI.switchMakerTab('skills')">Skills</button>
            <button class="char-maker-tab-btn" onclick="PlayerUI.switchMakerTab('equipment')">Equipment</button>
            <button class="char-maker-tab-btn" onclick="PlayerUI.switchMakerTab('magic')">Magic</button>
            <button class="char-maker-tab-btn" onclick="PlayerUI.switchMakerTab('review')">Review</button>
          </div>

          <div class="char-maker-content">
            <!-- BASICS TAB -->
            <div id="maker-basics" class="char-maker-tab-content active">
              <div class="maker-section">
                <label>Character Name *</label>
                <input type="text" id="makerCharName" placeholder="Enter name" required>
              </div>
              <div class="maker-section">
                <label>Player Name</label>
                <input type="text" id="makerPlayerName" placeholder="Your name (optional)">
              </div>
              <div class="maker-section">
                <label>Metatype</label>
                <select id="makerMetatype">
                  <option value="human">Human</option>
                  <option value="elf">Elf</option>
                  <option value="dwarf">Dwarf</option>
                  <option value="orc">Orc</option>
                  <option value="troll">Troll</option>
                </select>
              </div>
              <div class="maker-section">
                <label>Biography</label>
                <textarea id="makerBiography" placeholder="Character background..." rows="4"></textarea>
              </div>
              <div class="maker-section">
                <label>Starting Balance (¥)</label>
                <input type="number" id="makerBalance" value="50000" min="0">
              </div>
            </div>

            <!-- ATTRIBUTES TAB -->
            <div id="maker-attributes" class="char-maker-tab-content">
              <div class="maker-attrs-grid">
                ${['Body', 'Quickness', 'Strength', 'Charisma', 'Intelligence', 'Willpower'].map((attr, idx) => {
                  const key = attr.toLowerCase();
                  return `
                    <div class="maker-attr-block">
                      <label>${attr}</label>
                      <div class="maker-attr-input">
                        <input type="number" id="maker${attr}" min="1" max="10" value="3">
                        <span class="maker-attr-value" id="maker${attr}Display">3</span>
                      </div>
                      <input type="range" id="maker${attr}Range" min="1" max="10" value="3"
                        oninput="document.getElementById('maker${attr}').value = this.value; document.getElementById('maker${attr}Display').textContent = this.value;">
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- SKILLS TAB -->
            <div id="maker-skills" class="char-maker-tab-content">
              <div class="maker-section">
                <button onclick="PlayerUI.addSkillRow()" style="padding: 8px 16px; margin-bottom: 12px;">+ Add Skill</button>
              </div>
              <div id="skillsList" class="skills-list"></div>
            </div>

            <!-- EQUIPMENT TAB -->
            <div id="maker-equipment" class="char-maker-tab-content">
              <div class="maker-section">
                <button onclick="PlayerUI.addEquipmentRow('weapons')" style="padding: 8px 16px; margin-bottom: 12px;">+ Add Weapon</button>
              </div>
              <div id="weaponsList" class="equipment-list"></div>

              <div class="maker-section" style="margin-top: 20px;">
                <button onclick="PlayerUI.addEquipmentRow('gear')" style="padding: 8px 16px; margin-bottom: 12px;">+ Add Gear</button>
              </div>
              <div id="gearList" class="equipment-list"></div>

              <div class="maker-section" style="margin-top: 20px;">
                <button onclick="PlayerUI.addEquipmentRow('armor')" style="padding: 8px 16px; margin-bottom: 12px;">+ Add Armor</button>
              </div>
              <div id="armorList" class="equipment-list"></div>
            </div>

            <!-- MAGIC TAB -->
            <div id="maker-magic" class="char-maker-tab-content">
              <div class="maker-section">
                <label>
                  <input type="checkbox" id="makerAwakened" onchange="document.getElementById('magicSection').style.display = this.checked ? 'block' : 'none';"> Awakened Mage
                </label>
              </div>
              <div id="magicSection" style="display: none;">
                <div class="maker-section">
                  <label>Tradition</label>
                  <select id="makerTradition">
                    <option value="">None</option>
                    <option value="shamanism">Shamanism</option>
                    <option value="hermetic">Hermetic</option>
                    <option value="voodoo">Voodoo</option>
                  </select>
                </div>
                <div class="maker-section">
                  <label>Magic Rating (0-6)</label>
                  <input type="number" id="makerMagicRating" min="0" max="6" value="1">
                </div>
              </div>

              <div class="maker-section">
                <label>
                  <input type="checkbox" id="makerAdept" onchange="document.getElementById('adeptSection').style.display = this.checked ? 'block' : 'none';"> Adept
                </label>
              </div>
              <div id="adeptSection" style="display: none;">
                <div class="maker-section">
                  <label>Power Points (0-10)</label>
                  <input type="number" id="makerPowerPoints" min="0" max="10" value="0">
                </div>
              </div>
            </div>

            <!-- REVIEW TAB -->
            <div id="maker-review" class="char-maker-tab-content">
              <div id="reviewContent" style="padding: 12px; max-height: 400px; overflow-y: auto;">
                <p style="color: var(--text-muted);">Click "Save & Download" to review and export character...</p>
              </div>
            </div>
          </div>

          <div class="char-maker-footer">
            <button class="char-maker-btn-cancel" onclick="PlayerUI.closeCharacterMaker()">Cancel</button>
            <button class="char-maker-btn-save" onclick="PlayerUI.finalizeCharacter()">Save & Download JSON</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', charMakerHTML);
    this.initCharacterMaker();
    console.log('✓ Full character maker opened');
  },

  // Initialize character maker
  initCharacterMaker() {
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = '<div style="color: var(--text-muted); padding: 12px;">No skills added yet</div>';
  },

  // Add skill row
  addSkillRow() {
    const skillsList = document.getElementById('skillsList');
    if (skillsList.innerHTML.includes('No skills added yet')) {
      skillsList.innerHTML = '';
    }

    const skillId = 'skill_' + Date.now();
    const html = `
      <div class="skill-row" id="${skillId}">
        <input type="text" placeholder="Skill name" class="skill-name">
        <input type="number" placeholder="Rating" min="0" max="6" value="1" class="skill-rating">
        <input type="text" placeholder="Concentration" class="skill-concentration">
        <button onclick="document.getElementById('${skillId}').remove()">✕</button>
      </div>
    `;
    skillsList.insertAdjacentHTML('beforeend', html);
  },

  // Add equipment row
  addEquipmentRow(type) {
    const listId = type + 'List';
    let list = document.getElementById(listId);
    if (!list) {
      const container = document.querySelector(`#maker-equipment`);
      list = document.createElement('div');
      list.id = listId;
      list.className = 'equipment-list';
      container.appendChild(list);
    }

    if (list.innerHTML.includes('No items') || list.innerHTML === '') {
      list.innerHTML = '';
    }

    const itemId = type + '_' + Date.now();
    const html = `
      <div class="equipment-row" id="${itemId}">
        <input type="text" placeholder="Item name" class="equip-name">
        <input type="number" placeholder="Cost" value="0" class="equip-cost">
        <input type="text" placeholder="Notes" class="equip-notes">
        <button onclick="document.getElementById('${itemId}').remove()">✕</button>
      </div>
    `;
    list.insertAdjacentHTML('beforeend', html);
  },

  // Switch maker tabs
  switchMakerTab(tabName) {
    document.querySelectorAll('.char-maker-tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.char-maker-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    document.getElementById('maker-' + tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'review') {
      this.updateReview();
    }
  },

  // Update review
  updateReview() {
    const charName = document.getElementById('makerCharName').value || '[Unnamed]';
    const metatype = document.getElementById('makerMetatype').value;
    const balance = document.getElementById('makerBalance').value;

    let reviewHTML = `
      <div style="color: var(--primary-neon); margin-bottom: 12px;">
        <strong>${charName}</strong> (${metatype}) • ¥${parseInt(balance).toLocaleString()}
      </div>
      <div style="font-size: 10px; color: var(--text-bright); line-height: 1.6;">
    `;

    // Attributes
    reviewHTML += '<div style="margin-bottom: 8px;"><strong>Attributes:</strong> ';
    ['Body', 'Quickness', 'Strength', 'Charisma', 'Intelligence', 'Willpower'].forEach(attr => {
      const val = document.getElementById('maker' + attr).value;
      reviewHTML += `${attr.substring(0,3)} ${val} • `;
    });
    reviewHTML += '</div>';

    // Skills
    const skillRows = document.querySelectorAll('.skill-row');
    if (skillRows.length > 0) {
      reviewHTML += '<div style="margin-bottom: 8px;"><strong>Skills:</strong><br>';
      skillRows.forEach(row => {
        const name = row.querySelector('.skill-name').value;
        const rating = row.querySelector('.skill-rating').value;
        if (name) reviewHTML += `  ${name} (${rating})<br>`;
      });
      reviewHTML += '</div>';
    }

    document.getElementById('reviewContent').innerHTML = reviewHTML + '</div>';
  },

  // Finalize and download character
  finalizeCharacter() {
    const charName = document.getElementById('makerCharName').value.trim();
    if (!charName) {
      alert('⚠️ Please enter a character name');
      return;
    }

    // Create character object
    const character = CharacterSchema.createNewCharacter(charName, document.getElementById('makerMetatype').value);

    // Set basic info
    character.details.player = document.getElementById('makerPlayerName').value || '';
    character.details.biography = document.getElementById('makerBiography').value || '';
    character.balance = parseInt(document.getElementById('makerBalance').value) || 50000;

    // Set attributes
    ['Body', 'Quickness', 'Strength', 'Charisma', 'Intelligence', 'Willpower'].forEach(attr => {
      const key = attr.toLowerCase();
      const val = parseInt(document.getElementById('maker' + attr).value) || 3;
      character.attributes[key].base = val;
      character.attributes[key].modified = val;
    });

    // Add skills
    document.querySelectorAll('.skill-row').forEach(row => {
      const name = row.querySelector('.skill-name').value;
      const rating = parseInt(row.querySelector('.skill-rating').value) || 0;
      const conc = row.querySelector('.skill-concentration').value || '';

      if (name) {
        character.skills.push({
          id: 'skill_' + Date.now() + '_' + Math.random(),
          baseName: name,
          concentration: conc,
          specialization: '',
          ratings: { base: rating, concentration: 0, specialization: 0 }
        });
      }
    });

    // Add weapons
    document.querySelectorAll('#weaponsList .equipment-row').forEach(row => {
      const name = row.querySelector('.equip-name').value;
      if (name) {
        character.equipment.weapons.push({
          id: 'weapon_' + Date.now() + '_' + Math.random(),
          name: name,
          cost: parseInt(row.querySelector('.equip-cost').value) || 0,
          notes: row.querySelector('.equip-notes').value || ''
        });
      }
    });

    // Add gear
    document.querySelectorAll('#gearList .equipment-row').forEach(row => {
      const name = row.querySelector('.equip-name').value;
      if (name) {
        character.equipment.gear.push({
          id: 'gear_' + Date.now() + '_' + Math.random(),
          name: name,
          cost: parseInt(row.querySelector('.equip-cost').value) || 0,
          notes: row.querySelector('.equip-notes').value || ''
        });
      }
    });

    // Add armor
    document.querySelectorAll('#armorList .equipment-row').forEach(row => {
      const name = row.querySelector('.equip-name').value;
      if (name) {
        character.equipment.armor.push({
          id: 'armor_' + Date.now() + '_' + Math.random(),
          name: name,
          cost: parseInt(row.querySelector('.equip-cost').value) || 0,
          notes: row.querySelector('.equip-notes').value || ''
        });
      }
    });

    // Handle magic
    if (document.getElementById('makerAwakened').checked) {
      character.magic.awakened = true;
      character.magic.tradition = document.getElementById('makerTradition').value || null;
      character.attributes.magic.base = parseInt(document.getElementById('makerMagicRating').value) || 1;
      character.attributes.magic.current = character.attributes.magic.base;
    }

    // Handle adept
    if (document.getElementById('makerAdept').checked) {
      character.adept.isAdept = true;
      character.adept.powerPoints = parseInt(document.getElementById('makerPowerPoints').value) || 0;
    }

    // Save to localStorage
    const result = CharacterStorage.saveCharacter(character);

    if (result.success) {
      // Download JSON
      CharacterStorage.downloadCharacterAsJSON(character);

      this.closeCharacterMaker();
      this.renderPlayerList();

      alert(`✅ Character "${charName}" created!\n✓ Saved to localStorage\n✓ JSON file downloaded`);
      console.log(`✓ Character "${charName}" finalized and exported`);
    } else {
      alert(`❌ Failed to save character: ${result.error}`);
    }
  },

  // Close character maker
  closeCharacterMaker() {
    const modal = document.getElementById('charMakerOverlay');
    if (modal) {
      modal.remove();
    }
  },

  // Show character creation modal (LEGACY - kept for compatibility)
  showPlayerRegistrationModal() {
    // Now calls the full character maker instead
    this.showFullCharacterMaker();
    return;

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
