// Initialize Firebase (using config from config.js)
firebase.initializeApp(config.firebase);
const db = firebase.database();

let top100List = [];

// Fetch Top 100 list from Firebase
async function fetchTop100() {
    try {
        const ref = db.ref('top100');
        const snapshot = await ref.once('value');
        const data = snapshot.val() || {};
        
        // Convert object to array and sort by date added
        top100List = Object.values(data)
            .sort((a, b) => b.addedDate - a.addedDate);
            
        displayTop100();
        updateListCount();
    } catch (error) {
        console.error('Error fetching Top 100:', error);
        showError('Failed to load Top 100 list. Please try again.');
    }
}

// Display Top 100 list
function displayTop100() {
    const container = document.getElementById('top100List');
    const emptyList = document.getElementById('emptyList');
    
    if (top100List.length === 0) {
        container.style.display = 'none';
        emptyList.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyList.style.display = 'none';
    
    container.innerHTML = top100List.map(group => `
        <li class="list-item">
            <div class="upg-info">
                <div class="upg-name">
                    ${group.PeopNameInCountry}
                    <span class="pronunciation">[${group.Pronunciation || 'N/A'}]</span>
                    ${group.AudioAddress ? 
                        `<button onclick="playPronunciation('${group.AudioAddress}')" class="play-button">▶</button>` 
                        : ''}
                </div>
                <div class="upg-details">
                    <p>Country: ${group.Ctry}</p>
                    <p>Population: ${group.Population.toLocaleString()}</p>
                    <p>Evangelical: ${group.PercentEvangelical}%</p>
                    <p>Primary Religion: ${group.PrimaryReligion}</p>
                </div>
            </div>
            <button onclick="removeFromTop100('${group.PeopleID3}')" class="delete-button">
                Remove
            </button>
        </li>
    `).join('');
}

// Remove item from Top 100
async function removeFromTop100(peopleId) {
    if (!confirm('Are you sure you want to remove this group from your Top 100 list?')) {
        return;
    }
    
    try {
        await db.ref('top100/' + peopleId).remove();
        top100List = top100List.filter(group => group.PeopleID3 !== peopleId);
        displayTop100();
        updateListCount();
    } catch (error) {
        console.error('Error removing from Top 100:', error);
        alert('Failed to remove from Top 100. Please try again.');
    }
}

// Sort Top 100 list
function sortTop100(criteria) {
    switch(criteria) {
        case 'population':
            top100List.sort((a, b) => b.Population - a.Population);
            break;
        case 'evangelical':
            top100List.sort((a, b) => b.PercentEvangelical - a.PercentEvangelical);
            break;
        case 'language':
            top100List.sort((a, b) => a.PrimaryLanguageName.localeCompare(b.PrimaryLanguageName));
            break;
        case 'religion':
            top100List.sort((a, b) => a.PrimaryReligion.localeCompare(b.PrimaryReligion));
            break;
    }
    displayTop100();
}

// Update list count display
function updateListCount() {
    const countElement = document.getElementById('listCount');
    if (countElement) {
        countElement.textContent = `${top100List.length}/100`;
    }
}

// Play pronunciation audio
function playPronunciation(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Failed to play pronunciation audio.');
    });
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchTop100();
    
    // Add sort listener
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortTop100(e.target.value);
        });
    }
}); 