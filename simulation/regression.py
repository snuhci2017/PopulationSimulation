import csv
import numpy as np
from sklearn import linear_model
from sklearn.preprocessing import PolynomialFeatures

DATA_PATH = '../data/simulation_data.csv'

def main():
    data = []

    with open(DATA_PATH, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)

    labels = list(data[0].keys())
    y_label = 'total birth rate'
    x_labels = [i for i in labels if i!=y_label and not i.endswith('year')]
    print ("dependent variables:", x_labels)
    print ("independent variable:", y_label)

    xi, y = [], []
    for d in data:
        xs = [d[x] for x in x_labels]
        if '' in xs: continue
        xs = [float(x) for x in xs]
        xi.append(xs)
        y.append(float(d[y_label]))

    linregress(xi, y)

def linregress(xi, y):
    primes = [2, 3, 5, 7]
    poly = PolynomialFeatures(degree=2)
    xi = poly.fit_transform(xi)
    desc = poly.fit_transform(primes)
    alpha = (1 + np.random.randint(100)) * 0.001
    clf = linear_model.Ridge(alpha = alpha)
    clf.fit(xi, y)
    coef = clf.coef_
    intercept = clf.intercept_
    violate = 0
    for i in range(len(coef)):
        if (desc[0][i] in [4, 9, 25, 49] and coef[i]>=0): violate += 1
        print (coef[i], desc[0][i])
    print (intercept)
    if (violate>0): return False
    print ("="*10)
    for i in range(9):
        pred_y = intercept
        for j in range(len(desc[0])):
            pred_y += coef[j] * xi[i][j]
        print (i, pred_y, y[i])

if __name__ == '__main__':
    main()

