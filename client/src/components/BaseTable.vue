<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full border-collapse" :data-testid="testId">
      <thead>
        <tr class="bg-muted">
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" class="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in data"
          :key="index"
          class="border-b border-border hover-elevate transition-colors"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-4 text-sm text-foreground"
          >
            <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
              {{ getNestedValue(item, column.key) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-6 py-4 text-right">
            <slot name="actions" :item="item" />
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-8 text-center text-muted-foreground">
            <slot name="empty">
              Không có dữ liệu
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
  data: any[];
  testId?: string;
}

defineProps<Props>();

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
};
</script>