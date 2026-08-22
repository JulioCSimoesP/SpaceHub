/* App initialization */

const AppState = {
    name: ''
};

const AppController = {
    initialize() {
        Fancybox.bind('[data-fancybox="space-gallery"]', {
            // Ativa as miniaturas no rodapé
            Thumbs: {
                type: "modern",
            },
            // Animação suave ao abrir/fechar
            showClass: "f-fadeIn",
            hideClass: "f-fadeOut",
        });
    }
};

window.addEventListener('DOMContentLoaded', () => AppController.initialize());

/* Static assets */

const CATEGORY_ICON_LIBRARY = [
    { id: "", name: "", svg: `` },
];

const UTILITY_ICON_MAP = {
    name: ``,
};