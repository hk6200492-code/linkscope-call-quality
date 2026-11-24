# Linkscope — Video Call Quality Predictor
A browser-based AI project connecting wireless network measurements to video call quality. Try Home Wi-Fi, Busy café or Weak hotspot, then move one slider at a time to see how the predicted class changes.

## Run
Open dist/index.html in any modern browser. Prediction runs locally. The trained model ships with the project.

## Reproduce the model
With Python 3.11 or newer, run:
```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python train.py
```
The script generates 4,000 synthetic rows with a fixed seed, holds out 25% using a stratified split, trains a 41-tree random forest on the remainder and exports the forest to dist/model.js. It prints test accuracy and a majority-class baseline. The exported confusion matrix uses actual classes as rows and predicted classes as columns, in Smooth, Uneven, Poor order.

## Scope
Inputs cover upload bandwidth (Mbps), round-trip delay (ms), jitter (ms) and packet loss (%). Label thresholds and additive noise are assumptions in train.py. Held-out performance measures recovery of this simulation. Device quality, codecs and real user ratings are outside the dataset. The app accepts manual readings and does not measure the connection.

## GitHub
Suggested repository name: linkscope-call-quality. Upload README.md, requirements.txt, train.py and the dist folder to your repository. For static hosting, serve the contents of dist.
