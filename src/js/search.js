import { config } from './config.js';

export async function handleSearch(event) {
    event.preventDefault();
    
    const country = document.getElementById('country').value;
    const upg = document.getElementById('upg').value;
    const radius = document.getElementById('radius').value;
    const unit = document.querySelector('input[name="unit"]:checked').value;
    const type = document.querySelector('input[name="type"]:checked').value;

    let results = [];
    
    // Get selected UPG's coordinates
    const selectedUPG = allData.find(u => u.name === upg);
    const baseCoords = {
        lat: parseFloat(selectedUPG.latitude),
        lng: parseFloat(selectedUPG.longitude)
    };

    if (type === 'uupg' || type === 'both') {
        const uupgData = await loadUUPGData();
        const uupgResults = uupgData.filter(group => {
            return isWithinRadius(
                baseCoords,
                { lat: parseFloat(group.latitude), lng: parseFloat(group.longitude) },
                radius,
                unit
            );
        });
        results = [...results, ...uupgResults];
    }

    if (type === 'fpg' || type === 'both') {
        const fpgData = await fetchFPGData(country);
        const fpgResults = fpgData.filter(group => {
            return isWithinRadius(
                baseCoords,
                { lat: parseFloat(group.Latitude), lng: parseFloat(group.Longitude) },
                radius,
                unit
            );
        });
        results = [...results, ...fpgResults];
    }

    // Store results and redirect to results page
    sessionStorage.setItem('searchResults', JSON.stringify(results));
    window.location.href = 'results.html';
} 