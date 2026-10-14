<template>
  <div class="dropzone">
    <label class="upload-area" :class="{ dragover: dragging }" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="onDrop">
      <input ref="inputRef" type="file" accept="image/*" hidden @change="onChange" />

      <template v-if="!previewSrc">
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div class="upload-text">{{ label }}</div>
        <div class="upload-hint">{{ hint }}</div>
      </template>

      <img v-else :src="previewSrc" class="upload-preview" :alt="label" />
    </label>

    <button v-if="previewSrc" class="upload-remove" type="button" @click="clear">重新选择</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { compressImage, previewUrl } from '@/utils/image'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  modelValue: File | null
  label: string
  hint?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [File | null] }>()

const toast = useToast()
const inputRef = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const internalUrl = ref('')

const previewSrc = computed(() => internalUrl.value)

watch(
  () => props.modelValue,
  (file) => {
    if (internalUrl.value) {
      URL.revokeObjectURL(internalUrl.value)
      internalUrl.value = ''
    }
    if (file) internalUrl.value = previewUrl(file)
  },
)

onBeforeUnmount(() => {
  if (internalUrl.value) URL.revokeObjectURL(internalUrl.value)
})

async function accept(file: File) {
  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件')
    return
  }
  const compressed = await compressImage(file)
  emit('update:modelValue', compressed)
}

function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) accept(file)
  if (inputRef.value) inputRef.value.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) accept(file)
}

function clear() {
  emit('update:modelValue', null)
}
</script>

<style scoped>
.dropzone {
  display: flex;
  flex-direction: column;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed #d1d5db;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  background: #fafafa;
  min-height: 168px;
  overflow: hidden;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: var(--primary);
  background: #f0fdfa;
}

.upload-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 4px;
  background: #f0fdfa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon svg {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.upload-text {
  font-size: 14px;
  color: #4b5563;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.upload-preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 6px;
}

.upload-remove {
  margin-top: 8px;
  font-size: 12px;
  color: var(--primary);
  align-self: center;
}

.upload-remove:hover {
  text-decoration: underline;
}
</style>
