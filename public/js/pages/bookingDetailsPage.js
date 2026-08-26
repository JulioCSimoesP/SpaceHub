import { bookingService } from '../services/bookingService.js';
import { spaceService } from '../services/spaceService.js';
import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { Utils } from '../utils/formatters.js';

let currentBooking = null;

export async function initBookingDetailsPage(params = {}) {
    if (!params.id) {
        navigateFallback();
        return;
    }

    setupBackButton();
    await loadBookingDetails(params.id);
}

function setupBackButton() {
    const btnBack = document.querySelector('.btn-back');
    if (!btnBack) return;

    const fallbackUrl = auth.getRole() === 'host' ? '/host/bookings' : '/client/bookings';
    btnBack.setAttribute('href', fallbackUrl);
    btnBack.setAttribute('data-link', '');
}

function navigateFallback() {
    const fallbackUrl = auth.getRole() === 'host' ? '/host/bookings' : '/client/bookings';
    router.navigate(fallbackUrl);
}

async function loadBookingDetails(bookingId) {
    try {
        currentBooking = await bookingService.getBookingById(bookingId);

        renderStatusBadges(currentBooking.status);
        renderSpaceDetails(currentBooking);
        renderPaymentSummary(currentBooking);
        renderStayInformation(currentBooking);
        renderCounterpartProfile(currentBooking);
        renderPolicies(currentBooking.space?.politics || []);
        await renderAmenities(currentBooking.space?.amenities || []);
        await renderMap(currentBooking.space?.locale);
    } catch (error) {
        console.error('Erro ao carregar detalhes da reserva:', error);
        alert('Não foi possível carregar os detalhes desta reserva.');
        navigateFallback();
    }
}

function renderStatusBadges(status) {
    const statusBadges = document.querySelectorAll('.status-badge');
    const { badgeClass, statusText } = getStatusInfo(status);

    statusBadges.forEach((badge) => {
        badge.className = `status-badge ${badgeClass}`;
        badge.textContent = statusText;
    });
}

function renderSpaceDetails(booking) {
    const space = booking.space || {};
    const titleEl = document.querySelector('.space-card-header .space-title');
    const locationBadge = document.querySelector('.space-card-header .space-location-badge span');
    const viewSpaceBtn = document.querySelector('.booking-details-space-card > .btn-primary');

    if (titleEl) titleEl.textContent = space.title || 'Espaço reservado';

    const locale = space.locale || {};
    const street = locale.addressName || '';
    const number = locale.addressNumber ? `, ${locale.addressNumber}` : '';
    const neighborhood = locale.sublocality ? ` - ${locale.sublocality}` : '';
    const cityState = locale.locality ? `, ${locale.locality} - ${locale.state}` : '';
    const formattedAddress = street ? `${street}${number}${neighborhood}${cityState}` : 'Localização não informada';

    if (locationBadge) locationBadge.textContent = formattedAddress;

    if (viewSpaceBtn) {
        const spaceId = space.spaceId || space._id;
        viewSpaceBtn.setAttribute('href', `/spaces/${spaceId}`);
        viewSpaceBtn.setAttribute('data-link', '');
    }
}

function renderPaymentSummary(booking) {
    const summaryContainer = document.querySelector('.booking-details-cost-summary');
    if (!summaryContainer) return;

    const space = booking.space || {};
    const nights = calculateNights(booking.startDate, booking.endDate);

    const pricePerNight = space.price || 0;
    const subtotal = pricePerNight * nights;
    const cleaningTax = space.cleaningTax || 0;
    const serviceTax = space.serviceTax || 0;
    const total = subtotal + cleaningTax + serviceTax;

    summaryContainer.innerHTML = `
        <div class="cost-row">
            <dt class="cost-label">${Utils.formatCurrency(pricePerNight)} × ${nights} noite${nights > 1 ? 's' : ''}</dt>
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
            <dt class="cost-label">Total pago</dt>
            <dd class="cost-value">${Utils.formatCurrency(total)}</dd>
        </div>
    `;
}

function renderStayInformation(booking) {
    const space = booking.space || {};
    const infoRows = document.querySelectorAll('.booking-details-info-card .info-value');
    const nights = calculateNights(booking.startDate, booking.endDate);

    const checkinTime = space.checkinTime || '14:00';
    const checkoutTime = space.checkoutTime || '11:00';

    if (infoRows[0]) infoRows[0].textContent = `${booking.startDate} às ${checkinTime}`;
    if (infoRows[1]) infoRows[1].textContent = `${booking.endDate} às ${checkoutTime}`;
    if (infoRows[2]) infoRows[2].textContent = `${nights} dia${nights > 1 ? 's' : ''} (${nights} noite${nights > 1 ? 's' : ''})`;
}

