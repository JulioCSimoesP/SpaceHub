import { spaceService } from '../services/spaceService.js';
import { bookingService } from '../services/bookingService.js';
import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { Utils } from '../utils/formatters.js';

let currentSpace = null;

export async function initSpaceDetailsPage(params = {}) {
    if (!params.id) {
        router.navigate('/host/spaces');
        return;
    }

    setupBackButton();
    await loadSpaceDetails(params.id);
}

function setupBackButton() {
    const btnBack = document.querySelector('.btn-back');
    if (!btnBack) return;

    const fallback = auth.getRole() === 'host' ? '/host/spaces' : '/client/explore';
    btnBack.setAttribute('href', fallback);
    btnBack.setAttribute('data-link', '');
}

async function loadSpaceDetails(spaceId) {
    try {
        const response = await spaceService.getSpaceById(spaceId);
        currentSpace = response.space || response.data || response;

        renderBasicInfo(currentSpace);
        renderGallery(currentSpace.images || []);
        await renderAmenitiesAndPolicies(currentSpace);
        renderBookingCard(currentSpace);
        await renderMap(currentSpace.locale);
    } catch (error) {
        console.error('Erro ao carregar detalhes do espaço:', error);
        alert('Não foi possível carregar as informações deste espaço.');
        const fallback = auth.getRole() === 'host' ? '/host/spaces' : '/client/explore';
        router.navigate(fallback);
    }
}

function renderBasicInfo(space) {
    const pageTitle = document.querySelector('.page-title');
    const headerAddress = document.querySelector('.space-location-badge span');
    const descriptionText = document.querySelector('.space-description-text');
    const scheduleTimes = document.querySelectorAll('.schedule-time');
    const fullAddress = document.querySelector('.space-full-address');

    if (pageTitle) pageTitle.textContent = space.title || 'Espaço';
    if (descriptionText) descriptionText.textContent = space.description || '';

    const locale = space.locale || {};
    const street = locale.addressName || '';
    const number = locale.addressNumber ? `, ${locale.addressNumber}` : '';
    const neighborhood = locale.sublocality ? ` - ${locale.sublocality}` : '';
    const cityState = locale.locality ? `${locale.locality}${locale.state ? ' - ' + locale.state : ''}` : '';
    const formattedCep = locale.postalCode ? locale.postalCode.replace(/^(\d{5})(\d{3})$/, '$1-$2') : '';

    const shortAddress = street ? `${street}${number}${neighborhood}` : cityState;
    if (headerAddress) headerAddress.textContent = shortAddress;

    if (fullAddress) {
        fullAddress.innerHTML = `
            ${street}${number}${neighborhood}, ${cityState}<br>
            CEP: ${formattedCep || 'Não informado'}
        `;
    }

    if (scheduleTimes[0]) scheduleTimes[0].textContent = `A partir das ${space.checkinTime || '14:00'}`;
    if (scheduleTimes[1]) scheduleTimes[1].textContent = `Até as ${space.checkoutTime || '11:00'}`;
}

function renderGallery(images) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    if (images.length === 0) {
        galleryGrid.innerHTML = `
            <a href="/assets/images/foto1.png" class="gallery-item gallery-item-main" data-fancybox="space-gallery" data-caption="Foto do espaço">
                <img src="/assets/images/foto1.png" alt="Foto do espaço">
            </a>
        `;
        return;
    }

    const firstImage = typeof images[0] === 'object' ? images[0].url : images[0];
    const total = images.length;

    let html = `
        <a href="${firstImage}" class="gallery-item gallery-item-main" data-fancybox="space-gallery" data-caption="Foto principal: ${currentSpace.title}">
            <img src="${firstImage}" alt="Foto principal: ${currentSpace.title}">
        </a>
    `;

    if (total >= 2) {
        const img2 = typeof images[1] === 'object' ? images[1].url : images[1];
        html += `
            <a href="${img2}" class="gallery-item" data-fancybox="space-gallery" data-caption="Foto 2: ${currentSpace.title}">
                <img src="${img2}" alt="Foto 2: ${currentSpace.title}">
            </a>
        `;
    }

    if (total >= 3) {
        const img3 = typeof images[2] === 'object' ? images[2].url : images[2];
        html += `
            <a href="${img3}" class="gallery-item" data-fancybox="space-gallery" data-caption="Foto 3: ${currentSpace.title}">
                <img src="${img3}" alt="Foto 3: ${currentSpace.title}">
            </a>
        `;
    }

    if (total >= 4) {
        const img4 = typeof images[3] === 'object' ? images[3].url : images[3];
        const extraCount = total - 4;
        html += `
            <a href="${img4}" class="gallery-item ${extraCount > 0 ? 'gallery-item-more' : ''}" data-fancybox="space-gallery" data-caption="Foto 4: ${currentSpace.title}">
                <img src="${img4}" alt="Foto 4: ${currentSpace.title}">
                ${extraCount > 0 ? `<div class="gallery-more-overlay"><span>+${extraCount} foto${extraCount > 1 ? 's' : ''}</span></div>` : ''}
            </a>
        `;
    }

    for (let i = 4; i < total; i++) {
        const img = typeof images[i] === 'object' ? images[i].url : images[i];
        html += `<a href="${img}" class="hidden" data-fancybox="space-gallery" data-caption="Foto ${i + 1}: ${currentSpace.title}"></a>`;
    }

    galleryGrid.innerHTML = html;

    if (window.Fancybox) {
        Fancybox.bind('[data-fancybox="space-gallery"]', {
            Thumbs: { type: 'modern' }
        });
    }
}

