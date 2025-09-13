// scripts/features/study-session-handler.js

import { buscarMaterias } from './materias-handler.js';

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

    const now = new Date();
    const diffInSeconds = Math.floor((now - activeSession.startTime) / 1000);

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// --- FUNÇÕES DE LÓGICA DA SESSÃO ---

function startSession(materia) {
    closeSubjectModal();
    console.log('Iniciando sessão de estudo para:', materia.nome);
    
    activeSession = {
        materia: materia,
        startTime: new Date() // Fuso horário já é o local/Brasília
    };

    // Atualiza a UI para o estado "ativo"
    timerWidget.classList.add('active');
    playIcon.setAttribute('data-feather', 'pause'); // Muda o ícone para 'pause'
    feather.replace(); // Renderiza o novo ícone

    // Inicia o intervalo que atualiza o cronômetro a cada segundo
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopSession() {
    console.log('Parando sessão de estudo. Duração:', timerDisplay.textContent);
    
    // Aqui, no futuro, salvaremos a sessão no Supabase
    
    activeSession = null;
    clearInterval(timerInterval); // Para o cronômetro

    // Reseta a UI para o estado inicial
    timerWidget.classList.remove('active');
    playIcon.setAttribute('data-feather', 'play');
    feather.replace();
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