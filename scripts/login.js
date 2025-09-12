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
    const { error } = await signUp(email, password);
    handleAuthResponse(error, 'Conta criada! Faça o login.');
});

function handleAuthResponse(error, successMessage = null) {
    if (error) {
        messageEl.textContent = error.message;
        messageEl.classList.remove('hidden');
    } else {
        if (successMessage) {
            alert(successMessage);
            form.reset();
        } else {
            window.location.href = '/index.html'; // Redireciona para o app
        }
    }
}