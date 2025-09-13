// scripts/features/materias-handler.js

import supabaseClient from '../lib/supabase-client.js';

/**
 * Busca todas as matérias do usuário logado no banco de dados.
 * @returns {Promise<Array>} Uma promessa que resolve para uma lista de matérias.
 */
export async function buscarMaterias() {
    const { data, error } = await supabaseClient
        .from('materias')
        .select('id, nome, cor')
        .order('nome'); // Ordena por nome para a lista ficar organizada

    if (error) {
        console.error('Erro ao buscar matérias:', error);
        // Retorna uma lista vazia em caso de erro
        return [];
    }

    return data;
}

// No futuro, aqui também teríamos funções para criar, editar e deletar matérias.