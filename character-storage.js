// Character Storage - Persistent storage for player characters
// Handles localStorage + JSON file import/export for git workflow

const STORAGE_PREFIX = 'shadowrun_character_';
const CHARACTERS_LIST_KEY = 'shadowrun_characters_list';

const CharacterStorage = {
  // Save character to localStorage
  saveCharacter(character) {
    const validation = CharacterSchema.validateCharacter(character);

    if (!validation.valid) {
      console.error('❌ Character validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    const key = STORAGE_PREFIX + character.id;
    character.lastModified = new Date().toISOString();

    try {
      localStorage.setItem(key, JSON.stringify(character));
      this.updateCharactersList(character.id, character.name);
      console.log(`✓ Character "${character.name}" saved to localStorage`);
      return { success: true, character };
    } catch (error) {
      console.error('❌ Failed to save character:', error);
      return { success: false, error: error.message };
    }
  },

  // Load character from localStorage
  loadCharacter(characterId) {
    const key = STORAGE_PREFIX + characterId;

    try {
      const data = localStorage.getItem(key);
      if (!data) {
        console.warn(`⚠️ Character ${characterId} not found in localStorage`);
        return null;
      }

      const character = JSON.parse(data);
      const validation = CharacterSchema.validateCharacter(character);

      if (!validation.valid) {
        console.warn(`⚠️ Character ${characterId} failed validation, attempting repair...`);
        const repaired = CharacterSchema.repairCharacter(character);
        this.saveCharacter(repaired);
        return repaired;
      }

      return character;
    } catch (error) {
      console.error(`❌ Failed to load character ${characterId}:`, error);
      return null;
    }
  },

  // Delete character from localStorage
  deleteCharacter(characterId) {
    const key = STORAGE_PREFIX + characterId;

    try {
      localStorage.removeItem(key);
      this.removeFromCharactersList(characterId);
      console.log(`✓ Character ${characterId} deleted from localStorage`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete character:', error);
      return { success: false, error: error.message };
    }
  },

  // Get list of all saved characters
  getAllCharacters() {
    try {
      const listData = localStorage.getItem(CHARACTERS_LIST_KEY);
      const charactersList = listData ? JSON.parse(listData) : {};

      const characters = [];
      Object.entries(charactersList).forEach(([characterId, characterName]) => {
        const character = this.loadCharacter(characterId);
        if (character) {
          characters.push(character);
        }
      });

      return characters;
    } catch (error) {
      console.error('❌ Failed to get all characters:', error);
      return [];
    }
  },

  // Get character by name
  getCharacterByName(name) {
    const characters = this.getAllCharacters();
    return characters.find(c => c.name === name) || null;
  },

  // Add skill to character
  addSkill(characterId, baseName, concentration = '', specialization = '') {
    const character = this.loadCharacter(characterId);
    if (!character) return null;

    const skill = CharacterSchema.createNewSkill(baseName, concentration, specialization);
    character.skills.push(skill);

    this.saveCharacter(character);
    console.log(`✓ Added skill "${baseName}" to character "${character.name}"`);
    return skill;
  },

  // Add equipment to character
  addEquipment(characterId, equipmentType, equipmentData) {
    const character = this.loadCharacter(characterId);
    if (!character) return null;

    if (!character.equipment[equipmentType] || !Array.isArray(character.equipment[equipmentType])) {
      console.warn(`⚠️ Invalid equipment type: ${equipmentType}`);
      return null;
    }

    character.equipment[equipmentType].push(equipmentData);
    this.saveCharacter(character);
    console.log(`✓ Added ${equipmentType} to character "${character.name}"`);
    return equipmentData;
  },

  // Add cyberware and track essence loss
  installCyberware(characterId, cyberwareName, essence = 0, modifiers = {}) {
    const character = this.loadCharacter(characterId);
    if (!character) return null;

    const cyber = CharacterSchema.createNewCyberware(cyberwareName, essence);
    cyber.installed = true;
    cyber.modifiers = modifiers;

    character.equipment.cyberware.push(cyber);
    character.augmentations.totalEssenceLoss += essence;
    character.attributes.essence.current = Math.max(0.01, character.attributes.essence.base - character.augmentations.totalEssenceLoss);

    this.saveCharacter(character);
    console.log(`✓ Installed cyberware "${cyberwareName}" (Essence: -${essence})`);
    return cyber;
  },

  // Add bioware and track bio index
  installBioware(characterId, biowareName, bioIndex = 0, modifiers = {}) {
    const character = this.loadCharacter(characterId);
    if (!character) return null;

    const bio = CharacterSchema.createNewBioware(biowareName, bioIndex);
    bio.installed = true;
    bio.modifiers = modifiers;

    character.equipment.bioware.push(bio);
    character.augmentations.totalBioIndex += bioIndex;

    this.saveCharacter(character);
    console.log(`✓ Installed bioware "${biowareName}" (Bio Index: ${bioIndex})`);
    return bio;
  },

  // Update character balance (for shop purchases)
  updateBalance(characterId, amount) {
    const character = this.loadCharacter(characterId);
    if (!character) return null;

    const oldBalance = character.balance;
    character.balance = Math.max(0, character.balance + amount);
    character.lastModified = new Date().toISOString();

    this.saveCharacter(character);
    console.log(`✓ Updated balance: ¥${oldBalance.toLocaleString()} → ¥${character.balance.toLocaleString()}`);
    return character;
  },

  // Spend karma
  spendKarma(characterId, amount) {
    const character = this.loadCharacter(characterId);
    if (!character) return null;

    if (character.karma.current < amount) {
      console.warn(`⚠️ Insufficient karma: need ${amount}, have ${character.karma.current}`);
      return null;
    }

    character.karma.current -= amount;
    character.lastModified = new Date().toISOString();

    this.saveCharacter(character);
    console.log(`✓ Spent ${amount} karma`);
    return character;
  },

  // Update or create character
  updateCharactersList(characterId, characterName) {
    try {
      const listData = localStorage.getItem(CHARACTERS_LIST_KEY);
      const charactersList = listData ? JSON.parse(listData) : {};
      charactersList[characterId] = characterName;
      localStorage.setItem(CHARACTERS_LIST_KEY, JSON.stringify(charactersList));
    } catch (error) {
      console.error('❌ Failed to update characters list:', error);
    }
  },

  // Remove character from list
  removeFromCharactersList(characterId) {
    try {
      const listData = localStorage.getItem(CHARACTERS_LIST_KEY);
      const charactersList = listData ? JSON.parse(listData) : {};
      delete charactersList[characterId];
      localStorage.setItem(CHARACTERS_LIST_KEY, JSON.stringify(charactersList));
    } catch (error) {
      console.error('❌ Failed to update characters list:', error);
    }
  },

  // Export character as JSON string
  exportCharacterAsJSON(character) {
    try {
      return JSON.stringify(character, null, 2);
    } catch (error) {
      console.error('❌ Failed to export character:', error);
      return null;
    }
  },

  // Export character as downloadable file
  downloadCharacterAsJSON(character) {
    const jsonString = this.exportCharacterAsJSON(character);
    if (!jsonString) return;

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${character.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✓ Character "${character.name}" exported as ${character.name}.json`);
  },

  // Import character from JSON string
  importCharacterFromJSON(jsonString) {
    try {
      const character = JSON.parse(jsonString);
      const validation = CharacterSchema.validateCharacter(character);

      if (!validation.valid) {
        console.warn('⚠️ Imported character failed validation, attempting repair...');
        const repaired = CharacterSchema.repairCharacter(character);
        return { success: true, character: repaired, repaired: true };
      }

      return { success: true, character, repaired: false };
    } catch (error) {
      console.error('❌ Failed to import character:', error);
      return { success: false, error: error.message };
    }
  },

  // Import character from JSON file (file input)
  async importCharacterFromFile(file) {
    if (!file || file.type !== 'application/json') {
      return { success: false, error: 'File must be a JSON file' };
    }

    try {
      const text = await file.text();
      return this.importCharacterFromJSON(text);
    } catch (error) {
      console.error('❌ Failed to read file:', error);
      return { success: false, error: error.message };
    }
  },

  // Load character from JSON file in /characters/ directory
  async loadCharacterFromFile(filename) {
    try {
      const response = await fetch(`./characters/${filename}`);
      if (!response.ok) {
        console.warn(`⚠️ Character file ${filename} not found (${response.status})`);
        return null;
      }

      const character = await response.json();
      const validation = CharacterSchema.validateCharacter(character);

      if (!validation.valid) {
        console.warn(`⚠️ Character ${filename} failed validation`);
        return null;
      }

      return character;
    } catch (error) {
      console.error(`❌ Failed to load character from file ${filename}:`, error);
      return null;
    }
  },

  // Load all available characters (from localStorage and /characters/ directory)
  async loadAvailableCharacters() {
    const characters = new Map();

    // Load from localStorage
    this.getAllCharacters().forEach(character => {
      characters.set(character.id, character);
    });

    return characters;
  },

  // Auto-save character (called periodically during play)
  autoSaveCharacter(character) {
    return this.saveCharacter(character);
  },

  // Clear all characters from localStorage (use with caution!)
  clearAllCharacters() {
    try {
      const listData = localStorage.getItem(CHARACTERS_LIST_KEY);
      const charactersList = listData ? JSON.parse(listData) : {};

      Object.keys(charactersList).forEach(characterId => {
        const key = STORAGE_PREFIX + characterId;
        localStorage.removeItem(key);
      });

      localStorage.removeItem(CHARACTERS_LIST_KEY);
      console.log('✓ All characters cleared from localStorage');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to clear characters:', error);
      return { success: false, error: error.message };
    }
  }
};

window.CharacterStorage = CharacterStorage;
console.log('✓ Character Storage ready');
