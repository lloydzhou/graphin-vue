// @ts-nocheck
import { watchEffect, defineComponent, nextTick } from 'vue'
import { useContext, contextSymbol } from '../GraphinContext'

const FitView = defineComponent({
  name: 'FitView',
  props: {
    padding: {
      type: Array,
      default: () => [20, 20],
    },
    isBindLayoutChange: {
      type: Boolean,
      default: true
    }
  },
  inject: [contextSymbol],
  setup (props) {
    const { padding, isBindLayoutChange } = props
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const handleFitView = () => {
        const nodeSize = graph.getNodes().length
        if (nodeSize > 0) {
          graph.fitView(padding)
        }
      }
      /** 第一次就执行 FitView */
      // nextTick(() => {
      //   handleFitView()
      // })
      // 直接执行会导致出问题，可能画面里面没有元素，延时一下
      setTimeout(() => {
        handleFitView()
      }, 100)
      if (isBindLayoutChange) {
        graph.on('afterlayout', handleFitView)
      }
      onInvalidate(() => {
        if (isBindLayoutChange) {
          graph.off('afterlayout', handleFitView)
        }
      })
    })
    return () => null
  }
})

export default FitView
