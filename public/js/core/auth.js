import { authService } from '../services/authService.js';

class AuthManager {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('@SpaceHub:token') || null;
    }

    async init() {
        if (!this.token) return null;
        try {
            const data = await authService.getMe();
            this.user = data.user;
            return this.user;
        } catch {
            this.logout();
            return null;
        }
    }

    setSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('@SpaceHub:token', token);
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('@SpaceHub:token');
        window.history.pushState(null, null, '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getUser() {
        return this.user;
    }

    getRole() {
        return this.user ? this.user.profileType : null;
    }
}

export const auth = new AuthManager();