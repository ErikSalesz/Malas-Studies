// scripts/features/todo-handler.js

import supabaseClient from '../lib/supabase-client.js';
import { getdataSelecionada } from '../components/date-picker.js'; // Importa nosso getter

// Função para SALVAR uma nova tarefa no banco de dados
export async function salvarTarefa(conteudo) {
    const data = getdataSelecionada();
    const dataFormatada = data.toISOString().split('T')[0];

    const { data: novaTarefa, error } = await supabaseClient
        .from('tarefas')
        .insert([
            {
                conteudo: conteudo,
                data_tarefa: dataFormatada,
                concluida: false, // <-- A LINHA QUE FALTAVA!
            }
        ]);
    
    if (error) {
        console.error('Erro ao salvar tarefa:', error);
        alert('Não foi possível salvar a tarefa.');
        return;
    }

    console.log('Tarefa salva com sucesso:', novaTarefa);
    // Após salvar, busca e exibe todas as tarefas do dia novamente
    await exibirTarefas();
}

// Função para BUSCAR e EXIBIR as tarefas na tela
export async function exibirTarefas() {
    const data = getdataSelecionada();
    const dataFormatada = data.toISOString().split('T')[0];
    const listaTarefas = document.getElementById('todo-list');

    // Busca no Supabase todas as tarefas onde 'data_tarefa' é igual à data selecionada
    const { data: tarefas, error } = await supabaseClient
        .from('tarefas')
        .select('*')
        .eq('data_tarefa', dataFormatada)
        .order('created_at', { ascending: true }); // Ordena as mais antigas primeiro

    if (error) {
        console.error('Erro ao buscar tarefas:', error);
        return;
    }

    // Limpa a lista antes de adicionar os novos itens
    listaTarefas.innerHTML = '';

    if (tarefas.length === 0) {
        listaTarefas.innerHTML = '<li>Nenhuma tarefa para hoje.</li>';
    } else {
        tarefas.forEach(tarefa => {
            const item = document.createElement('li');
            item.className = 'todo-item';
            item.dataset.id = tarefa.id; // <-- ADICIONE ESTA LINHA

            if (tarefa.concluida) {
                item.classList.add('completed');
            }
            item.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" ${tarefa.concluida ? 'checked' : ''}>
                    <span>${tarefa.conteudo}</span>
                </div>
                <button class="delete-button" aria-label="Deletar tarefa">
                    <i data-feather="trash-2"></i>
                </button>
            `;
            listaTarefas.appendChild(item);
        });
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
}

// Função para ATUALIZAR o status de uma tarefa
export async function atualizarStatusTarefa(id, novoStatus) {
    const { error } = await supabaseClient
        .from('tarefas')
        .update({ concluida: novoStatus })
        .eq('id', id); // 'eq' significa "equals" (igual a)

    if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        alert('Não foi possível atualizar a tarefa.');
        return false; // Retorna false se deu erro
    }

    console.log(`Tarefa ${id} atualizada para ${novoStatus}`);
    return true; // Retorna true se deu certo
}

// Função para DELETAR uma tarefa
export async function deletarTarefa(id) {
    const { error } = await supabaseClient
        .from('tarefas')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar tarefa:', error);
        alert('Não foi possível deletar a tarefa.');
        return false;
    }

    console.log(`Tarefa ${id} deletada com sucesso`);
    return true;
}

// Função que configura os "escutadores de evento" para a lista
export function initTodoList() {
    const listaTarefas = document.getElementById('todo-list');

    // Mude o evento para 'click' para capturar cliques nos botões também
    listaTarefas.addEventListener('click', async (event) => {
        // --- Lógica para DELETAR ---
        const deleteButton = event.target.closest('.delete-button');
        if (deleteButton) {
            const item = deleteButton.closest('.todo-item');
            const idTarefa = item.dataset.id;
            
            // Pede confirmação antes de deletar (boa prática)
            if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
                const sucesso = await deletarTarefa(idTarefa);
                if (sucesso) {
                    // Remove o item da tela para feedback instantâneo
                    item.remove();
                }
            }
            return; // Encerra a função aqui
        }

        // --- Lógica para ATUALIZAR STATUS (agora dentro do evento 'click') ---
        const checkbox = event.target.matches('input[type="checkbox"]') ? event.target : null;
        if (checkbox) {
            const item = checkbox.closest('.todo-item');
            const idTarefa = item.dataset.id;
            const novoStatus = checkbox.checked;

            const sucesso = await atualizarStatusTarefa(idTarefa, novoStatus);

            if (sucesso) {
                item.classList.toggle('completed', novoStatus);
            } else {
                checkbox.checked = !novoStatus;
            }
        }
    });
}