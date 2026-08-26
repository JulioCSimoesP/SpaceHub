import { spaceService } from '../services/spaceService.js';
import { Utils } from '../utils/formatters.js';

const state = {
    allSpaces: [],
    filteredSpaces: [],
    metadataAmenities: [],
    pagination: {
        page: 1,
        itemsPerPage: 12
    },
    filters: {
        locationText: '',
        coordinates: { lat: -23.55052, lng: -46.633308 },
        radiusKm: 5,
        amenities: [],
        minPriceCents: 0,
        maxPriceCents: 1000000
    },
    mapInstance: null,
    radiusCircle: null,
    mapMarkers: []
};

export async function initExplorePage() {
    state.pagination.page = 1;
    await loadMetadata();
    setupSearchForm();
    setupFilterModal();
    setupPaginationEvents();
    await initMapAndAutocomplete();
    await fetchAndFilterSpaces();
}

async function loadMetadata() {
    try {
        const metadata = await spaceService.getMetadata();
        state.metadataAmenities = metadata.amenities || [];
        renderFilterAmenities(state.metadataAmenities);
    } catch (error) {
        console.error('Erro ao buscar comodidades:', error);
    }
}

function waitForGoogleMaps(timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (window.google?.maps?.Map) {
            return resolve(window.google.maps);
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            if (window.google?.maps?.Map) {
                clearInterval(interval);
                resolve(window.google.maps);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error('Tempo limite excedido aguardando o Google Maps API.'));
            }
        }, 50);
    });
}

