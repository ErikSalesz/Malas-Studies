// scripts/features/agenda-handler.js (VERSÃO CORRIGIDA E ROBUSTA)

import supabaseClient from '../lib/supabase-client.js';
import { getdataSelecionada } from '../components/date-picker.js';

// --- ELEMENTOS GLOBAIS DO MÓDULO ---
const detailsModal = document.getElementById('agenda-details-modal');
const overlay = document.getElementById('overlay');
let agendamentoSelecionado = null; // Guarda o objeto do agendamento atualmente aberto

// Elementos da UI do Modal
const displayView = document.getElementById('modal-content-display');
const editView = document.getElementById('modal-content-edit');
const displayActions = document.getElementById('modal-actions-display');
const editActions = document.getElementById('modal-actions-edit');
const editForm = document.getElementById('agenda-edit-form');
const contentEl = document.getElementById('modal-agenda-content');
const timeEl = document.getElementById('modal-agenda-time');

// --- FUNÇÕES DE API (BANCO DE DADOS) ---

export async function salvarAgendamento(conteudo, horaInicio, horaFim) {
    const dataSelecionada = getdataSelecionada();
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const dataHoraInicio = new Date(dataSelecionada);
    dataHoraInicio.setHours(inicioH, inicioM, 0, 0);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    const dataHoraFim = new Date(dataSelecionada);
    dataHoraFim.setHours(fimH, fimM, 0, 0);

    const { error } = await supabaseClient
        .from('agendamentos').insert([{
            conteudo,
            horario_inicio: dataHoraInicio.toISOString(),
            horario_fim: dataHoraFim.toISOString(),
            concluida: false
        }]);

    if (error) {
        console.error('Erro ao salvar agendamento:', error);
        alert('Não foi possível salvar o agendamento.');
        return;
    }
    await exibirAgendamentos();
}

async function atualizarAgendamento(id, novosDados) {
    const { dataSelecionada, conteudo, horaInicio, horaFim } = novosDados;
    const [inicioH, inicioM] = horaInicio.split(':').map(Number);
    const dataHoraInicio = new Date(dataSelecionada);
    dataHoraInicio.setHours(inicioH, inicioM, 0, 0);
    const [fimH, fimM] = horaFim.split(':').map(Number);
    const dataHoraFim = new Date(dataSelecionada);
    dataHoraFim.setHours(fimH, fimM, 0, 0);

    const { error } = await supabaseClient
        .from('agendamentos').update({
            conteudo,
            horario_inicio: dataHoraInicio.toISOString(),
            horario_fim: dataHoraFim.toISOString()
        }).eq('id', id);

    if (error) {
        console.error("Erro ao atualizar agendamento:", error);
        alert('Falha ao atualizar o agendamento.');
        return;
    }
    closeDetailsModal();
    await exibirAgendamentos();
}

async function deletarAgendamento() {
    if (!agendamentoSelecionado) return;
    const { error } = await supabaseClient
        .from('agendamentos').delete().eq('id', agendamentoSelecionado.id);

    if (error) {
        console.error('Erro ao deletar agendamento:', error);
        alert('Não foi possível deletar o agendamento.');
        return;
    }
    closeDetailsModal();
    await exibirAgendamentos();
}

// --- FUNÇÕES DE CONTROLE DA UI ---

function switchToEditMode() {
    displayView.classList.add('hidden');
    displayActions.classList.add('hidden');
    editView.classList.remove('hidden');
    editActions.classList.remove('hidden');

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
    const inicio = new Date(agendamento.horario_inicio);
    const fim = new Date(agendamento.horario_fim);
    const formatTime = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    contentEl.textContent = agendamento.conteudo;
    timeEl.textContent = `${formatTime(inicio)} - ${formatTime(fim)}`;
    
    switchToDisplayMode(); // GARANTE que sempre abra no modo de visualização
    detailsModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function closeDetailsModal() {
    detailsModal.classList.add('hidden');
    overlay.classList.add('hidden');
    agendamentoSelecionado = null;
}

export async function exibirAgendamentos() {
    const dataSelecionada = getdataSelecionada();
    const timelineContent = document.getElementById('timeline-content');
    document.querySelectorAll('.agenda-item').forEach(item => item.remove());

    const inicioDoDia = new Date(dataSelecionada);
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date(dataSelecionada);
    fimDoDia.setHours(23, 59, 59, 999);

    const { data: agendamentos, error } = await supabaseClient
        .from('agendamentos').select('*')
        .gte('horario_inicio', inicioDoDia.toISOString())
        .lte('horario_inicio', fimDoDia.toISOString())
        .order('horario_inicio');

    if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return;
    }
    agendamentos.forEach(agendamento => {
        const inicio = new Date(agendamento.horario_inicio);
        const fim = new Date(agendamento.horario_fim);
        const minutoInicio = inicio.getHours() * 60 + inicio.getMinutes();
        const minutoFim = fim.getHours() * 60 + fim.getMinutes();
        const duracao = minutoFim - minutoInicio;
        const top = (minutoInicio / 1440) * 100;
        const height = (duracao / 1440) * 100;

        const item = document.createElement('div');
        item.className = 'agenda-item';
        item.dataset.id = agendamento.id;
        item.style.top = `${top}%`;
        item.style.height = `${height}%`;
        item.innerHTML = `<span>${agendamento.conteudo}</span>`;
        timelineContent.appendChild(item);
    });
}

// --- INICIALIZAÇÃO DOS EVENTOS ---

export function initAgendaHandler() {
    const timelineContent = document.getElementById('timeline-content');
    const closeButton = document.getElementById('close-details-button');
    const deleteButton = document.getElementById('delete-agenda-button');
    const editButton = document.getElementById('edit-agenda-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');

    timelineContent.addEventListener('click', async (event) => {
        const agendaItem = event.target.closest('.agenda-item');
        if (!agendaItem) return;
        const id = agendaItem.dataset.id;
        const { data, error } = await supabaseClient
            .from('agendamentos').select('*').eq('id', id).single();
        if (error) {
            console.error('Erro ao buscar detalhes do agendamento:', error);
            return;
        }
        if (data) openDetailsModal(data);
    });

    closeButton.addEventListener('click', closeDetailsModal);
    overlay.addEventListener('click', closeDetailsModal);
    deleteButton.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja deletar este agendamento?')) {
            deletarAgendamento();
        }
    });
    
    editButton.addEventListener('click', switchToEditMode);
    cancelEditButton.addEventListener('click', switchToDisplayMode);

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const novosDados = {
            conteudo: document.getElementById('agenda-edit-input').value.trim(),
            horaInicio: document.getElementById('agenda-edit-start-time').value,
            horaFim: document.getElementById('agenda-edit-end-time').value,
            dataSelecionada: getdataSelecionada()
        };
        atualizarAgendamento(agendamentoSelecionado.id, novosDados);
    });
}