<template>
  <div class="relative w-full rounded-lg border border-border bg-card shadow-sm">
    <div class="w-full overflow-x-auto overflow-y-hidden touch-pan-x max-h-[calc(100vh-250px)]">
      <table class="w-full border-collapse whitespace-nowrap min-w-full" :data-testid="testId">
        <thead>
          <tr class="bg-muted">
            <th
              v-for="(column, idx) in columns"
              :key="column.key"
              :class="[
                'sticky top-0 z-10 px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted shadow-sm',
                idx === 0 ? 'sm:static sticky left-0 z-20 bg-muted/95 backdrop-blur sm:shadow-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
              ]"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" class="sticky top-0 sm:static right-0 z-20 px-4 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider align-middle bg-muted/95 backdrop-blur sm:shadow-none sm:border-l-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] border-l border-border/50">
              <div class="flex justify-center">Thao tác</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in data"
            :key="index"
            class="border-b border-border hover-elevate transition-colors bg-card group"
          >
            <td
              v-for="(column, idx) in columns"
              :key="column.key"
              :class="[
                'px-4 sm:px-6 py-4 sm:py-5 text-sm text-foreground bg-inherit',
                idx === 0 ? 'sm:static sticky left-0 z-10 sm:shadow-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
              ]"
            >
              <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-4 sm:px-6 py-4 sm:py-5 align-middle bg-inherit sm:static sticky right-0 z-10 sm:shadow-none shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] border-l sm:border-l-0 border-border/50">
              <div class="flex justify-center">
                <slot name="actions" :item="item" />
              </div>
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-4 sm:px-6 py-8 text-center text-muted-foreground">
              <slot name="empty">
                Không có dữ liệu
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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