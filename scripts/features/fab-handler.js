// scripts/features/fab-handler.js

import { salvarTarefa } from './agenda-handler.js';

// Seleciona todos os elementos que vamos controlar
const fabButton = document.getElementById('fab-add-button');
const overlay = document.getElementById('overlay');
const bottomSheet = document.getElementById('actions-bottom-sheet');
const addTodoAction = document.getElementById('add-todo-action');
const todoModal = document.getElementById('todo-modal');
const todoForm = document.getElementById('todo-form');
const cancelTodoButton = document.getElementById('cancel-todo-button');

// Funções para mostrar/esconder elementos
const show = (element) => element.classList.remove('hidden');
const hide = (element) => element.classList.add('hidden');

function openBottomSheet() {
    show(overlay);
    show(bottomSheet);
}

function closeBottomSheet() {
    hide(overlay);
    hide(bottomSheet);
}

function openTodoModal() {
    closeBottomSheet(); // Fecha o menu de ações antes de abrir o modal
    show(overlay); // O overlay continua visível para o modal
    show(todoModal);
}

function closeTodoModal() {
    hide(overlay);
    hide(todoModal);
    todoForm.reset(); // Limpa o formulário
}

// Função que será chamada para salvar o to-do (por enquanto, só no console)
async function saveTodo(event) {
    event.preventDefault();
    const todoInput = document.getElementById('todo-input');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');

    const conteudo = todoInput.value.trim();
    const horaInicio = startTimeInput.value;
    const horaFim = endTimeInput.value;

    if (conteudo && horaInicio && horaFim) {
        // CHAMA A NOVA FUNÇÃO COM OS NOVOS DADOS
        await salvarAgendamento(conteudo, horaInicio, horaFim);
        closeTodoModal();
    }
}

export function initFabHandler() {
    // Renderiza os ícones de Feather.js nos novos botões
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Adiciona os eventos
    fabButton.addEventListener('click', openBottomSheet);
    overlay.addEventListener('click', () => {
        closeBottomSheet();
        closeTodoModal();
    });
    addTodoAction.addEventListener('click', openTodoModal);
    cancelTodoButton.addEventListener('click', closeTodoModal);
    todoForm.addEventListener('submit', saveTodo);
}