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
 * - STORAGEARRAY: Array of item keys that should be stored in the bank (stores when stack is >= 5)
 * - LOWHP: Value of HP when a potion will be used
 * - LOWMP: Value of MP when a potion will be used
 **/
var STATE;
var farm_mode = true;
var targetedMonster = "arcticbee";
const ITEMARRAY = ["hpot1", "mpot1"];
const SELLARRAY = ["wgloves", "wcap", "wbreeches", "wshoes", "wshield", "quiver", "wattire"];
const SKILLARRAY = ["charge", "taunt", "dash", "cleave", "hardshell"];
const PARTYARRAY = ["Magra", "Dexla", "Noirme", "Draxious", "Sacerdos"];
const STORAGEARRAY = ["smush", "beewings", "ascale", "poison", "seashell", "spidersilk", "bfur", "pleather", "rattail", "gem0", "gslime", "cscale", "crabclaw", "frogt", "vitscroll",
						"essenceoffrost", "pants1", "gloves1", "helmet1", "boots1", "eslippers", "epyjamas", "ecape", "eears", "xmaspants", "sshield", "sstinger", "hbow", "candy0", "candy1"];
const LOWHP = character.max_hp / 1.2;
const LOWMP = character.max_mp / 1.2;

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
	return true;
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
	} else if(is_in_range(target) && !can_attack(target)) {
		move(target.x, target.y);
	} else if(!is_in_range(target)) {
		target = findTargetedMonster();
		if(target) {
			change_target(target); // Change target to newly found one
			move(target.x, target.y);
		} else {
			set_message("No Monsters");
			STATE = "MOVING";
			return;
		}
	}

	// Move randomly in different directions (unique for different characters)
	let randomDistance = Math.floor((Math.random() * 8) + 1);
	if(is_in_range(target)) {
		if(randomDistance == 8) move(character.x-15, character.y);
		if(randomDistance == 7) move(character.x+15, character.y);
		if(randomDistance == 6) move(character.x, character.y-15);
		if(randomDistance == 5) move(character.x, character.y+15);
		if(randomDistance == 4) move(character.x-15, character.y-15);
		if(randomDistance == 3) move(character.x+15, character.y+15);
		if(randomDistance == 2) move(character.x-15, character.y+15);
		if(randomDistance == 1) move(character.x+15, character.y-15);
		if(is_in_range(target)) attack(target);
	}

	// Use skills
    for (skill of SKILLARRAY) {
        let random = Math.floor((Math.random() * 20) + 1); // Value between 1 and 20
        if(is_in_range(target)) {
            if(random <= 10) { // 50% chance for skill to activate
                if(skill == "charge" || skill == "taunt") parent.use_skill(skill, target);
			} else if(random > 15) { // 25% chance for skill to activate
				if(skill == "cleave" && character.mp > 720) parent.use_skill(skill, target);
				if(skill == "dash") parent.use_skill(skill, target);
				if(skill == "hardshell" && character.hp < 500) parent.use_skill(skill, target);
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

	let target = get_targeted_monster(); // Get currently targeted monster
	if(!target) { // If no target was found
		target = findTargetedMonster();
		if(target) change_target(target); // Change target to newly found one
	} if(target && !is_in_range(target)) {
		move(target.x, target.y); // Walk to the enemy
		STATE = "FARMING";
	} else if(target && is_in_range(target)) {
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
 **/
setInterval(() => {
	game_log("Current Level: " + character.level); // Log level
	game_log("Current XP: " + character.xp); // Log XP
	for(let i = 0; i < PARTYARRAY.length; i++) {
		on_party_invite(PARTYARRAY[i]); // Accept party invites from specified users
	}
}, 60000 * 15);

/* REGULAR INTERVAL CODE
 * Does the following every fourth of a second:
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
}, 1000/4);