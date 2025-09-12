// scripts/login.js
import { signUp, signIn } from './features/auth-handler.js';

const form = document.getElementById('auth-form');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const messageEl = document.getElementById('auth-message');

loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const { error } = await signIn(email, password);
    handleAuthResponse(error);
});

signupButton.addEventListener('click', async () => {
    const email = form.email.value;
    const password = form.password.value;

    // --- NOVA VALIDAÇÃO ---
    if (password.length < 6) {
        messageEl.textContent = 'Sua senha deve ter no mínimo 6 caracteres.';
        messageEl.classList.remove('hidden');
        return; // Para a execução aqui
    }
    // --- FIM DA VALIDAÇÃO ---

    const { error } = await signUp(email, password);
    handleAuthResponse(error, 'Conta criada com sucesso! Verifique seu e-mail e faça o login.');
});

handleAuthResponse(error, 'Conta criada com sucesso! Você já pode entrar.');