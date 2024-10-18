<template>
  <div ref="editorEl" :style="{ height: height }"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const loadAce = async () => {
  const ace = await import("ace-builds");
  await Promise.all([
    import("ace-builds/src-noconflict/mode-javascript"),
    import("ace-builds/src-noconflict/theme-monokai"),
    import("ace-builds/src-noconflict/ext-language_tools"),
    import("ace-builds/src-noconflict/snippets/javascript"),
    import("ace-builds/src-noconflict/worker-javascript"),
  ]);

  ace.config.set("basePath", "/node_modules/ace-builds/src-noconflict");
  ace.config.set("modePath", "/node_modules/ace-builds/src-noconflict");
  ace.config.set("themePath", "/node_modules/ace-builds/src-noconflict");
  ace.config.set("workerPath", "/node_modules/ace-builds/src-noconflict");

  return ace.default;
};

export default {
  name: 'AceEditor',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '300px',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorEl = ref(null);
    let editor = null;

    const initializeEditor = async () => {
      const ace = await loadAce();
      editor = ace.edit(editorEl.value, {
        theme: "ace/theme/monokai",
        mode: "ace/mode/javascript",
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        useWorker: true,
      });

      editor.setValue(props.modelValue);
      editor.clearSelection();

      editor.on('change', () => {
        emit('update:modelValue', editor.getValue());
      });

      const langTools = ace.require("ace/ext/language_tools");
      const customCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
          const completions = [
            { value: "module.exports", score: 1000, meta: "keyword" },
            { value: "config", score: 900, meta: "object" },
            { value: "fields", score: 900, meta: "array" },
            { value: "beforeProcess", score: 800, meta: "function" },
            { value: "afterProcess", score: 800, meta: "function" },
            { value: "data", score: 700, meta: "parameter" },
            { value: "bundle", score: 700, meta: "parameter" },
            { value: "resourceType", score: 600, meta: "property" },
            { value: "Patient", score: 500, meta: "resource" },
            { value: "Observation", score: 500, meta: "resource" },
            { value: "Organization", score: 500, meta: "resource" },
            { value: "Encounter", score: 500, meta: "resource" },
          ];
          callback(null, completions);
        },
      };

      langTools.setCompleters([
        langTools.textCompleter,
        langTools.snippetCompleter,
        langTools.keyWordCompleter,
        customCompleter,
      ]);
    };

    onMounted(() => {
      initializeEditor();
    });

    onBeforeUnmount(() => {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    });

    watch(() => props.modelValue, (newValue) => {
      if (editor && newValue !== editor.getValue()) {
        editor.setValue(newValue);
        editor.clearSelection();
      }
    });

    return {
      editorEl,
    };
  },
};
</script>
