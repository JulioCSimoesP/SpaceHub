import { bookingService } from '../services/bookingService.js';
import { auth } from '../core/auth.js';

let allBookings = [];

export async function initBookingDashboardPage() {
    allBookings = [];
    adaptHeaderByRole();
    setupDateFilters();
    await loadBookings();
}

function adaptHeaderByRole() {
    const role = auth.getRole();
    const pageTitle = document.querySelector('.page-title');
    const pageDescription = document.querySelector('.page-description');

    if (role === 'host') {
        if (pageTitle) pageTitle.textContent = 'Reservas dos meus espaços';
        if (pageDescription) pageDescription.textContent = 'Acompanhe as reservas realizadas pelos clientes nos seus imóveis.';
    } else {
        if (pageTitle) pageTitle.textContent = 'Minhas reservas';
        if (pageDescription) pageDescription.textContent = 'Veja o histórico e status de todas as suas viagens e estadias.';
    }
}

async function loadBookings() {
    const listContainer = document.querySelector('.booking-dashboard-list');
    const emptyState = document.getElementById('empty-state-booking-dashboard');

    if (!listContainer || !emptyState) return;

    try {
        const response = await bookingService.listMyBookings();
        allBookings = response.bookings || response.data || response || [];

        applyFilters();
    } catch (error) {
        console.error('Erro ao carregar reservas:', error);
        listContainer.innerHTML = '<p class="error-message">Não foi possível carregar as reservas no momento.</p>';
    }
}

function setupDateFilters() {
    const dateFromInput = document.getElementById('filter-date-from');
    const dateToInput = document.getElementById('filter-date-to');

    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    if (dateFromInput && !dateFromInput.value) {
        dateFromInput.value = startOfYear;
    }

    if (dateToInput && !dateToInput.value) {
        dateToInput.value = endOfYear;
    }

    dateFromInput?.addEventListener('change', applyFilters);
    dateToInput?.addEventListener('change', applyFilters);
}

function applyFilters() {
    const dateFromInput = document.getElementById('filter-date-from');
    const dateToInput = document.getElementById('filter-date-to');
    const listContainer = document.querySelector('.booking-dashboard-list');
    const emptyState = document.getElementById('empty-state-booking-dashboard');

    if (!listContainer || !emptyState) return;

    const fromVal = dateFromInput?.value;
    const toVal = dateToInput?.value;

    let filtered = [...allBookings];

    if (fromVal) {
        const fromDate = new Date(`${fromVal}T00:00:00`);
        filtered = filtered.filter((b) => {
            const bookingStart = parseDDMMAAAA(b.startDate);
            return bookingStart >= fromDate;
        });
    }

    if (toVal) {
        const toDate = new Date(`${toVal}T23:59:59`);
        filtered = filtered.filter((b) => {
            const bookingEnd = parseDDMMAAAA(b.endDate);
            return bookingEnd <= toDate;
        });
    }

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');
    renderBookingsList(filtered, listContainer);
}

function parseDDMMAAAA(dateStr) {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
}

function renderBookingsList(bookings, container) {
    container.innerHTML = bookings.map((booking) => {
        const space = booking.space || {};
        const firstImg = space.images?.[0];
        const primaryImage = typeof firstImg === 'object' ? firstImg?.url : ('/assets/images/foto1.png');

        const locale = space.locale || {};
        const street = locale.addressName || '';
        const number = locale.addressNumber ? `, ${locale.addressNumber}` : '';
        const neighborhoodOrCity = locale.sublocality || locale.locality || '';
        const address = street 
            ? `${street}${number} - ${neighborhoodOrCity}`
            : (locale.locality ? `${locale.locality} - ${locale.state}` : 'Localização não informada');

        const { badgeClass, statusText } = getStatusInfo(booking.status);

        return `
            <article class="booking-dashboard-card-item" data-id="${booking._id}">
                <div class="card-media">
                    <img src="${primaryImage}" alt="Foto do imóvel: ${space.title || 'Espaço'}">
                </div>

                <div class="card-body">
                    <h2 class="space-title">${space.title || 'Título não informado'}</h2>

                    <div class="space-location-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="32" height="32" fill="#000000" viewBox="0 0 256 256">
                            <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
                        </svg>
                        <span>${address}</span>
                    </div>

                    <dl class="booking-stay-dates">
                        <div class="stay-date-row">
                            <dt class="stay-label">Check-in:</dt>
                            <dd class="stay-value">${booking.startDate}</dd>
                        </div>
                        <div class="stay-date-row">
                            <dt class="stay-label">Check-out:</dt>
                            <dd class="stay-value">${booking.endDate}</dd>
                        </div>
                    </dl>

                    <div class="booking-status-wrapper">
                        <span class="status-badge ${badgeClass}">${statusText}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <a href="/bookings/${booking._id}" data-link class="btn-primary" aria-label="Ver detalhes da reserva para ${space.title || 'este imóvel'}">
                        <span>Ver detalhes</span>
                    </a>
                </div>
            </article>
        `;
    }).join('');
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
            return { badgeClass: 'status-pending', statusText: status || 'Pendente' };
    }
}