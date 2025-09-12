// scripts/timeline.js

const timelineContainer = document.getElementById('timeline-container');
const timeLine = document.getElementById('current-time-line');

// Função para gerar os marcadores de hora (00:00, 01:00, etc.)
function gerarMarcadoresDeHora() {
    for (let i = 0; i < 24; i++) {
        const hourSlot = document.createElement('div');
        hourSlot.className = 'hour-slot';
        // Formata a hora para ter sempre dois dígitos (ex: 01:00, 02:00)
        hourSlot.textContent = `${String(i).padStart(2, '0')}:00`;
        timelineContainer.appendChild(hourSlot);
    }
}

// Função principal que calcula e atualiza a posição da linha
function atualizarLinhaDoTempo() {
    // 1. Pega a data e hora atual no fuso horário de Brasília
    const agora = new Date();
    const options = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false };
    const formatador = new Intl.DateTimeFormat('pt-BR', options);
    const [hora, minuto] = formatador.format(agora).split(':').map(Number);
    
    // 2. Calcula o total de minutos que se passaram no dia
    const minutosTotaisDoDia = (hora * 60) + minuto;
    
    // 3. Calcula a porcentagem do dia que já passou (1 dia = 1440 minutos)
    const porcentagemDoDia = (minutosTotaisDoDia / 1440) * 100;

    // 4. Atualiza a posição 'top' da linha em CSS
    timeLine.style.top = `${porcentagemDoDia}%`;

    console.log(`Hora de Brasília: ${hora}:${minuto}. Posição da linha: ${porcentagemDoDia.toFixed(2)}%`);
}

// Função que será exportada e chamada no main.js
export function initTimeline() {
    gerarMarcadoresDeHora(); // Cria os slots de hora na tela
    atualizarLinhaDoTempo(); // Posiciona a linha na hora correta imediatamente
    
    // Atualiza a linha a cada 60 segundos, recalculando tudo do zero
    setInterval(atualizarLinhaDoTempo, 60000); 
}