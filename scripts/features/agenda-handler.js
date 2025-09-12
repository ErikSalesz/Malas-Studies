// scripts/features/agenda-handler.js (VERSÃO FINAL CRUD)

import supabaseClient from '../lib/supabase-client.js';
import { getdataSelecionada } from '../components/date-picker.js';

// --- VARIÁVEIS DO MÓDULO ---
const detailsModal = document.getElementById('agenda-details-modal');
const overlay = document.getElementById('overlay');
let agendamentoSelecionado = null; // Agora guarda o objeto inteiro

// Elementos do Modal de Detalhes/Edição
const displayView = document.getElementById('modal-content-display');
const editView = document.getElementById('modal-content-edit');
const displayActions = document.getElementById('modal-actions-display');
const editActions = document.getElementById('modal-actions-edit');
const editForm = document.getElementById('agenda-edit-form');

// --- FUNÇÕES DE DADOS (API) ---

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

// NOVA FUNÇÃO PARA ATUALIZAR
async function atualizarAgendamento(id, novosDados) {
    const { dataSelecionada } = novosDados; // Pega a data base
    
    // Recria os objetos Date completos para garantir que a data está correta
    const [inicioH, inicioM] = novosDados.horaInicio.split(':').map(Number);
    const dataHoraInicio = new Date(dataSelecionada);
    dataHoraInicio.setHours(inicioH, inicioM, 0, 0);

    const [fimH, fimM] = novosDados.horaFim.split(':').map(Number);
    const dataHoraFim = new Date(dataSelecionada);
    dataHoraFim.setHours(fimH, fimM, 0, 0);

    const { error } = await supabaseClient
        .from('agendamentos')
        .update({
            conteudo: novosDados.conteudo,
            horario_inicio: dataHoraInicio.toISOString(),
            horario_fim: dataHoraFim.toISOString()
        })
        .eq('id', id);
    
    if (error) {
        console.error("Erro ao atualizar agendamento:", error);
        alert('Falha ao atualizar o agendamento.');
        return;
    }
    console.log("Agendamento atualizado com sucesso!");
    closeDetailsModal();
    await exibirAgendamentos();
}

// NOVA FUNÇÃO PARA DELETAR
async function deletarAgendamento() {
    if (!agendamentoSelecionado) return;

    const { error } = await supabaseClient
        .from('agendamentos')
        .delete()
        .eq('id', agendamentoSelecionado);

    if (error) {
        console.error('Erro ao deletar agendamento:', error);
        alert('Não foi possível deletar o agendamento.');
        return;
    }

    console.log('Agendamento deletado com sucesso!');
    closeDetailsModal();
    await exibirAgendamentos(); // Atualiza a timeline
}

// --- FUNÇÕES DE UI (INTERFACE) ---

function switchToEditMode() {
    displayView.classList.add('hidden');
    displayActions.classList.add('hidden');
    editView.classList.remove('hidden');
    editActions.classList.remove('hidden');

    // Pré-preenche o formulário com os dados do agendamento selecionado
    const inicio = new Date(agendamentoSelecionado.horario_inicio);
    const fim = new Date(agendamentoSelecionado.horario_fim);
    
    document.getElementById('agenda-edit-input').value = agendamentoSelecionado.conteudo;
    document.getElementById('agenda-edit-start-time').value = `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`;
    document.getElementById('agenda-edit-end-time').value = `${String(fim.getHours()).padStart(2, '0')}:${String(fim.getMinutes()).padStart(2, '0')}`;
}

function switchToDisplayMode() {
    editView.classList.add('hidden');
    editActions.classList.add('hidden');
    displayView.classList.remove('hidden');
    displayActions.classList.remove('hidden');
}

function openDetailsModal(agendamento) {
    agendamentoSelecionado = agendamento;

    const contentEl = document.getElementById('modal-agenda-content');
    const timeEl = document.getElementById('modal-agenda-time');

    contentEl.textContent = agendamento.conteudo;
    
    const inicio = new Date(agendamento.horario_inicio);
    const fim = new Date(agendamento.horario_fim);
    const formatTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    timeEl.textContent = `${formatTime(inicio)} - ${formatTime(fim)}`;
    
    detailsModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function closeDetailsModal() {
    detailsModal.classList.add('hidden');
    overlay.classList.add('hidden');
    agendamentoSelecionado = null;
    // Garante que o modal sempre abra na visualização
    setTimeout(switchToDisplayMode, 300); // Atraso para a animação de fechar
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
        item.dataset.id = agendamento.id
        item.style.top = `${top}%`;
        item.style.height = `${height}%`;
        item.innerHTML = `<span>${agendamento.conteudo}</span>`;
        
        timelineContent.appendChild(item);
    });
}

// --- INICIALIZAÇÃO ---

export function initAgendaHandler() {
    const timelineContent = document.getElementById('timeline-content');
    const closeButton = document.getElementById('close-details-button');
    const deleteButton = document.getElementById('delete-agenda-button');
    const editButton = document.getElementById('edit-agenda-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    // NOVOS EVENTOS PARA EDIÇÃO
    editButton.addEventListener('click', switchToEditMode);
    cancelEditButton.addEventListener('click', switchToDisplayMode);

    // Evento para abrir o modal ao clicar em um agendamento
    timelineContent.addEventListener('click', async (event) => {
        const agendaItem = event.target.closest('.agenda-item');
        if (!agendaItem) return;

        const id = agendaItem.dataset.id;
        // Busca os dados completos do agendamento clicado
        const { data, error } = await supabaseClient
            .from('agendamentos')
            .select('*')
            .eq('id', id)
            .single(); // .single() pega apenas um resultado

        if (error) {
            console.error('Erro ao buscar detalhes do agendamento:', error);
            return;
        }

        if (data) {
            openDetailsModal(data);
        }
    });

    // Eventos para os botões do modal
    closeButton.addEventListener('click', closeDetailsModal);
    overlay.addEventListener('click', closeDetailsModal); // Fecha ao clicar fora
    deleteButton.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja deletar este agendamento?')) {
            deletarAgendamento();
        }
    });

    // NOVOS EVENTOS PARA EDIÇÃO
    editButton.addEventListener('click', switchToEditMode);
    cancelEditButton.addEventListener('click', switchToDisplayMode);

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const novosDados = {
            conteudo: document.getElementById('agenda-edit-input').value.trim(),
            horaInicio: document.getElementById('agenda-edit-start-time').value,
            horaFim: document.getElementById('agenda-edit-end-time').value,
            dataSelecionada: getdataSelecionada() // Passa a data base para a função
        };
        atualizarAgendamento(agendamentoSelecionado.id, novosDados);
    });
}