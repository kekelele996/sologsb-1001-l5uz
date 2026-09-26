<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../store/editor'
import type { Cue } from '../types'
import { BASE_RATE, dubbingFit, isOverflow } from '../utils/dubbing'

const props = defineProps<{ cue: Cue }>()
const store = useEditorStore()
const fit = computed(() => dubbingFit(props.cue))
const overflow = computed(() => isOverflow(fit.value))
const tooltip = computed(() => store.t('dubbingDetail', {
  chars: fit.value.chars,
  rate: BASE_RATE,
  speed: props.cue.speed,
  estimated: fit.value.estimated.toFixed(1),
  window: fit.value.window.toFixed(1),
}))
</script>

<template>
  <span v-if="fit.chars" class="dubbing-fit" :class="{ overflow }" :title="tooltip">
    <template v-if="overflow">+{{ fit.overflow.toFixed(2) }}s</template>
    <template v-else>≈{{ fit.estimated.toFixed(1) }}s</template>
  </span>
</template>
