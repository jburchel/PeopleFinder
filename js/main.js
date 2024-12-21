// Initialize Firebase for Top 100 list
firebase.initializeApp(config.firebase);
const db = firebase.database();

// Global data store
let allData = [];

// Load and parse CSV data
async function loadCSVData() {
    try {
        console.log('Loading CSV data...');
        const response = await fetch('data/existing_upgs_updated.csv');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('CSV first line:', text.split('\n')[0]);
        
        const data = parseCSVData(text);
        console.log('Parsed data count:', data.length);
        return data;
    } catch (error) {
        console.error('Error loading CSV:', error);
        displayError(`Failed to load data: ${error.message}`);
        return [];
    }
}

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

// Parse CSV text into array of objects
function parseCSVData(csvText) {
    try {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        console.log('CSV headers:', headers);
        
        const data = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
                // Handle quoted values that might contain commas
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                    ?.map(val => val.replace(/^"|"$/g, '').trim()) || [];
                
                return headers.reduce((obj, header, i) => {
                    obj[header] = values[i] || '';
                    return obj;
                }, {});
            });

        console.log('First entry:', data[0]);
        return data;
    } catch (error) {
        console.error('CSV parsing error:', error);
        throw new Error('Failed to parse CSV data');
    }
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
        // Use the actual field names from your CSV
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
    try {
        // Load data
        allData = await loadCSVData();
        console.log('Data loaded, length:', allData.length);
        
        if (allData.length > 0) {
            // Setup dropdowns
            populateCountries(allData);
            
            // Add event listeners
            document.getElementById('country').addEventListener('change', (e) => {
                populateUPGs(e.target.value);
            });
            
            document.getElementById('searchForm').addEventListener('submit', handleSearch);
        } else {
            throw new Error('No data loaded');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        displayError('Failed to initialize application');
    }
}

// Start when page loads
document.addEventListener('DOMContentLoaded', init); 