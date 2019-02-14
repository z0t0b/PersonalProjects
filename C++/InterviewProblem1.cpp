/** Checking if a string has only unique chars
    O(n^2) time complexity :( **/

// INCLUSIONS
#include <iostream>
#include <string.h>
using namespace std;

// MAIN METHOD
int main() {
   string input = "";
   cout << "UNIQUE CHAR CALCULATOR" << endl;
   cout << "This program detects if there are no similar characters within a string" << endl;
   cout << "Enter desired string to check: ";
   cin >> input; 
   string str(input);
   bool value = true;
   for (int i = 0; i < input.size(); i++) {
      int n = 1;      
      while (str[i] != str[i + n] && n < input.size() - i) {
         n++;
      }
      if (str[i] == str[i + n]) {
         value = false;
      }
   }
   if (value == false) {
      cout << "\nDuplicate values detected!" << endl;
   }
   else {
      cout << "\nNo duplicates found!" << endl;
   }
   return 0;
}
