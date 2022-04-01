// @ts-nocheck
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { useContext, contextSymbol } from '../GraphinContext'

const FitView = defineComponent({
  name: 'FitView',
  props: {
    padding: {
      type: Array,
      default: () => [],
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
    const handleFitView = () => {
      /* afterlayout事件触发后，还需要等refreshPisitions完成再执行fitView */
      setTimeout(() => {
        const nodeSize = graph.getNodes().length
        if (nodeSize > 0) {
          console.log('FitView', graph, padding)
          graph.fitView(padding)
        }
      }, 60)
    }
    onMounted(() => {
      /** 第一次就执行 FitView */
      handleFitView()
      if (isBindLayoutChange) {
        graph.on('afterlayout', handleFitView)
      }
    })
    onUnmounted(() => {
      if (isBindLayoutChange) {
        graph.off('afterlayout', handleFitView)
      }
    })
    return () => null
  }
})

export default FitView
