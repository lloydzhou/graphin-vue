// @ts-nocheck
import { watchEffect, defineComponent } from 'vue'
import { useContext, contextSymbol } from '../GraphinContext'
const FontPaint = defineComponent({
  name: 'FontPaint',
  inject: [contextSymbol],
  setup () {
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const timer = setTimeout(() => {
        graph.getNodes().forEach((node) => {
          graph.setItemState(node, 'normal', true)
        })
        graph.paint()
      }, 1600)
      onInvalidate(() => {
        clearTimeout(timer)
      })
    })
    return () => null
  }
})

export default FontPaint
