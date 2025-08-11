#Crearemos una clase llamada 'City' usando método __init__() 

class City:
    def __init__(self, name, country, population, landmarks):
        self.name = name
        self.country = country
        self.population = population
        self.landmarks = landmarks

vancouver = City('Vancouver', 'Canada', 10000000, 'Deep Cove')
new_york = City('New York', 'EEUU', 100000000, 'La tumba del Hamilton')

print(vars(vancouver))
print(vars(new_york))

