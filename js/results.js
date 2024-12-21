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

    // Add sort button functionality
    document.querySelectorAll('.sort-button').forEach(button => {
        button.addEventListener('click', (e) => {
            // Update active button
            document.querySelectorAll('.sort-button').forEach(btn => 
                btn.classList.remove('active'));
            e.target.classList.add('active');
            
            // Sort and display results
            sortResults(results, e.target.dataset.sort);
        });
    });
});

function displaySearchSummary(params) {
    const summary = document.querySelector('.search-summary');
    summary.innerHTML = `
        <h2>Search Parameters</h2>
        <p>Country: ${params.country}</p>
        <p>Base UPG: ${params.upg}</p>
        <p>Radius: ${params.radius} ${params.unit}</p>
        <p>Total Results: ${results.length} (${
            results.filter(r => r.type === 'FPG').length} FPGs, ${
            results.filter(r => r.type === 'UUPG').length} UUPGs)</p>
    `;
}

function displayResults(results) {
    // Split results by type
    const fpgResults = results.filter(r => r.type === 'FPG');
    const uupgResults = results.filter(r => r.type === 'UUPG');

    // Display in respective columns
    document.getElementById('fpgResults').innerHTML = 
        fpgResults.map(result => createResultCard(result)).join('');
    document.getElementById('uupgResults').innerHTML = 
        uupgResults.map(result => createResultCard(result)).join('');
}

function createResultCard(result) {
    return `
        <div class="result-card ${result.type.toLowerCase()}">
            <div class="result-header">
                <h3>${result.PeopNameInCountry} 
                    <span class="pronunciation">[${result.Pronunciation || 'N/A'}]</span>
                </h3>
                <span class="distance">${result.distance.toFixed(1)} ${searchParams.unit}</span>
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
                <button class="add-to-top-100" data-group-id="${result.PeopleID3 || result.id}">
                    Add to Top 100
                </button>
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