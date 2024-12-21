// Get search parameters from session storage
const searchParams = JSON.parse(sessionStorage.getItem('searchParams'));
let searchResults = [];

// Initialize Firebase (using config from config.js)
firebase.initializeApp(config.firebase);
const db = firebase.database();

// Calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
    const R = unit === 'kilometers' ? 6371 : 3959; // Earth's radius in km or miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI/180);
}

// Fetch and display results
async function fetchResults() {
    try {
        // Get base UPG coordinates from CSV
        const baseUPG = await getBaseUPGData(searchParams.upg);
        
        // Fetch FPGs/UUPGs from Joshua Project API
        const apiUrl = `https://joshuaproject.net/api/v2/peoples?api_key=${config.jpApiKey}&country=${searchParams.country}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Filter and process results
        searchResults = data
            .filter(group => {
                const distance = calculateDistance(
                    baseUPG.latitude,
                    baseUPG.longitude,
                    group.Latitude,
                    group.Longitude,
                    searchParams.unit
                );
                group.distance = distance; // Add distance to group object
                return distance <= searchParams.radius;
            })
            .sort((a, b) => a.distance - b.distance);

        displayResults(searchResults);
    } catch (error) {
        console.error('Error fetching results:', error);
        showError('Failed to load results. Please try again.');
    }
}

// Display results in the table
function displayResults(results) {
    const container = document.getElementById('resultsList');
    container.innerHTML = results.map(group => `
        <li class="result-item">
            <div class="group-info">
                <h3>${group.PeopNameInCountry} 
                    <span class="pronunciation">[${group.Pronunciation || 'N/A'}]</span>
                    ${group.AudioAddress ? 
                        `<button onclick="playPronunciation('${group.AudioAddress}')" class="play-button">▶</button>` 
                        : ''}
                </h3>
                <p>Distance: ${group.distance.toFixed(1)} ${searchParams.unit}</p>
                <p>Population: ${group.Population.toLocaleString()}</p>
                <p>Evangelical: ${group.PercentEvangelical}%</p>
            </div>
            <button onclick="addToTop100('${group.PeopleID3}')" class="add-button">
                Add to Top 100
            </button>
        </li>
    `).join('');
}

// Add to Top 100 list
async function addToTop100(peopleId) {
    try {
        const ref = db.ref('top100/' + peopleId);
        await ref.set(searchResults.find(g => g.PeopleID3 === peopleId));
        alert('Added to Top 100 list!');
    } catch (error) {
        console.error('Error adding to Top 100:', error);
        alert('Failed to add to Top 100. Please try again.');
    }
}

// Sort results
function sortResults(criteria) {
    switch(criteria) {
        case 'distance':
            searchResults.sort((a, b) => a.distance - b.distance);
            break;
        case 'population':
            searchResults.sort((a, b) => b.Population - a.Population);
            break;
        case 'evangelical':
            searchResults.sort((a, b) => b.PercentEvangelical - a.PercentEvangelical);
            break;
        // Add other sorting options as needed
    }
    displayResults(searchResults);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchResults();
    
    // Add sort listener
    document.getElementById('sort').addEventListener('change', (e) => {
        sortResults(e.target.value);
    });
}); 