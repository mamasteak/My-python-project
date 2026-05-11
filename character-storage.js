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