function renderCounterpartProfile(booking) {
    const currentUserId = auth.getUser()?._id;
    const isGuest = booking.guestId?._id === currentUserId;

    // Se o usuário logado for o hóspede, exibe os dados do anfitrião; caso contrário, exibe os do hóspede
    const targetUser = isGuest ? booking.hostId : booking.guestId;
    const targetRoleLabel = isGuest ? 'Informações do anfitrião' : 'Informações do hóspede';

    const cardTitle = document.querySelector('.user-profile-card .card-title');
    const userNameEl = document.querySelector('.user-profile-name');
    const emailLink = document.querySelector('.user-contact-list a[href^="mailto:"]');
    const phoneLink = document.querySelector('.user-contact-list a[href^="tel:"]');

    if (cardTitle) cardTitle.textContent = targetRoleLabel;
    if (userNameEl) userNameEl.textContent = targetUser?.name || 'Usuário SpaceHub';

    if (emailLink) {
        const email = targetUser?.email || 'contato@spacehub.com.br';
        emailLink.textContent = email;
        emailLink.setAttribute('href', `mailto:${email}`);
    }

    if (phoneLink) {
        const phone = targetUser?.phoneNumber || 'Não informado';
        phoneLink.textContent = phone;
        phoneLink.setAttribute('href', `tel:${phone.replace(/\D/g, '')}`);
    }
}

async function renderAmenities(amenitiesList = []) {
    const container = document.querySelector('.amenities-summary-list');
    if (!container) return;

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

    const displayed = amenitiesList.slice(0, 4);
    const extraCount = amenitiesList.length - 4;

    const itemsHtml = displayed.map((item) => {
        const metaObj = metadataAmenities.find((m) => m.id === item || m.name === item || m.label === item);
        return `
            <li class="amenity-item">
                ${metaObj?.svg || defaultIcon}
                <span>${metaObj?.label || item}</span>
            </li>
        `;
    }).join('');

    const extraHtml = extraCount > 0 ? `
        <li class="amenity-item amenity-item-more">
            <span>+${extraCount} comodidade${extraCount > 1 ? 's' : ''}</span>
        </li>
    ` : '';

    container.innerHTML = itemsHtml + extraHtml;
}

function renderPolicies(policies = []) {
    const container = document.querySelector('.policies-full-list');
    if (!container) return;

    if (policies.length === 0) {
        container.innerHTML = '<li class="policy-item"><span>Nenhuma regra específica cadastrada.</span></li>';
        return;
    }

    const defaultIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
        </svg>
    `;

    container.innerHTML = policies.map((policy) => `
        <li class="policy-item">
            ${defaultIcon}
            <span>${policy}</span>
        </li>
    `).join('');
}

async function renderMap(locale = {}) {
    const mapContainer = document.getElementById('booking-details-map');
    if (!mapContainer || !window.google?.maps?.Map) return;

    const coordinates = locale.geolocation?.coordinates;
    const lat = coordinates ? coordinates[1] : -23.55052;
    const lng = coordinates ? coordinates[0] : -46.633308;

    try {
        const MapConstructor = google.maps.Map;
        const MarkerConstructor = google.maps.Marker;

        const map = new MapConstructor(mapContainer, {
            center: { lat, lng },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        new MarkerConstructor({
            position: { lat, lng },
            map: map
        });
    } catch (error) {
        console.error('Erro ao renderizar mapa da reserva:', error);
    }
}

function calculateNights(startStr, endStr) {
    if (!startStr || !endStr) return 1;

    const [d1, m1, y1] = startStr.split('/').map(Number);
    const [d2, m2, y2] = endStr.split('/').map(Number);

    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);

    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
}

function getStatusInfo(status) {
    switch (status) {
        case 'confirmed':
            return { badgeClass: 'status-confirmed', statusText: 'Confirmada' };
        case 'pending':
            return { badgeClass: 'status-pending', statusText: 'Pendente' };
        case 'canceled':
            return { badgeClass: 'status-cancelled', statusText: 'Cancelada' };
        default:
            return { badgeClass: 'status-confirmed', statusText: status || 'Confirmada' };
    }
}