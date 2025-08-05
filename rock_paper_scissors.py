# Rock, paper, scissors project
# Cata Paz

print("================================")
print("Rock Paper Scissors Lizard Spock")
print("================================")
print("")
print("1) ✊")
print("2) 🖐️")
print("3) ✌️")
print("4) 🦎")
print("5) 🖖")

import random

Your_choice_n = int(input("Pick a number: "))
CPU_choice_n = random.randint(0,5)

# Transformar número elejido en emoji

if Your_choice_n == 1:
    Your_choice_emoji = "✊"
elif Your_choice_n == 2:
    Your_choice_emoji = "🖐️"
elif Your_choice_n == 3:
    Your_choice_emoji = "✌️"
elif Your_choice_n == 4:
    Your_choice_emoji = "🦎"
else:
    Your_choice_emoji = "🖖"

# Transformar número random de CPU en emoji

if CPU_choice_n == 1:
    CPU_choice_emoji = "✊"
elif CPU_choice_n == 2:
    CPU_choice_emoji = "🖐️"
elif CPU_choice_n == 3:
    CPU_choice_emoji = "✌️"
elif CPU_choice_n == 4:
    CPU_choice_emoji = "🦎"
else:
    CPU_choice_emoji = "🖖"

print("You chose: " + Your_choice_emoji)
print("CPU chose: " + CPU_choice_emoji)

# Definir quién gana

if Your_choice_emoji == "✌️" and CPU_choice_emoji == "🖐️":
    print("You win!")
elif Your_choice_emoji == "🖐️" and CPU_choice_emoji == "✊":
    print("You win!")
elif Your_choice_emoji == "✊" and CPU_choice_emoji == "🦎":
    print("You win!")
elif Your_choice_emoji == "🦎" and CPU_choice_emoji == "🖖":
    print("You win!")
elif Your_choice_emoji == "🖖" and CPU_choice_emoji == "✌️":
    print("You win!")
elif Your_choice_emoji == "✌️" and CPU_choice_emoji == "🦎":
    print("You win!")
elif Your_choice_emoji == "🦎" and CPU_choice_emoji == "🖐️":
    print("You win!")
elif Your_choice_emoji == "🖐️" and CPU_choice_emoji == "🖖":
    print("You win!")
elif Your_choice_emoji == "🖖" and CPU_choice_emoji == "✊":
    print("You win!")
elif Your_choice_emoji == "✊" and CPU_choice_emoji == "✌️":
    print("You win!")
elif Your_choice_emoji == CPU_choice_emoji:
    print("It's a tie!")
else:
    print("You lose!")