function renderFilterAmenities(amenities) {
    const container = document.querySelector('.filter-amenities-grid');
    if (!container) return;

    const defaultIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
            <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path>
        </svg>
    `;

    container.innerHTML = amenities.map((item) => {
        const id = item.id || item.value || item._id || item;
        const label = item.label || item.name || item;
        const iconSvg = item.svg || defaultIcon;

        return `
            <label class="selection-card">
                <input type="checkbox" name="amenities" value="${id}" class="sr-only">
                <div class="selection-card-content">
                    <div class="selection-card-content-wrapper">
                        ${iconSvg}
                        <span class="card-text">${label}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>
                </div>
            </label>
        `;
    }).join('');
}

async function initMapAndAutocomplete() {
    const mapContainer = document.getElementById('explore-map');
    const searchInput = document.getElementById('explore-search-input');

    if (!mapContainer || !window.google || !window.google.maps) return;

    try {
        const mapsApi = await waitForGoogleMaps();

        const MapConstructor = mapsApi.Map;
        const CircleConstructor = mapsApi.Circle;
        const AutocompleteConstructor = mapsApi.places ? mapsApi.places.Autocomplete : null;

        state.mapInstance = new MapConstructor(mapContainer, {
            center: state.filters.coordinates,
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        state.radiusCircle = new CircleConstructor({
            strokeColor: '#007deb',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#007deb',
            fillOpacity: 0.12,
            map: state.mapInstance,
            center: state.filters.coordinates,
            radius: state.filters.radiusKm * 1000
        });

        if (searchInput && AutocompleteConstructor) {
            const autocomplete = new AutocompleteConstructor(searchInput, {
                componentRestrictions: { country: 'br' },
                fields: ['geometry', 'formatted_address']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry?.location) return;

                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                state.filters.coordinates = { lat, lng };
                state.filters.locationText = place.formatted_address || searchInput.value;

                updateMapCenter();
                fetchAndFilterSpaces();
            });
        }
    } catch (error) {
        console.error('Erro ao carregar mapa de exploração:', error);
    }
}

function updateMapCenter() {
    if (!state.mapInstance || !state.radiusCircle) return;

    state.mapInstance.setCenter(state.filters.coordinates);
    state.radiusCircle.setCenter(state.filters.coordinates);
    state.radiusCircle.setRadius(state.filters.radiusKm * 1000);

    const radiusLabel = document.getElementById('search-radius-val');
    if (radiusLabel) radiusLabel.textContent = `${state.filters.radiusKm} km`;
}

function setupSearchForm() {
    const searchForm = document.getElementById('form-explore-search');
    searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchAndFilterSpaces();
    });

    const mapContainer = document.getElementById('explore-map');
    const btnFullscreenMap = document.getElementById('btn-toggle-fullscreen-map');

    if (!mapContainer) return;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().catch((err) => {
                console.error(`Erro ao ativar tela cheia: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    btnFullscreenMap?.addEventListener('click', toggleFullscreen);

    document.addEventListener('fullscreenchange', () => {
        const isFullscreen = document.fullscreenElement === mapContainer;
        let closeBtn = mapContainer.querySelector('.btn-close-fullscreen-map');

        if (isFullscreen) {
            if (!closeBtn) {
                closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.className = 'btn-close-fullscreen-map';
                closeBtn.setAttribute('aria-label', 'Fechar mapa em tela cheia');
                closeBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                `;
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.exitFullscreen();
                });
                mapContainer.appendChild(closeBtn);
            }
        } else {
            closeBtn?.remove();
        }
    });
}

function setupFilterModal() {
    const modal = document.getElementById('modal-filters');
    const btnOpen = document.getElementById('btn-open-filters');
    const btnClose = document.getElementById('btn-close-filters');
    const btnReset = document.getElementById('btn-reset-filters');
    const formFilters = document.getElementById('form-advanced-filters');

    const radiusSlider = document.getElementById('filter-radius');
    const radiusDisplay = document.getElementById('radius-value-display');
    const minPriceInput = document.getElementById('filter-min-price');
    const maxPriceInput = document.getElementById('filter-max-price');

    if (!modal) return;

    btnOpen?.addEventListener('click', () => modal.classList.remove('hidden'));
    btnClose?.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    radiusSlider?.addEventListener('input', (e) => {
        if (radiusDisplay) radiusDisplay.textContent = `${e.target.value} km`;
    });

    btnReset?.addEventListener('click', () => {
        if (radiusDisplay) radiusDisplay.textContent = '5 km';
        state.filters.radiusKm = 5;
        state.filters.amenities = [];
        state.filters.minPriceCents = 0;
        state.filters.maxPriceCents = 100000;
    });

    formFilters?.addEventListener('submit', (e) => {
        e.preventDefault();

        state.filters.radiusKm = parseInt(radiusSlider?.value || '5', 10);
        state.filters.amenities = Array.from(formFilters.querySelectorAll('input[name="amenities"]:checked')).map((el) => el.value);

        const minReais = parseInt(minPriceInput?.value || '0', 10);
        const maxReais = parseInt(maxPriceInput?.value || '1000', 10);
        state.filters.minPriceCents = minReais * 100;
        state.filters.maxPriceCents = maxReais >= 1000 ? Infinity : maxReais * 100;

        updateMapCenter();
        modal.classList.add('hidden');
        state.pagination.page = 1;
        fetchAndFilterSpaces();
    });
}

async function fetchAndFilterSpaces() {
    try {
        const response = await spaceService.listSpaces();
        state.allSpaces = response.spaces || response.data || response || [];

        state.filteredSpaces = state.allSpaces.filter((space) => {
            const price = space.price || 0;
            if (price < state.filters.minPriceCents) return false;
            if (state.filters.maxPriceCents !== Infinity && price > state.filters.maxPriceCents) return false;

            if (state.filters.amenities.length > 0) {
                const spaceAmenities = space.amenities || [];
                const hasAll = state.filters.amenities.every((a) => spaceAmenities.includes(a));
                if (!hasAll) return false;
            }

            if (space.locale?.geolocation?.coordinates) {
                const [lng, lat] = space.locale.geolocation.coordinates;
                const distanceKm = calculateDistanceKm(
                    state.filters.coordinates.lat,
                    state.filters.coordinates.lng,
                    lat,
                    lng
                );
                if (distanceKm > state.filters.radiusKm) return false;
            }

            return true;
        });

        updateResultsCount();
        renderMapMarkers();
        renderCurrentPage();
    } catch (error) {
        console.error('Erro ao buscar espaços:', error);
    }
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function renderMapMarkers() {
    if (!state.mapInstance || !window.google || !window.google.maps) return;

    state.mapMarkers.forEach((m) => m.setMap(null));
    state.mapMarkers = [];

    const MarkerConstructor = google.maps.Marker;
    const InfoWindowConstructor = google.maps.InfoWindow;
    const infoWindow = new InfoWindowConstructor();

    state.filteredSpaces.forEach((space) => {
        if (!space.locale?.geolocation?.coordinates) return;

        const [lng, lat] = space.locale.geolocation.coordinates;
        const marker = new MarkerConstructor({
            position: { lat, lng },
            map: state.mapInstance,
            title: space.title
        });

        marker.addListener('click', () => {
            const content = `
                <div style="padding: 6px; font-family: sans-serif;">
                    <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${space.title}</strong>
                    <span style="color: #007deb; font-weight: bold;">${Utils.formatCurrency(space.price)} / noite</span>
                </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(state.mapInstance, marker);
        });

        state.mapMarkers.push(marker);
    });
}

function setupPaginationEvents() {
    const selectItemsPerPage = document.getElementById('items-per-page');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    selectItemsPerPage?.addEventListener('change', (e) => {
        state.pagination.itemsPerPage = parseInt(e.target.value, 10) || 12;
        state.pagination.page = 1;
        renderCurrentPage();
    });

    btnPrev?.addEventListener('click', () => {
        if (state.pagination.page > 1) {
            state.pagination.page--;
            renderCurrentPage();
            scrollToTopGrid();
        }
    });

    btnNext?.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredSpaces.length / state.pagination.itemsPerPage) || 1;
        if (state.pagination.page < totalPages) {
            state.pagination.page++;
            renderCurrentPage();
            scrollToTopGrid();
        }
    });
}

