// -- Directions --
// 1.) Status checks are performed before any other code
//   - If potions need to be bought or used
//   - If the player needs to respawn
//   - If items need to be combined
// 2.) Character accepts party requests from trusted players
//   - They check every 15 minutes
// 3.) Character uses the mluck skill every fourth a second to potentially get rare items

/* GLOBAL VARIABLES
 * All the global variables grouped for easy modifications. Variables without a value shouldn't be changed.
 * - STATE: The state the character is in. Switches between TIMEOUT and MOVING
 * - ITEMARRAY: Array of item keys that should be purchased upon depletion
 * - PARTYARRAY: Array of character names that should be sent party requests
 * - COMBINEARRAY: Array of item keys that should be automatically combined (combines up to and including level 2 items)
 * - RETRIEVEARRAY: Array of item keys that should be automatically retrieved from the bank
 * - EXCHANGEARRAY: Array of item keys that should be automatically exchanged to Xyn
 * - LOWHP: Value of HP when a potion will be used
 * - LOWMP: Value of MP when a potion will be used
 **/
var STATE;
const ITEMARRAY = ["hpot0", "mpot0"];
const PARTYARRAY = ["Magra", "Dexla", "Noirme", "Draxious", "Sacerdos"];
const COMBINEARRAY = ["hpbelt", "ringsj", "hpamulet", "wbook0", "vitring", "intring", "dexring", "strring", "strearring", "intearring", "dexearring", "vitearring"];
const RETRIEVEARRAY = ["candy0", "candy1"]
const EXCHANGEARRAY = ["candy0", "candy1"]
const LOWHP = character.max_hp / 1.2;
const LOWMP = character.max_mp / 1.2;

/* EXCHANGE ITEMS FUNCTION
 * Automatically exchanges valid items to Xyn
 **/
function exchangeItems() {
    EXCHANGEARRAY.map(item => {
        for(let i = 0; i < character.items[locate_item(item)].q; i++) {
            setTimeout(() => {
                exchange(locate_item(item));
            }, 1000 * i + 1000)
        }
    })
}

/* RETRIEVE BANK ITEMS FUNCTION
 * Automatically combines items with levels <= 2
 **/
function retrieveBankItems() {
    STATE = "MOVING";
    if(!character.bank) {
        parent.current_map === "main" ? smart_move("bank") : smart_move("main");
        transport("bank");
    }
    setTimeout(() => {
        let emptySpaces = []
        for(let i = 0; i < 42; i++) {
            if(!character.items[i]) emptySpaces.push(i)
        }
        if(emptySpaces.length === 0) return;
        let emptySpaceCounter = 0;
        for(let i = 0; i < 42; i++) {
            RETRIEVEARRAY.map(item => {
                for(bank in character.bank) {
                    if(Array.isArray(character.bank[bank])) character.bank[bank].map((bankItem, itemIndex) => {
                        if(bankItem && bankItem.name === item && (emptySpaceCounter + 1 !== emptySpaces.length)) {
                            bank_retrieve(bank, itemIndex, emptySpaces[emptySpaceCounter])
                            emptySpaceCounter += 1;
                        }
                    })
                }
            })
        }
    }, 20000)
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
 * Uses potions, respawns character, and exchanges/combines/retrieves items when necessary
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
	}
	if(combineItems() == "Items combined!") return true;
	else return false;
}

/* ON PARTY INVITE FUNCTION
 * Accept a party invite from a character specified in the PARTYARRAY variable
 **/
function on_party_invite(name) {
	if(PARTYARRAY.includes(name)) {
        accept_party_invite(name);	
    }
}

/* FIND NEAREST CHARACTER FUNCTION
 * Finds the nearest character and targets it
 **/
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

/* LONGER INTERVAL CODE
 * Does the following every 3 hours:
 * - Exchanges items with Xyn
 **/
setInterval(() => {
	exchangeItems()
}, 60000 * 180);

/* REGULAR INTERVAL CODE
 * Does the following every 15 minutes:
 * - Logs the characters current level and XP
 * - Accepts party invites from listed players
 * - Retrieves items from the bank
 **/
setInterval(() => {
	game_log("Current Level: " + character.level); // Log level
	game_log("Current XP: " + character.xp); // Log XP
	for(let i = 0; i < PARTYARRAY.length; i++) {
		on_party_invite(PARTYARRAY[i]); // Accept party invites from specified users
	}

    retrieveBankItems()
}, 60000 * 15);

/* REGULAR INTERVAL CODE
 * Does the following every fourth of a second:
 * - Skips the rest if the current state is TIMEOUT
 * - Performs status checks
 * - Prevents using skills if the user is currently moving, failed the status checks or has no target
 * - Otherwise, uses skills
 **/
setInterval(() => {
    if(STATE == "TIMEOUT") return;

    var results = statusChecks();
    var target = findNearestCharacter();
    if(is_moving(character) || !results || !target) return;
    
    parent.use_skill("mluck", target);
}, 1000/4);