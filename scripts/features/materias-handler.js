// scripts/features/materias-handler.js

import supabaseClient from '../lib/supabase-client.js';

// --- ELEMENTOS DO DOM ---
const modal = document.getElementById('subjects-modal');
const openButton = document.getElementById('open-subjects-button');
const closeButton = document.getElementById('close-subjects-button');
const subjectsList = document.getElementById('subjects-list');
const addForm = document.getElementById('add-subject-form');
const overlay = document.getElementById('overlay');

// --- FUNÇÕES DE DADOS (API) ---

export async function buscarMaterias() {
    const { data, error } = await supabaseClient
        .from('materias').select('id, nome, cor').order('nome');
    if (error) {
        console.error('Erro ao buscar matérias:', error);
        return [];
    }
    return data;
}

async function salvarMateria(nome, cor) {
    const { error } = await supabaseClient
        .from('materias').insert([{ nome, cor }]);
    if (error) {
        console.error('Erro ao salvar matéria:', error);
        alert('Falha ao salvar a matéria.');
        return;
    }
    await renderizarListaMaterias(); // Re-renderiza a lista com o novo item
}

// --- FUNÇÕES DE UI ---

function openModal() {
    renderizarListaMaterias();
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
}

async function renderizarListaMaterias() {
    subjectsList.innerHTML = '<li>Carregando...</li>';
    const materias = await buscarMaterias();
    subjectsList.innerHTML = '';

    if (materias.length === 0) {
        subjectsList.innerHTML = '<li>Nenhuma matéria cadastrada.</li>';
        return;
    }

    materias.forEach(materia => {
        const li = document.createElement('li');
        li.className = 'subject-item';
        li.innerHTML = `
            <div class="subject-info">
                <div class="subject-color-swatch" style="background-color: ${materia.cor};"></div>
                <span>${materia.nome}</span>
            </div>
            <!-- Botões de ação futuros (editar/deletar) -->
        `;
        subjectsList.appendChild(li);
    });
}

// --- INICIALIZAÇÃO ---

export function initMateriasHandler() {
    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    // Reutiliza o overlay para fechar este modal também
    overlay.addEventListener('click', () => {
        if (!modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    addForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nameInput = document.getElementById('subject-name-input');
        const colorInput = document.getElementById('subject-color-input');
        const nome = nameInput.value.trim();
        const cor = colorInput.value;

        if (nome) {
            await salvarMateria(nome, cor);
            addForm.reset(); // Limpa o formulário
        }
    });
}