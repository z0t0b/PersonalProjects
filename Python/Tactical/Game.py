# Main game runner
# Started: 7/29/19
# Ended: 
# By: CENSORED

import random

# Character building function
def charBuild(int choice)
	while(choice < 1 || choice > 5):
		print("Error! Unidentified class.")
		choice = int(input("Please enter your desired starting class for " + str(name) + ": "))

	if(choice == 1):
		print("Your starting class is a warrior! He has high attack and defense, but low magic power and resistance.")
		attack = random.randint(59, 75)
		defense = random.randint(59, 75)
		magic = random.randint(19, 30)
		resistance = random.randint(19, 30)

	elif(choice == 2):
		print("Your starting class is a mage! He has high magic power and resistance, but low attack and defense.")
		attack = random.randint(19, 30)
		defense = random.randint(19, 30)
		magic = random.randint(59, 75)
		resistance = random.randint(59, 75)

	elif(choice == 3):
		print("Your starting class is a healer! He has moderate resistance and defense, high magic power, and low attack.")
		attack = random.randint(19, 30)
		defense = random.randint(39, 55)
		magic = random.randint(59, 75)
		resistance = random.randint(39, 55)

	elif(choice == 4):
		print("Your starting class is a gunman! He has moderate resistance and defense, high attack, and low magic power.")
		attack = random.randint(59, 75)
		defense = random.randint(39, 55)
		magic = random.randint(19, 30)
		resistance = random.randint(39, 55)

	else:
		print("Your starting class is a templar! He has moderate magic power and defense, high attack, and low resistance.")
		attack = random.randint(59, 75)
		defense = random.randint(39, 55)
		magic = random.randint(39, 55)
		resistance = random.randint(19, 30)

# Main function
def main:
	print("Hello, and welcome to the game of (TO BE DECIDED)!\nYou can choose one of five classes for your starting character...")
	print("\tThe warrior has high attack and defense, but low magic power and resistance.")
	print("\tThe mage has high magic power and resistance, but low attack and defense.")
	print("\tThe healer has moderate resistance and defense, high magic power, and low attack.")
	print("\tThe gunman has moderate resistance and defense, high attack, and low magic power.")
	print("\tThe templar has moderate magic power and defense, high attack, and low resistance.")

	name = str(input("\nPlease enter the characters name: "))
	print("Class options:\n1 - Warrior\n2 - Mage\n3 - Healer\n4 - Gunman\n5 - Templar\n")
	startClass = int(input("Please enter your desired starting class for " + str(name) + ": "))

	charBuild(startClass)
