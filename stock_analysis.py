# Stock Analysis

stock_prices = [34.68, 36.09, 34.94, 33.97, 34.68, 35.82, 43.41, 44.29, 44.65, 53.56, 49.85, 48.71, 48.71, 49.94, 48.53, 47.03, 46.59, 48.62, 44.21, 47.21]

#Price at given day 
def price_at(i):
  print(stock_prices[i-1])

# Maximum price from day a to day b.
def max_price(a,b):
  print(max(stock_prices[a : b]))

# Minimum price from day a to day b.
def min_price(a,b):
  print(min(stock_prices[a : b]))

price_at(3)
max_price(0,20)
min_price(0,20)