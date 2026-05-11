// Character Schema - Shadowrun 2E Bangkok Operations
// Comprehensive character data structure based on SR2E rules

const CharacterSchema = {
  createNewCharacter(name, metatype = 'human') {
    return {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      metatype: metatype,

      // Character Details
      details: {
        player: '',
        gm: '',
        campaign: '',
        biography: ''
      },

      // Core Attributes (SR2E Base 6 points, max 10 before mods)
      attributes: {
        body: { base: 3, modified: 3 },
        quickness: { base: 3, modified: 3 },
        strength: { base: 3, modified: 3 },
        charisma: { base: 3, modified: 3 },
        intelligence: { base: 3, modified: 3 },
        willpower: { base: 3, modified: 3 },
        reaction: { base: 3, modified: 3 },
        essence: { base: 6, current: 6 },
        magic: { base: 0, current: 0 }
      },

      // Health & Condition Monitors
      health: {
        physical: { current: 0, max: 10 },
        stun: { current: 0, max: 10 }
      },

      // Dice Pools (calculated based on attributes and skills)
      pools: {
        combat: { current: 5, max: 5 },
        spell: { current: 0, max: 0 },
        hacking: { current: 0, max: 0 },
        control: { current: 0, max: 0 },
        task: { current: 0, max: 0 },
        astral: { current: 0, max: 0 },
        karma: { current: 0, total: 0 }
      },

      // Initiative
      initiative: {
        base: 6,
        dice: 1
      },

      // Three-Tier Skills (Base → Concentration → Specialization)
      skills: [],

      // Equipment & Inventory
      equipment: {
        weapons: [],
        armor: [],
        gear: [],
        cyberware: [],
        bioware: [],
        spells: [],
        adeptpowers: [],
        programs: []
      },

      // Augmentation Tracking
      augmentations: {
        totalEssenceLoss: 0,
        totalBioIndex: 0,
        cyberwareModifiers: {},
        biowareModifiers: {}
      },

      // Magic System
      magic: {
        awakened: false,
        tradition: null,
        spells: []
      },

      // Adept System
      adept: {
        isAdept: false,
        powerPoints: 0,
        usedPoints: 0,
        powers: []
      },

      // Financial
      balance: 50000,
      karma: {
        current: 0,
        total: 0
      },

      // Metadata
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  },

  createNewSkill(baseName, concentration = '', specialization = '') {
    return {
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      baseName: baseName,
      concentration: concentration,
      specialization: specialization,
      ratings: {
        base: 0,
        concentration: 0,
        specialization: 0
      }
    };
  },

  createNewCyberware(name, essence = 0, rating = 1) {
    return {
      id: `cyber_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      essence: essence,
      rating: rating,
      installed: false,
      modifiers: {},
      cost: 0,
      availability: 'Street'
    };
  },

  createNewBioware(name, bioIndex = 0) {
    return {
      id: `bio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      bioIndex: bioIndex,
      installed: false,
      modifiers: {},
      cost: 0,
      availability: 'Street'
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

    if (!Array.isArray(character.skills)) {
      errors.push('Skills must be an array');
    }

    if (!character.pools || typeof character.pools !== 'object') {
      errors.push('Character must have pools object');
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

    // Repair attributes
    if (!repaired.attributes) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.attributes = template.attributes;
    }

    // Repair health
    if (!repaired.health) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.health = template.health;
    }

    // Repair pools
    if (!repaired.pools) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.pools = template.pools;
    }

    // Repair equipment
    if (!repaired.equipment) {
      const template = this.createNewCharacter(repaired.name || 'Unknown');
      repaired.equipment = template.equipment;
    }

    // Repair skills
    if (!Array.isArray(repaired.skills)) {
      repaired.skills = [];
    }

    // Repair augmentations
    if (!repaired.augmentations) {
      repaired.augmentations = {
        totalEssenceLoss: 0,
        totalBioIndex: 0,
        cyberwareModifiers: {},
        biowareModifiers: {}
      };
    }

    // Repair magic system
    if (!repaired.magic) {
      repaired.magic = {
        awakened: false,
        tradition: null,
        spells: []
      };
    }

    // Repair adept system
    if (!repaired.adept) {
      repaired.adept = {
        isAdept: false,
        powerPoints: 0,
        usedPoints: 0,
        powers: []
      };
    }

    // Repair balance
    if (typeof repaired.balance !== 'number' || repaired.balance < 0) {
      repaired.balance = 50000;
    }

    // Repair karma
    if (!repaired.karma) {
      repaired.karma = { current: 0, total: 0 };
    }

    repaired.lastModified = new Date().toISOString();

    return repaired;
  },

  calculateDerivedAttributes(character) {
    const attrs = character.attributes;
    const augs = character.augmentations;

    // Reaction = (Quickness + Intelligence) / 2
    attrs.reaction.modified = Math.ceil((attrs.quickness.modified + attrs.intelligence.modified) / 2);

    // Combat Pool = (Quickness + Intelligence + Willpower) / 2
    character.pools.combat.max = Math.floor((attrs.quickness.modified + attrs.intelligence.modified + attrs.willpower.modified) / 2);
    if (character.pools.combat.current > character.pools.combat.max) {
      character.pools.combat.current = character.pools.combat.max;
    }

    // Task Pool = Intelligence
    character.pools.task.max = attrs.intelligence.modified;

    // Astral Pool = Willpower + Charisma (if awakened)
    if (character.magic.awakened && attrs.magic.current > 0) {
      character.pools.astral.max = attrs.willpower.modified + attrs.charisma.modified;
    }

    // Initiative = Quickness + Reaction (in phases)
    character.initiative.base = attrs.quickness.modified + attrs.reaction.modified;

    return character;
  }
};

window.CharacterSchema = CharacterSchema;
console.log('✓ Character Schema ready (Phase 2: Comprehensive SR2E Model)');
