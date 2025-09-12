// scripts/components/date-picker.js

const datePickerContainer = document.getElementById('date-picker-container');
const timelineContainer = document.getElementById('timeline-container');

// "Estado" - a data que está atualmente selecionada. Começa com hoje.
let dataSelecionada = new Date();

// Função para renderizar os dias na tela
function renderizarSeletorDeData() {
    datePickerContainer.innerHTML = ''; // Limpa o container
    
    // Vamos mostrar 7 dias: 3 antes do selecionado, o selecionado, e 3 depois
    for (let i = -3; i <= 3; i++) {
        const data = new Date(dataSelecionada);
        data.setDate(data.getDate() + i);

        const diaItem = document.createElement('div');
        diaItem.className = 'day-item';
        
        // Adiciona a classe 'active' se for o dia central (selecionado)
        if (i === 0) {
            diaItem.classList.add('active');
        }

        const nomeDia = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const numeroDia = data.getDate();

        diaItem.innerHTML = `
            <div class="day-name">${nomeDia}</div>
            <div class="day-number">${numeroDia}</div>
        `;
        
        datePickerContainer.appendChild(diaItem);
    }
}

// Função para mudar o dia (para frente ou para trás)
function mudarDia(offset) {
    dataSelecionada.setDate(dataSelecionada.getDate() + offset);
    renderizarSeletorDeData();
    // No futuro, aqui chamaremos a função para recarregar os agendamentos da timeline
    console.log("Data alterada para:", dataSelecionada.toLocaleDateString('pt-BR'));
}

// Lógica para detectar o gesto de arrastar (swipe)
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50; // Mínimo de pixels para considerar um swipe

timelineContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

timelineContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) < swipeThreshold) return; // Não foi um swipe longo o suficiente

    if (deltaX > 0) {
        // Arrastou para a direita -> dia anterior
        mudarDia(-1);
    } else {
        // Arrastou para a esquerda -> próximo dia
        mudarDia(1);
    }
}

// Função principal que será exportada
export function initDatePicker() {
    renderizarSeletorDeData(); // Renderiza pela primeira vez
}