async function renderAmenitiesAndPolicies(space) {
    const amenitiesContainer = document.getElementById('amenities-list-object');
    const policiesContainer = document.getElementById('policies-list-object');
    const btnToggleAmenities = document.getElementById('btn-toggle-amenities');
    const btnTogglePolicies = document.getElementById('btn-toggle-policies');

    let metadataAmenities = [];
    try {
        const meta = await spaceService.getMetadata();
        metadataAmenities = meta.amenities || [];
    } catch {
        metadataAmenities = [];
    }

    const defaultIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
            <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path>
        </svg>
    `;

    // 1. Renderiza Comodidades
    if (amenitiesContainer) {
        const amenities = space.amenities || [];
        amenitiesContainer.innerHTML = amenities.map((item, index) => {
            const metaObj = metadataAmenities.find((m) => m.id === item || m.name === item || m.label === item);
            const iconSvg = metaObj?.svg || defaultIcon;
            const isExtra = index >= 4;

            return `
                <li class="amenity-item ${isExtra ? 'extra-item hidden' : ''}">
                    ${iconSvg}
                    <span>${metaObj?.label || item}</span>
                </li>
            `;
        }).join('');

        setupToggleExpand(btnToggleAmenities, amenitiesContainer, amenities.length > 4);
    }

    // 2. Renderiza Políticas
    if (policiesContainer) {
        const policies = space.politics || [];
        policiesContainer.innerHTML = policies.map((policy, index) => {
            const isExtra = index >= 3;
            return `
                <li class="policy-item ${isExtra ? 'extra-item hidden' : ''}">
                    ${defaultIcon}
                    <span>${policy}</span>
                </li>
            `;
        }).join('');

        setupToggleExpand(btnTogglePolicies, policiesContainer, policies.length > 3);
    }
}

function setupToggleExpand(btn, container, hasExtra) {
    if (!btn) return;
    if (!hasExtra) {
        btn.classList.add('hidden');
        return;
    }

    btn.classList.remove('hidden');
    btn.onclick = () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        const extraItems = container.querySelectorAll('.extra-item');

        extraItems.forEach((item) => item.classList.toggle('hidden', isExpanded));
        btn.setAttribute('aria-expanded', (!isExpanded).toString());
        btn.querySelector('span').textContent = isExpanded ? 'Mostrar mais' : 'Mostrar menos';
    };
}

function renderBookingCard(space) {
    const isHost = auth.getRole() === 'host';
    const isOwner = space.host?._id === auth.getUser()?._id || space.host === auth.getUser()?._id;

    const priceEl = document.querySelector('.booking-price');
    const datesGrid = document.querySelector('.booking-dates-grid');
    const submitBtn = document.getElementById('btn-submit-booking');
    const checkinInput = document.getElementById('booking-checkin');
    const checkoutInput = document.getElementById('booking-checkout');

    if (priceEl) priceEl.textContent = Utils.formatCurrency(space.price);

    if (isHost || isOwner) {
        if (datesGrid) datesGrid.classList.add('hidden');
        if (submitBtn) submitBtn.classList.add('hidden');
        updateCostSummary(space, 1);
        return;
    }

    if (datesGrid) datesGrid.classList.remove('hidden');
    if (submitBtn) submitBtn.classList.remove('hidden');

    const todayStr = new Date().toISOString().split('T')[0];
    if (checkinInput) checkinInput.min = todayStr;
    if (checkoutInput) checkoutInput.min = todayStr;

    const handleDateChange = () => {
        const checkinVal = checkinInput.value;
        const checkoutVal = checkoutInput.value;

        if (checkinVal && checkoutInput) {
            const nextDay = new Date(checkinVal);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutInput.min = nextDay.toISOString().split('T')[0];
        }

        if (checkinVal && checkoutVal) {
            const start = new Date(`${checkinVal}T00:00:00`);
            const end = new Date(`${checkoutVal}T00:00:00`);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                updateCostSummary(space, diffDays);
                return;
            }
        }

        updateCostSummary(space, 1);
    };

    checkinInput?.addEventListener('change', handleDateChange);
    checkoutInput?.addEventListener('change', handleDateChange);

    updateCostSummary(space, 1);
    setupBookingFormSubmit(space);
}

function updateCostSummary(space, nights) {
    const summaryContainer = document.querySelector('.space-booking-cost-summary');
    if (!summaryContainer) return;

    const isHost = auth.getRole() === 'host';
    const isOwner = space.host?._id === auth.getUser()?._id || space.host === auth.getUser()?._id;

    const cleaningTax = space.cleaningTax || 0;
    const serviceTax = space.serviceTax || 0;

    if (isHost || isOwner) {
        summaryContainer.innerHTML = `
            <div class="cost-row">
                <dt class="cost-label">Taxa de limpeza</dt>
                <dd class="cost-value">${Utils.formatCurrency(cleaningTax)}</dd>
            </div>
            <div class="cost-row">
                <dt class="cost-label">Taxa de serviço</dt>
                <dd class="cost-value">${Utils.formatCurrency(serviceTax)}</dd>
            </div>
        `;
        return;
    }

    const nightPrice = space.price || 0;
    const subtotal = nightPrice * nights;
    const total = subtotal + cleaningTax + serviceTax;

    summaryContainer.innerHTML = `
        <div class="cost-row">
            <dt class="cost-label">${Utils.formatCurrency(nightPrice)} × ${nights} noite${nights > 1 ? 's' : ''}</dt>
            <dd class="cost-value">${Utils.formatCurrency(subtotal)}</dd>
        </div>
        <div class="cost-row">
            <dt class="cost-label">Taxa de limpeza</dt>
            <dd class="cost-value">${Utils.formatCurrency(cleaningTax)}</dd>
        </div>
        <div class="cost-row">
            <dt class="cost-label">Taxa de serviço</dt>
            <dd class="cost-value">${Utils.formatCurrency(serviceTax)}</dd>
        </div>
        <div class="cost-row cost-total">
            <dt class="cost-label">Total</dt>
            <dd class="cost-value">${Utils.formatCurrency(total)}</dd>
        </div>
    `;
}

function formatDateToDDMMAAAA(isoStr) {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
}

function parseDDMMAAAAToDate(dateStr) {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
}

function checkDatesOverlap(startA, endA, startB, endB) {
    return startA < endB && endA > startB;
}

function setupBookingFormSubmit(space, existingBookings = []) {
    const form = document.getElementById('form-booking');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentUser = auth.getUser();
        if (!currentUser) {
            alert('Você precisa estar conectado para realizar uma reserva.');
            router.navigate('/auth/login');
            return;
        }

        const checkinVal = form.checkin.value;
        const checkoutVal = form.checkout.value;

        if (!checkinVal || !checkoutVal) {
            alert('Selecione as datas de check-in e check-out.');
            return;
        }

        const selectedStart = new Date(`${checkinVal}T00:00:00`);
        const selectedEnd = new Date(`${checkoutVal}T00:00:00`);

        if (selectedEnd <= selectedStart) {
            alert('A data de check-out deve ser posterior à data de check-in.');
            return;
        }

        const hasLocalConflict = existingBookings.some((b) => {
            if (b.status === 'canceled') return false;
            const bStart = parseDDMMAAAAToDate(b.startDate);
            const bEnd = parseDDMMAAAAToDate(b.endDate);
            return checkDatesOverlap(selectedStart, selectedEnd, bStart, bEnd);
        });

        if (hasLocalConflict) {
            alert('Este espaço já possui uma reserva ativa para o período selecionado. Por favor, escolha outras datas.');
            return;
        }

        const submitBtn = document.getElementById('btn-submit-booking');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processando reserva...';

        try {
            const startDateFormatted = formatDateToDDMMAAAA(checkinVal);
            const endDateFormatted = formatDateToDDMMAAAA(checkoutVal);

            const response = await bookingService.createBooking({
                spaceId: space._id,
                startDate: startDateFormatted,
                endDate: endDateFormatted
            });

            const createdBooking = response.booking || response.data || response;
            const newBookingId = createdBooking._id || createdBooking.id;

            alert('Reserva realizada com sucesso!');

            if (newBookingId) {
                router.navigate(`/bookings/${newBookingId}`);
            } else {
                router.navigate('/client/bookings');
            }
        } catch (error) {
            console.error('Erro ao realizar reserva:', error);
            const msg = error.response?.data?.message || 'Falha ao processar reserva. Tente novamente.';
            alert(msg);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Realizar reserva';
        }
    });
}

async function renderMap(locale = {}) {
    const mapContainer = document.getElementById('space-map');
    if (!mapContainer || !window.google) return;

    const coordinates = locale.geolocation?.coordinates;
    const lat = coordinates ? coordinates[1] : -23.55052;
    const lng = coordinates ? coordinates[0] : -46.633308;

    try {
        const { Map } = await google.maps.importLibrary('maps');
        const { Marker } = await google.maps.importLibrary('marker');

        const map = new Map(mapContainer, {
            center: { lat, lng },
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        new Marker({
            position: { lat, lng },
            map: map
        });
    } catch (error) {
        console.error('Erro ao renderizar mapa de detalhes:', error);
    }
}