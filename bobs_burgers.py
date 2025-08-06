class Restaurant: 
  name = ''
  category = ''
  rating = 0.0
  delivery = True 

bobs_burgers = Restaurant()
bobs_burgers.name = 'Bob\'s Burgers'
bobs_burgers.category = 'American Diner'
bobs_burgers.rating = 4.7
bobs_burgers.delivery = False 

carro6 = Restaurant()
carro6.name = 'Carro 6'
carro6.category = 'Completos'
carro6.rating = 5.0
carro6.delivery = False

bajon_barney = Restaurant()
bajon_barney.name = 'El bajón del Barney'
bajon_barney.category = 'Picada'
bajon_barney.rating = 4.1
bajon_barney.delivery = True

print(vars(carro6)) 
print(vars(bobs_burgers)) 
print(vars(bajon_barney)) 