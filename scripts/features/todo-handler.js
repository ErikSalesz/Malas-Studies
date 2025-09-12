// scripts/features/todo-handler.js

import supabaseClient from '../lib/supabase-client.js';
import { getdataSelecionada } from '../components/date-picker.js'; // Importa nosso getter

// Função para SALVAR uma nova tarefa no banco de dados
export async function salvarTarefa(conteudo) {
    const data = getdataSelecionada();
    // Formata a data para 'YYYY-MM-DD', que é o formato que o Supabase entende para o tipo 'date'
    const dataFormatada = data.toISOString().split('T')[0];

    const { data: novaTarefa, error } = await supabaseClient
        .from('tarefas')
        .insert([
            {
                conteudo: conteudo,
                data_tarefa: dataFormatada
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