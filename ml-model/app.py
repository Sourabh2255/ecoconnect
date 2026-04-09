from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np

app = Flask(__name__)

model = load_model("waste_model.h5")

# match your dataset classes
classes = ['Hazardous','Non-Recyclable','Organic','Recyclable']

def preprocess(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    image = Image.open(file)

    processed = preprocess(image)
    prediction = model.predict(processed)

    # ✅ FIXED INDENTATION
    predictions = prediction[0]

    result = classes[np.argmax(predictions)]
    confidence = float(np.max(predictions))

    # ✅ ALL PREDICTIONS
    all_predictions = {
        classes[i]: float(predictions[i])
        for i in range(len(classes))
    }

    # ✅ RETURN EVERYTHING
    return jsonify({
        "prediction": result,
        "confidence": confidence,
        "all_predictions": all_predictions
    })

if __name__ == "__main__":
    app.run(port=5001)