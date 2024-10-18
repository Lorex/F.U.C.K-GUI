<template>
  <q-page class="config-builder-page">
    <div class="row q-col-gutter-md config-container">
      <!-- 左側設定區塊 -->
      <div class="col-12 col-md-6 config-form-wrapper">
        <config-form @config-updated="updateConfig" ref="configForm" />
      </div>

      <!-- 右側生成的設定檔區塊 -->
      <div class="col-12 col-md-6 config-preview-wrapper">
        <q-card class="config-preview-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <h2 class="text-h5 text-weight-bold q-my-none">
                {{ $t("generatedConfig") }}
              </h2>
              <q-btn
                :label="$t('downloadConfig')"
                color="primary"
                @click="downloadConfig"
                icon="download"
              />
            </div>
            <p class="text-caption q-mb-md">
              {{ $t("generatedConfigTooltip") }}
            </p>
          </q-card-section>

          <q-card-section class="config-preview">
            <div
              ref="generatedConfigEditorEl"
              class="ace-editor-container"
            ></div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import ConfigForm from "components/ConfigBuilder/ConfigForm.vue";
import { useI18n } from "vue-i18n";

const loadAce = async () => {
  const ace = await import("ace-builds");
  await Promise.all([
    import("ace-builds/src-noconflict/mode-javascript"),
    import("ace-builds/src-noconflict/theme-monokai"),
    import("ace-builds/src-noconflict/ext-language_tools"),
  ]);

  ace.config.set("basePath", "/node_modules/ace-builds/src-noconflict");
  ace.config.set("modePath", "/node_modules/ace-builds/src-noconflict");
  ace.config.set("themePath", "/node_modules/ace-builds/src-noconflict");
  ace.config.set("workerPath", "/node_modules/ace-builds/src-noconflict");

  return ace;
};

export default {
  name: "ConfigBuilderPage",
  components: {
    ConfigForm,
  },
  setup() {
    const { t } = useI18n();
    const generatedConfig = ref("");
    const generatedConfigEditorEl = ref(null);
    let generatedConfigEditor = null;
    const configForm = ref(null);

    const updateConfig = (newConfig) => {
      generatedConfig.value = newConfig;
      if (generatedConfigEditor) {
        generatedConfigEditor.setValue(newConfig);
        generatedConfigEditor.clearSelection();
        generatedConfigEditor.resize();
      }
    };

    const downloadConfig = () => {
      const configObject = JSON.parse(
        generatedConfig.value.match(/module\.exports\.config = (.+?);/s)[1]
      );
      const fileName = `${configObject.name || "config"}.js`;

      const blob = new Blob([generatedConfig.value], {
        type: "application/javascript",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    onMounted(async () => {
      const ace = await loadAce();

      nextTick(() => {
        generatedConfigEditor = ace.edit(generatedConfigEditorEl.value, {
          mode: "ace/mode/javascript",
          theme: "ace/theme/monokai",
          readOnly: true,
          highlightActiveLine: false,
          highlightGutterLine: false,
          showPrintMargin: false,
          fontSize: 14,
        });
        generatedConfigEditor.setOptions({
          maxLines: Infinity,
          minLines: 10,
          wrap: true,
          autoScrollEditorIntoView: true,
        });
        generatedConfigEditor.renderer.setScrollMargin(10, 10, 10, 10);
        generatedConfigEditor.resize(true);

        // 在 Ace 編輯器初始化後,調用 ConfigForm 的 generateInitialConfig 方法
        configForm.value.generateInitialConfig();
      });
    });

    return {
      generatedConfig,
      updateConfig,
      downloadConfig,
      generatedConfigEditorEl,
      configForm,
    };
  },
};
</script>

<style lang="scss" scoped>
.config-builder-page {
  padding: 16px;
  height: calc(100vh - 72px);
}

.config-container {
  height: 100%;
}

.config-form-wrapper {
  height: 100%;
  overflow-y: auto;
}

.config-preview-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-preview-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.config-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ace-editor-container {
  flex: 1;
  overflow: auto;
  font-size: 14px;
}
</style>
