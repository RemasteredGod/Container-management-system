#!/usr/bin/env python3

import sys
import subprocess
import importlib.util
import os
import re
import time
import argparse
import numpy as np
from datetime import datetime
from collections import defaultdict

# Core dependency check
required_packages = ['opencv-python', 'pytesseract', 'numpy']

def install_package(package):
    print(f"Installing {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    print(f"{package} installed successfully!")

for package in required_packages:
    package_name = package.split('==')[0] if '==' in package else package
    spec = importlib.util.find_spec(package_name.replace('-', '_'))
    if spec is None:
        install_package(package)

import cv2
import pytesseract

use_ocr = True

def check_tesseract():
    """Check if Tesseract is installed and configure it"""
    import shutil
    tesseract_path = shutil.which('tesseract')
    if not tesseract_path:
        brew_path = shutil.which('brew')
        if not brew_path:
            print("Tesseract OCR not found. Install with Homebrew:")
            print("brew install tesseract")
        else:
            print("Install Tesseract OCR with: brew install tesseract")
        
        response = input("Continue without OCR? (y/n): ")
        return response.lower() == 'y'
    
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
    return True

def normalize_text(text):
    """Normalize text to help identify duplicates"""
    return re.sub(r'\s+', '', text).upper()

def is_likely_license_plate(text):
    """Identify if text looks like a license plate"""
    patterns = [
        r'[A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,2}\s*\d{4}',
        r'[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}',
        r'[A-Z]{2}\s*\d{1,2}\s*\d{4}',
        r'\d{1,3}\s*[A-Z]{1,3}\s*\d{1,4}'
    ]
    
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)

def is_likely_container_number(text):
    """Identify if text looks like a container number"""
    patterns = [
        r'[A-Z]{4}\s*\d{6}[0-9A-Z]?',
        r'[A-Z]{3}[UJZ]\s*\d{6}[0-9A-Z]?'
    ]
    
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)

def extract_numbers(text):
    """Extract license plates and container numbers from text"""
    results = []
    
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        if is_likely_license_plate(line):
            results.append(("LICENSE PLATE", line))
        elif is_likely_container_number(line):
            results.append(("CONTAINER", line))
    
    return results

def enhance_image(frame):
    """Enhance image for better OCR results"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    bilateral = cv2.bilateralFilter(gray, 11, 17, 17)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(bilateral)
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    return cleaned

def process_frame(frame):
    """Process a frame to extract text"""
    global use_ocr
    
    if not use_ocr:
        return ""
    
    processed = enhance_image(frame)
    
    try:
        config = '--psm 11 --oem 1 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-. '
        text = pytesseract.image_to_string(processed, lang='eng', config=config)
        return text.strip()
    except Exception as e:
        print(f"OCR error: {e}")
        return ""

def log_vehicle_details(details, detection_type, log_file):
    """Log detected vehicles to file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} - [{detection_type}] {details}\n"
    
    with open(log_file, "a") as f:
        f.write(log_entry)
    
    print(f"✅ Logged: {details}")
    return timestamp

def configure_camera(camera_id=0):
    """Configure camera with appropriate settings"""
    cap = cv2.VideoCapture(camera_id)
    
    if not cap.isOpened():
        print("Error: Could not open the camera.")
        return None
    
    # Set reasonable default resolution (HD)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
    
    actual_width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    actual_height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    print(f"Camera initialized: {actual_width}x{actual_height}")
    
    return cap

