def fortune():
  import random
  number = random.randint(0,8)
  if number == 1:
    print("Don't pursue happiness – create it.")
  elif number == 2:
    print("All things are difficult before they are easy.")
  elif number == 3:
    print("The early bird gets the worm, but the second mouse gets the cheese.")
  elif number == 4:
    print("Someone in your life needs a letter from you.")
  elif number == 5:
    print("Don't just think. Act!")
  elif number == 6:
    print("Your heart will skip a beat.")
  elif number == 7:
    print("The fortune you search for is in another cookie.")
  else:
    print("Help! I'm being held prisoner in a Chinese bakery!")


fortune()
fortune()
fortune()