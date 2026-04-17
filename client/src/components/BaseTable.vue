<template>
  <div class="relative w-full md:rounded-lg border-0 md:border md:border-border bg-transparent md:bg-card md:shadow-sm">
    <div class="w-full md:overflow-auto max-h-none md:max-h-[calc(100vh-250px)]">
      <table class="w-full border-collapse block md:table whitespace-normal md:whitespace-nowrap min-w-full" :data-testid="testId">
        <thead class="hidden md:table-header-group">
          <tr class="bg-muted">
            <th
              v-for="column in columns"
              :key="column.key"
              class="sticky top-0 z-10 px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted shadow-sm"
            >
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" class="sticky top-0 right-0 z-20 px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider align-middle bg-muted/95 backdrop-blur shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] border-l border-border/50">
              <div class="flex justify-center">Thao tác</div>
            </th>
          </tr>
        </thead>
        <tbody class="block md:table-row-group space-y-4 md:space-y-0">
          <tr
            v-for="(item, index) in data"
            :key="index"
            class="block md:table-row border border-border md:border-0 md:border-b md:border-border hover:bg-muted/50 md:hover-elevate transition-colors bg-card rounded-xl md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 group"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="block md:table-cell py-3 px-2 md:px-6 md:py-5 border-b border-border/30 md:border-0 last-of-type:border-0"
            >
              <div class="flex min-h-[2rem] items-center justify-between md:block w-full gap-4">
                <span class="text-xs font-semibold text-muted-foreground uppercase shrink-0 md:hidden max-w-[40%] text-left">
                  {{ column.label }}
                </span>
                <div class="w-auto flex flex-col justify-center items-end md:items-start md:justify-start text-right md:text-left text-sm text-foreground max-w-[60%] md:max-w-none">
                  <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                    {{ getNestedValue(item, column.key) }}
                  </slot>
                </div>
              </div>
            </td>
            <td 
              v-if="$slots.actions" 
              class="block md:table-cell px-2 py-4 md:px-6 md:py-5 align-middle bg-inherit mt-1 md:mt-0 pt-4 md:border-l md:border-border/50 border-t border-border/60 md:border-t-0"
            >
              <div class="flex items-center justify-between md:justify-center w-full">
                <span class="text-xs font-semibold text-muted-foreground uppercase shrink-0 md:hidden">Thao tác</span>
                <div class="flex justify-end gap-2 md:w-full">
                  <slot name="actions" :item="item" />
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="data.length === 0" class="block md:table-row">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="block md:table-cell px-4 py-12 text-center text-muted-foreground bg-card rounded-xl border border-border md:border-0 md:bg-transparent">
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