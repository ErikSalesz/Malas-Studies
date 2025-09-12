// scripts/components/date-picker.js (VERSÃO ATUALIZADA)

// ---- NOVA IMPORTAÇÃO ----
import { atualizarExibicaoTimeline } from './timeline.js';

const datePickerContainer = document.getElementById('date-picker-container');
const timelineContainer = document.getElementById('timeline-container');

let dataSelecionada = new Date();

// Função centralizada: Atualiza o estado, a UI do seletor e a timeline
function selecionarDia(novaData) {
    dataSelecionada = novaData;
    renderizarSeletorDeData();

    // ---- A CONEXÃO ACONTECE AQUI ----
    // Avisa o módulo da timeline que o dia mudou
    atualizarExibicaoTimeline(novaData); 
}

// Função para renderizar os dias na tela (sem alteração de lógica interna)
function renderizarSeletorDeData() {
    datePickerContainer.innerHTML = ''; 
    const dataCentral = new Date(dataSelecionada);

    for (let i = -3; i <= 3; i++) {
        const dataDoLoop = new Date(dataCentral);
        dataDoLoop.setDate(dataDoLoop.getDate() + i);

        const diaItem = document.createElement('div');
        diaItem.className = 'day-item';
        
        if (dataDoLoop.toDateString() === dataSelecionada.toDateString()) {
            diaItem.classList.add('active');
        }

        const nomeDia = dataDoLoop.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const numeroDia = dataDoLoop.getDate();

        diaItem.innerHTML = `
            <div class="day-name">${nomeDia}</div>
            <div class="day-number">${numeroDia}</div>
        `;

        diaItem.addEventListener('click', () => {
            selecionarDia(dataDoLoop);
        });
        
        datePickerContainer.appendChild(diaItem);
    }
}

// Função de swipe (sem alteração de lógica interna)
function mudarDiaComSwipe(offset) {
    const novaData = new Date(dataSelecionada);
    novaData.setDate(novaData.getDate() + offset);
    selecionarDia(novaData);
}

// --- Lógica do Swipe (continua a mesma) ---
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

timelineContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

timelineContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) < swipeThreshold) return;

    if (deltaX > 0) {
        mudarDiaComSwipe(-1); // Dia anterior
    } else {
        mudarDiaComSwipe(1); // Próximo dia
    }
}

// Função principal que será exportada
export function initDatePicker() {
    renderizarSeletorDeData(); // Renderiza pela primeira vez
}