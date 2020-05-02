// -- Directions --
// 1.) farm_mode set to true will make the character farm a specific monster
//   - If a monster is not specified in targetedMonster it will not work
// 2.) Status checks are performed before any other code
//   - If potions need to be bought or used
//   - If the player needs to respawn
// 3.) Targeted monster is attacked after respawning or buying potions
// 4.) Character accepts party requests from trusted players
//   - They check every 10 minutes
// 5.) This character will move decent distances when attacking enemies to dodge
//
// -- KNOWN BUGS --
// 1.) Characters sometimes use the smart_move command excessively
// 2.) Characters will freak out and spam smart_move and other commands if they are not in the mainland

var farm_mode = true;
var targetedMonster = "spider";
var STATE;
const ITEMARRAY = ["hpot0", "hpot1", "mpot0", "mpot1"];
const SELLARRAY = ["wgloves", "wcap", "wbreeches", "wshoes", "quiver"];
const SKILLARRAY = ["curse", "partyheal"];
const PARTYARRAY = ["Magra", "Dexla", "Noirme", "Draxious", "Sacerdos"];
const COMBINEARRAY = ["hpbelt", "ringsj", "hpamulet", "wbook0", "vitring"];
const EGGARRAY = ["egg0", "egg1", "egg2", "egg3", "egg4", "egg5", "egg6", "egg7", "egg8"];
const LOWHP = character.max_hp / 1.2;
const LOWMP = character.max_mp / 1.2;

// Combines items that are otherwise useless; NOTE: INCREDIBLY JANKETY
function combineItems(item1, item2, item3, item4) {
	let newUpgradeX = parent.G.maps.main.npcs[0].position[0];
	let newUpgradeY = parent.G.maps.main.npcs[0].position[1];
	
	if(!is_moving(character)) {
		smart_move("newupgrade");
	}
	if(quantity("cscroll0") == 0) { // Ensure character has 50 scrolls
		if((character.x >= newUpgradeX-30 && character.x <= newUpgradeX+30)
		&& (character.y >= newUpgradeY-30 && character.y <= newUpgradeY+30)) {
			buy("cscroll0", 50);
			return;
		}
		if(quantity("cscroll0") == 0) {
			STATE = "MOVING";
			return;
		}
	}
	compound(item1, item2, item3, item4);
	return "Items combined!";
}

