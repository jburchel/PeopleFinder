// src/js/main.js
import * as firebase from 'firebase';
import moment from 'moment';

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
firebase.initializeApp(firebaseConfig);

// Firebase references
const database = firebase.database();

// Example function to fetch data from Firestore
async function fetchData() {
    const response = await axios.get('https://your-database-url.firebaseio.com/fpgs.json');
    return response.data;
}

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
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header.trim()] = values[index]?.trim() || '';
        });
        return entry;
    });
}

// Function to populate country dropdown
function populateCountryDropdown(data) {
    const countrySelect = document.getElementById('country');
    countrySelect.innerHTML = '<option value="">Choose a country...</option>';
    const countries = [...new Set(data.map(row => row.country))].sort();
    
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
    
    upgs.forEach(upg => {
        const option = document.createElement('option');
        option.value = upg.name;
        option.textContent = `${upg.name} (${upg.population}) [${upg.pronunciation}]`;
        upgSelect.appendChild(option);
    });
}

// Initialize the form
async function initializeForm() {
    const data = await loadCSVData();
    if (data.length > 0) {
        populateCountryDropdown(data);
        
        // Add event listener for country selection
        document.getElementById('country').addEventListener('change', (e) => {
            const selectedCountry = e.target.value;
            populateUPGDropdown(data, selectedCountry);
        });
    }
}

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeForm);
