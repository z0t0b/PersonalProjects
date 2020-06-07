// -- Directions --
// 1.) Status checks are performed before any other code
//   - If potions need to be bought or used
//   - If the player needs to respawn
// 2.) Character accepts party requests from trusted players
//   - They check every 10 minutes
// 3.) Character uses the mluck skill every half a second to potentially get rare items

var STATE;
const PARTYARRAY = ["Magra", "Dexla", "Noirme", "Draxious", "Sacerdos", "Athelos", "Takamine"];
const LOWHP = character.max_hp / 1.2;
const LOWMP = character.max_mp / 1.2;

// Checks if potions are empty and goes to purchase them automatically
function getPotions() {
	let fancypotsX = parent.G.maps.main.npcs[5].position[0];
	let fancypotsY = parent.G.maps.main.npcs[5].position[1];
	
    if(quantity("mpot0") == 0) {
        if((character.x >= fancypotsX-30 && character.x <= fancypotsX+30)
            && (character.y >= fancypotsY-30 && character.y <= fancypotsY+30)) {
            buy("mpot0", 1000);
        } if(quantity("mpot0") > 0) {
            return "Potions found!";
        }
    }
}

// Checks if the character is dead and respawns them with a target in mind
function resetCharacter() {
	if(character.rip) {
		STATE = "TIMEOUT";
		setTimeout(() => {
			respawn();
			STATE = "MOVING";
		}, 15000);
	}
}

// Checks the status of the character for auto-maintenance
function statusChecks() {
    if((character.hp < LOWHP) || (character.mp < LOWMP)) use_hp_or_mp();
    
    resetCharacter();

    if(quantity("mpot0") == 0) {
        if(getPotions() == "Potions found!") return true;
        else return false;
    }
    return true;
}

// Accept party invites from trusted players (specified in the array)
function on_party_invite(name) {
	if(PARTYARRAY.includes(name)) {
        accept_party_invite(name);	
    }
}

// Finds the nearest character and returns them
function findNearestCharacter() {
    var min_d = 999999, target = null;
    
    for(id in parent.entities) {
		var current = parent.entities[id];
		if(current.type != "character" || !current.visible || current.rip || current.invincible || current.npc) continue;
		var c_dist = parent.distance(character, current);
		if(c_dist < min_d) min_d = c_dist, target = current;
    }
    return target;
}

// Methods that need to happen after larger time intervals
setInterval(() => {
	game_log("Current Level: " + character.level); // Log level
	game_log("Current XP: " + character.xp); // Log XP
	for(let i = 0; i < PARTYARRAY.length; i++) {
		on_party_invite(PARTYARRAY[i]); // Accept party invites from specified users
	}
}, 60000 * 10); // Occurs every 10 minutes

// 'main' method
setInterval(() => {
    if(STATE == "TIMEOUT") return;

    var results = statusChecks();
    var target = findNearestCharacter();
    if(is_moving(character) || !results || !target) return;
    
    parent.use_skill("mluck", target);
}, 1000/2); // Loops every half of a second.