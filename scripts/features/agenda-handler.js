// scripts/features/agenda-handler.js (CÓDIGO NOVO)

import supabaseClient from '../lib/supabase-client.js';
import { getdataSelecionada } from '../components/date-picker.js';

// Função para SALVAR um novo AGENDAMENTO
export async function salvarAgendamento(conteudo, horaInicio, horaFim) {
    const dataSelecionada = getdataSelecionada();

    // Combina a data selecionada com as horas dos inputs para criar objetos Date completos
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const dataHoraInicio = new Date(dataSelecionada);
    dataHoraInicio.setHours(inicioH, inicioM, 0, 0);

    const [fimH, fimM] = horaFim.split(':').map(Number);
    const dataHoraFim = new Date(dataSelecionada);
    dataHoraFim.setHours(fimH, fimM, 0, 0);

    const { error } = await supabaseClient
        .from('agendamentos') // Salva na nova tabela
        .insert([
            {
                conteudo: conteudo,
                horario_inicio: dataHoraInicio.toISOString(), // Converte para o formato do Supabase
                horario_fim: dataHoraFim.toISOString(),
                concluida: false
            }
        ]);

    if (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert('Não foi possível salvar o agendamento.');
        return;
    }

    console.log('Agendamento salvo com sucesso!');
    await exibirAgendamentos(); // Atualiza a timeline
}

// Função para BUSCAR e RENDERIZAR os agendamentos na timeline
export async function exibirAgendamentos() {
    const dataSelecionada = getdataSelecionada();
    const timelineContent = document.getElementById('timeline-content');

    // Limpa apenas os agendamentos antigos antes de desenhar os novos
    document.querySelectorAll('.agenda-item').forEach(item => item.remove());

    // Calcula o início e o fim do dia selecionado para a query
    const inicioDoDia = new Date(dataSelecionada);
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date(dataSelecionada);
    fimDoDia.setHours(23, 59, 59, 999);

    const { data: agendamentos, error } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .gte('horario_inicio', inicioDoDia.toISOString()) // gte = Greater Than or Equal
        .lte('horario_inicio', fimDoDia.toISOString()) // lte = Less Than or Equal
        .order('horario_inicio');

    if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return;
    }

    // Desenha cada agendamento na timeline
    agendamentos.forEach(agendamento => {
        const inicio = new Date(agendamento.horario_inicio);
        const fim = new Date(agendamento.horario_fim);

        const minutoInicio = inicio.getHours() * 60 + inicio.getMinutes();
        const minutoFim = fim.getHours() * 60 + fim.getMinutes();
        const duracao = minutoFim - minutoInicio;

        // A MÁGICA: Calcula a posição e altura em porcentagem
        const top = (minutoInicio / 1440) * 100; // 1440 minutos em um dia
        const height = (duracao / 1440) * 100;

        const item = document.createElement('div');
        item.className = 'agenda-item';
        item.style.top = `${top}%`;
        item.style.height = `${height}%`;
        item.innerHTML = `<span>${agendamento.conteudo}</span>`;
        
        timelineContent.appendChild(item);
    });
}