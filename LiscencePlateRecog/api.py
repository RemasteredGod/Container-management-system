from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64

# Import from the local llmModule.py file
from llmModule import recognize_license_plate

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        data = request.json
        if not data or ('image_source' not in data):
            return jsonify({'error': 'No image data provided'}), 400
            
        image_source = data['image_source']
        is_url = data.get('is_url', False)
 
        # If it's base64 data directly (not a URL), save it temporarily
        if not is_url:
            # Create the temp directory if it doesn't exist
            os.makedirs('temp', exist_ok=True)
            
            # Save the base64 image to a temporary file
            img_data = base64.b64decode(image_source)
            temp_img_path = os.path.join('temp', 'uploaded_image.jpg')
            with open(temp_img_path, 'wb') as f:
                f.write(img_data)
            
            # Process the image
            result = recognize_license_plate(temp_img_path)
        else:
            # Process the URL directly
            result = recognize_license_plate(image_source, is_url=True)
        
        # Convert Pydantic model to dictionary
        return jsonify({
            'license_plates_detected': result.license_plates_detected,
            'plates': [
                {
                    'is_license_plate': plate.is_license_plate,
                    'plate_number': plate.plate_number,
                    'confidence': plate.confidence
                } 
                for plate in result.plates
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

