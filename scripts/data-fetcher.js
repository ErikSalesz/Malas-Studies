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