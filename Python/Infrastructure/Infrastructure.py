# Infrastructure.py
# Date Created: 7/30/19
# Date Finished: 
# By: CENSORED

# Util Functions
def containsAny(item, items):
	if item in items:
		return True
	return False

# Main function
def main():
	print("\n\n****************************** Welcome to Infrastructure!!! ******************************\n")
	print("\tThe rules of the game are simple:")
	print("\t### Each time you type enter (or anything besides a keyword), you gain points...")
	print("\t\t### The number of points you get is determined by how many structures you have!")
	print("\t### You can purchase structures by using the ~buy or ~purchase commands.")
	print("\t### You can prestige when you have 100 of each building (there are 5 types of buildings).")
	print("\t\t### You can prestige unlimited times! Try to get the highest score!")
	print("\t### Type ~help for a list of commands at any time...\n\n")

	quit = 0
	counter = 0
	shelter = 0
	tower = 0
	castle = 0
	fortress = 0
	prestigePts = 1

	buy = ["BUY", "PURCHASE"]
	helpWord = ["HELP"]
	prestige = ["PRESTIGE"]
	points = ["POINTS"]
	quit = ["QUIT"]

	while(quit != 1):

		command = str(input("~")).upper()
		if(containsAny(command, helpWord)):
			print("\n~buy/~purchase: Purchase more buildings.")
			print("~prestige: Prestige to the next level (only available after 100 of each building is earned).")
			print("~points: Shows how many points you currently have.")
			print("~help: Displays the list of commands.")
			print("~quit: Quits the game and saves your score (may update the high score list).\n")

		elif(containsAny(command, buy)):
			print("\n1 - Shelter (10 points)\n2 - Tower (1000 points)\n3 - Castle (100000 points)\n4 - Fortress (10000000 points, default for any other value)\n")
			choice = int(input("~"))
			if(choice == 1):
				if(counter < 10):
					print("Invalid amount of points!\n")
				elif(shelter == 100):
					print("Max amount of shelters reached!\n")
				else:
					numBuy = int(input("Please enter the amount of shelters to buy: "))
					if(numBuy > 100 or numBuy > 100 - shelter):
						print("Invalid amount of points!\n")
					elif(numBuy == 1):
						print("A shelter was purchased!\n")
						shelter += 1
						counter -= 10
					else:
						print(str(numBuy) + " shelters were purchased!\n")
						shelter += numBuy
						counter -= 10 * numBuy

			elif(choice == 2):
				if(counter < 1000):
					print("Invalid amount of points!\n")
				elif(tower == 100):
					print("Max amount of towers reached!\n")
				else:
					numBuy = int(input("Please enter the amount of towers to buy: "))
					if(numBuy > 100 or numBuy > 100 - tower):
						print("Invalid amount of points!\n")
					elif(numBuy == 1):
						print("A tower was purchased!\n")
						tower += 1
						counter -= 1000
					else:
						print(str(numBuy) + " towers were purchased!\n")
						tower += numBuy
						counter -= 1000 * numBuy

			elif(choice == 3):
				if(counter < 100000):
					print("Invalid amount of points!\n")
				elif(castle == 100):
					print("Max amount of castles reached!\n")
				else:
					numBuy = int(input("Please enter the amount of castles to buy: "))
					if(numBuy > 100 or numBuy > 100 - castle):
						print("Invalid amount of points!\n")
					elif(numBuy == 1):
						print("A castle was purchased!\n")
						castle += 1
						counter -= 100000
					else:
						print(str(numBuy) + " castles were purchased!\n")
						castle += numBuy
						counter -= 100000 * numBuy

			else:
				if(counter < 10000000):
					print("Invalid amount of points!\n")
				elif(fortress == 100):
					print("Max amount of fortresses reached!\n")
				else:
					numBuy = int(input("Please enter the amount of fortresses to buy: "))
					if(numBuy > 100 or numBuy > 100 - fortress):
						print("Invalid amount of points!\n")
					elif(numBuy == 1):
						print("A fortress was purchased!\n")
						fortress += 1
						counter -= 10000000
					else:
						print(str(numBuy) + " fortresses were purchased!\n")
						fortress += numBuy
						counter -= 10000000 * numBuy

		elif(containsAny(command, prestige)):
			if(shelter == 100 and tower == 100 and castle == 100 and foretress == 100):
				prestigePts += 1
				print("Congrats! You have acheived prestige level " + str(prestigePts))
				print("Your buildings have been demolished and your points have been reset to 0!\n")
				shelter = 0
				tower = 0
				castle = 0
				fortress = 0
				counter = 0
			else:
				print("You do not have enough buildings to prestige!\n")


		elif(containsAny(command, points)):
			print("\nNumber of shelters: " + str(shelter))
			print("Number of towers: " + str(tower))
			print("Number of castles: " + str(castle))
			print("Number of fortresses: " + str(fortress))
			print("Prestige level: " + str(prestigePts))
			print("Number of points: " + str(counter) + "\n")

		elif(containsAny(command, quit)):
			quit = 1
			print("\n****************************** Thank you for playing Infrastructure! ******************************\n\n")

		else:
			tempVal = 0
			tempVal += shelter * 2
			tempVal += tower * 4
			tempVal += castle * 8
			tempVal += fortress * 16

			if(tempVal != 0):
				counter += tempVal
				print("You gained " + str(tempVal) + " points!")
			else:
				counter += 1
				print("You gained 1 point!")
			

main()
