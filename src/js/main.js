// src/js/main.js

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
        console.log('CSV loaded:', csvText.substring(0, 200)); // Show first 200 chars
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
    console.log('Parsed data:', data.slice(0, 2)); // Show first 2 entries
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

// Initialize the form
async function initializeForm() {
    const data = await loadCSVData();
    console.log('Data loaded, length:', data.length);
    if (data.length > 0) {
        populateCountryDropdown(data);
        
        // Add event listener for country selection
        document.getElementById('country').addEventListener('change', (e) => {
            const selectedCountry = e.target.value;
            console.log('Country selected:', selectedCountry);
            populateUPGDropdown(data, selectedCountry);
        });
    }
}

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeForm);
