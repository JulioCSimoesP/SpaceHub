export async function setupLocationPicker({
    searchInputId = 'address-search',
    selectedInputId = 'address-selected',
    mapContainerId = 'map-location-picker',
    initialCoords = { lat: -23.55052, lng: -46.633308 }
} = {}) {
    const searchInput = document.getElementById(searchInputId);
    const selectedInput = document.getElementById(selectedInputId);
    const mapContainer = document.getElementById(mapContainerId);

    if (!searchInput || !mapContainer || !window.google || !google.maps) {
        console.warn('Google Maps API não carregada ou elementos do DOM ausentes.');
        return null;
    }

    try {
        const { Map } = await google.maps.importLibrary('maps');
        const { Marker } = await google.maps.importLibrary('marker');
        const { Autocomplete } = await google.maps.importLibrary('places');
        const { Geocoder } = await google.maps.importLibrary('geocoding');

        const map = new google.maps.Map(mapContainer, {
            center: initialCoords,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        const marker = new google.maps.Marker({
            position: initialCoords,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        const autocomplete = new google.maps.places.Autocomplete(searchInput, {
            componentRestrictions: { country: 'br' },
            fields: ['address_components', 'geometry', 'formatted_address']
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
                alert('Não foi possível obter a localização desse endereço.');
                return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            map.setCenter({ lat, lng });
            map.setZoom(17);
            marker.setPosition({ lat, lng });

            const addressData = parseAddressComponents(place.address_components, lat, lng, place.formatted_address);
            populateHiddenAddressInputs(addressData, selectedInput);
        });

        marker.addListener('dragend', () => {
            const position = marker.getPosition();
            const lat = position.lat();
            const lng = position.lng();

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const addressData = parseAddressComponents(results[0].address_components, lat, lng, results[0].formatted_address);
                    populateHiddenAddressInputs(addressData, selectedInput);
                }
            });
        });

        return { map, marker };

    } catch (error) {
        console.error('Erro ao inicializar Google Maps:', error);
        return null;
    }
}

function parseAddressComponents(components = [], lat, lng, formattedAddress) {
    const locale = {
        addressName: '',
        addressNumber: '',
        sublocality: '',
        locality: '',
        state: '',
        country: 'Brasil',
        postalCode: '',
        latitude: lat,
        longitude: lng,
        fullFormatted: formattedAddress || ''
    };

    components.forEach((component) => {
        const types = component.types;

        if (types.includes('route')) {
            locale.addressName = component.long_name;
        } else if (types.includes('street_number')) {
            locale.addressNumber = component.long_name;
        } else if (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood')) {
            locale.sublocality = component.long_name;
        } else if (types.includes('administrative_area_level_2')) {
            locale.locality = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
            locale.state = component.short_name; // Ex: SP, RJ
        } else if (types.includes('country')) {
            locale.country = component.long_name;
        } else if (types.includes('postal_code')) {
            locale.postalCode = component.long_name.replace(/\D/g, '');
        }
    });

    return locale;
}

function populateHiddenAddressInputs(data, selectedInput) {
    if (selectedInput) {
        const displayAddress = data.addressName
            ? `${data.addressName}${data.addressNumber ? ', ' + data.addressNumber : ''} - ${data.sublocality || data.locality}`
            : data.fullFormatted;
        selectedInput.value = displayAddress;
    }

    setInputValue('#addr-name', data.addressName);
    setInputValue('#addr-number', data.addressNumber);
    setInputValue('#addr-sublocality', data.sublocality);
    setInputValue('#addr-locality', data.locality);
    setInputValue('#addr-state', data.state);
    setInputValue('#addr-country', data.country);
    setInputValue('#addr-zip', data.postalCode);
    setInputValue('#addr-lat', data.latitude);
    setInputValue('#addr-lng', data.longitude);
}

function setInputValue(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.value = value || '';
}