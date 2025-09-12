// scripts/components/date-picker.js (VERSÃO ATUALIZADA)

const datePickerContainer = document.getElementById('date-picker-container');
const timelineContainer = document.getElementById('timeline-container');

// "Estado" - a data que está atualmente selecionada. Começa com hoje.
let dataSelecionada = new Date();

// NOVA FUNÇÃO CENTRALIZADA: Atualiza o estado e re-renderiza a UI
function selecionarDia(novaData) {
    dataSelecionada = novaData;
    renderizarSeletorDeData();
    // No futuro, aqui chamaremos a função para recarregar os agendamentos da timeline
    console.log("Data selecionada:", dataSelecionada.toLocaleDateString('pt-BR'));
}

// Função para renderizar os dias na tela (agora com lógica de clique)
function renderizarSeletorDeData() {
    datePickerContainer.innerHTML = ''; // Limpa o container
    
    // A data central de referência para o loop
    const dataCentral = new Date(dataSelecionada);

    for (let i = -3; i <= 3; i++) {
        const dataDoLoop = new Date(dataCentral);
        dataDoLoop.setDate(dataDoLoop.getDate() + i);

        const diaItem = document.createElement('div');
        diaItem.className = 'day-item';
        
        // Compara o dia, mês e ano para ver se é o dia selecionado
        if (dataDoLoop.toDateString() === dataSelecionada.toDateString()) {
            diaItem.classList.add('active');
        }

        const nomeDia = dataDoLoop.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const numeroDia = dataDoLoop.getDate();

        diaItem.innerHTML = `
            <div class="day-name">${nomeDia}</div>
            <div class="day-number">${numeroDia}</div>
        `;

        // ADICIONA A LÓGICA DE CLIQUE
        diaItem.addEventListener('click', () => {
            selecionarDia(dataDoLoop);
        });
        
        datePickerContainer.appendChild(diaItem);
    }
}

// Função para mudar o dia (para frente ou para trás) com swipe
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