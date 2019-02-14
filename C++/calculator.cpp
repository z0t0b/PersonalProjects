// A simple calculator
// Created by: Eli
// Date Started: 12/27/18
// PERSONAL PROJECT


//------------//
// INCLUSIONS //
//------------//
#include <iostream>
#include <math.h>
#include <cmath>
using namespace std;

//-----------//
// VARIABLES //
//-----------//
int choice;
double number1;
double number2;
double finalNumber;

//---------//
// METHODS //
//---------//
int main() {
   cout << "Make a choice: add, subtract, multiplication, division, exponentiation, or modulus (1, 2, 3, 4, 5, or 6): ";
   cin >> choice;
   if (choice == 1) {
      cout << "\n****************" << endl;
      cout << "*** ADDITION ***" << endl;
      cout << "****************" << endl;
      cout << "\nWhat is the first number? ";
      cin >> number1;
      cout << "\nWhat is the second number? ";
      cin >> number2;
      finalNumber = number1 + number2;
      cout << "\n" << finalNumber << " is the final number." << endl;
   }
   else if (choice == 2) {
      cout << "\n*******************" << endl;
      cout << "*** SUBTRACTION ***" << endl;
      cout << "*******************" << endl;
      cout << "\nWhat is the first number? ";
      cin >> number1;
      cout << "\nWhat is the second number? ";
      cin >> number2;
      finalNumber = number1 - number2;
      cout << "\n" << finalNumber << " is the final number." << endl;
   }
   else if (choice == 3) {
      cout << "\n**********************" << endl;
      cout << "*** MULTIPLICATION ***" << endl;
      cout << "**********************" << endl;
      cout << "\nWhat is the first number? ";
      cin >> number1;
      cout << "\nWhat is the second number? ";
      cin >> number2;
      finalNumber = number1 * number2;
      cout << "\n" << finalNumber << " is the final number." << endl;
   }
   else if (choice == 4) {
      cout << "\n****************" << endl;
      cout << "*** DIVISION ***" << endl;
      cout << "****************" << endl;
      cout << "\nWhat is the first number? ";
      cin >> number1;
      cout << "\nWhat is the second number? ";
      cin >> number2;
      finalNumber = number1 / number2;
      cout << "\n" << finalNumber << " is the final number." << endl;
   }
   else if (choice == 5) {
      cout << "\n*******************" << endl;
      cout << "*** EXPONENTIAL ***" << endl;
      cout << "*******************" << endl;
      cout << "\nWhat is the first number? ";
      cin >> number1;
      cout << "\nWhat is the second number? ";
      cin >> number2;
      finalNumber = pow(number1, number2);
      cout << "\n" << finalNumber << " is the final number." << endl;
   }
   else if (choice == 6) {
      cout << "\n**************" << endl;
      cout << "*** MODULO ***" << endl;
      cout << "**************" << endl;
      cout << "\nWhat is the first number? ";
      cin >> number1;
      cout << "\nWhat is the second number? ";
      cin >> number2;
      finalNumber = fmod(number1, number2);
      cout << "\n" << finalNumber << " is the final number." << endl;
   }
   else {
      cout << "\n\nNot a valid choice, run the program again." << endl;
   }
   
   return 0;
}
