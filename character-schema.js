// Character Schema - Shadowrun 2E Bangkok Operations
// Defines the data structure and validation for player characters

const CharacterSchema = {
  createNewCharacter(name, metatype = 'human') {
    return {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      metatype: metatype,

      attributes: {
        body: { base: 3, modified: 3 },
        quickness: { base: 3, modified: 3 },
        strength: { base: 3, modified: 3 },
        charisma: { base: 3, modified: 3 },
        intelligence: { base: 3, modified: 3 },
        willpower: { base: 3, modified: 3 },
        essence: { base: 6, current: 6 },
        magic: { value: 0 },
        reaction: { base: 3, modified: 3 }
      },

      health: {
        physical: { current: 0, max: 10 },
        stun: { current: 0, max: 10 }
      },

      pools: {
        combat: { current: 5, max: 5 },
        spell: { current: 0, max: 0 },
        hacking: { current: 0, max: 0 },
        karma: { current: 0, total: 0 }
      },

      balance: 50000,
      equipment: {
        weapons: [],
        armor: [],
        gear: [],
        cyberware: [],
        bioware: []
      },

      skills: [],

      magic: {
        awakened: false,
        tradition: null,
        spells: []
      },

      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  },

  validateCharacter(character) {
    const errors = [];

    if (!character.id || typeof character.id !== 'string') {
      errors.push('Character must have a valid id');
    }

    if (!character.name || typeof character.name !== 'string') {
      errors.push('Character must have a valid name');
    }

    if (typeof character.balance !== 'number' || character.balance < 0) {
      errors.push('Balance must be a non-negative number');
    }

    if (!character.attributes || typeof character.attributes !== 'object') {
      errors.push('Character must have attributes object');
    } else {
      const requiredAttrs = ['body', 'quickness', 'strength', 'charisma', 'intelligence', 'willpower', 'essence', 'magic', 'reaction'];
      requiredAttrs.forEach(attr => {
        if (!character.attributes[attr]) {
          errors.push(`Missing attribute: ${attr}`);
        }
      });
    }

    if (!character.health || typeof character.health !== 'object') {
      errors.push('Character must have health object');
    }

    if (!Array.isArray(character.equipment.weapons)) {
      errors.push('Equipment weapons must be an array');
    }

    if (!Array.isArray(character.skills)) {
      errors.push('Skills must be an array');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  repairCharacter(character) {
    const repaired = { ...character };

    if (!repaired.id) {
      repaired.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!repaired.attributes) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.attributes = template.attributes;
    }

    if (!repaired.health) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.health = template.health;
    }

    if (!repaired.pools) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.pools = template.pools;
    }

    if (!repaired.equipment) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.equipment = template.equipment;
    }

    if (!Array.isArray(repaired.skills)) {
      repaired.skills = [];
    }

    if (typeof repaired.balance !== 'number' || repaired.balance < 0) {
      repaired.balance = 50000;
    }

    repaired.lastModified = new Date().toISOString();

    return repaired;
  }
};

window.CharacterSchema = CharacterSchema;
console.log('✓ Character Schema ready');
