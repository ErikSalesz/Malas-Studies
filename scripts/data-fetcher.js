// scripts/data-fetcher.js

// Importa nosso cliente Supabase já configurado
import supabaseClient from './supabase-client.js';

export async function carregarMensagens() {
    const lista = document.getElementById('mensagens-lista');
    
    // Usa o cliente para fazer uma query na tabela 'mensagens'
    const { data: mensagens, error } = await supabaseClient // <-- Mude aqui também
        .from('mensagens')
        .select('*');
        
    if (error) {
        console.error('Erro ao buscar mensagens:', error);
        lista.innerHTML = '<li>Erro ao carregar mensagens.</li>';
        return;
    }
    
    // Limpa a lista e preenche com os dados do banco
    lista.innerHTML = ''; 
    if (mensagens.length === 0) {
        lista.innerHTML = '<li>Nenhuma mensagem encontrada.</li>';
    } else {
        for (const mensagem of mensagens) {
            const item = document.createElement('li');
            item.textContent = mensagem.conteudo;
            lista.appendChild(item);
        }
    }
}

// NOVA FUNÇÃO PARA ADICIONAR MENSAGENS
async function adicionarMensagem(conteudo) {
    const { data, error } = await supabaseClient
        .from('mensagens')
        .insert([
            { conteudo: conteudo }
        ]);

    if (error) {
        console.error('Erro ao adicionar mensagem:', error);
        alert('Falha ao enviar a mensagem!');
        return false;
    }

    console.log('Mensagem adicionada:', data);
    return true;
}

// NOVA FUNÇÃO PARA INICIALIZAR O FORMULÁRIO
export function initFormulario() {
    const form = document.getElementById('add-message-form');
    const input = document.getElementById('message-input');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const conteudo = input.value.trim();
        if (conteudo.length === 0) {
            return; // Não faz nada se o campo estiver vazio
        }

        const sucesso = await adicionarMensagem(conteudo);

        if (sucesso) {
            input.value = ''; // Limpa o campo do formulário
            carregarMensagens(); // Recarrega a lista para mostrar a nova mensagem
        }
    });
}