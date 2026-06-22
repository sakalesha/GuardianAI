from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/ml/predict', methods=['POST'])
def predict():
    return jsonify({"prediction": "placeholder"})

if __name__ == '__main__':
    app.run(port=5000)
