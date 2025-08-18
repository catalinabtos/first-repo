class pokemon:
  def __init__(self, entry, name, types, description, is_caught):
    self.entry = int(entry)
    self.name = str(name)
    self.types = list(types)
    self.description = str(description)
    self.is_caught = bool(is_caught)
  def speak(self):
    print(f"{self.name} {self.name}")
  def display_details(self):
    print(f"Entry Number: {self.entry}")
    print(f"Name: {self.name}")
    print(f"Type: {', '.join(self.types)}")
    print(f"Description: {self.description}")
    if self.is_caught == True:
        print(f"{self.name} has already been caught!")
    else:
        print(f"{self.name} has not been caught!")

bulbasaur = pokemon(1, "Bulbasaur", ["Grass", "Poison"], "Bulbasaur is a small, quadrupedal, amphibian and plant Pokémon with a blue-green body and darker spots.", True)
charmander = pokemon(4, "Charmander", ["Fire"], "Charmander is a Fire type Pokémon introduced in Generation 1 . Charmander is a bipedal, reptilian Pokémon.", False)
squirtle = pokemon(7, "Squirtle", ["Water"], "Squirtle is a small, bipedal, turtle-like Pokémon, primarily light blue with a hard brown shell on its back. It has large, purple-red eyes, a hooked upper lip, and a long, curly tail that resembles a squirrel's tail.", True)

bulbasaur.speak()
bulbasaur.display_details()

charmander.speak()
charmander.display_details()

squirtle.speak()
squirtle.display_details()
