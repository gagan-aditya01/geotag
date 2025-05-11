document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadBtn = document.getElementById('upload-btn');
    const imageUpload = document.getElementById('image-upload');
    const uploadPrompt = document.getElementById('upload-prompt');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const editorSection = document.getElementById('editor-section');
    const overlayElement = document.getElementById('geotag-overlay');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Form Elements
    const locationNameInput = document.getElementById('location-name');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const useCurrentDatetime = document.getElementById('use-current-datetime');
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const overlayPositionSelect = document.getElementById('overlay-position');
    const overlayColorInput = document.getElementById('overlay-color');
    const overlayBgSelect = document.getElementById('overlay-bg');
    
    // Map & Variables
    let map;
    let marker;
    let uploadedImage = null;
    let addressDetails = {};
    
    // Initialize the date and time inputs with current values
    function initializeDateTimeInputs() {
        const now = new Date();
        const dateString = now.toISOString().split('T')[0];
        const timeString = now.toTimeString().slice(0, 5);
        
        dateInput.value = dateString;
        timeInput.value = timeString;
    }
    
    // Initialize Leaflet map
    function initMap() {
        if (map) map.remove();
        
        map = L.map('map').setView([0, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add marker on click
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            if (marker) {
                marker.setLatLng(e.latlng);
            } else {
                marker = L.marker(e.latlng).addTo(map);
            }
            
            latitudeInput.value = lat.toFixed(6);
            longitudeInput.value = lng.toFixed(6);
            
            // Try to get location name
            reverseGeocode(lat, lng);
            
            // Update overlay
            updateOverlay();
        });
    }
    
    // Reverse geocode to get location name
    async function reverseGeocode(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            if (data && data.display_name) {
                let locationName = '';
                
                if (data.address) {
                    if (data.address.city) {
                        locationName = data.address.city;
                    } else if (data.address.town) {
                        locationName = data.address.town;
                    } else if (data.address.village) {
                        locationName = data.address.village;
                    } else if (data.address.county) {
                        locationName = data.address.county;
                    }
                    
                    if (data.address.state && locationName) {
                        locationName += ', ' + data.address.state;
                    } else if (data.address.state) {
                        locationName = data.address.state;
                    }
                    
                    if (data.address.country && locationName) {
                        locationName += ', ' + data.address.country;
                    } else if (data.address.country) {
                        locationName = data.address.country;
                    }
                }
                
                if (!locationName) {
                    const parts = data.display_name.split(',');
                    if (parts.length > 2) {
                        locationName = parts.slice(0, 2).join(',');
                    } else {
                        locationName = data.display_name;
                    }
                }
                
                locationNameInput.value = locationName;
                // Store address details for overlay
                addressDetails = data.address || {};
                addressDetails.display_name = data.display_name;
            }
        } catch (error) {
            console.error('Error with reverse geocoding:', error);
        }
    }
    
    // Update the overlay with current values
    function updateOverlay() {
        const locationName = locationNameInput.value || 'Location';
        const latitude = latitudeInput.value || '0.000000';
        const longitude = longitudeInput.value || '0.000000';
        const color = overlayColorInput.value;
        const background = overlayBgSelect.value;
        let dateTimeStr = '';
        if (useCurrentDatetime.checked) {
            const now = new Date();
            dateTimeStr = now.toLocaleString('en-IN', { hour12: false, timeZoneName: 'short' });
        } else {
            if (dateInput.value && timeInput.value) {
                const date = new Date(`${dateInput.value}T${timeInput.value}`);
                dateTimeStr = date.toLocaleString('en-IN', { hour12: false, timeZoneName: 'short' });
            }
        }
        let addressLine = '';
        if (addressDetails) {
            addressLine = [
                addressDetails.road,
                addressDetails.suburb,
                addressDetails.city || addressDetails.town || addressDetails.village,
                addressDetails.state,
                addressDetails.postcode,
                addressDetails.country
            ].filter(Boolean).join(', ');
        }
        if (!addressLine && addressDetails && addressDetails.display_name) {
            addressLine = addressDetails.display_name;
        }
        
        // Use the provided image.png as the map thumbnail
        const mapThumb = `<img class='map-thumb' src='image.png' alt='Map thumbnail' />`;
        
        // Always force bottom center overlay
        overlayElement.className = 'geotag-overlay';
        overlayElement.style.color = color;
        overlayElement.innerHTML = `
            <div class="geotag-box">
                <div class="geotag-box-row">
                    <div class="geotag-map-thumb" title="Location: ${latitude}, ${longitude}">${mapThumb}</div>
                    <div class="geotag-info">
                        <div class="geotag-location">${locationName}</div>
                        <div class="geotag-address">${addressLine}</div>
                    </div>
                </div>
                <div class="geotag-coords">Lat: ${latitude}, Long: ${longitude}</div>
                <div class="geotag-datetime">${dateTimeStr}</div>
                <div class="geotag-note">Note : Captured by GPS Map Camera</div>
            </div>
        `;
    }
    
    // Update date/time inputs disabled state based on checkbox
    function updateDateTimeInputsState() {
        const isDisabled = useCurrentDatetime.checked;
        dateInput.disabled = isDisabled;
        timeInput.disabled = isDisabled;
        updateOverlay();
    }
    
    // Handle image upload
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            
            // Create image element
            const img = document.createElement('img');
            img.src = uploadedImage;
            
            // Clear preview and add image
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
            
            // Hide upload prompt, show preview and editor
            uploadPrompt.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            editorSection.classList.remove('hidden');
            
            // Initialize map
            setTimeout(initMap, 100); // Slight delay to ensure DOM is ready
            
            // Update overlay
            updateOverlay();
        };
        
        reader.readAsDataURL(file);
    }
    
    // Handle download button click
    async function handleDownloadClick() {
        if (!uploadedImage) {
            alert('Please upload an image first.');
            return;
        }
        
        try {
            // Get the image preview wrapper
            const imageWrapper = document.querySelector('.image-preview-wrapper');
            
            // Use html2canvas to capture the image with overlay
            const canvas = await html2canvas(imageWrapper, {
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            });
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'geotagged-image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
            alert('There was an error generating your image. Please try again.');
        }
    }
    
    // Reset the app
    function resetApp() {
        // Clear uploaded image
        uploadedImage = null;
        imagePreview.innerHTML = '';
        
        // Reset form values
        locationNameInput.value = '';
        latitudeInput.value = '';
        longitudeInput.value = '';
        useCurrentDatetime.checked = true;
        initializeDateTimeInputs();
        overlayPositionSelect.value = 'bottom-left';
        overlayColorInput.value = '#ffffff';
        overlayBgSelect.value = 'semi-transparent';
        
        // Reset UI
        previewContainer.classList.add('hidden');
        editorSection.classList.add('hidden');
        uploadPrompt.classList.remove('hidden');
        
        // Remove map
        if (map) map.remove();
    }
    
    // Event Listeners
    uploadBtn.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleImageUpload);
    
    // File drag and drop
    uploadPrompt.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadPrompt.classList.add('drag-over');
    });
    
    uploadPrompt.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadPrompt.classList.remove('drag-over');
    });
    
    uploadPrompt.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadPrompt.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            imageUpload.files = e.dataTransfer.files;
            handleImageUpload({ target: { files: e.dataTransfer.files } });
        }
    });
    
    // Form inputs
    locationNameInput.addEventListener('input', updateOverlay);
    latitudeInput.addEventListener('input', updateOverlay);
    longitudeInput.addEventListener('input', updateOverlay);
    useCurrentDatetime.addEventListener('change', updateDateTimeInputsState);
    dateInput.addEventListener('change', updateOverlay);
    timeInput.addEventListener('change', updateOverlay);
    overlayPositionSelect.addEventListener('change', updateOverlay);
    overlayColorInput.addEventListener('input', updateOverlay);
    overlayBgSelect.addEventListener('change', updateOverlay);
    
    // Buttons
    downloadBtn.addEventListener('click', handleDownloadClick);
    resetBtn.addEventListener('click', resetApp);
    
    // Lat/Lng manual input
    latitudeInput.addEventListener('change', function() {
        if (map && marker && !isNaN(parseFloat(latitudeInput.value)) && !isNaN(parseFloat(longitudeInput.value))) {
            const lat = parseFloat(latitudeInput.value);
            const lng = parseFloat(longitudeInput.value);
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], map.getZoom());
        }
    });
    
    longitudeInput.addEventListener('change', function() {
        if (map && marker && !isNaN(parseFloat(latitudeInput.value)) && !isNaN(parseFloat(longitudeInput.value))) {
            const lat = parseFloat(latitudeInput.value);
            const lng = parseFloat(longitudeInput.value);
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], map.getZoom());
        }
    });
    
    // Initialize the form
    initializeDateTimeInputs();
    updateDateTimeInputsState();
}); 