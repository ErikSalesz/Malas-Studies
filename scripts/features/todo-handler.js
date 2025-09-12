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
                <input type="checkbox" ${tarefa.concluida ? 'checked' : ''}>
                <span>${tarefa.conteudo}</span>
            `;
            listaTarefas.appendChild(item);
        });
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

// Função que configura os "escutadores de evento" para a lista
export function initTodoList() {
    const listaTarefas = document.getElementById('todo-list');

    listaTarefas.addEventListener('change', async (event) => {
        // Verifica se o que foi alterado foi um checkbox
        if (event.target.matches('input[type="checkbox"]')) {
            const item = event.target.closest('.todo-item');
            const idTarefa = item.dataset.id;
            const novoStatus = event.target.checked;

            // Chama a função para atualizar no banco de dados
            const sucesso = await atualizarStatusTarefa(idTarefa, novoStatus);

            // Se a atualização no banco deu certo, atualiza o visual na tela
            if (sucesso) {
                item.classList.toggle('completed', novoStatus);
            } else {
                // Se deu erro, desfaz a mudança visual do checkbox
                event.target.checked = !novoStatus;
            }
        }
    });
}