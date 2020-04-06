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
// 2.) When going for potions, the character may spam the 'buy' command

var farm_mode=true;
var targetedMonster="tortoise";
var STATE;
const ITEMARRAY = ["hpot0", "hpot1", "mpot0", "mpot1"];
const PARTYARRAY = ["Magra", "Dexla", "Noirme"];
const LOWHP = character.max_hp / 1.75;
const LOWMP = character.max_mp / 1.75;

// Checks if potions are empty and goes to purchase them automatically
function getPotions() {
	let fancypotsX = parent.G.maps.main.npcs[5].position[0];
	let fancypotsY = parent.G.maps.main.npcs[5].position[1];
	
	for(let i = 0; i < ITEMARRAY.length; i++) {
		if(quantity(ITEMARRAY[i]) == 0) {
			if(!is_moving(character)) {
				smart_move("fancypots");
			}
			if((character.x >= fancypotsX-30 && character.x <= fancypotsX+30)
			&& (character.y >= fancypotsY-30 && character.y <= fancypotsY+30)) {
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

// Finds the desired monster
function findTargetedMonster() {
	var min_d=999999,target=null;
	for(id in parent.entities) {
		var current=parent.entities[id];
		if(current.type != "monster" || !current.visible || current.dead) continue;
		if(current.mtype && current.mtype != targetedMonster) continue;
		var c_dist=parent.distance(character,current);
		if(c_dist<min_d) min_d=c_dist,target=current;
	}
	return target;
}

// Farms target monsters after location has been reached
function farmMonster() {
	var target = get_targeted_monster(); // Get currently targeted monster
	if(!target) { // If no target was found
		target = findTargetedMonster();
		if(target) change_target(target); // Change target to newly found one
		else {
			set_message("No Monsters");
			STATE = "MOVING";
			return;
		}
	}
	else if(is_in_range(target) && can_attack(target)) {
		set_message("Attacking");
		attack(target);
	}
	else if(!is_in_range(target)) {
		move(target.x, target.y);
	}
	
	// Move randomly in different directions (unique for different characters)
	let randomDistance = Math.floor((Math.random() * 4) + 1);
	if(is_in_range(target)) {
		if(randomDistance == 4) {
		   move(character.x-15, character.y-15); // Move random distance away from target
		} else if(randomDistance == 3) {
			move(character.x+15, character.y+15);
		} else if(randomDistance == 2) {
			move(character.x-15, character.y+15);
		} else {
			move(character.x+15, character.y-15);
		}
	}	
}

// Go to the desired monster farm
function goToMonsterFarm() {
	if(!is_moving(character)) {
		smart_move(targetedMonster);
	}
	var target = get_targeted_monster(); // Get currently targeted monster
	if(!target) { // If no target was found
		target = findTargetedMonster();
		if(target) change_target(target); // Change target to newly found one
	}
	if(target && !is_in_range(target)) {
		move(target.x, target.y); // Walk to the enemy
		STATE = "FARMING";
	} else if(target && is_in_range(target)) {
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
	if(character.rip) return;
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
}, 1000/2); // Loops every half of a second.