import base64
import os
from typing import Optional
from pydantic import BaseModel, Field
import httpx
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

# Define the structured output
class LicensePlate(BaseModel):
    is_license_plate: bool = Field(description="Whether the image contains a license plate")
    plate_number: Optional[str] = Field(None, description="The license plate number if detected. None if not detected")
    confidence: float = Field(description="Confidence score between 0 and 1")

class MultiLicensePlateResult(BaseModel):
    license_plates_detected: int = Field(description="Number of license plates detected in the image")
    plates: list[LicensePlate] = Field(description="List of detected license plates")


# Initialize the model
model = ChatGoogleGenerativeAI(google_api_key="AIzaSyCC3eQj893NFmazhohpeq8CAEIyBaX-TXY", model="gemini-2.0-flash").with_structured_output(MultiLicensePlateResult)

def encode_image(image_path):
    """Encode image to base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def get_image_from_url(image_url):
    """Get image data from URL and convert to base64"""
    response = httpx.get(image_url)
    return base64.b64encode(response.content).decode("utf-8")

def recognize_license_plate(image_source, is_url=False):
    """Recognize license plate from image"""
    # Prepare image data
    if is_url:
        image_data = get_image_from_url(image_source)
    else:
        image_data = encode_image(image_source)
    
    # Create message with text and image
    message = HumanMessage(
        content=[
            {
                "type": "text", 
                "text": "Analyze this image and determine if it contains a license plate. If it does, extract the license plate number. Be precise with the characters you identify. Any Number of license plate can be detected in the image. Also Please provide a confidence score between 0 and 1.",
            },
            {
                "type": "image",
                "source_type": "base64",
                "data": image_data,
                "mime_type": "image/jpeg"  # Adjust based on your image format
            }
        ]
    )
    
    # Get structured response from the model
    response = model.invoke([message])
    return response

# Example usage
if __name__ == "__main__":
    result = recognize_license_plate("LLMSample1/images.jpeg")
    print(f"Number of license plates: {result.license_plates_detected}")
    if result.license_plates_detected:
        print(f"Plate numbers:\n{result.plates}")
    else:
        print("No license plate detected.")
    print(f"Confidence: {result.confidence}")
