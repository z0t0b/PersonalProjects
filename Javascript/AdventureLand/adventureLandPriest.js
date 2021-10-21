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

/* GLOBAL VARIABLES
 * All the global variables grouped for easy modifications. Variables without a value shouldn't be changed.
 * - STATE: The state the character is in. Switches between TIMEOUT, MOVING and FARMING
 * - farm_mode: Whether or not to farm monsters
 * - targetedMonster: The key of the monster to farm
 * - ITEMARRAY: Array of item keys that should be purchased upon depletion
 * - SELLARRAY: Array of item keys that should be sold
 * - SKILLARRAY: Array of skill keys that should be used
 * - PARTYARRAY: Array of character names that should be sent party requests
 * - COMBINEARRAY: Array of item keys that should be automatically combined (combines up to and including level 2 items)
 * - STORAGEARRAY: Array of item keys that should be stored in the bank (stores when stack is >= 5)
 * - EGGARRAY: Array of item keys (for eggs) that should be combined into a basket (for Easter special)
 * - LOWHP: Value of HP when a potion will be used
 * - LOWMP: Value of MP when a potion will be used
 **/
var STATE;
var farm_mode = true;
var targetedMonster = "arcticbee";
const ITEMARRAY = ["hpot1", "mpot1"];
const SELLARRAY = ["wgloves", "wcap", "wbreeches", "wshoes", "wshield", "quiver", "wattire"];
const SKILLARRAY = ["curse", "partyheal"];
const PARTYARRAY = ["Magra", "Dexla", "Noirme", "Draxious", "Sacerdos"];
const COMBINEARRAY = ["hpbelt", "ringsj", "hpamulet", "wbook0", "vitring", "intring", "dexring", "strring", "strearring", "intearring", "dexearring", "vitearring"];
const STORAGEARRAY = ["smush", "beewings", "ascale", "poison", "seashell", "spidersilk", "bfur", "pleather", "rattail", "gem0", "gslime", "cscale", "crabclaw", "frogt", "vitscroll",
						"essenceoffrost", "pants1", "gloves1", "helmet1", "boots1", "eslippers", "epyjamas", "ecape", "eears", "xmaspants", "sshield", "sstinger", "hbow"];
const EGGARRAY = ["egg0", "egg1", "egg2", "egg3", "egg4", "egg5", "egg6", "egg7", "egg8"];
const LOWHP = character.max_hp / 1.2;
const LOWMP = character.max_mp / 1.2;

/* COMBINE ITEMS FUNCTION
 * Automatically combines items with levels <= 2
 **/
function combineItems() {
	let newUpgradeX = parent.G.maps.main.npcs[0].position[0];
	let newUpgradeY = parent.G.maps.main.npcs[0].position[1];
	
	if(quantity("cscroll0") == 0) { // Ensure character has 50 scrolls
		if(!is_moving(character)) {
            parent.current_map === "main" ? smart_move("newupgrade") : smart_move("main");
        } if((character.x >= newUpgradeX-30 && character.x <= newUpgradeX+30)
			&& (character.y >= newUpgradeY-30 && character.y <= newUpgradeY+30)) {
			buy("cscroll0", 50);
		} if(quantity("cscroll0") == 0) {
			return "Items not combined!";
		}
	}

	for(items of COMBINEARRAY) {
		if(quantity(items) >= 3) {
			for(let level = 0; level < 3; level++) {
				let [item1, item2, item3, item4] = [42, 42, 42, 42];
				for(let i = 0; i < 42; i++) {
					if(parent.character.items[i] !== null && parent.character.items[i].name == items && parent.character.items[i].level == level) {
						if(item1 == 42) {
							item1 = i;
							continue;
						} if(item2 == 42) {
							item2 = i;
							continue;
						} if(item3 == 42) {
							item3 = i;
							continue;
						}
					}
					if(parent.character.items[i] !== null && parent.character.items[i].name == "cscroll0" && item4 == 42) {
						item4 = i;
					}
				}
				if(item1 != 42 && item2 != 42 && item3 != 42 && item4 != 42) {
					STATE = "MOVING";
					if(!is_moving(character)) {
						parent.current_map === "main" ? smart_move("newupgrade") : smart_move("main");
					}
					if((character.x >= newUpgradeX-30 && character.x <= newUpgradeX+30)
						&& (character.y >= newUpgradeY-30 && character.y <= newUpgradeY+30)) {
							compound(item1, item2, item3, item4);
							return "Items combined!";
					} else {
						return "Items not combined!";
					}
				}
			}
		}
	}
	return "Items combined!";
}

/* SELL USELESS ITEMS FUNCTION
 * Uses the item keys in the SELLARRAY variable for automatic selling
 **/
function sellUselessItems() {
	let basicsX = parent.G.maps.main.npcs[6].position[0];
	let basicsY = parent.G.maps.main.npcs[6].position[1];
	
	for(let i = 0; i < SELLARRAY.length; i++) {
		if(quantity(SELLARRAY[i]) > 0) {
			if(!is_moving(character)) {
				parent.current_map === "main" ? smart_move("basics") : smart_move("main");
			} if((character.x >= basicsX-30 && character.x <= basicsX+30)
				&& (character.y >= basicsY-30 && character.y <= basicsY+30)) {
				sell(locate_item(SELLARRAY[i]), quantity(SELLARRAY[i]));
			} if(quantity(ITEMARRAY[i]) == 0) {
				STATE = "MOVING";
				return "Useless items sold!";
			}
		}
	}
}

