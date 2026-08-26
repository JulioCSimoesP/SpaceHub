import { authService } from '../services/authService.js';
import { auth } from '../core/auth.js';
import { router } from '../core/router.js';

export function initAuthPage() {
    setupModalSwitching();
    setupPasswordToggle();
    setupLoginForm();
    setupRegisterForm();
}

function setupModalSwitching() {
    const modalLogin = document.getElementById('modal-login');
    const modalRegister = document.getElementById('modal-register');
    const btnSwitchToRegister = document.getElementById('btn-switch-to-register');
    const btnSwitchToLogin = document.getElementById('btn-switch-to-login');

    if (!modalLogin || !modalRegister) return;

    btnSwitchToRegister?.addEventListener('click', () => {
        modalLogin.classList.add('hidden');
        modalRegister.classList.remove('hidden');
    });

    btnSwitchToLogin?.addEventListener('click', () => {
        modalRegister.classList.add('hidden');
        modalLogin.classList.remove('hidden');
    });
}

/**
 * Alterna entre type="password" e type="text" no campo de senha
 */
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('btn-toggle-password');
    const passwordInput = document.getElementById('login-password');

    if (!toggleBtn || !passwordInput) return;

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        toggleBtn.classList.toggle('is-visible', isPassword);
        toggleBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    });
}

function setupLoginForm() {
    const loginForm = document.getElementById('form-login');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Entrando...';

            const data = await authService.login({ email, password });
            
            auth.setSession(data.token, data.user);

            const redirectPath = data.redirectTo || (data.user.profileType === 'host' ? '/host/spaces' : '/client/explore');
            router.navigate(redirectPath);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Falha ao realizar login. Verifique suas credenciais.';
            alert(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

function setupRegisterForm() {
    const registerForm = document.getElementById('form-register');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const name = registerForm.name.value.trim();
        const phoneNumber = registerForm.phone.value.trim();
        const email = registerForm.email.value.trim();
        const password = registerForm.password.value;
        const profileType = registerForm.profileType.value;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Cadastrando...';

            const data = await authService.register({
                name,
                phoneNumber,
                email,
                password,
                profileType
            });

            console.log(data);

            auth.setSession(data.token, data.user);

            const redirectPath = data.redirectTo || (data.user.profileType === 'host' ? '/host/spaces' : '/client/explore');
            router.navigate(redirectPath);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Falha ao realizar cadastro. Tente novamente.';
            alert(errorMessage);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}