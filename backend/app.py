from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image, ImageOps
import io
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)

# Load model
try:
    model = load_model('model/mnist_model.h5')
    app.logger.info("Model loaded successfully")
    # model.summary()  # Verify input shape
except Exception as e:
    app.logger.error(f"Error loading model: {str(e)}")
    raise e

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No image selected"}), 400

        # Read the image from the file
        image = Image.open(io.BytesIO(file.read())).convert('L')
        image = image.resize((28, 28))  # Ensure the image is 28x28 pixels
        
        # Convert to numpy array, normalize, and reshape for the model
        img_array = np.array(image) / 255.0
        img_array = img_array.reshape(1, 784)  # Flatten the image
        
        # Check if image is in the correct shape (1, 784)
        if img_array.shape != (1, 784):
            return jsonify({"error": f"Invalid image shape: {img_array.shape}"}), 400

        # Make the prediction
        prediction = model.predict(img_array)
        digit = int(np.argmax(prediction))  # Get the predicted digit (0-9)
        confidence = float(np.max(prediction))  # Get the prediction confidence
        
        return jsonify({
            "digit": digit,
            "confidence": confidence
        })

    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