/* GET POTIONS FUNCTION
 * Uses the item keys in the ITEMARRAY to refill potions upon depletion (buys 500 potions)
 **/
function getPotions() {
	let fancypotsX = parent.G.maps.main.npcs[5].position[0];
	let fancypotsY = parent.G.maps.main.npcs[5].position[1];
	
	for(let i = 0; i < ITEMARRAY.length; i++) {
		if(quantity(ITEMARRAY[i]) == 0) {
			if(!is_moving(character)) {
				parent.current_map === "main" ? smart_move("fancypots") : smart_move("main");
			} if((character.x >= fancypotsX-30 && character.x <= fancypotsX+30)
				&& (character.y >= fancypotsY-30 && character.y <= fancypotsY+30)) {
				buy(ITEMARRAY[i], 500);
			} if(quantity(ITEMARRAY[i]) > 0) {
				STATE = "MOVING";
				return "Potions found!";
			}
		}
	}
}

/* RESET CHARACTER FUNCTION
 * Puts the character state into TIMEOUT and respawns the character
 **/
function resetCharacter() {
	if(character.rip) {
		STATE = "TIMEOUT";
		setTimeout(() => {
			respawn();
			STATE = "MOVING";
		}, 15000);
	}
}

/* STATUS CHECKS FUNCTION
 * Uses potions, respawns character, and purchases/sells/stores items when necessary
 * Essentially an auto-maintenance function
 **/
function statusChecks() {
	if((character.hp < LOWHP) || (character.mp < LOWMP)) use_hp_or_mp();
	
	resetCharacter();
	
	for(let i = 0; i < ITEMARRAY.length; i++) {
		if(quantity(ITEMARRAY[i]) == 0) {
			STATE = "MOVING";
			if(getPotions() == "Potions found!") return true;
			else return false;
		}
	} for(let i = 0; i < SELLARRAY.length; i++) {
		if(quantity(SELLARRAY[i]) > 0) {
			STATE = "MOVING";
			if(sellUselessItems() == "Useless items sold!") return true;
			else return false;
		}
	} for(let i = 0; i < STORAGEARRAY.length; i++) {
		if(quantity(STORAGEARRAY[i]) >= 5) {
			STATE = "MOVING";
			if(character.bank) {
				bank_store(locate_item(STORAGEARRAY[i]));
				return true;
			} else if(!is_moving(character)) {
				parent.current_map === "main" ? smart_move("bank") : smart_move("main");
				transport("bank");
			}
			return false;
		}
	}
	if(combineItems() == "Items combined!") return true;
	else return false;
}

/* FIND TARGETED MONSTER FUNCTION
 * Finds the targeted monster specified in the targetedMonster variable and targets it
 **/
function findTargetedMonster() {
	var min_d = 999999, target = null;
	for(id in parent.entities) {
		let current = parent.entities[id];
		if(current.type != "monster" || !current.visible || current.dead) continue;
		if(current.mtype && current.mtype != targetedMonster) continue;
		let c_dist  =parent.distance(character, current);
		if(c_dist<min_d) min_d = c_dist, target = current;
	}
	return target;
}

/* FARM MONSTER FUNCTION
 * Targets the monster for farming and does the following:
 * - Handles moving/strafing during combat
 * - Handles using skills
 **/
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
	} else if(is_in_range(target) && can_attack(target)) {
		attack(target);
	} else if(!is_in_range(target)) {
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
		attack(target);
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

/* GO TO MONSTER FARM FUNCTION
 * Moves the character to the monster farm location and selects the closest monster as a target
 * Sets the character to the FARMING state when a target is selected
 **/
function goToMonsterFarm() {
	if(!is_moving(character)) {
		smart_move(targetedMonster);
	}

	let target = get_targeted_monster(); // Get currently targeted monster // Get currently targeted monster
	if(!target) { // If no target was found
		target = findTargetedMonster();
		if(target) change_target(target); // Change target to newly found one
	} if(target && !is_in_range(target)) {
		move(character.x+(target.x-character.x)/1.2, character.y+(target.y-character.y)/1.2); // Walk most of the distance
	} if(target && is_in_range(target)) {
		STATE = "FARMING";
	}
}

/* ON PARTY INVITE FUNCTION
 * Accept a party invite from a character specified in the PARTYARRAY variable
 **/
function on_party_invite(name) {
	if(PARTYARRAY.includes(name)) {
		accept_party_invite(name);	
	}
}

/* REGULAR INTERVAL CODE
 * Does the following every 15 minutes:
 * - Logs the characters current level and XP
 * - Accepts party invites from listed players
 * - Creates baskets of eggs from eggs (for easter event)
 **/
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
}, 60000 * 15);

/* REGULAR INTERVAL CODE
 * Does the following every half of a second:
 * - Skips the rest if the current state is TIMEOUT
 * - Sets the default state to MOVING if not in FARMING or TIMEOUT (catch-all)
 * - Performs status checks
 * - Prevents farming if the user isn't in farm mode, is currently moving, failed the status checks or is dead
 * - Otherwise, moves to the monster farm and farms/loots monsters
 **/
setInterval(() => {
	if(STATE == "TIMEOUT") return;
	if(STATE != "FARMING") {
		STATE = "MOVING"; // Default state for character
	}
	
	var results = statusChecks(); // Must return true to proceed
	if(!farm_mode || is_moving(character) || !results || character.rip) return;
	
	if(STATE == "MOVING") {
		goToMonsterFarm(); // Go to farming location
	}
	else if(STATE == "FARMING") {
		loot();
		farmMonster(); // Attack specific monster in the area
	}
}, 1000/2);