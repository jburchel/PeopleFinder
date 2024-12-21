// Global data store
let allData = [];

// Add this function near the top of main.js
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    main.insertBefore(errorDiv, main.firstChild);
    
    // Log to console for debugging
    console.error(message);
}

// Load and parse CSV data
async function loadCSVData() {
    try {
        const path = 'data/existing_upgs_updated.csv';
        console.log('Attempting to load CSV from:', path);
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for path: ${path}`);
        }
        
        const text = await response.text();
        console.log('CSV loaded successfully, first line:', text.split('\n')[0]);
        
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
        const response = await fetch('data/updated_uupg.csv');
        const csvText = await response.text();
        
        // Parse CSV with proper column mapping
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            // Handle quoted values that might contain commas
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                ?.map(val => val.replace(/^"|"$/g, '').trim()) || [];
            
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index] || '';
            });
            
            // Add type identifier
            entry.type = 'UUPG';
            
            return {
                name: entry[0] || '',                // Name
                pronunciation: entry[1] || '',       // Pronunciation
                country: entry[2] || '',            // Country
                population: parseInt(entry[3]) || 0, // Population
                language: entry[4] || '',           // Language
                religion: entry[5] || '',           // Religion
                latitude: parseFloat(entry[6]) || 0, // Latitude
                longitude: parseFloat(entry[7]) || 0,// Longitude
                type: 'UUPG'
            };
        });
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

        return data;
    } catch (error) {
        console.error('CSV parsing error:', error);
        throw new Error('Failed to parse CSV data');
    }
}

// Populate country dropdown
function populateCountries(data) {
    const select = document.getElementById('country');
    select.innerHTML = '<option value="">Choose a country...</option>';
    
    // Get unique countries and sort them
    const countries = [...new Set(data.map(row => row.country))].sort();
    console.log('Available countries:', countries);
    
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
    
    if (!country) return;
    
    const upgs = allData
        .filter(row => row.country === country)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`UPGs for ${country}:`, upgs);
    
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
        unit: document.querySelector('input[name="unit"]:checked').value,
        type: document.querySelector('input[name="type"]:checked').value
    };

    try {
        // Get base UPG coordinates
        const baseUPG = allData.find(upg => upg.name === formData.upg);
        if (!baseUPG) {
            throw new Error('Base UPG not found');
        }

        let results = [];

        // Fetch UUPGs if selected
        if (formData.type === 'uupg' || formData.type === 'both') {
            const uupgData = await loadUUPGData();
            const uupgResults = uupgData
                .filter(group => {
                    // Only process if we have valid coordinates
                    if (!group.latitude || !group.longitude) return false;
                    
                    const distance = calculateDistance(
                        parseFloat(baseUPG.latitude),
                        parseFloat(baseUPG.longitude),
                        group.latitude,
                        group.longitude,
                        formData.unit
                    );
                    
                    // Add distance to the group object if within radius
                    if (distance <= parseFloat(formData.radius)) {
                        group.distance = distance;
                        return true;
                    }
                    return false;
                })
                .map(group => ({
                    ...group,
                    PeopNameInCountry: group.name,
                    Pronunciation: group.pronunciation,
                    Population: group.population,
                    PrimaryLanguageName: group.language,
                    PrimaryReligion: group.religion,
                    type: 'UUPG'
                }));
            
            results = [...results, ...uupgResults];
        }

        // Fetch FPGs if selected
        if (formData.type === 'fpg' || formData.type === 'both') {
            try {
                console.log('Fetching FPG data...');
                // Build the API URL with proper parameters
                const jpUrl = new URL('https://api.joshuaproject.net/v1/peoples.json');
                jpUrl.searchParams.append('api_key', config.jpApiKey);
                jpUrl.searchParams.append('country_code', formData.country);
                jpUrl.searchParams.append('frontier_people', 1);
                
                console.log('API URL:', jpUrl.toString());
                
                const response = await fetch(jpUrl.toString());
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const fpgData = await response.json();
                console.log('FPG data received:', fpgData);
                
                const fpgResults = fpgData
                    .filter(group => {
                        if (!group.Latitude || !group.Longitude) return false;
                        
                        const distance = calculateDistance(
                            parseFloat(baseUPG.latitude),
                            parseFloat(baseUPG.longitude),
                            parseFloat(group.Latitude),
                            parseFloat(group.Longitude),
                            formData.unit
                        );
                        
                        if (distance <= parseFloat(formData.radius)) {
                            return {
                                ...group,
                                distance,
                                type: 'FPG',
                                // Map JP API fields to match our format
                                PeopNameInCountry: group.PeopNameInCountry || group.PeopleName,
                                Population: group.Population || 0,
                                PrimaryLanguageName: group.PrimaryLanguageName,
                                PrimaryReligion: group.PrimaryReligion,
                                PercentEvangelical: group.PercentEvangelical
                            };
                        }
                        return false;
                    });
                
                results = [...results, ...fpgResults];
                console.log('Combined results:', results);
            } catch (error) {
                console.error('FPG fetch error:', error);
                displayError(`Failed to fetch FPG data: ${error.message}`);
            }
        }

        // Sort results by distance
        results.sort((a, b) => a.distance - b.distance);

        // Store results in sessionStorage
        sessionStorage.setItem('searchResults', JSON.stringify({
            results,
            searchParams: formData
        }));

        // Redirect to results page
        window.location.href = 'results.html';
    } catch (error) {
        console.error('Search error:', error);
        displayError(`Search failed: ${error.message}`);
    }
}

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
    const R = unit === 'kilometers' ? 6371 : 3959; // Earth's radius in km or miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * Math.PI / 180;
}

// Initialize the page
async function init() {
    try {
        console.log('Initializing application...');
        allData = await loadCSVData();
        console.log('Data loaded, length:', allData.length);
        
        if (allData.length > 0) {
            console.log('First record:', allData[0]);
            populateCountries(allData);
            
            // Add event listeners
            const countrySelect = document.getElementById('country');
            console.log('Country select element:', countrySelect);
            
            countrySelect.addEventListener('change', (e) => {
                console.log('Country changed to:', e.target.value);
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