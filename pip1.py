import wikipedia

search = wikipedia.search('Python')

print(search)

summary_first = wikipedia.summary(search[0])
print(summary_first)