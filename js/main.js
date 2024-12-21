// Initialize Firebase for Top 100 list
firebase.initializeApp(config.firebase);
const db = firebase.database();

// Global data store
let allData = [];

// Load and parse CSV data
async function loadCSVData() {
    try {
        const response = await fetch('data/existing_upgs_updated.csv');
        const text = await response.text();
        return parseCSVData(text);
    } catch (error) {
        console.error('Error loading CSV:', error);
        alert('Failed to load data. Please try again.');
        return [];
    }
}

// Parse CSV text into array of objects
function parseCSVData(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, i) => {
                obj[header] = values[i]?.trim() || '';
                return obj;
            }, {});
        });
}

// Populate country dropdown
function populateCountries(data) {
    const select = document.getElementById('country');
    const countries = [...new Set(data.map(row => row.country))].sort();
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
    });
}

// Populate UPG dropdown based on selected country
function populateUPGs(country) {
    const select = document.getElementById('upg');
    select.innerHTML = '<option value="">Select a UPG...</option>';
    
    const upgs = allData
        .filter(row => row.country === country)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    upgs.forEach(upg => {
        const option = document.createElement('option');
        option.value = upg.name;
        option.textContent = `${upg.name} [${upg.pronunciation || 'N/A'}]`;
        select.appendChild(option);
    });
}

// Handle form submission
async function handleSearch(event) {
    event.preventDefault();
    
    const formData = {
        country: document.getElementById('country').value,
        upg: document.getElementById('upg').value,
        radius: document.getElementById('radius').value,
        unit: document.querySelector('input[name="unit"]:checked').value
    };

    // Store search parameters in sessionStorage
    sessionStorage.setItem('searchParams', JSON.stringify(formData));
    
    // Redirect to results page
    window.location.href = 'results.html';
}

// Initialize the page
async function init() {
    // Load data
    allData = await loadCSVData();
    
    if (allData.length > 0) {
        // Setup dropdowns
        populateCountries(allData);
        
        // Add event listeners
        document.getElementById('country').addEventListener('change', (e) => {
            populateUPGs(e.target.value);
        });
        
        document.getElementById('searchForm').addEventListener('submit', handleSearch);
    }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', init); 