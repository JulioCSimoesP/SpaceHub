import { spaceService } from '../services/spaceService.js';
import { uploadService } from '../services/uploadService.js';
import { router } from '../core/router.js';
import { Utils } from '../utils/formatters.js';
import { setupLocationPicker } from '../utils/map.js';

let selectedFiles = [];
let existingImages = [];

const DEFAULT_ICON_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256">
        <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path>
    </svg>
`;

const CHECK_ICON_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="32" height="32"
        fill="#000000" viewBox="0 0 256 256">
        <path
            d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z">
        </path>
    </svg>
`;

export async function initSpaceFormPage(params = {}) {
    selectedFiles = [];
    existingImages = [];

    setupCancelButtons();
    setupCurrencyMasks();
    setupPhotoUpload();
    setupFormSubmit(params.id);
    
    await setupLocationPicker();

    await loadMetadataOptions();

    if (params.id) {
        await loadSpaceDataForEdit(params.id);
    }
}

async function loadMetadataOptions() {
    const amenitiesContainer = document.querySelectorAll('.selection-cards-grid')[0];
    const politicsContainer = document.querySelectorAll('.selection-cards-grid')[1];

    try {
        const metadata = await spaceService.getMetadata();
        const amenities = metadata.amenities || [];
        const politics = metadata.politics || [];

        if (amenitiesContainer) {
            amenitiesContainer.innerHTML = amenities.map((item) => renderSelectionCard(item, 'amenities')).join('');
        }

        if (politicsContainer) {
            politicsContainer.innerHTML = politics.map((item) => renderSelectionCard(item, 'politics')).join('');
        }
    } catch (error) {
        console.error('Erro ao buscar metadados de comodidades/políticas:', error);
    }
}

function renderSelectionCard(item, groupName) {
    const id = item.id || item.value || item._id || item;
    const label = item.label || item.name || item;
    const iconSvg = item.svg || DEFAULT_ICON_SVG;

    return `
        <label class="selection-card">
            <input type="checkbox" name="${groupName}" value="${id}" class="sr-only">
            <div class="selection-card-content">
                <div class="selection-card-content-wrapper">
                    ${iconSvg}
                    <span class="card-text">${label}</span>
                </div>
                ${CHECK_ICON_SVG}
            </div>
        </label>
    `;
}

function setupCancelButtons() {
    const cancelButtons = document.querySelectorAll('.space-form-header-actions a, .space-form-mobile-actions a');
    cancelButtons.forEach((btn) => {
        btn.setAttribute('href', '/host/spaces');
        btn.setAttribute('data-link', '');
    });
}

function setupCurrencyMasks() {
    const currencyInputs = ['#price-per-night', '#cleaning-tax', '#service-tax'];

    currencyInputs.forEach((selector) => {
        const input = document.querySelector(selector);
        if (!input) return;

        if (!input.value) {
            input.value = Utils.formatCurrency(0);
        }

        input.addEventListener('input', (event) => handleAmountInput(event.target));
        input.addEventListener('keydown', (event) => handleAmountKeydown(event));
        
        input.addEventListener('click', (event) => {
            resetAmountIfEmpty(event.target);
            forceCursorToEnd(event.target);
        });

        input.addEventListener('focus', (event) => {
            resetAmountIfEmpty(event.target);
            forceCursorToEnd(event.target);
        });
    });
}

function handleAmountInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');

    if (value === '') {
        inputElement.value = Utils.formatCurrency(0);
        return;
    }

    const cents = parseInt(value, 10);
    inputElement.value = Utils.formatCurrency(cents);
    forceCursorToEnd(inputElement);
}

function handleAmountKeydown(event) {
    if (['Backspace', 'Delete', 'Tab', 'Enter'].includes(event.key)) {
        return;
    }

    if (event.ctrlKey || event.metaKey) {
        return;
    }

    const forbiddenKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
    if (forbiddenKeys.includes(event.key)) {
        event.preventDefault();
        return;
    }

    if (!/^\d$/.test(event.key)) {
        event.preventDefault();
    }
}

function resetAmountIfEmpty(inputElement) {
    if (!inputElement.value || inputElement.value.trim() === '') {
        inputElement.value = Utils.formatCurrency(0);
    }
}

function forceCursorToEnd(inputElement) {
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
}

function setupPhotoUpload() {
    const fileInput = document.getElementById('space-photos');
    const previewGrid = document.getElementById('photos-preview-grid');

    if (!fileInput || !previewGrid) return;

    previewGrid.innerHTML = '';
    updatePhotoCounter();

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        const totalPhotos = existingImages.length + selectedFiles.length + files.length;

        if (totalPhotos > 12) {
            alert('Você pode selecionar no máximo 12 fotos para o espaço.');
            fileInput.value = '';
            return;
        }

        files.forEach((file) => {
            selectedFiles.push(file);
        });

        renderPreviews();
        fileInput.value = '';
    });
}

function renderPreviews() {
    const previewGrid = document.getElementById('photos-preview-grid');
    if (!previewGrid) return;

    previewGrid.innerHTML = '';

    existingImages.forEach((image, index) => {
        const imgSrc = typeof image === 'string' ? image : image.url;

        const item = createPreviewElement(imgSrc, `Foto salva ${index + 1}`, () => {
            existingImages.splice(index, 1);
            renderPreviews();
        });
        previewGrid.appendChild(item);
    });

    selectedFiles.forEach((file, index) => {
        const objectUrl = URL.createObjectURL(file);
        const item = createPreviewElement(objectUrl, `Nova foto ${index + 1}`, () => {
            URL.revokeObjectURL(objectUrl);
            selectedFiles.splice(index, 1);
            renderPreviews();
        });
        previewGrid.appendChild(item);
    });

    updatePhotoCounter();
}

