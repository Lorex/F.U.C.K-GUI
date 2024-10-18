<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="row items-center no-wrap">
          Project F.U.C.K. WebUI
          <q-tabs class="q-ml-md">
            <q-route-tab to="/" :label="$t('home')" icon="home" />
            <q-route-tab to="/config-builder" :label="$t('configBuilder')" icon="build" />
          </q-tabs>
        </q-toolbar-title>
        <q-btn flat round :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleDarkMode" />
        <q-btn-dropdown flat :label="currentLang" icon="language">
          <q-list>
            <q-item clickable v-close-popup @click="changeLang('en-US')">
              <q-item-section avatar>
                <q-icon name="flag" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>English</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="changeLang('zh-TW')">
              <q-item-section avatar>
                <q-icon name="flag" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>繁體中文</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "MainLayout",
  setup() {
    const { locale } = useI18n({ useScope: "global" });
    const $q = useQuasar();

    const currentLang = computed(() => locale.value === "en-US" ? "English" : "繁體中文");

    const changeLang = (lang) => {
      locale.value = lang;
    };

    const toggleDarkMode = () => {
      $q.dark.toggle();
    };

    return {
      currentLang,
      changeLang,
      toggleDarkMode
    };
  },
});
</script>

<style lang="scss" scoped>
.q-toolbar-title {
  flex-grow: 1;
}
</style>
