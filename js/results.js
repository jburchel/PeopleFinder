// Load and display results
document.addEventListener('DOMContentLoaded', () => {
    const storedData = JSON.parse(sessionStorage.getItem('searchResults'));
    if (!storedData) {
        console.error('No search results found in session storage');
        window.location.href = 'index.html';
        return;
    }

    console.log('Loaded search results:', storedData);
    const { results, searchParams } = storedData;
    
    if (!results || !results.length) {
        console.log('No results to display');
        displayError('No results found matching your search criteria.');
        return;
    }

    console.log('Displaying results:', results);
    displaySearchSummary(results, searchParams);
    displayResults(results);

    // Add sort button functionality
    document.querySelectorAll('.sort-button').forEach(button => {
        button.addEventListener('click', (e) => {
            // Update active button
            document.querySelectorAll('.sort-button').forEach(btn => 
                btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Sort and display results
            const sortedResults = sortResults(results, e.target.dataset.sort);
            displayResults(sortedResults);
        });
    });
});

function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('main').insertBefore(errorDiv, document.querySelector('main').firstChild);
}

function displaySearchSummary(results, params) {
    const summary = document.querySelector('.search-summary');
    const fpgCount = results.filter(r => r.type === 'FPG').length;
    const uupgCount = results.filter(r => r.type === 'UUPG').length;
    
    summary.innerHTML = `
        <h2>Search Parameters</h2>
        <p>Country: ${params.country}</p>
        <p>Base UPG: ${params.upg}</p>
        <p>Radius: ${params.radius} ${params.unit}</p>
        <p>Total Results: ${results.length} (${fpgCount} FPGs, ${uupgCount} UUPGs)</p>
    `;
}

function createResultCard(result, unit) {
    return `
        <div class="result-card ${result.type.toLowerCase()}">
            <div class="result-header">
                <h3>${result.PeopNameInCountry || result.name} 
                    <span class="pronunciation">[${result.Pronunciation || result.pronunciation || 'N/A'}]</span>
                </h3>
                <span class="distance">${result.distance.toFixed(1)} ${unit}</span>
            </div>
            <div class="result-details">
                <p><strong>Population:</strong> ${formatNumber(result.Population || result.population)}</p>
                <p><strong>Language:</strong> ${result.PrimaryLanguageName || result.language}</p>
                <p><strong>Religion:</strong> ${result.PrimaryReligion || result.religion}</p>
                <p><strong>Location:</strong> ${result.country || result.Ctry}</p>
                ${result.PercentEvangelical ? 
                    `<p><strong>Evangelical:</strong> ${result.PercentEvangelical}%</p>` : ''}
            </div>
            <div class="result-actions">
                <button class="add-to-top-100" data-group-id="${result.PeopleID3 || result.id}">
                    Add to Top 100
                </button>
            </div>
        </div>
    `;
}

function displayResults(results) {
    const unit = JSON.parse(sessionStorage.getItem('searchResults')).searchParams.unit;
    
    // Split results by type
    const fpgResults = results.filter(r => r.type === 'FPG');
    const uupgResults = results.filter(r => r.type === 'UUPG');

    // Display in respective columns
    document.getElementById('fpgResults').innerHTML = 
        fpgResults.map(result => createResultCard(result, unit)).join('');
    document.getElementById('uupgResults').innerHTML = 
        uupgResults.map(result => createResultCard(result, unit)).join('');
}

function sortResults(results, sortBy) {
    return [...results].sort((a, b) => {
        switch (sortBy) {
            case 'distance':
                return a.distance - b.distance;
            case 'population':
                return (b.Population || b.population || 0) - (a.Population || a.population || 0);
            case 'language':
                return (a.PrimaryLanguageName || a.language || '').localeCompare(b.PrimaryLanguageName || b.language || '');
            case 'religion':
                return (a.PrimaryReligion || a.religion || '').localeCompare(b.PrimaryReligion || b.religion || '');
            case 'evangelical':
                return (b.PercentEvangelical || 0) - (a.PercentEvangelical || 0);
            default:
                return 0;
        }
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num || 0);
} 