function createPreviewElement(src, altText, onRemove) {
    const div = document.createElement('div');
    div.className = 'photo-preview-item';

    div.innerHTML = `
        <img src="${src}" alt="${altText}">
        <button type="button" class="btn-remove-photo" aria-label="Remover foto ${altText}">
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
            </svg>
        </button>
    `;

    div.querySelector('.btn-remove-photo').addEventListener('click', onRemove);
    return div;
}

function updatePhotoCounter() {
    const counter = document.getElementById('photos-counter');
    if (!counter) return;

    const total = existingImages.length + selectedFiles.length;
    counter.textContent = `${total}/12`;
}

function setupFormSubmit(spaceId) {
    const form = document.getElementById('form-create-space');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const totalPhotos = existingImages.length + selectedFiles.length;
        if (totalPhotos === 0) {
            alert('Por favor, adicione ao menos uma foto do espaço.');
            return;
        }

        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach((btn) => {
            btn.disabled = true;
            btn.textContent = spaceId ? 'Salvando...' : 'Criando espaço...';
        });

        try {
            let uploadedImages = [];

            if (selectedFiles.length > 0) {
                const uploadResponse = await uploadService.uploadImages(selectedFiles);
                uploadedImages = uploadResponse.images || [];
            }

            const allImages = [...existingImages, ...uploadedImages];

            const amenities = Array.from(form.querySelectorAll('input[name="amenities"]:checked')).map((el) => el.value);
            const politics = Array.from(form.querySelectorAll('input[name="politics"]:checked')).map((el) => el.value);

            const payload = {
                title: form.title.value.trim(),
                description: form.description.value.trim(),
                checkinTime: form.checkinTime.value,
                checkoutTime: form.checkoutTime.value,
                price: Utils.parseCurrency(form.pricePerNight.value),
                cleaningTax: Utils.parseCurrency(form.cleaningTax.value),
                serviceTax: Utils.parseCurrency(form.serviceTax.value),
                amenities,
                politics,
                images: allImages,
                locale: {
                    addressName: form.addressName?.value || 'Endereço não informado',
                    addressNumber: form.addressNumber?.value || 'S/N',
                    sublocality: form.sublocality?.value || '',
                    locality: form.locality?.value || '',
                    state: form.state?.value || '',
                    country: form.country?.value || 'Brasil',
                    postalCode: (form.postalCode?.value || '00000000').replace(/\D/g, '').padEnd(8, '0').slice(0, 8),
                    geolocation: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(form.longitude?.value) || -46.633308,
                            parseFloat(form.latitude?.value) || -23.55052
                        ]
                    }
                }
            };

            if (spaceId) {
                await spaceService.updateSpace(spaceId, payload);
            } else {
                await spaceService.createSpace(payload);
            }

            router.navigate('/host/spaces');
        } catch (error) {
            console.error('Erro ao salvar espaço:', error);
            const message = error.response?.data?.message || 'Falha ao salvar o espaço. Tente novamente.';
            alert(message);
        } finally {
            submitButtons.forEach((btn) => {
                btn.disabled = false;
                btn.textContent = spaceId ? 'Salvar alterações' : 'Criar espaço';
            });
        }
    });
}

async function loadSpaceDataForEdit(spaceId) {
    try {
        const pageTitle = document.querySelector('.page-title');
        const submitButtons = document.querySelectorAll('button[type="submit"]');

        if (pageTitle) pageTitle.textContent = 'Editar espaço';
        submitButtons.forEach((btn) => (btn.textContent = 'Salvar alterações'));

        const response = await spaceService.getSpaceById(spaceId);
        const space = response.space || response.data || response;

        const form = document.getElementById('form-create-space');
        if (!form) return;

        form.title.value = space.title || '';
        form.description.value = space.description || '';
        form.checkinTime.value = space.checkinTime || '';
        form.checkoutTime.value = space.checkoutTime || '';

        form.pricePerNight.value = Utils.formatCurrency(space.price);
        form.cleaningTax.value = Utils.formatCurrency(space.cleaningTax);
        form.serviceTax.value = Utils.formatCurrency(space.serviceTax);

        if (space.locale) {
            const addrInput = document.getElementById('address-selected');
            if (addrInput) {
                addrInput.value = `${space.locale.addressName || ''}, ${space.locale.addressNumber || ''} - ${space.locale.sublocality || space.locale.locality}`;
            }

            setInputValue('#addr-name', space.locale.addressName);
            setInputValue('#addr-number', space.locale.addressNumber);
            setInputValue('#addr-sublocality', space.locale.sublocality);
            setInputValue('#addr-locality', space.locale.locality);
            setInputValue('#addr-state', space.locale.state);
            setInputValue('#addr-country', space.locale.country);
            setInputValue('#addr-zip', space.locale.postalCode);

            if (space.locale.geolocation?.coordinates) {
                setInputValue('#addr-lng', space.locale.geolocation.coordinates[0]);
                setInputValue('#addr-lat', space.locale.geolocation.coordinates[1]);
            }
        }

        (space.amenities || []).forEach((val) => {
            const checkbox = form.querySelector(`input[name="amenities"][value="${val}"]`);
            if (checkbox) checkbox.checked = true;
        });

        (space.politics || []).forEach((val) => {
            const checkbox = form.querySelector(`input[name="politics"][value="${val}"]`);
            if (checkbox) checkbox.checked = true;
        });

        existingImages = space.images || [];
        renderPreviews();
    } catch (error) {
        console.error('Erro ao buscar dados do espaço para edição:', error);
        alert('Não foi possível carregar os dados deste espaço.');
        router.navigate('/host/spaces');
    }
}

function setInputValue(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.value = value || '';
}