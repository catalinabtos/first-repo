import imageio.v3 as iio

filenames = ['1.jpg', '2.jpg', "3.jpg"]
images = [ ]

for filename in filenames:
  images.append(iio.imread(filename))

iio.imwrite('me2.gif', images, duration = 500, loop = 0)

