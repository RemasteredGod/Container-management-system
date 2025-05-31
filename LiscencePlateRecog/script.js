document.addEventListener('DOMContentLoaded', function(event) {
    // Prevent any form submission that might be implicitly created
    event.preventDefault();
    
    // Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const imageUrlInput = document.getElementById('image-url');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeBtn = document.getElementById('remove-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    const loadingElement = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');
    const noResultsElement = document.getElementById('no-results');
    const errorMessageElement = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const plateCountElement = document.getElementById('plate-count');
    const platesListElement = document.getElementById('plates-list');
    
    let currentImage = null;
    let activeTab = 'upload';

    const apiUrl = 'http://localhost:5000/recognize';
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            activeTab = tabId;
            
            // Reset the submit button state
            updateSubmitButtonState();
        });
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('dragover');
        });
    });
    
    dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    // Open file dialog when clicking on the drop area
    dropArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleImageFile(fileInput.files[0]);
        }
    });
    
    // Handle URL input
    imageUrlInput.addEventListener('input', () => {
        currentImage = {
            type: 'url',
            data: imageUrlInput.value
        };
        
        if (imageUrlInput.value) {
            previewImage.src = imageUrlInput.value;
            previewContainer.style.display = 'block';
        } else {
            previewContainer.style.display = 'none';
            currentImage = null;
        }
        
        updateSubmitButtonState();
    });
    
    // Remove image preview
    removeBtn.addEventListener('click', () => {
        previewContainer.style.display = 'none';
        previewImage.src = '';
        fileInput.value = '';
        imageUrlInput.value = '';
        currentImage = null;
        updateSubmitButtonState();
    });
    
    // Submit button - using onclick instead of addEventListener for more compatibility
    submitBtn.onclick = function(e) {
        // Triple protection against reloads
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        
        handleSubmit();
        return false; // This helps with older browsers
    };
    
    // Handle image file selection
    function handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
            
            currentImage = {
                type: 'file',
                data: e.target.result.split(',')[1] // Base64 data without the prefix
            };
            
            updateSubmitButtonState();
        };
        reader.readAsDataURL(file);
    }
    
    // Update submit button state
    function updateSubmitButtonState() {
        if (activeTab === 'upload' && currentImage?.type === 'file') {
            submitBtn.disabled = false;
        } else if (activeTab === 'url' && imageUrlInput.value.trim()) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }
    
    // Handle form submission
    async function handleSubmit() {
        // Show loading state
        loadingElement.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        noResultsElement.classList.add('hidden');
        errorMessageElement.classList.add('hidden');
        
        try {
            let requestData = {};
            
            if (activeTab === 'upload' && currentImage?.type === 'file') {
                requestData = {
                    image_source: currentImage.data,
                    is_url: false
                };
            } else if (activeTab === 'url') {
                requestData = {
                    image_source: imageUrlInput.value.trim(),
                    is_url: true
                };
            } else {
                throw new Error('No image selected');
            }
            
            // Send the request to the API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Process the results
            if (result.error) {
                throw new Error(result.error);
            }
            
            displayResults(result);
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message);
        } finally {
            loadingElement.classList.add('hidden');
        }
    }
    
    // Display results
    function displayResults(data) {
        const licensePlatesDetected = data.license_plates_detected || 0;
        
        // Update plate count
        plateCountElement.textContent = licensePlatesDetected;
        
        // Clear previous results
        platesListElement.innerHTML = '';
        
        if (licensePlatesDetected > 0 && data.plates && data.plates.length > 0) {
            // Display each license plate
            data.plates.forEach(plate => {
                if (plate.is_license_plate && plate.plate_number) {
                    const plateCard = document.createElement('div');
                    plateCard.className = 'plate-card';
                    
                    const confidencePercentage = Math.round(plate.confidence * 100);
                    
                    plateCard.innerHTML = `
                        <div class="plate-number">${plate.plate_number}</div>
                        <div class="confidence">
                            <div class="confidence-bar">
                                <div class="confidence-level" style="width: ${confidencePercentage}%"></div>
                            </div>
                            <div class="confidence-text">Confidence: ${confidencePercentage}%</div>
                        </div>
                    `;
                    
                    platesListElement.appendChild(plateCard);
                }
            });
            
            resultsContainer.classList.remove('hidden');
        } else {
            noResultsElement.classList.remove('hidden');
        }
    }
    
    // Show error message
    function showError(message) {
        errorText.textContent = message;
        errorMessageElement.classList.remove('hidden');
        loadingElement.classList.add('hidden');
    }
});