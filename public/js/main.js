import { auth } from './core/auth.js';
import { router } from './core/router.js';

/* Static assets */

const CATEGORY_ICON_LIBRARY = [
    { id: "", name: "", svg: `` },
];

const UTILITY_ICON_MAP = {
    name: ``,
};

/* Controlador Principal da Aplicação */
const AppController = {
    async initialize() {
        if (window.Fancybox) {
            Fancybox.bind('[data-fancybox="space-gallery"]', {
                Thumbs: {
                    type: "modern"
                },
                showClass: "f-fadeIn",
                hideClass: "f-fadeOut"
            });
        }

        this.initBackToTop();

        await auth.init();

        router.handleRoute();
    },

    initBackToTop() {
        const backToTopBtn = document.querySelector('.btn-back-to-top');
        if (!backToTopBtn) return;

        window.addEventListener('scroll', () => {
            if (document.body.classList.contains('auth-page')) {
                backToTopBtn.classList.add('hidden');
                return;
            }

            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};

window.addEventListener('DOMContentLoaded', () => AppController.initialize());