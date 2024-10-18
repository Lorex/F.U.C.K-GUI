import { inject } from 'vue'

export function useFhirConverterService() {
  const $axios = inject('$axios')

  const generateConfig = async (formData) => {
    // 這裡實現您的配置生成邏輯
    // 如果需要,可以使用 $axios 進行 API 調用
    // 返回生成的配置
  }

  return {
    generateConfig
  }
}
