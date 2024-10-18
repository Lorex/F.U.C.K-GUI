<template>
  <div class="config-form-container">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <!-- 基本設定 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold">{{ $t("configSettings") }}</div>
          <p class="text-caption q-mt-sm q-mb-none">
            {{ $t("configSettingsTooltip") }}
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-6">
              <q-input
                v-model="config.name"
                :label="$t('configName')"
                :hint="$t('configNameTooltip')"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-btn
                    color="primary"
                    flat
                    dense
                    :label="$t('generateRandomName')"
                    @click="generateRandomName"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-input
                v-model="config.version"
                :label="$t('version')"
                :hint="$t('versionTooltip')"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-xs-12 col-sm-6">
              <q-select
                v-model="config.action"
                :options="actionOptions"
                :label="$t('action')"
                :hint="$t('actionTooltip')"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-select
                v-model="config.fhir_version"
                :options="fhirVersionOptions"
                :label="$t('fhirVersion')"
                :hint="$t('fhirVersionTooltip')"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12">
              <q-input
                v-if="config.action === 'upload'"
                v-model="config.fhirServerBaseUrl"
                :label="$t('fhirServerBaseUrl')"
                :hint="$t('fhirServerBaseUrlTooltip')"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12">
              <q-toggle
                v-model="config.validate"
                :label="
                  config.validate
                    ? $t('enableValidation')
                    : $t('disableValidation')
                "
                :hint="$t('validateTooltip')"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 欄位映射 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold">{{ $t("fieldMappings") }}</div>
          <p class="text-caption q-mt-sm q-mb-none">
            {{ $t("fieldMappingsTooltip") }}
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-for="(field, index) in fields" :key="index" class="q-mb-md">
            <q-btn-group stretch class="full-width">
              <q-input
                v-model="field.source"
                :label="$t('sourceField')"
                outlined
                dense
                class="col"
              />
              <q-input
                v-model="field.target"
                :label="$t('targetField')"
                outlined
                dense
                class="col"
              />
              <q-btn-dropdown
                color="secondary"
                :label="$t('fieldPreprocessor')"
                @click="toggleFieldPreprocessor(index)"
                icon="code"
              />
              <q-btn
                :label="$t('removeField')"
                color="negative"
                @click="removeField(index)"
                icon="delete"
              />
            </q-btn-group>
            <div v-if="field.showPreprocessor" class="q-mt-sm">
              <q-toggle
                v-model="field.enablePreprocessor"
                :label="$t('enableFieldPreprocessor')"
              />
              <AceEditor
                v-if="field.enablePreprocessor"
                v-model="field.preprocessor"
                height="200px"
              />
            </div>
          </div>
          <q-btn
            :label="$t('addField')"
            color="primary"
            @click="addField"
            class="q-mt-sm"
            icon="add"
          />
        </q-card-section>
      </q-card>

      <!-- 全域處理器 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ $t("globalProcessors") }}
          </div>
          <p class="text-caption q-mt-sm q-mb-none">
            {{ $t("globalProcessorsTooltip") }}
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-tabs
            v-model="processorTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <q-tab name="preprocessor" :label="$t('preprocessor')" />
            <q-tab name="postprocessor" :label="$t('postprocessor')" />
          </q-tabs>

          <q-separator />

          <q-tab-panels
            v-model="processorTab"
            animated
            transition-prev="fade"
            transition-next="fade"
          >
            <q-tab-panel name="preprocessor">
              <q-toggle
                v-model="enablePreprocessor"
                :label="
                  enablePreprocessor
                    ? $t('enablePreprocessor')
                    : $t('disablePreprocessor')
                "
              />
              <AceEditor
                v-if="enablePreprocessor"
                v-model="preprocessorCode"
                height="300px"
              />
            </q-tab-panel>
            <q-tab-panel name="postprocessor">
              <q-toggle
                v-model="enablePostprocessor"
                :label="
                  enablePostprocessor
                    ? $t('enablePostprocessor')
                    : $t('disablePostprocessor')
                "
              />
              <AceEditor
                v-if="enablePostprocessor"
                v-model="postprocessorCode"
                height="300px"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <!-- 全域資源模板 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ $t("globalResourceTemplates") }}
          </div>
          <p class="text-caption q-mt-sm q-mb-none">
            {{ $t("globalResourceTemplatesTooltip") }}
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="loadingSchema" class="text-center q-my-lg">
            <q-spinner color="primary" size="3em" />
            <p>{{ $t("loadingFhirSchema") }}</p>
          </div>
          <div
            v-else
            v-for="(template, index) in globalResourceTemplates"
            :key="index"
            class="q-mb-md"
          >
            <q-btn-group stretch class="full-width">
              <q-select
                v-model="template.resourceType"
                :options="availableResources"
                :label="$t('selectResourceType')"
                outlined
                dense
                emit-value
                map-options
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                @filter="filterResources"
                @filter-abort="filterResources('', (callback) => callback())"
                class="col"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ $t('noResults') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-btn-dropdown
                color="secondary"
                :label="$t('editTemplate')"
                @click="toggleResourceTemplateEditor(index)"
                icon="edit"
              />
              <q-btn
                :label="$t('removeResource')"
                color="negative"
                @click="removeResourceTemplate(index)"
                icon="delete"
              />
            </q-btn-group>
            <div v-if="template.showEditor" class="q-mt-sm">
              <AceEditor v-model="template.content" height="300px" />
            </div>
          </div>
          <q-btn
            :label="$t('addResource')"
            color="primary"
            @click="addResourceTemplate"
            class="q-mt-sm"
            icon="add"
          />
        </q-card-section>
      </q-card>
    </q-form>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import AceEditor from "../AceEditor.vue";
