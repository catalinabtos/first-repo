import random #0 Invocar el modulo random

def play(): #1 Definir función 'play()'
  symbols = ['🍒','🍇','🍉','7️⃣'] #2 Crear listado de simbolos


  while True: #7 While Loop para reiniciar el juego
    choice = input ("Do you want to play? (Y/N) ").upper() #8 Preguntar si quiere jugar Y/N
    
    
    if choice == "Y":
      results = random.choices(symbols, k=3) #3 Crear una variable 'results' que use .choices() para obtener 3 símbolos  
      print (" | ".join(results))   #4 Imprimir cada resultado de 'results' separado por |
      
      if results == ['7️⃣', '7️⃣', '7️⃣']: #5 If todos los item son 7 imprimir "Jackpot"
        print ("Jackpot!! 💰")
      
      else:
       print("Thanks for playing!") #6 Else "Thanks for playing"
    
    elif choice == "N":
      print("Ok, bye!")
      break
    
    else:
      print("Insert valid input")
  

    

play()