// Sells useless items specified in the SELLARRAY above
function sellUselessItems() {
	let basicsX = parent.G.maps.main.npcs[6].position[0];
	let basicsY = parent.G.maps.main.npcs[6].position[1];
	
	for(let i = 0; i < SELLARRAY.length; i++) {
		if(quantity(SELLARRAY[i]) > 0) {
			if(!is_moving(character)) {
				smart_move("basics");
			}
			if((character.x >= basicsX-30 && character.x <= basicsX+30)
			&& (character.y >= basicsY-30 && character.y <= basicsY+30)) {
				sell(locate_item(SELLARRAY[i]), quantity(SELLARRAY[i]));
			}
			if(quantity(ITEMARRAY[i]) == 0) {
				STATE = "MOVING";
				return "Useless items sold!";
			} else return "Useless items not sold!";
		}
	}
}

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
				buy(ITEMARRAY[i], 1000);
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
	
	for(let i = 0; i < ITEMARRAY.length; i++) {
		if(quantity(ITEMARRAY[i]) == 0) {
			STATE = "MOVING";
			if(getPotions() == "Potions found!") return true;
			else return false;
		}
	}
	
    let itemsCombined = true;
	for(items of COMBINEARRAY) {
		if(quantity(items) >= 3) {
			let item1 = 42;
			let item2 = 42;
			let item3 = 42;
			let item4 = 42;
			for(let i = 0; i < 42; i++) {
				if(parent.character.items[i] !== null && parent.character.items[i].name == items && parent.character.items[i].level == 0 && item1 == 42) {
					item1 = i;
					continue;
				}
				if(parent.character.items[i] !== null && parent.character.items[i].name == items && parent.character.items[i].level == 0 && item2 == 42) {
					item2 = i;
					continue;
				}
				if(parent.character.items[i] !== null && parent.character.items[i].name == items && parent.character.items[i].level == 0 && item3 == 42) {
					item3 = i;
					continue;
				}
				if(parent.character.items[i] !== null && parent.character.items[i].name == "cscroll0" && item4 == 42) {
					item4 = i;
				}
			}
			if(item1 != 42 && item2 != 42 && item3 != 42 && item4 != 42) {
				STATE = "MOVING";
				if(combineItems(item1, item2, item3, item4) == "Items combined!") itemsCombined = true;
				else itemsCombined = false;
			}
			item1 = 42;
			item2 = 42;
			item3 = 42;
			item4 = 42;
			for(let i = 0; i < 42; i++) {
				if(parent.character.items[i] !== null && parent.character.items[i].name == items && parent.character.items[i].level == 1 && item1 == 42) {
					item1 = i;
					continue;
				}
				if(parent.character.items[i] !== null && parent.character.items[i].name == items && parent.character.items[i].level == 1 && item2 == 42) {
					item2 = i;
					continue;
				}
				if(parent.character.items[i] !== null && parent.character.items[i].name == items && parent.character.items[i].level == 1 && item3 == 42) {
					item3 = i;
					continue;
				}
				if(parent.character.items[i] !== null && parent.character.items[i].name == "cscroll0" && item4 == 42) {
					item4 = i;
				}
			}
			if(item1 != 42 && item2 != 42 && item3 != 42 && item4 != 42) {
				STATE = "MOVING";
				if(combineItems(item1, item2, item3, item4) == "Items combined!") itemsCombined = true;
				else itemsCombined = false;
			}
			return itemsCombined;
		}
	}
	for(let i = 0; i < SELLARRAY.length; i++) {
		if(quantity(SELLARRAY[i]) > 0) {
			STATE = "MOVING";
			if(sellUselessItems() == "Useless items sold!") return true;
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
	let target = get_targeted_monster(); // Get currently targeted monster
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
		move(character.x+(target.x-character.x)/2, character.y+(target.y-character.y)/2); // Walk half the distance
	}
	
	// Move randomly in different directions (unique for different characters)
	let randomDistance = Math.floor((Math.random() * 4) + 1);
	if(is_in_range(target)) {
		if(randomDistance == 4) {
		   move(character.x-30, character.y-30); // Move random distance away from target
		} else if(randomDistance == 3) {
			move(character.x+30, character.y+30);
		} else if(randomDistance == 2) {
			move(character.x-30, character.y+30);
		} else {
			move(character.x+30, character.y-30);
		}
    }
    
    // Use skills
    for (skill of SKILLARRAY) {
        let random = Math.floor((Math.random() * 5) + 1); // Value between 1 and 5
        if(is_in_range(target)) {
            if(random == 1) { // 20% chance for skill to activate
                parent.use_skill(skill, target);
            }
        }
    }
}

// Go to the desired monster farm
function goToMonsterFarm() {
	if(!is_moving(character)) {
		smart_move(targetedMonster);
	}
	let target = get_targeted_monster(); // Get currently targeted monster // Get currently targeted monster
	if(!target) { // If no target was found
		target = findTargetedMonster();
		if(target) change_target(target); // Change target to newly found one
	}	
	if(target && !is_in_range(target)) {
		move(character.x+(target.x-character.x)/1.2, character.y+(target.y-character.y)/1.2); // Walk most of the distance
	}
	if(target && is_in_range(target)) {
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
    game_log("Current Level: " + character.level); // Log level
	game_log("Current XP: " + character.xp); // Log XP
    for(let i = 0; i < PARTYARRAY.length; i++) {
		on_party_invite(PARTYARRAY[i]); // Accept party invites from specified users
	}

	// This next part moves the character to the craftsman and (hopefully) automatically crafts a basket of eggs
	let hasEnoughEggs = true;
	for(let i = 0; i < EGGARRAY.length; i++) {
		if(quantity(EGGARRAY[i]) == 0) {
			hasEnoughEggs = false;
		}
	}
	if(hasEnoughEggs) {
		STATE = "TIMEOUT";
		smart_move("craftsman");
		setTimeout(() => {
			auto_craft("basketofeggs");
			STATE = "MOVING";
		}, 60000 * 2); // waits 2 minutes 
	}
}, 60000 * 10); // Occurs every 10 minutes

// 'main' method
setInterval(() => {
	if(STATE == "TIMEOUT") return;
	if(STATE != "FARMING") {
		STATE = "MOVING"; // Default state for character
	}
	
	var results = statusChecks(); // Must return true to proceed
	
	if(!farm_mode || is_moving(character) || !results || character.rip) return;
	loot();
	
	if(STATE == "MOVING") {
		goToMonsterFarm(); // Go to farming location
	}
	else if(STATE == "FARMING") {
		farmMonster(); // Attack specific monster in the area
	}
}, 1000/2); // Loops every half of a second.