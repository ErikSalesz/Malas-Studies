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
let animationFrameId = null;

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

    // --- LÓGICA DE ANIMAÇÃO PRINCIPAL ---
    function animate() {
        // Para a animação se a sessão foi terminada
        if (!activeSession) return;

        // Atualiza o texto do cronômetro
        const now = new Date();
        const diffInSeconds = Math.floor((now - activeSession.startTime) / 1000);
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;
        timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Atualiza a altura do bloco na timeline
        atualizarBlocoDeEstudoVivo();
        
        // Pede ao navegador para chamar a função 'animate' novamente no próximo quadro de renderização
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Inicia o loop de animação
    animate();
}

// --- FUNÇÕES DE LÓGICA DA SESSÃO ---

function startSession(materia) {
    closeSubjectModal();
    
    const startTime = new Date();
    activeSession = { materia, startTime };

    timerWidget.classList.add('active');
    playIcon.innerHTML = feather.icons.pause.toSvg();

    // Cria o bloco visual com altura zero
    criarBlocoDeEstudoVivo(startTime, materia);

    // Inicia o nosso loop de animação de forma suave
    updateTimerDisplay();
}

async function stopSession() {
    const endTime = new Date();
    
    // --- PARA O LOOP DE ANIMAÇÃO ---
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // O resto da função continua igual...
    const inicio = activeSession.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fim = endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    await salvarAgendamento(activeSession.materia.nome, inicio, fim);

    const blocoVivo = document.getElementById('live-session-block');
    if (blocoVivo) blocoVivo.remove();

    await exibirAgendamentos();

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

// --- FUNÇÃO DE INICIALIZAÇÃO ---
export function initStudySessionHandler() {
    timerButton.addEventListener('click', handleTimerClick);
    overlay.addEventListener('click', closeSubjectModal);
}