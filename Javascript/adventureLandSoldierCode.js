// -- Directions --
// 1.) farm_mode set to true will make the character farm a specific monster
//   - If a monster is not specified in targetedMonster it will not work
// 2.) Status checks are performed before any other code
//   - If potions need to be bought or used
//   - If the player needs to respawn
// 3.) Targeted monster is attacked after respawning or buying potions
// 4.) Character accepts party requests from trusted players
//   - They check every 10 minutes
// 5.) This character will move slightly when attacking enemies to dodge
//
// -- KNOWN BUGS --
// 1.) Characters sometimes use the smart_move command excessively
// 2.) If the code is activated when standing near the targetedMonster...
//   - The player will usually excessively spam smart_move
// 3.) The player may also engage the wrong enemies
//   - Slightly mitigated by specifying exp cutoffs

var farm_mode=true;
var targetedMonster="tortoise";
var STATE;
const ITEMARRAY = ["hpot0", "hpot1", "mpot0", "mpot1"];
const PARTYARRAY = ["Magra", "Dexla", "Noirme"];
const LOWHP = character.max_hp / 1.75;
const LOWMP = character.max_mp / 1.75;

// Checks if potions are empty and goes to purchase them automatically
function getPotions() {
	for(let i = 0; i < ITEMARRAY.length; i++) {
		if(quantity(ITEMARRAY[i]) == 0) {
			if(!is_moving(character)) {
				smart_move("fancypots");
			}
			if(quantity(ITEMARRAY[i]) != 100) {
				buy(ITEMARRAY[i], 100);
			}
			if(quantity(ITEMARRAY[i]) > 0) {
				STATE = "MOVING";
				return "Potions found!";
			} else return "Potions not found!";
		}
	}
}

// Checks if the character is dead and respawns them with a target in mind
function resetCharacter() {
	if(character.rip) {
		STATE = "RESPAWNING";
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
	
	for(let i = 0; i < ITEMARRAY.length; i++) {
		if(quantity(ITEMARRAY[i]) == 0) {
			STATE = "MOVING";
			if(getPotions() == "Potions found!") return true;
			else return false;
		}
	}
	return true;
}

// Farms target monsters after location has been reached
function farmMonster() {
	var target=get_targeted_monster(); // Get currently targeted monster
	if(!target) { // If no target was found
		target=get_nearest_monster({min_xp:700, max_att:720});
		if(target) change_target(target); // Change target to newly found one
		else {
			set_message("No Monsters");
			return;
		}
	}
	if(!is_in_range(target)) {
		move(character.x+(target.x-character.x)/2, character.y+(target.y-character.y)/2); // Walk half the distance
	}	
	else if(can_attack(target)) {
		set_message("Attacking");
		attack(target);
	}
	
	// Move randomly in different directions (unique for different characters)
	let randomDistance = Math.floor((Math.random() * 5) + 1);
	if(is_in_range(target)) {
		if(randomDistance > 2) {
		   move(character.x-randomDistance*2, character.y-randomDistance*2); // Move random distance away from target
		} else if(randomDistance == 2) {
			move(character.x-4, character.y+4);
		} else {
			move(character.x+6, character.y-6);
		}
	}	
}

// Go to the desired monster farm
function goToMonsterFarm() {
	if(!is_moving(character)) {
		smart_move(targetedMonster);
	}
	var target=get_targeted_monster(); // Get currently targeted monster
	if(!target) { // If no target was found
		target=get_nearest_monster({min_xp:700, max_att:720});
		if(target) change_target(target); // Change target to newly found one
	}
	if(!is_in_range(target)) {
		move(character.x-(target.x-character.x)/2, character.y-(target.y-character.y)/2); // Walk half the distance
	} else {
		STATE = "FARMING";
	}
}

// Accept party invites from trusted players (specified in the array)
function on_party_invite(name) {
	for (name of PARTYARRAY){
		if(PARTYARRAY.includes(name)) {
			accept_party_invite(name);	
		}
	}
}

// Methods that need to happen after larger time intervals
setInterval(() => {
	for(let i = 0; i < PARTYARRAY.length; i++) {
		on_party_invite(PARTYARRAY[i]); // Accept party invites from specified users
	}
}, 60000 * 10); // Occurs every 10 minutes

// 'main' method
setInterval(() => {
	if(STATE == "RESPAWNING") return;
	if(STATE != "FARMING") {
		STATE = "MOVING"; // Default state for character
	}
	
	var results = statusChecks(); // Must return true to proceed
	
	if(!farm_mode || is_moving(character) || !results) return;
	loot();
	
	if(STATE == "MOVING") {
		goToMonsterFarm(); // Go to farming location
	}
	else if(STATE == "FARMING") {
		farmMonster(); // Attack specific monster in the area
		return;
	}
}, 1000); // Loops every second.