import js_beautify from "js-beautify";

// 新增這個函數來加載 Ace 編輯器
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
  name: "ConfigForm",
  components: {
    AceEditor,
  },
  emits: ["config-updated"],
  setup(props, { emit }) {
    const $q = useQuasar();
    const { t } = useI18n();

    const config = reactive({
      name: "",
      version: "0.0.1",
      action: "upload",
      fhir_version: "R4",
      fhirServerBaseUrl: "",
      validate: false,
    });

    const fields = ref([]);
    const processorTab = ref("preprocessor");
    const enablePreprocessor = ref(false);
    const enablePostprocessor = ref(false);
    const preprocessorCode = ref("");
    const postprocessorCode = ref("");
    const globalResourceTemplates = ref([]);
    const loadingSchema = ref(false);
    const availableResources = ref([]);
    const originalResources = ref([]);  // 新增這行，用於存儲原始資源列表

    const actionOptions = [
      { label: t("upload"), value: "upload" },
      { label: t("return"), value: "return" },
    ];

    const fhirVersionOptions = [
      { label: "R4", value: "R4" },
      { label: "R4B", value: "R4B" },
      { label: "R5", value: "R5" },
    ];

    const generateRandomName = () => {
      const adjectives = [
        "Awesome",
        "Fantastic",
        "Groovy",
        "Jazzy",
        "Quirky",
        "Zany",
        "Wacky",
        "Funky",
        "Spiffy",
        "Snazzy",
      ];
      const nouns = [
        "Unicorn",
        "Ninja",
        "Wizard",
        "Pirate",
        "Dinosaur",
        "Robot",
        "Superhero",
        "Rockstar",
        "Jedi",
        "Yeti",
      ];
      const verbs = [
        "Transforming",
        "Juggling",
        "Hacking",
        "Surfing",
        "Teleporting",
        "Moonwalking",
        "Karate-chopping",
        "Disco-dancing",
        "Levitating",
        "Yodeling",
      ];

      const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];

      config.name = `${randomAdjective}${randomNoun}${randomVerb}`;
    };

    const toggleFieldPreprocessor = (index) => {
      fields.value[index].showPreprocessor =
        !fields.value[index].showPreprocessor;
    };

    const removeField = (index) => {
      fields.value.splice(index, 1);
    };

    const addField = () => {
      fields.value.push({
        source: "",
        target: "",
        showPreprocessor: false,
        enablePreprocessor: false,
        preprocessor: `// Field preprocessor
(data) => {
    // 在這裡編寫您的欄位前處理邏輯
    // 例如：
    // if (data === 'male') {
    //     return 'M';
    // } else if (data === 'female') {
    //     return 'F';
    // }
    return data;
}`,
      });
    };

    const toggleResourceTemplateEditor = (index) => {
      globalResourceTemplates.value[index].showEditor =
        !globalResourceTemplates.value[index].showEditor;
    };

    const removeResourceTemplate = (index) => {
      globalResourceTemplates.value.splice(index, 1);
    };

    const addResourceTemplate = () => {
      globalResourceTemplates.value.push({
        resourceType: "",
        content: "{\n    // Add your FHIR resource template here\n}",
        showEditor: false,
      });
    };

    const generateConfig = () => {
      let imports = new Set();
      let configString = "";

      // 檢查並收集所有編輯器中的 import 和 require 語句
      const checkForImports = (editorValue) => {
        const lines = editorValue.split("\n");
        for (const line of lines) {
          if (
            line.trim().startsWith("import") ||
            (line.trim().startsWith("const") && line.includes("require(")) ||
            (line.trim().startsWith("let") && line.includes("require(")) ||
            (line.trim().startsWith("var") && line.includes("require("))
          ) {
            imports.add(line.trim());
          }
        }
      };

      // 移除編輯器內容中的 import 和 require 語句
      const removeImports = (editorValue) => {
        return editorValue
          .split("\n")
          .filter(
            (line) =>
              !line.trim().startsWith("import") &&
              !(line.trim().startsWith("const") && line.includes("require(")) &&
              !(line.trim().startsWith("let") && line.includes("require(")) &&
              !(line.trim().startsWith("var") && line.includes("require("))
          )
          .join("\n");
      };

      // 檢查所有可能包含 import 或 require 的地方
      checkForImports(preprocessorCode.value);
      checkForImports(postprocessorCode.value);
      globalResourceTemplates.value.forEach((template) =>
        checkForImports(template.content)
      );
      fields.value.forEach((field) => {
        if (field.enablePreprocessor) {
          checkForImports(field.preprocessor);
        }
      });

      // 添加收集到的 import 和 require 語句到配置文件開頭
      if (imports.size > 0) {
        configString += Array.from(imports).join("\n") + "\n\n";
      }

      // 添加其他配置內容
      configString += `
module.exports.config = ${JSON.stringify(config, null, 2)};

module.exports.globalResource = {
${globalResourceTemplates.value
  .map(
    (template) =>
      `  ${template.resourceType}: ${removeImports(template.content)}`
  )
  .join(",\n")}
};

module.exports.fields = [
${fields.value
  .map(
    (field) => `  {
    source: "${field.source}",
    target: "${field.target}"${
      field.enablePreprocessor
        ? `,
    beforeConvert: ${removeImports(field.preprocessor)}`
        : ""
    }
  }`
  )
  .join(",\n")}
];
      `.trim();

      if (enablePreprocessor.value) {
        configString += `\n\n${removeImports(preprocessorCode.value).trim()}`;
      }

      if (enablePostprocessor.value) {
        configString += `\n\n${removeImports(postprocessorCode.value).trim()}`;
      }

      const beautifiedConfig = js_beautify(configString, {
        indent_size: 2,
        space_in_empty_paren: true,
      });

      return beautifiedConfig;
    };

    const generateInitialConfig = () => {
      const initialConfig = generateConfig();
      emit("config-updated", initialConfig);
    };

    const onSubmit = () => {
      const generatedConfig = generateConfig();
      emit("config-updated", generatedConfig);
    };

    const loadFhirSchema = async (version) => {
      loadingSchema.value = true;
      try {
        const response = await fetch(
          `/node_modules/@fhir-uck/fhir-converter-core/src/fhir_packages/${version}/fhir.schema.json`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const schema = await response.json();

        if (schema.discriminator && schema.discriminator.mapping) {
          originalResources.value = Object.keys(
            schema.discriminator.mapping
          ).map((key) => ({
            label: key,
            value: key,
          }));
          availableResources.value = [...originalResources.value];  // 複製一份到 availableResources
        } else {
          console.warn("discriminator.mapping not found in schema");
          originalResources.value = [];
          availableResources.value = [];
        }
      } catch (error) {
        console.error("Could not load FHIR schema:", error);
        originalResources.value = [];
        availableResources.value = [];
      } finally {
        loadingSchema.value = false;
      }
    };

    const filterResources = (val, update, abort) => {
      if (val === '') {
        update(() => {
          availableResources.value = [...originalResources.value];
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        availableResources.value = originalResources.value.filter(
          v => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    };

    onMounted(async () => {
      await loadAce();
      loadFhirSchema(config.fhir_version);

      // 設置預設的處理器代碼
      preprocessorCode.value = `
// Global data pre-processor
module.exports.beforeProcess = (data) => {
    // 在這裡編寫您的前處理邏輯
    return data;
}
      `.trim();

      postprocessorCode.value = `
// Global data post-processor
module.exports.afterProcess = (bundle) => {
    // 在這裡編寫您的後處理邏輯
    return bundle;
}
      `.trim();

      // 在組件掛載後生成初始配置
      generateInitialConfig();
    });

    watch(
      () => config.fhir_version,
      (newVersion) => {
        loadFhirSchema(newVersion);
      }
    );

    watch(
      [
        config,
        fields,
        enablePreprocessor,
        enablePostprocessor,
        preprocessorCode,
        postprocessorCode,
        globalResourceTemplates,
      ],
      () => {
        const generatedConfig = generateConfig();
        emit("config-updated", generatedConfig);
      },
      { deep: true }
    );

    return {
      config,
      fields,
      processorTab,
      enablePreprocessor,
      enablePostprocessor,
      preprocessorCode,
      postprocessorCode,
      globalResourceTemplates,
      loadingSchema,
      availableResources,
      actionOptions,
      fhirVersionOptions,
      generateRandomName,
      toggleFieldPreprocessor,
      removeField,
      addField,
      toggleResourceTemplateEditor,
      removeResourceTemplate,
      addResourceTemplate,
      onSubmit,
      generateInitialConfig,
      filterResources,
    };
  },
};
</script>

<style lang="scss" scoped>
.config-form-container {
  height: 100%;
  overflow-y: auto;
}
</style>
