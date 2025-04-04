<script setup lang="ts">
import {ref, watch, nextTick} from 'vue';
import type {Todo} from '~/types';

// Define as propriedades esperadas pelo componente
const props = defineProps<{
  todo: Todo; // Objeto contendo os dados da tarefa
  isEditing: boolean; // Indica se a tarefa está no modo de edição
}>();

// Define os eventos que o componente pode emitir para o componente pai
const emit = defineEmits<{
  (e: 'toggle-complete', id: number): void; // Alterna o status de conclusão da tarefa
  (e: 'remove-todo', id: number): void; // Remove a tarefa
  (e: 'start-edit', todo: Todo): void; // Inicia o modo de edição para a tarefa
  (e: 'save-edit', id: number, newText: string): void; // Salva as alterações realizadas na edição
  (e: 'cancel-edit'): void; // Cancela o modo de edição
}>();

// Estado local para gerenciar o valor do input de edição
const editText = ref('');
// Ref para acessar o elemento input durante a edição para aplicar foco
const editInput = ref<HTMLInputElement | null>(null);

// Observa a propriedade isEditing para configurar o campo de edição
watch(
  () => props.isEditing,
  newValue => {
    if (newValue) {
      // Quando o modo de edição é ativado:
      // 1. Preenche o input com o texto atual da tarefa
      editText.value = props.todo.text;
      // 2. Foca o input assim que o DOM for atualizado
      nextTick(() => {
        editInput.value?.focus();
      });
    }
  },
);

// Função para iniciar a edição via duplo clique no texto da tarefa
const handleDoubleClick = () => {
  emit('start-edit', props.todo);
};

// Emite o evento para salvar a edição com o texto atualizado
const handleSave = () => {
  const trimmedText = editText.value.trim();
  emit('save-edit', props.todo.id, trimmedText);
};

// Emite o evento para cancelar a edição
const handleCancel = () => {
  emit('cancel-edit');
};

// Emite o evento para alternar o status 'completed' da tarefa
const handleToggle = () => {
  emit('toggle-complete', props.todo.id);
};

// Emite o evento para remover a tarefa
const handleRemove = () => {
  emit('remove-todo', props.todo.id);
};
</script>

<template>
  <li :class="{completed: todo.completed, editing: isEditing}" class="todo-item">
    <div v-if="!isEditing" class="view">
      <input type="checkbox" :checked="todo.completed" @change="handleToggle" class="todo-checkbox" />
      <span class="todo-text" @dblclick="handleDoubleClick">
        {{ todo.text }}
      </span>
      <button @click="handleRemove" class="remove-btn">
        <Icon name="material-symbols:delete-outline" />
      </button>
    </div>

    <div v-else class="edit">
      <input type="text" ref="editInput" v-model="editText" @blur="handleSave" @keyup.enter="handleSave" @keyup.esc="handleCancel" class="edit-input" />
    </div>
  </li>
</template>

<style scoped>
.todo-item {
  align-items: center;
  background-color: var(--card-background);
  border-bottom: 1px solid var(--divider-color);
  display: flex;
  gap: 15px;
  padding: 12px 15px;
  transition: background-color 0.2s ease;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed {
  background-color: var(--background-color);
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--primary-color);
}

.todo-item .view {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 15px;
}

.todo-item .edit {
  margin: 0;
  padding: 0;
  width: 100%;
}

.edit-input {
  width: calc(100% - 10px);
  padding: 12px 15px;
  font-size: inherit;
  font-family: inherit;
  border: 1px solid var(--border-color);
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  line-height: inherit;
}

.todo-item.editing .view {
  display: none;
}

.todo-item .edit {
  display: none;
}

.todo-item.editing .edit {
  display: block;
}

.todo-checkbox {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.todo-text {
  cursor: pointer;
  flex-grow: 1;
  color: var(--text-color);
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--danger-color);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: var(--primary-hover);
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
