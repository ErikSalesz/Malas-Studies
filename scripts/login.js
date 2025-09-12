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

function handleAuthResponse(error, successMessage = null) {
    if (error) {
        // Mostra mensagem de erro
        messageEl.textContent = error.message;
        messageEl.classList.remove('success'); // Garante que não tenha a classe de sucesso
        messageEl.classList.remove('hidden');
    } else if (successMessage) {
        // Mostra mensagem de sucesso
        messageEl.textContent = successMessage;
        messageEl.classList.add('success'); // Adiciona a classe de sucesso
        messageEl.classList.remove('hidden');
        
        // Limpa o formulário após o sucesso do cadastro
        form.reset();

        // Esconde a mensagem de sucesso após alguns segundos
        setTimeout(() => {
            messageEl.classList.add('hidden');
            messageEl.classList.remove('success'); // Limpa para a próxima vez
        }, 5000); // 5 segundos
    } else {
        // Se não houve erro e nem mensagem de sucesso, é um login bem-sucedido
        window.location.href = '/index.html'; // Redireciona para o app
    }
}