import { auth } from './auth.js';

const routes = {
    '/': {
        view: '/views/auth/auth.html',
        bodyClass: 'auth-page',
        isPublic: true,
        init: () => import('../pages/authPage.js').then((m) => m.initAuthPage())
    },
    '/login': {
        view: '/views/auth/auth.html',
        bodyClass: 'auth-page',
        isPublic: true,
        init: () => import('../pages/authPage.js').then((m) => m.initAuthPage())
    },
    '/client/explore': {
        view: '/views/client/explore.html',
        bodyClass: 'client-page explore-page',
        allowedRoles: ['client'],
        init: () => import('../pages/explorePage.js').then((m) => m.initExplorePage())
    },
    '/client/bookings': {
        view: '/views/shared/booking-dashboard.html',
        bodyClass: 'client-page bookings-page',
        allowedRoles: ['client'],
        init: () => import('../pages/bookingDashboardPage.js').then((m) => m.initBookingDashboardPage())
    },
    '/host/spaces': {
        view: '/views/host/space-dashboard.html',
        bodyClass: 'host-page spaces-dashboard-page',
        allowedRoles: ['host'],
        init: () => import('../pages/spaceDashboardPage.js').then((m) => m.initSpaceDashboardPage())
    },
    '/host/spaces/new': {
        view: '/views/host/space-form.html',
        bodyClass: 'host-page space-form-page',
        allowedRoles: ['host'],
        init: () => import('../pages/spaceFormPage.js').then((m) => m.initSpaceFormPage())
    },
    '/host/bookings': {
        view: '/views/shared/booking-dashboard.html',
        bodyClass: 'host-page bookings-page',
        allowedRoles: ['host'],
        init: () => import('../pages/bookingDashboardPage.js').then((m) => m.initBookingDashboardPage())
    },
    '/spaces/:id': {
        view: '/views/shared/space-details.html',
        bodyClass: 'space-details-page',
        isPublic: false,
        init: (params) => import('../pages/spaceDetailsPage.js').then((m) => m.initSpaceDetailsPage(params))
    },
    '/bookings/:id': {
        view: '/views/shared/booking-details.html',
        bodyClass: 'booking-details-page',
        isPublic: false,
        init: (params) => import('../pages/bookingDetailsPage.js').then((m) => m.initBookingDetailsPage(params))
    }
};

class Router {
    constructor() {
        this.appElement = document.getElementById('app');
        this.headerElement = document.getElementById('main-header');
        this.routes = routes;

        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    navigate(url) {
        window.history.pushState(null, null, url);
        this.handleRoute();
    }

    async handleRoute() {
        let path = window.location.pathname;
        if (path === '/public/' || path === '/public/index.html' || path === '/index.html') {
            path = '/';
        }
        const matched = this.matchRoute(path);

        if (!matched) {
            await this.renderNotFound();
            return;
        }

        const { routeConfig, params } = matched;

        if (!routeConfig.isPublic && !auth.isAuthenticated()) {
            this.navigate('/login');
            return;
        }

        if (routeConfig.isPublic && auth.isAuthenticated()) {
            const redirectPath = auth.getRole() === 'host' ? '/host/spaces' : '/client/explore';
            this.navigate(redirectPath);
            return;
        }

        if (routeConfig.allowedRoles && !routeConfig.allowedRoles.includes(auth.getRole())) {
            const fallbackPath = auth.getRole() === 'host' ? '/host/spaces' : '/client/explore';
            this.navigate(fallbackPath);
            return;
        }

        document.body.className = routeConfig.bodyClass || '';
        await this.renderView(routeConfig.view);
        await this.renderHeader(routeConfig.isPublic);

        if (routeConfig.init) {
            routeConfig.init(params);
        }
    }

    matchRoute(path) {
        if (this.routes[path]) {
            return { routeConfig: this.routes[path], params: {} };
        }

        for (const [routePattern, config] of Object.entries(this.routes)) {
            const patternRegex = new RegExp(`^${routePattern.replace(/:([a-zA-Z0-9_]+)/g, '(?<$1>[^/]+)')}$`);
            const match = path.match(patternRegex);
            if (match) {
                return { routeConfig: config, params: match.groups || {} };
            }
        }

        return null;
    }

    async renderView(viewUrl) {
        try {
            const response = await fetch(viewUrl);
            if (!response.ok) {
                throw new Error(`Falha HTTP ${response.status} ao buscar ${viewUrl}`);
            }
            const html = await response.text();
            if (html.toLowerCase().includes('<title>spacehub')) {
                throw new Error(`O servidor retornou o index.html em vez de ${viewUrl}. Verifique os caminhos.`);
            }
            this.appElement.innerHTML = html;
        } catch(error) {
            console.error('Erro no renderView:', error);
            this.appElement.innerHTML = '<h2>Erro ao carregar a página.</h2>';
        }
    }

    async renderHeader(isPublic) {
        if (isPublic || !auth.isAuthenticated()) {
            this.headerElement.innerHTML = '';
            this.headerElement.classList.add('hidden');
            return;
        }

        if (this.headerElement.children.length === 0) {
            const response = await fetch('/views/partials/header.html');
            this.headerElement.innerHTML = await response.text();
            const { initHeader } = await import('../pages/headerPage.js');
            initHeader();
        }
        this.headerElement.classList.remove('hidden');
    }

    async renderNotFound() {
        document.body.className = 'not-found-page';
        const response = await fetch('/views/shared/not-found.html');
        this.appElement.innerHTML = await response.text();
        this.headerElement.classList.add('hidden');
    }
}

export const router = new Router();