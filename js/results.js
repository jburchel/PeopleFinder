// Load and display results
document.addEventListener('DOMContentLoaded', () => {
    const storedData = JSON.parse(sessionStorage.getItem('searchResults'));
    if (!storedData) {
        window.location.href = 'index.html';
        return;
    }

    const { results, searchParams } = storedData;
    displaySearchSummary(searchParams);
    displayResults(results);

    // Add sort functionality
    document.getElementById('sortBy').addEventListener('change', (e) => {
        sortResults(results, e.target.value);
    });
});

function displaySearchSummary(params) {
    const summary = document.querySelector('.search-summary');
    summary.innerHTML = `
        <h2>Search Parameters</h2>
        <p>Country: ${params.country}</p>
        <p>Base UPG: ${params.upg}</p>
        <p>Radius: ${params.radius} ${params.unit}</p>
        <p>Type: ${params.type.toUpperCase()}</p>
        <p>Total Results: ${results.length}</p>
    `;
}

function displayResults(results) {
    const container = document.querySelector('.results-container');
    container.innerHTML = results.map(result => createResultCard(result)).join('');
}

function createResultCard(result) {
    return `
        <div class="result-card ${result.type.toLowerCase()}">
            <div class="result-header">
                <h3>${result.PeopNameInCountry} 
                    <span class="pronunciation">[${result.Pronunciation || 'N/A'}]</span>
                    <span class="type-badge">${result.type}</span>
                </h3>
                <div class="distance">${result.distance.toFixed(1)} ${searchParams.unit}</div>
            </div>
            <div class="result-details">
                <p><strong>Population:</strong> ${formatNumber(result.Population)}</p>
                <p><strong>Language:</strong> ${result.PrimaryLanguageName}</p>
                <p><strong>Religion:</strong> ${result.PrimaryReligion}</p>
                <p><strong>Location:</strong> ${result.country || result.Ctry}</p>
                ${result.PercentEvangelical ? 
                    `<p><strong>Evangelical:</strong> ${result.PercentEvangelical}%</p>` : ''}
            </div>
            <div class="result-actions">
                <label>
                    <input type="checkbox" class="add-to-top-100" 
                           data-group-id="${result.PeopleID3 || result.id}">
                    Add to Top 100
                </label>
            </div>
        </div>
    `;
}

function sortResults(results, sortBy) {
    const sortedResults = [...results].sort((a, b) => {
        switch (sortBy) {
            case 'distance':
                return a.distance - b.distance;
            case 'population':
                return (b.Population || 0) - (a.Population || 0);
            case 'language':
                return (a.PrimaryLanguageName || '').localeCompare(b.PrimaryLanguageName || '');
            case 'religion':
                return (a.PrimaryReligion || '').localeCompare(b.PrimaryReligion || '');
            case 'type':
                return (a.type || '').localeCompare(b.type || '');
            case 'evangelical':
                return (b.PercentEvangelical || 0) - (a.PercentEvangelical || 0);
            default:
                return 0;
        }
    });

    displayResults(sortedResults);
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num || 0);
} 