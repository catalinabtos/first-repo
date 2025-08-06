# McDonald's Drive Thru

# Menu items

def welcome():
    Menu = [
        "1) Cheeseburger \n ",
        "2) Fries \n ",
        "3) Soda \n ",
        "4) Ice Cream \n ",
        "5) Cookie \n "
    ]
    for i in Menu:
      print(i)

# Define function
def get_item(j):
    Menu = [
     "1) Cheeseburger \n ",
     "2) Fries \n ",
     "3) Soda \n ",
     "4) Ice Cream \n ",
     "5) Cookie \n "
    ]
    print(Menu[j-1])

# Presentar menú luego preguntar qué va a comprar y presentar opción elegida

welcome()

j = int (input('What is your order? '))

get_item(j)

