# 📍 GeoTag Overlay Web App

A lightweight web application that allows users to upload any image and add customizable **geotag overlays** (location, coordinates, timestamp) before downloading the final version. Useful for social media, reports, hackathons, or field documentation.

## 🚀 Features

- Upload any image
- Select geolocation using a map (Leaflet.js)
- Input or auto-detect date and time
- Add customizable geotag overlay:  
  - Address / City  
  - Latitude / Longitude  
  - Date & Time  
- Preview overlay on image
- Download geotagged image as PNG
- Fully client-side (no server required)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Libraries Used**:
  - [Leaflet.js](https://leafletjs.com/) – for interactive maps
  - [html2canvas](https://html2canvas.hertzen.com/) – for converting HTML + overlay into downloadable image
  - [Nominatim API](https://nominatim.org/release-docs/latest/api/Search/) – reverse geocode Lat/Lng to location

## 🔧 How to Use

1. Open `index.html` in your browser
2. Click "Browse Files" or drag and drop an image
3. Use the map to select a location (or manually input coordinates)
4. Customize date/time and overlay appearance
5. Click "Download Image" to save the result

## 💻 Development

This project is built with vanilla HTML, CSS, and JavaScript. No build tools are required.

### Project Structure

```
/
├── index.html       # Main HTML structure
├── styles.css       # CSS styling
├── script.js        # JavaScript functionality
└── README.md        # Project documentation
```

### Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. Make changes to files as needed

## 📋 Notes

- This app runs entirely in the browser - no data is uploaded to any server
- For the reverse geocoding to work properly, the app should be accessed via a server (localhost or hosted) rather than directly opening the HTML file

## 📜 License

MIT License 