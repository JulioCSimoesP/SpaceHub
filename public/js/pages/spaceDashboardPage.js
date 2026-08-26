import { spaceService } from '../services/spaceService.js';
import { router } from '../core/router.js';
import { Utils } from '../utils/formatters.js';

export async function initSpaceDashboardPage() {
    setupActionButtons();
    await loadMySpaces();
}

function setupActionButtons() {
    const newSpaceBtn = document.querySelector('.btn-new-space');
    const mobileAddBtn = document.getElementById('btn-add-space-mobile');
    const emptyActionBtn = document.querySelector('.btn-empty-action');

    const setupLink = (btn) => {
        if (!btn) return;
        btn.setAttribute('href', '/host/spaces/new');
        btn.setAttribute('data-link', '');
    };

    setupLink(newSpaceBtn);
    setupLink(mobileAddBtn);
    setupLink(emptyActionBtn);
}

async function loadMySpaces() {
    const listContainer = document.querySelector('.spaces-list');
    const emptyState = document.getElementById('empty-spaces-state');

    if (!listContainer || !emptyState) return;

    try {
        const response = await spaceService.getMySpaces();
        const spaces = response.data || response.spaces || response || [];

        if (!Array.isArray(spaces) || spaces.length === 0) {
            emptyState.classList.remove('hidden');
            listContainer.innerHTML = '';
            return;
        }

        emptyState.classList.add('hidden');
        renderSpacesList(spaces, listContainer);
    } catch (error) {
        console.error('Erro ao carregar espaços:', error);
        listContainer.innerHTML = '<p class="error-message">Não foi possível carregar seus anúncios no momento.</p>';
    }
}

function renderSpacesList(spaces, container) {
    container.innerHTML = spaces.map((space) => {
        const firstImg = space.images?.[0];
        const primaryImage = typeof firstImg === 'object' ? firstImg?.url : (firstImg || '/assets/images/foto1.png');

        const formattedPrice = Utils.formatCurrency(space.price);

        const locale = space.locale || {};
        const street = locale.addressName || '';
        const number = locale.addressNumber ? `, ${locale.addressNumber}` : '';
        const neighborhoodOrCity = locale.sublocality || locale.locality || '';
        
        const address = street 
            ? `${street}${number} - ${neighborhoodOrCity}`
            : (locale.locality ? `${locale.locality} - ${locale.state}` : 'Localização não informada');

        return `
            <article class="space-crud-card" data-id="${space._id}">
                <div class="card-media">
                    <img src="${primaryImage}" alt="Foto principal: ${space.title}">
                </div>

                <div class="card-body">
                    <h2 class="space-title">${space.title}</h2>

                    <div class="space-location-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="32" height="32" fill="#000000" viewBox="0 0 256 256">
                        <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z">
                        </path>
                    </svg>
                        <span>${address}</span>
                    </div>

                    <div class="space-price">
                        <span class="price-value">${formattedPrice}</span>
                        <span class="price-period">/ noite</span>
                    </div>
                </div>

                <div class="card-actions">
                    <a href="/spaces/${space._id}" data-link class="btn-action btn-view" aria-label="Ver anúncio ${space.title}">
                        <span>Ver anúncio</span>
                    </a>

                    <a href="/host/spaces/${space._id}/edit" data-link class="btn-action btn-edit" aria-label="Editar anúncio ${space.title}">
                        <span>Editar</span>
                    </a>

                    <button type="button" class="btn-action btn-delete" data-id="${space._id}" data-title="${space.title}" aria-label="Excluir anúncio ${space.title}">
                        <span>Excluir</span>
                    </button>
                </div>
            </article>
        `;
    }).join('');

    setupDeleteListeners(container);
}

function setupDeleteListeners(container) {
    const deleteButtons = container.querySelectorAll('.btn-delete');

    deleteButtons.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');

            const confirmed = confirm(`Tem certeza de que deseja excluir o anúncio "${title}"?`);
            if (!confirmed) return;

            try {
                btn.disabled = true;
                btn.textContent = 'Excluindo...';

                await spaceService.deleteSpace(id);

                const card = btn.closest('.space-crud-card');
                card?.remove();

                if (container.children.length === 0) {
                    document.getElementById('empty-spaces-state')?.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Erro ao deletar espaço:', error);
                alert('Erro ao excluir anúncio. Tente novamente.');
                btn.disabled = false;
                btn.textContent = 'Excluir';
            }
        });
    });
}