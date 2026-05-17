import PrimeVue from 'primevue/config'
import Nora from '@primeuix/themes/nora'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    theme: {
      preset: Nora,
      options: {
        cssLayer: {
          name: 'primevue',
          order: 'primevue',
        },
      },
    },
  })
  nuxtApp.vueApp.use(ToastService)
  nuxtApp.vueApp.use(ConfirmationService)
  nuxtApp.vueApp.directive('tooltip', Tooltip)
})
