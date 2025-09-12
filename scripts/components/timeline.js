// scripts/components/timeline.js (VERSÃO ATUALIZADA)

const timelineContent = document.getElementById('timeline-content');
const timeLine = document.getElementById('current-time-line');

// Função interna que calcula e posiciona a linha
function posicionarLinhaDoTempo() {
    const agora = new Date();
    const options = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false };
    const formatador = new Intl.DateTimeFormat('pt-BR', options);
    const [hora, minuto] = formatador.format(agora).split(':').map(Number);
    const timeLine = document.getElementById('current-time-line');
    
    const minutosTotaisDoDia = (hora * 60) + minuto;
    const porcentagemDoDia = (minutosTotaisDoDia / 1440) * 100;

    timeLine.style.top = `${porcentagemDoDia}%`;
    timeLine.setAttribute('data-time', `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`);
}

// Função para gerar os marcadores de hora (sem alteração)
function gerarMarcadoresDeHora() {
    for (let i = 0; i < 24; i++) {
        const hourSlot = document.createElement('div');
        hourSlot.className = 'hour-slot';
        hourSlot.textContent = `${String(i).padStart(2, '0')}:00`;
        timelineContent.appendChild(hourSlot);
    }
}

// ---- NOVA FUNÇÃO PÚBLICA ----
// Esta função será chamada por outros módulos para atualizar a timeline
export function atualizarExibicaoTimeline(dataSelecionada) {
    const hoje = new Date();

    // Compara se a data selecionada é o dia de hoje (ignorando as horas)
    if (dataSelecionada.toDateString() === hoje.toDateString()) {
        // Se for hoje, mostra a linha e a posiciona corretamente
        timeLine.style.display = 'block';
        posicionarLinhaDoTempo();
    } else {
        // Se for qualquer outro dia, esconde a linha
        timeLine.style.display = 'none';
    }

    // No futuro, aqui também vamos carregar os agendamentos do dia selecionado
    console.log(`Timeline atualizada para o dia: ${dataSelecionada.toLocaleDateString('pt-BR')}`);
}

// Função de inicialização
export function initTimeline() {
    gerarMarcadoresDeHora();
    
    // Ao iniciar, atualiza a exibição para a data atual
    atualizarExibicaoTimeline(new Date()); 
    
    // O intervalo continua rodando para que, se o usuário voltar para o dia de hoje,
    // a linha esteja na posição mais recente.
    setInterval(posicionarLinhaDoTempo, 60000); 
}