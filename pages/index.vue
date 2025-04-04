<script setup lang="ts">
import {ref, onMounted, watch, computed, nextTick} from 'vue';
import type {Todo} from '~/types';

// Adiciona metadados da página para SEO e título
useHead({
  title: 'Lista de Tarefas - Nuxt Todo App',
  meta: [
    {
      name: 'description',
      content: 'Gerencie suas tarefas diárias com este aplicativo simples e eficiente feito com Nuxt 3 e TypeScript.',
    },
  ],
});

const LOCAL_STORAGE_KEY = 'nuxt-ts-todos';

// Estado para armazenar a lista de tarefas
const todos = ref<Todo[]>([]);

// Estado para armazenar o texto da nova tarefa
const newTodoText = ref('');

// Estado para o filtro
type FilterState = 'all' | 'active' | 'completed';
// Inicia com o filtro 'all' para exibir todas as tarefas
const currentFilter = ref<FilterState>('all');

// Estado para controlar a tarefa que está sendo editada
const editingTodoId = ref<number | null>(null);
// Guarda o texto original da tarefa para possibilitar o cancelamento da edição
const originalTodoText = ref<string>('');
// Ref para possibilitar o foco dinâmico no input de edição (se necessário)
const editInputRef = ref<HTMLInputElement | null>(null);

// Propriedade computada que filtra as tarefas conforme o filtro selecionado
const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed);
    case 'completed':
      return todos.value.filter(todo => todo.completed);
    case 'all':
    default:
      return todos.value;
  }
});

// Função para alterar o filtro ativo
const setFilter = (filter: FilterState) => {
  currentFilter.value = filter;
};

// Ao montar, carrega as tarefas do localStorage (apenas no cliente)
onMounted(() => {
  const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedTodos) {
    try {
      // Tenta converter a string armazenada em objeto JavaScript
      const parsedTodos = JSON.parse(storedTodos) as Todo[];
      if (Array.isArray(parsedTodos)) {
        todos.value = parsedTodos;
      } else {
        console.warn('Dados inválidos encontrados no localStorage para tarefas.');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Erro ao processar os dados do localStorage:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
});

// Observa alterações na lista de tarefas e atualiza o localStorage (ambiente cliente)
watch(
  todos,
  newTodos => {
    if (process.client) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTodos));
    }
  },
  {deep: true},
);

// Função para adicionar uma nova tarefa à lista
const addTodo = () => {
  const trimmedText = newTodoText.value.trim();
  if (!trimmedText) return;

  const newTodo: Todo = {
    id: Date.now(),
    text: trimmedText,
    completed: false,
  };

  todos.value.unshift(newTodo);
  newTodoText.value = '';
};

// Função para alternar o status 'completed' de uma tarefa
const toggleComplete = (id: number) => {
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
};

// Função para remover uma tarefa; se estiver em edição ela é cancelada
const removeTodo = (id: number) => {
  if (editingTodoId.value === id) {
    cancelEdit();
  }
  todos.value = todos.value.filter(t => t.id !== id);
};

// Inicia o modo de edição: salva o texto original e define a tarefa em edição
const startEdit = (todo: Todo) => {
  originalTodoText.value = todo.text;
  editingTodoId.value = todo.id;
  nextTick(() => {
    // O foco poderá ser gerenciado pelo componente filho; aqui apenas a atualização é notificada
  });
};

// Salva a edição, atualizando o texto ou removendo a tarefa se estiver vazio
const saveEdit = (id: number, newText: string) => {
  const trimmedText = newText.trim();
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    if (trimmedText) {
      todo.text = trimmedText;
    } else {
      removeTodo(id);
    }
  }
  editingTodoId.value = null;
  originalTodoText.value = '';
};

// Cancela o modo de edição sem reverter alterações (o pai gerencia o estado)
const cancelEdit = () => {
  editingTodoId.value = null;
  originalTodoText.value = '';
};
</script>

<template>
  <div class="app-container">
    <!-- Seção do Formulário -->
    <div class="form-section">
      <h1><Icon name="material-symbols:task-alt" /> Adicionar Tarefa</h1>
      <form @submit.prevent="addTodo" class="add-form">
        <div class="input-wrapper">
          <Icon name="material-symbols:add-task" class="input-icon" />
          <input type="text" v-model="newTodoText" placeholder="O que precisa ser feito?" required />
        </div>
        <button type="submit">
          <Icon name="material-symbols:add-circle-outline" />
          Adicionar
        </button>
      </form>

      <FilterControls :current-filter="currentFilter" @update:filter="setFilter" />
    </div>

    <!-- Divisor -->
    <div class="divider"></div>

    <!-- Seção da Lista -->
    <div class="list-section">
      <h1>Minhas Tarefas</h1>
      <ul class="todo-list">
        <TodoItem
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          :is-editing="editingTodoId === todo.id"
          @toggle-complete="toggleComplete"
          @remove-todo="removeTodo"
          @start-edit="startEdit"
          @save-edit="saveEdit"
          @cancel-edit="cancelEdit" />
      </ul>
      <p v-if="todos.length === 0" class="empty-message">Nenhuma tarefa ainda! Adicione uma acima.</p>
      <p v-else-if="filteredTodos.length === 0" class="empty-message">Nenhuma tarefa corresponde ao filtro atual.</p>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  font-family: 'Poppins', sans-serif;
}

h1 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.add-form {
  display: flex;
  gap: 10px;
  width: 100%;
}

.input-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
  display: flex;
}

.input-wrapper input {
  width: 100%;
  padding-left: 40px;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.add-form button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-message {
  background-color: #fff;
  border-radius: 4px;
  color: var(--text-color);
  margin-top: 20px;
  padding: 15px;
  text-align: center;
}
</style>