def show_stats(stats):
    """Show detailed statistics in a modal window"""
    # Create stats window
    height, width = 600, 800
    stats_img = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Variables we'll track
    line_y = 60
    line_height = 30
    
    # Header
    cv2.putText(stats_img, "DETECTION STATISTICS", (20, 30), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    
    # Count plates and containers
    license_plates = stats["LICENSE PLATE"]
    containers = stats["CONTAINER"]
    
    total_unique = len(license_plates) + len(containers)
    
    # Get top plates and containers by frequency
    top_plates = sorted(license_plates.items(), key=lambda x: x[1][1], reverse=True)
    top_containers = sorted(containers.items(), key=lambda x: x[1][1], reverse=True)
    
    # Summary counts
    cv2.putText(stats_img, f"Total Unique: {total_unique}", 
               (20, line_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)
    line_y += line_height
    
    cv2.putText(stats_img, f"License Plates: {len(license_plates)}", 
               (20, line_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    line_y += line_height
    
    cv2.putText(stats_img, f"Containers: {len(containers)}", 
               (20, line_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    line_y += line_height * 2
    
    # Most frequent license plates section
    if top_plates:
        cv2.putText(stats_img, "MOST FREQUENT LICENSE PLATES:", 
                   (20, line_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
        line_y += line_height
        
        for i, (plate, (timestamp, count)) in enumerate(top_plates):
            cv2.putText(stats_img, f"{plate} - {count} times", 
                       (40, line_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            line_y += line_height
            if i >= 4:  # Show top 5
                break
    
    line_y += line_height
    
    # Most frequent containers section
    if top_containers:
        cv2.putText(stats_img, "MOST FREQUENT CONTAINERS:", 
                   (20, line_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
        line_y += line_height
        
        for i, (container, (timestamp, count)) in enumerate(top_containers):
            cv2.putText(stats_img, f"{container} - {count} times", 
                       (40, line_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            line_y += line_height
            if i >= 4:  # Show top 5
                break
    
    # Footer
    cv2.putText(stats_img, "Press any key to close", (20, height - 20), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (150, 150, 150), 1)
    
    # Show the stats window
    cv2.imshow("Detection Statistics", stats_img)
    cv2.waitKey(0)  # Wait for key press
    cv2.destroyWindow("Detection Statistics")

def save_csv(stats, filename):
    """Save statistics to CSV file"""
    with open(filename, "w") as f:
        f.write("Type,Value,First Seen,Times Detected\n")
        for item_type, items in stats.items():
            for value, (first_time, count) in items.items():
                f.write(f"{item_type},{value},{first_time},{count}\n")
    print(f"Statistics saved to {filename}")

def run_camera():
    """Main function to run camera and detect license plates/containers"""
    global use_ocr
    
    # Setup
    use_ocr = check_tesseract()
    if not use_ocr:
        print("Running without OCR functionality")
        return

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='License Plate & Container Recognition')
    parser.add_argument('--camera', '-c', type=int, default=0, help='Camera index')
    parser.add_argument('--log', '-l', type=str, default='vehicle_log.txt', help='Log file path')
    args = parser.parse_args()
    
    # Initialize camera
    cap = configure_camera(args.camera)
    if not cap:
        return

    # Setup UI window
    window_name = "License Plate & Container Recognition"
    cv2.namedWindow(window_name)

    # Initialize tracking variables
    frame_count = 0
    stats = {
        "LICENSE PLATE": {},
        "CONTAINER": {}
    }
    seen_text = set()
    recent_detections = []
    
    # Display help text at startup
    print("\n" + "=" * 50)
    print("LICENSE PLATE & CONTAINER RECOGNITION")
    print("=" * 50)
    print("KEYBOARD CONTROLS:")
    print("  d - Show detailed statistics")
    print("  s - Save statistics to CSV")
    print("  c - Force capture current frame")
    print("  q - Quit")
    print("=" * 50)

    while True:
        # Capture frame
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame")
            break

        # Create a copy for display
        display = frame.copy()
        
        # Process every 10th frame to reduce CPU load
        frame_count += 1
        process_this_frame = frame_count % 10 == 0
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        
        # Force process frame if 'c' is pressed
        if key == ord('c'):
            process_this_frame = True
        
        # Show statistics if 'd' is pressed
        elif key == ord('d'):
            show_stats(stats)
        
        # Save statistics to CSV if 's' is pressed
        elif key == ord('s'):
            save_csv(stats, "detection_stats.csv")
        
        # Quit if 'q' is pressed
        elif key == ord('q'):
            break

        # Process frame for text detection
        if process_this_frame:
            text = process_frame(frame)
            
            if text:
                extracted = extract_numbers(text)
                
                if extracted:
                    print("\n---------------------")
                    
                    for detection_type, value in extracted:
                        normalized = normalize_text(value)
                        
                        # Check for duplicates
                        is_duplicate = normalized in seen_text
                        
                        if is_duplicate:
                            # Update stats for this item
                            if value in stats[detection_type]:
                                first_time, count = stats[detection_type][value]
                                stats[detection_type][value] = (first_time, count + 1)
                                print(f"🔄 REPEAT {detection_type}: {value} (seen {count+1} times)")
                        else:
                            # New detection
                            seen_text.add(normalized)
                            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            stats[detection_type][value] = (timestamp, 1)
                            
                            # Add to recent detections
                            recent_detections.insert(0, (detection_type, value))
                            if len(recent_detections) > 5:  # Keep last 5 only
                                recent_detections.pop()
                            
                            print(f"🆕 NEW {detection_type}: {value}")
                            log_vehicle_details(value, detection_type, args.log)
                    
                    print("---------------------")

        # Draw information overlay
        height, width = frame.shape[:2]
        
        # Semi-transparent background
        overlay = display.copy()
        cv2.rectangle(overlay, (10, 10), (400, 230), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, display, 0.3, 0, display)
        
        # Display counts
        license_plate_count = len(stats["LICENSE PLATE"])
        container_count = len(stats["CONTAINER"])
        total_count = license_plate_count + container_count
        
        cv2.putText(display, f"Total Unique: {total_count}", (20, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        cv2.putText(display, f"License Plates: {license_plate_count}", (20, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(display, f"Containers: {container_count}", (20, 90), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        # Display recent detections
        cv2.putText(display, "RECENT DETECTIONS:", (20, 120), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)
                   
        for i, (detection_type, value) in enumerate(recent_detections):
            y_pos = 150 + i * 30
            prefix = "🚗" if detection_type == "LICENSE PLATE" else "📦"
            count = stats[detection_type].get(value, (None, 0))[1]
            count_text = f" ({count}x)" if count > 1 else ""
            cv2.putText(display, f"{prefix} {value}{count_text}", (30, y_pos), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Show controls at the bottom
        cv2.putText(display, "d:stats | s:save | c:capture | q:quit", 
                   (10, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        # Show the frame
        cv2.imshow(window_name, display)

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    
    # Show final summary
    print("\n" + "=" * 50)
    print("FINAL STATISTICS:")
    print(f"Total unique detections: {license_plate_count + container_count}")
    print(f"  - License plates: {license_plate_count}")
    print(f"  - Containers: {container_count}")
    
    # Show most frequent detections
    if stats["LICENSE PLATE"]:
        top_plates = sorted(stats["LICENSE PLATE"].items(), key=lambda x: x[1][1], reverse=True)[:3]
        print("\nMost frequent license plates:")
        for plate, (_, count) in top_plates:
            print(f"  - {plate}: seen {count} times")
    
    if stats["CONTAINER"]:
        top_containers = sorted(stats["CONTAINER"].items(), key=lambda x: x[1][1], reverse=True)[:3]
        print("\nMost frequent containers:")
        for container, (_, count) in top_containers:
            print(f"  - {container}: seen {count} times")
    
    print("\nPress 'd' to show detailed statistics before exiting")
    print("\nPress 'Enter' to exit...")
    
    # Give one last chance to view statistics
    while True:
        key = cv2.waitKey(0) & 0xFF
        if key == ord('d'):
            show_stats(stats)
        else:
            break

if __name__ == "__main__":
    run_camera()