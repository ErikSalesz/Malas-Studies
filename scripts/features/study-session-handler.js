import { buscarMaterias } from './materias-handler.js';
import { salvarAgendamento, exibirAgendamentos } from './agenda-handler.js';
import { criarBlocoDeEstudoVivo, atualizarBlocoDeEstudoVivo } from '../components/timeline.js';

// --- ELEMENTOS DO DOM ---
const timerWidget = document.getElementById('study-timer-widget');
const timerButton = document.getElementById('study-timer-button');
const timerDisplay = document.getElementById('study-timer-display');
const playIcon = timerButton.querySelector('i');

const subjectModal = document.getElementById('subject-select-modal');
const subjectList = document.getElementById('subject-select-list');
const overlay = document.getElementById('overlay');

// --- ESTADO DA SESSÃO ---
let activeSession = null; // Guarda os dados da sessão ativa
let animationFrameId = null; // Guarda a referência da nossa animação

// --- FUNÇÕES DE CONTROLE DA UI ---

function openSubjectModal() {
    populateSubjectList();
    subjectModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function closeSubjectModal() {
    subjectModal.classList.add('hidden');
    overlay.classList.add('hidden');
}

async function populateSubjectList() {
    subjectList.innerHTML = '<li class="loading-state">Carregando matérias...</li>';
    const materias = await buscarMaterias();
    subjectList.innerHTML = ''; // Limpa o loading

    if (materias.length === 0) {
        subjectList.innerHTML = '<li>Você ainda não cadastrou nenhuma matéria.</li>';
        return;
    }

    materias.forEach(materia => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.innerHTML = `
            <i data-feather="play-circle" style="color: ${materia.cor || 'var(--cor-texto)'};"></i>
            <span>${materia.nome}</span>
        `;
        button.onclick = () => startSession(materia);
        li.appendChild(button);
        subjectList.appendChild(li);
    });

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}


// --- O CORAÇÃO DA NOVA LÓGICA DE ANIMAÇÃO ---
function animateSession() {
    if (!activeSession) return;

    const now = new Date();
    const diffInMs = now - activeSession.startTime;
    
    // Pequeno buffer de 100ms no início.
    // Durante este tempo, a altura do bloco permanecerá zero.
    // Isso dá tempo para o navegador renderizar o estado inicial.
    if (diffInMs > 100) {
        const diffInMinutes = diffInMs / (1000 * 60);
        const elapsedHeightPercentage = (diffInMinutes / 1440) * 100;
        atualizarBlocoDeEstudoVivo(elapsedHeightPercentage);
    }

    // O cronômetro é atualizado desde o primeiro frame
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Continua a animação
    animationFrameId = requestAnimationFrame(animateSession);
}

// --- Funções de Controle da Sessão (ajustes mínimos) ---
function startSession(materia) {
    closeSubjectModal();
    const startTime = new Date();
    activeSession = { materia, startTime };

    timerWidget.classList.add('active');
    playIcon.innerHTML = feather.icons.pause.toSvg();

    // Cria o bloco. Ele permanecerá com altura zero por 100ms.
    criarBlocoDeEstudoVivo(startTime, materia);

    // Inicia o loop de animação
    animationFrameId = requestAnimationFrame(animateSession);
}

async function stopSession() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // O resto da função continua exatamente igual
    if (activeSession) {
        const endTime = new Date();
        const inicio = activeSession.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const fim = endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        await salvarAgendamento(activeSession.materia.nome, inicio, fim);

        const blocoVivo = document.getElementById('live-session-block');
        if (blocoVivo) blocoVivo.remove();

        await exibirAgendamentos();
    }
    
    activeSession = null;

    timerWidget.classList.remove('active');
    playIcon.innerHTML = feather.icons.play.toSvg();
    timerDisplay.textContent = '00:00:00';
}

function handleTimerClick() {
    if (activeSession) {
        stopSession();
    } else {
        openSubjectModal();
    }
}

// --- Função de Inicialização (sem alterações) ---
export function initStudySessionHandler() {
    timerButton.addEventListener('click', handleTimerClick);
    overlay.addEventListener('click', () => {
        // Garante que o overlay só feche o modal de matéria
        if (!subjectModal.classList.contains('hidden')) {
            closeSubjectModal();
        }
    });
}