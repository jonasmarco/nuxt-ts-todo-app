<script setup lang="ts">
type FilterState = 'all' | 'active' | 'completed';

// Define a propriedade que recebe o filtro atual do componente pai
const props = defineProps<{
  currentFilter: FilterState;
}>();

// Define o evento para atualizar o filtro selecionado no componente pai
const emit = defineEmits<{
  (e: 'update:filter', filter: FilterState): void;
}>();

// Emite a alteração do filtro quando o usuário clica em um botão
const setFilter = (filter: FilterState) => {
  emit('update:filter', filter);
};

// Lista de opções de filtro disponíveis
const filters = [
  {label: 'Todos', value: 'all'},
  {label: 'Ativos', value: 'active'},
  {label: 'Concluídos', value: 'completed'},
] as const;

// Retorna o ícone correspondente a cada filtro para exibição
const getIconForFilter = (filter: FilterState) => {
  const icons = {
    all: 'material-symbols:list',
    active: 'material-symbols:check-box-outline-blank',
    completed: 'material-symbols:check-box',
  };
  return icons[filter];
};
</script>

<template>
  <div class="filter-controls">
    <button v-for="filter in filters" :key="filter.value" @click="setFilter(filter.value)" :class="{active: currentFilter === filter.value}">
      <Icon :name="getIconForFilter(filter.value)" />
      {{ filter.label }}
    </button>
  </div>
</template>

<style scoped>
.filter-controls {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1.5rem 0;
  padding: 1rem;
}

.filter-controls button {
  align-items: center;
  background-color: transparent;
  border: 1px solid var(--divider-color);
  color: var(--text-color);
  display: flex;
  font-size: 0.875rem;
  gap: 6px;
  min-width: 100px;
  padding: 0.5rem 1rem;
}

.filter-controls button:hover {
  background-color: transparent;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-controls button.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--divider-color);
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .filter-controls button {
    flex: 1;
    min-width: auto;
  }
}
</style>
