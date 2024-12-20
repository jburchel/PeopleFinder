// src/js/main.js

import { config } from './config.js';

// Global variable to store loaded data
let allData = [];

// Function to render results
function renderResults(results) {
    // Implement your result rendering logic here
}

// Main function to initialize the app
async function initApp() {
    try {
        const data = await fetchData();
        console.log('Data fetched:', data);
        // Render results using the fetched data
        renderResults(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the main function
initApp();

// Function to load CSV data
async function loadCSVData() {
    try {
        const response = await fetch('./data/existing_upgs_updated.csv');
        const csvText = await response.text();
        console.log('CSV loaded:', csvText.substring(0, 200));
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading CSV:', error);
        return [];
    }
}

// Function to parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    console.log('CSV headers:', headers);
    
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header.trim()] = values[index]?.trim() || '';
        });
        return entry;
    });
    console.log('Parsed data:', data.slice(0, 2));
    return data;
}

// Function to populate country dropdown
function populateCountryDropdown(data) {
    const countrySelect = document.getElementById('country');
    countrySelect.innerHTML = '<option value="">Choose a country...</option>';
    const countries = [...new Set(data.map(row => row.country))].sort();
    console.log('Unique countries:', countries);
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

// Function to populate UPG dropdown based on selected country
function populateUPGDropdown(data, selectedCountry) {
    const upgSelect = document.getElementById('upg');
    upgSelect.innerHTML = '<option value="">Select a UPG...</option>';
    
    const upgs = data
        .filter(row => row.country === selectedCountry)
        .sort((a, b) => a.name.localeCompare(b.name));
    console.log(`UPGs for ${selectedCountry}:`, upgs);
    
    upgs.forEach(upg => {
        const option = document.createElement('option');
        option.value = upg.name;
        option.textContent = `${upg.name} (${upg.population}) [${upg.pronunciation}]`;
        upgSelect.appendChild(option);
    });
}

// Function to handle search
async function handleSearch(event) {
    event.preventDefault();
    
    const country = document.getElementById('country').value;
    const upgName = document.getElementById('upg').value;
    const radius = document.getElementById('radius').value;
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const type = document.querySelector('input[name="type"]:checked').value;

    let results = [];
    
    // Get selected UPG's coordinates
    const selectedUPG = allData.find(upg => upg.name === upgName);
    console.log('Selected UPG:', selectedUPG);
    
    if (!selectedUPG) {
        alert('Please select a UPG first');
        return;
    }

    const baseCoords = {
        lat: parseFloat(selectedUPG.latitude),
        lng: parseFloat(selectedUPG.longitude)
    };

    if (type === 'uupg' || type === 'both') {
        const uupgData = await loadUUPGData();
        const uupgResults = uupgData.filter(group => {
            return isWithinRadius(
                baseCoords,
                { lat: parseFloat(group.latitude), lng: parseFloat(group.longitude) },
                radius,
                unit
            );
        });
        results = [...results, ...uupgResults];
    }

    if (type === 'fpg' || type === 'both') {
        const fpgData = await fetchFPGData(country);
        const fpgResults = fpgData.filter(group => {
            return isWithinRadius(
                baseCoords,
                { lat: parseFloat(group.Latitude), lng: parseFloat(group.Longitude) },
                radius,
                unit
            );
        });
        results = [...results, ...fpgResults];
    }

    console.log('Search results:', results);
    // Store results and redirect to results page
    sessionStorage.setItem('searchResults', JSON.stringify(results));
    window.location.href = 'results.html';
}

// Helper function to calculate distance between coordinates
function isWithinRadius(coord1, coord2, radius, unit) {
    const R = unit === 'kilometers' ? 6371 : 3959; // Earth's radius in km or miles
    const lat1 = toRad(coord1.lat);
    const lat2 = toRad(coord2.lat);
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lng - coord1.lng);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= radius;
}

function toRad(degrees) {
    return degrees * (Math.PI/180);
}

// Initialize the form
async function initializeForm() {
    allData = await loadCSVData();
    console.log('Data loaded, length:', allData.length);
    if (allData.length > 0) {
        populateCountryDropdown(allData);
        
        // Add event listener for country selection
        document.getElementById('country').addEventListener('change', (e) => {
            const selectedCountry = e.target.value;
            console.log('Country selected:', selectedCountry);
            populateUPGDropdown(allData, selectedCountry);
        });

        // Add form submit handler
        document.getElementById('searchForm').addEventListener('submit', handleSearch);
    }
}

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeForm);

// Function to load UUPG CSV data
async function loadUUPGData() {
    try {
        const response = await fetch('./data/updated_uupg.csv');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading UUPG CSV:', error);
        return [];
    }
}

// Function to fetch FPGs from Joshua Project API
async function fetchFPGData(country) {
    try {
        const url = `https://api.joshuaproject.net/v1/people_groups.json?api_key=${config.apiKey}&frontier=1&country=${country}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching FPG data:', error);
        return [];
    }
}
