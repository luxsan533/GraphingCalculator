import numpy as np
import matplotlib.pyplot as plt
import sys

# sys.argv gets data from js file
# since the data are strings we must turn xlim to an int with int() and func to python code with eval()
xlim = int(sys.argv[1])
# linspace creates list of numbers with given length evenly spaced between 2 limits
x = np.linspace(-xlim, xlim, 100)
func = eval(sys.argv[2])
name = sys.argv[3]

y = func

# Create Figure (empty canvas)
fig = plt.figure()

# Add set of axes to figure
axes = fig.add_axes([0.1, 0.1, 0.8, 0.8]) # left, bottom, width, height (range 0 to 1)

# Plot on that set of axes
axes.set_ylim(-xlim, xlim)

# removes border from figure
axes.spines['right'].set_color('none')
axes.spines['top'].set_color('none')

axes.xaxis.set_ticks_position('bottom')
axes.spines['bottom'].set_position(('data',0)) # set position of x spine to x=0

axes.yaxis.set_ticks_position('left')
axes.spines['left'].set_position(('data',0))   # set position of y spine to y=0

# plots x, y data sets onto figure
axes.plot(x, y, 'b')
axes.set_xlabel('X', loc = 'right') # Notice the use of set_ to begin methods
axes.set_ylabel('Y', loc = 'bottom', rotation = 0)
axes.set_title('y = ' + sys.argv[2])

folder = "\\Users\\Luxsan Jeyasingam\\Desktop\\Webdev\\Graphing_Calculator\\public\\"
filename = name + '.png'
# print(folder)
fig.savefig(folder + filename)
print(['http://localhost:3000/', name, '.png'])
# sys.stdout.flush()