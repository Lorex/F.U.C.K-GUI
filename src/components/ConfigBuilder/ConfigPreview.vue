<template>
  <div class="q-pa-md">
    <h2 class="text-h5 q-mb-md">{{ $t('configPreview') }}</h2>
    <q-card>
      <q-card-section>
        <pre class="config-preview">{{ JSON.stringify(config, null, 2) }}</pre>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :label="$t('copy')" color="primary" @click="copyConfig" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ConfigPreview',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const $q = useQuasar()
    const { t } = useI18n()

    const copyConfig = () => {
      navigator.clipboard.writeText(JSON.stringify(props.config, null, 2)).then(() => {
        $q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'content_copy',
          message: t('copied')
        })
      }).catch(() => {
        $q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'error',
          message: t('errorOccurred')
        })
      })
    }

    return {
      copyConfig
    }
  }
}
</script>

<style scoped>
.config-preview {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
