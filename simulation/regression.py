import csv
import numpy as np
from sklearn import linear_model
from sklearn.preprocessing import PolynomialFeatures

DATA_PATH = '../data/simulation_data3.csv'

def main():
    data = []

    with open(DATA_PATH, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)

    labels = list(data[0].keys())
    y_labels = ['new born baby', 'female count']
    x_labels = [i for i in labels if i not in y_labels and not i.endswith('year')]
    print ("dependent variables:", x_labels)
    print ("independent variable:", y_labels)

    xi, y = [], []
    for d in data:
        xs = [d[x] for x in x_labels]
        if '' in xs: continue
        xs = [float(x) for x in xs]
        xi.append([sum(xs)])
        y.append(1000*float(d[y_labels[0]])/float(d[y_labels[1]]))
        #print (xi[-1], y[-1])
        #print (46.66 - 0.0429*xi[-1][0], y[-1])
        print (100 - 0.25*xi[-1][0], y[-1])
    linregress(xi, y)


def linregress(xi, y):
    #primes = [2, 3, 5, 7]
    #poly = PolynomialFeatures(degree=2)
    #xi = poly.fit_transform(xi)
    #desc = poly.fit_transform(primes)
    alpha =  (1 + np.random.randint(100)) * 0.0001
    clf = linear_model.Ridge(alpha = alpha)
    clf.fit(xi, y)
    coef = clf.coef_
    intercept = clf.intercept_
    violate = 0
    for i in range(len(coef)):
        print (coef[i])
    print (intercept)
    print ("="*10)
    for i in range(9):
        pred_y = intercept
        for j in range(1):
            pred_y += coef[j] * xi[i][j]
        print (i, xi[i], pred_y, y[i])

if __name__ == '__main__':
    main()

