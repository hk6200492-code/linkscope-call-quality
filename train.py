"""Train and export a reproducible simulator-based call quality classifier."""
from pathlib import Path
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(42)
n = 4000
upload = rng.uniform(0.2, 12, n)
latency = rng.uniform(10, 350, n)
jitter = rng.uniform(0, 100, n)
loss = rng.uniform(0, 8, n)
X = np.column_stack([upload, latency, jitter, loss])
# Illustrative impairment assumptions with random variation across calls.
stress = (1.8 / upload + latency / 350 + jitter / 75 + loss / 5
          + rng.normal(0, 0.12, n))
y = np.digitize(stress, [1.65, 2.85])
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=7, stratify=y)
forest = RandomForestClassifier(n_estimators=41, max_depth=7, random_state=42)
forest.fit(X_train, y_train)
pred = forest.predict(X_test)
trees = []
for estimator in forest.estimators_:
    t = estimator.tree_
    trees.append(dict(feature=t.feature.tolist(), threshold=t.threshold.tolist(),
                      left=t.children_left.tolist(), right=t.children_right.tolist(),
                      votes=t.value[:, 0].tolist()))
model = dict(trees=trees, accuracy=accuracy_score(y_test, pred),
             confusion=confusion_matrix(y_test, pred).tolist(),
             baseline=float(np.max(np.bincount(y_test)) / len(y_test)))
out = Path(__file__).resolve().parent / 'dist' / 'model.js'
out.write_text('const model = ' + json.dumps(model, separators=(',', ':')) + ';\n')
print('Held-out accuracy', model['accuracy'], 'majority baseline', model['baseline'])
