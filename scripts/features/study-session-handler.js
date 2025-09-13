// scripts/features/study-session-handler.js

import { buscarMaterias } from './materias-handler.js';
import { salvarAgendamento, exibirAgendamentos } from './agenda-handler.js';
import { criarBlocoDeEstudoVivo, atualizarBlocoDeEstudoVivo } from '../components/timeline.js';

// --- ELEMENTOS DO DOM ---
const timerWidget = document.getElementById('study-timer-widget');
const timerButton = document.getElementById('study-timer-button');
const timerDisplay = document.getElementById('study-timer-display');
const playIcon = timerButton.querySelector('i'); // Seleciona o ícone

const subjectModal = document.getElementById('subject-select-modal');
const subjectList = document.getElementById('subject-select-list');
const overlay = document.getElementById('overlay');

// --- ESTADO DA SESSÃO ---
let activeSession = null; // Guarda os dados da sessão ativa
let timerInterval = null; // Guarda a referência do nosso 'setInterval'
let isFirstTick = true; // <-- NOSSO NOVO FLAG!

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

function updateTimerDisplay() {
    if (!activeSession) return;

    if (isFirstTick) {
        isFirstTick = false;
    } else {
        // A partir da segunda batida, atualizamos a altura normalmente
        atualizarBlocoDeEstudoVivo();
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - activeSession.startTime) / 1000);

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    atualizarBlocoDeEstudoVivo();
}

// --- FUNÇÕES DE LÓGICA DA SESSÃO (ATUALIZADAS) ---

function startSession(materia) {
    closeSubjectModal();

    // Sempre que uma nova sessão começar, resetamos nosso flag para true
    isFirstTick = true; 
    
    const startTime = new Date(); // Fuso horário já é o local/Brasília
    activeSession = { materia, startTime };

    // Atualiza a UI do widget
    timerWidget.classList.add('active');
    playIcon.innerHTML = feather.icons.pause.toSvg(); // Corrige o bug do ícone!

    // --- NOVA LÓGICA ---
    // Cria o bloco visual na timeline
    criarBlocoDeEstudoVivo(startTime, materia);

    timerInterval = setInterval(updateTimerDisplay, 1000);
}

async function stopSession() {
    const endTime = new Date();
    console.log('Parando sessão de estudo. Duração:', timerDisplay.textContent);
    
    // --- NOVA LÓGICA ---
    // Salva o agendamento completo no Supabase
    const inicio = activeSession.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fim = endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await salvarAgendamento(activeSession.materia.nome, inicio, fim);

    // Remove o bloco "vivo" da tela
    const blocoVivo = document.getElementById('live-session-block');
    if (blocoVivo) blocoVivo.remove();

    // Atualiza a timeline para mostrar o bloco permanente que acabamos de salvar
    await exibirAgendamentos();

    // Reseta o estado
    activeSession = null;
    clearInterval(timerInterval);

    // Reseta a UI do widget
    timerWidget.classList.remove('active');
    playIcon.innerHTML = feather.icons.play.toSvg(); // Corrige o bug do ícone!
    timerDisplay.textContent = '00:00:00';
}

function handleTimerClick() {
    if (activeSession) {
        // Se a sessão está ativa, o clique para a sessão
        stopSession();
    } else {
        // Se não está ativa, o clique abre o modal de seleção
        openSubjectModal();
    }
}

// --- FUNÇÃO DE INICIALIZAÇÃO ---

export function initStudySessionHandler() {
    timerButton.addEventListener('click', handleTimerClick);
    overlay.addEventListener('click', closeSubjectModal); // Reutiliza o overlay
}