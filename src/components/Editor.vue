<template>
  <div class="code-editor">
    <div class="line-numbers">
      <span v-for="n in lineCount" :key="n">{{ n }}</span>
    </div>
    <v-textarea
      ref="textareaRef"
      v-model="content"
      @input="updateContent"
      @scroll="syncScroll"
      @blur="$emit('unfocus')"
      hide-details
      variant="outlined"
      class="code-textarea"
      :style="{ 'font-family': 'monospace' }"
      no-resize
      auto-grow
    ></v-textarea>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue','unfocus'])

const content = ref(props.modelValue)
const textareaRef = ref(null)

// Compute line numbers based on content
const lineCount = computed(() => {
  return content.value.split('\n').length
})

// Sync scroll between line numbers and textarea
const syncScroll = () => {
  const textarea = textareaRef.value.$el.querySelector('textarea')
  const lineNumbers = textarea.parentElement.parentElement.querySelector('.line-numbers')
  if (lineNumbers && textarea) {
    lineNumbers.scrollTop = textarea.scrollTop
  }
}

// Update content and emit changes
const updateContent = () => {
  emit('update:modelValue', content.value)
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})
</script>

<style scoped>
.code-editor {
  display: flex;
  border: 1px solid v-bind('theme.current.value.colors["outline"]');
  border-radius: 4px;
  overflow: hidden;
  font-size: 14px; /* Consistent font size */
}

.line-numbers {
  width: 40px;
  background: v-bind('theme.current.value.colors["surface"]');
  text-align: right;
  padding: 12px 8px 12px 4px; /* Match textarea padding */
  line-height: 1.5; /* Match textarea line height */
  overflow-y: hidden; /* Prevent independent scrolling */
  user-select: none;
  display: flex;
  flex-direction: column;
}

.line-numbers span {
  display: block;
  line-height: 1.5; /* Match textarea line height */
  height: 1.5em; /* Ensure consistent height per line */
  font-family: monospace; /* Match textarea font */
}

.code-textarea {
  flex: 1;
  line-height: 1.5; /* Consistent line height */
  min-height: 200px;
  background: v-bind('theme.current.value.colors["background"]');
  overflow-x: auto;
  white-space: pre;
}

/* Override Vuetify textarea styles for alignment */
:deep(.v-textarea .v-field__input) {
  padding: 12px 8px !important; /* Match line-numbers padding */
  line-height: 1.5 !important; /* Match line-numbers line height */
  font-family: monospace !important;
  white-space: pre;
  mask-image: inherit;
  font-size: 14px !important; /* Match font size */
}

/* Ensure textarea and line numbers align */
:deep(.v-textarea textarea) {
  margin-top: 0 !important; /* Remove any default margin */
  padding-top: 0 !important; /* Remove any default padding */
}
</style>