function renderCurrentPage() {
    const container = document.querySelector('.explore-spaces-grid');
    const emptyState = document.getElementById('empty-explore-state');
    const paginationNav = document.querySelector('.pagination-footer');

    if (!container || !emptyState) return;

    const totalItems = state.filteredSpaces.length;

    if (totalItems === 0) {
        emptyState.classList.remove('hidden');
        container.innerHTML = '';
        if (paginationNav) paginationNav.classList.add('hidden');
        updatePaginationInfo(0);
        return;
    }

    emptyState.classList.add('hidden');
    if (paginationNav) paginationNav.classList.remove('hidden');

    const startIndex = (state.pagination.page - 1) * state.pagination.itemsPerPage;
    const endIndex = startIndex + state.pagination.itemsPerPage;
    const pageItems = state.filteredSpaces.slice(startIndex, endIndex);

    renderSpaceCards(pageItems, container);
    updatePaginationInfo(totalItems);
    renderPaginationButtons(totalItems);
}

function renderSpaceCards(spaces, container) {
    container.innerHTML = spaces.map((space) => {
        const firstImg = space.images?.[0];
        const primaryImage = typeof firstImg === 'object' ? firstImg?.url : (firstImg || '/assets/images/foto1.png');

        const locale = space.locale || {};
        const address = locale.addressName
            ? `${locale.addressName}${locale.addressNumber ? ', ' + locale.addressNumber : ''} - ${locale.sublocality || locale.locality}`
            : (locale.locality ? `${locale.locality} - ${locale.state}` : 'Localização não informada');

        const amenities = space.amenities || [];
        const displayedAmenities = amenities.slice(0, 3);
        const extraAmenitiesCount = amenities.length - 3;

        const amenitiesHtml = displayedAmenities.map((item) => {
            const meta = state.metadataAmenities.find((m) => m.id === item || m.name === item || m.label === item);
            return `
                <li class="amenity-item">
                    ${meta?.svg || ''}
                    <span>${meta?.label || item}</span>
                </li>
            `;
        }).join('');

        const extraHtml = extraAmenitiesCount > 0 ? `
            <li class="amenity-item amenity-item-more">
                <span>+${extraAmenitiesCount} comodidade${extraAmenitiesCount > 1 ? 's' : ''}</span>
            </li>
        ` : '';

        return `
            <article class="explore-space-card" data-id="${space._id}">
                <div class="card-media">
                    <img src="${primaryImage}" alt="Foto principal: ${space.title}">
                </div>

                <div class="card-body">
                    <h2 class="space-title">${space.title}</h2>

                    <div class="space-location-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
                        </svg>
                        <span>${address}</span>
                    </div>

                    <ul class="amenities-summary-list">
                        ${amenitiesHtml}
                        ${extraHtml}
                    </ul>

                    <div class="card-footer-row">
                        <div class="space-price">
                            <span class="price-value">${Utils.formatCurrency(space.price)}</span>
                            <span class="price-period">/ noite</span>
                        </div>

                        <a href="/spaces/${space._id}" data-link class="btn-primary" aria-label="Ver detalhes de ${space.title}">
                            <span>Ver detalhes</span>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function updateResultsCount() {
    const countEl = document.getElementById('results-count');
    if (countEl) {
        countEl.innerHTML = `<strong>${state.filteredSpaces.length}</strong> espaço${state.filteredSpaces.length !== 1 ? 's' : ''} encontrado${state.filteredSpaces.length !== 1 ? 's' : ''}`;
    }
}

function updatePaginationInfo(totalItems) {
    const infoText = document.querySelector('.current-shown-items');
    if (!infoText) return;

    if (totalItems === 0) {
        infoText.textContent = '0 de 0 espaços';
        return;
    }

    const start = (state.pagination.page - 1) * state.pagination.itemsPerPage + 1;
    const end = Math.min(state.pagination.page * state.pagination.itemsPerPage, totalItems);

    infoText.textContent = `${start}-${end} de ${totalItems} espaços`;
}

function renderPaginationButtons(totalItems) {
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    const numbersContainer = document.querySelector('.page-numbers-container');

    const totalPages = Math.ceil(totalItems / state.pagination.itemsPerPage) || 1;

    if (btnPrev) btnPrev.disabled = state.pagination.page === 1;
    if (btnNext) btnNext.disabled = state.pagination.page === totalPages || totalItems === 0;

    if (!numbersContainer) return;
    numbersContainer.innerHTML = '';

    let startPage = Math.max(1, state.pagination.page - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-btn';
        btn.textContent = i;
        btn.setAttribute('aria-label', `Página ${i}`);

        if (i === state.pagination.page) {
            btn.classList.add('is-active');
            btn.setAttribute('aria-current', 'page');
        }

        btn.addEventListener('click', () => {
            state.pagination.page = i;
            renderCurrentPage();
            scrollToTopGrid();
        });

        numbersContainer.appendChild(btn);
    }
}

function scrollToTopGrid() {
    document.querySelector('.explore-results-section')?.scrollIntoView({ behavior: 'smooth' });
}