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

// --- LÓGICA DA SESSÃO E ANIMAÇÃO ---

function animateSession() {
    // Para a animação se a sessão foi terminada por outra função
    if (!activeSession) return;

    // Calcula as diferenças de tempo
    const now = new Date();
    const diffInMs = now - activeSession.startTime;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = diffInMs / (1000 * 60);

    // 1. ATUALIZA O TEXTO DO CRONÔMETRO
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // 2. ATUALIZA A ALTURA DO BLOCO (A NOVA LÓGICA)
    const elapsedHeightPercentage = (diffInMinutes / 1440) * 100; // 1440 minutos em um dia
    atualizarBlocoDeEstudoVivo(elapsedHeightPercentage);
    
    // 3. PEDE AO NAVEGADOR PARA CONTINUAR A ANIMAÇÃO
    animationFrameId = requestAnimationFrame(animateSession);
}

function startSession(materia) {
    closeSubjectModal();
    
    const startTime = new Date();
    activeSession = { materia, startTime };

    // Atualiza a UI do widget
    timerWidget.classList.add('active');
    playIcon.innerHTML = feather.icons.pause.toSvg();

    // Cria o bloco visual. Ele começará com altura 0.
    criarBlocoDeEstudoVivo(startTime, materia);

    // Inicia o nosso loop de animação
    animationFrameId = requestAnimationFrame(animateSession);
}

async function stopSession() {
    const endTime = new Date();
    
    // Para o loop de animação
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Salva o agendamento completo no Supabase
    const inicio = activeSession.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fim = endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await salvarAgendamento(activeSession.materia.nome, inicio, fim);

    // Remove o bloco "vivo" da tela
    const blocoVivo = document.getElementById('live-session-block');
    if (blocoVivo) blocoVivo.remove();

    // Atualiza a timeline para mostrar o bloco permanente que acabamos de salvar
    await exibirAgendamentos();

    // Reseta o estado da sessão
    activeSession = null;

    // Reseta a UI do widget
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

// --- FUNÇÃO DE INICIALIZAÇÃO ---
export function initStudySessionHandler() {
    timerButton.addEventListener('click', handleTimerClick);
    overlay.addEventListener('click', closeSubjectModal);
}