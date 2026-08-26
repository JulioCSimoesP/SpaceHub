import { auth } from '../core/auth.js';

export function initHeader() {
    const user = auth.getUser();
    if (!user) return;

    renderUserInfo(user);
    renderNavigationLinks(user);
    setupDropdown();
    setupMobileMenu();
    setupLogout();
}

export function updateActiveLinks() {
    const currentPath = window.location.pathname;

    const allLinks = document.querySelectorAll('.menu-nav ul li a, .modal-menu-nav .menu-btn');
    allLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('is-active');
        } else {
            link.classList.remove('is-active');
        }
    });
}

function renderUserInfo(user) {
    const firstName = user.name ? user.name.split(' ')[0] : 'Usuário';
    const roleText = user.profileType === 'host' ? 'Anfitrião' : 'Hóspede';

    document.querySelectorAll('.user-name').forEach((el) => {
        el.textContent = `Olá, ${firstName}`;
    });

    document.querySelectorAll('.user-role').forEach((el) => {
        el.textContent = roleText;
    });
}

function renderNavigationLinks(user) {
    const currentPath = window.location.pathname;
    const isHost = user.profileType === 'host';

    // Definição das rotas e textos por perfil
    const navItems = isHost
        ? [
            { text: 'Meus espaços', path: '/host/spaces' },
            { text: 'Reservas', path: '/host/bookings' }
        ]
        : [
            { text: 'Explorar', path: '/client/explore' },
            { text: 'Minhas reservas', path: '/client/bookings' }
        ];

    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.setAttribute('href', isHost ? '/host/spaces' : '/client/explore');
        logoLink.setAttribute('data-link', '');
    }

    const desktopNavLinks = document.querySelectorAll('.menu-nav ul li a');
    desktopNavLinks.forEach((link, index) => {
        if (navItems[index]) {
            link.setAttribute('href', navItems[index].path);
            link.setAttribute('data-link', '');
            
            const span = link.querySelector('span');
            if (span) span.textContent = navItems[index].text;

            if (currentPath === navItems[index].path) {
                link.classList.add('is-active');
            } else {
                link.classList.remove('is-active');
            }
        }
    });

    const mobileNavLinks = document.querySelectorAll('.modal-menu-nav .menu-btn');
    mobileNavLinks.forEach((link, index) => {
        if (navItems[index]) {
            link.setAttribute('href', navItems[index].path);
            link.setAttribute('data-link', '');

            const span = link.querySelector('span');
            if (span) span.textContent = navItems[index].text;

            if (currentPath === navItems[index].path) {
                link.classList.add('is-active');
            } else {
                link.classList.remove('is-active');
            }
        }
    });
}

function setupDropdown() {
    const btnUserMenu = document.getElementById('btn-user-menu');
    const userDropdown = document.getElementById('user-dropdown');

    if (!btnUserMenu || !userDropdown) return;

    btnUserMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = userDropdown.classList.toggle('hidden');
        btnUserMenu.setAttribute('aria-expanded', (!isHidden).toString());
    });

    document.addEventListener('click', (e) => {
        if (!userDropdown.classList.contains('hidden') && !userDropdown.contains(e.target) && !btnUserMenu.contains(e.target)) {
            userDropdown.classList.add('hidden');
            btnUserMenu.setAttribute('aria-expanded', 'false');
        }
    });
}

function setupMobileMenu() {
    const btnOpenMenu = document.getElementById('btn-open-menu');
    const btnCloseMenu = document.getElementById('btn-close-menu');
    const modalMenu = document.getElementById('modal-menu');

    if (!modalMenu) return;

    const openMenu = () => {
        modalMenu.classList.remove('hidden');
        btnOpenMenu?.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        modalMenu.classList.add('hidden');
        btnOpenMenu?.setAttribute('aria-expanded', 'false');
    };

    btnOpenMenu?.addEventListener('click', openMenu);
    btnCloseMenu?.addEventListener('click', closeMenu);

    modalMenu.querySelectorAll('a[data-link]').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    modalMenu.addEventListener('click', (e) => {
        if (e.target === modalMenu) closeMenu();
    });
}

function setupLogout() {
    const logoutElements = document.querySelectorAll('.logout-link, .logout-btn');
    logoutElements.forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    });
}