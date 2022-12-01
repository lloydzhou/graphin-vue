// @ts-nocheck
import { onMounted, onUnmounted, defineComponent, ref, DefineComponent } from 'vue'
import { useContext, contextSymbol } from '../GraphinContext'

export const FontPaint: DefineComponent<any> = defineComponent({
  name: 'FontPaint',
  inject: [contextSymbol],
  setup () {
    const { graph } = useContext()
    const timer = ref()
    onMounted(() => {
      timer.value = setTimeout(() => {
        graph.getNodes().forEach((node) => {
          graph.setItemState(node, 'normal', true)
        })
        graph.paint()
      }, 1600)
    })
    onUnmounted(() => {
      if (timer.value) {
        clearTimeout(timer.value)
      }
    })
    return () => null
  }
})

