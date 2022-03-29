// @ts-nocheck
import { onMounted, onUnmounted, defineComponent } from 'vue'
import { useContext, contextSymbol } from '../GraphinContext'

const DragNodeWithForce = defineComponent({
  name: 'DragNodeWithForce',
  props: {
    autoPin: {
      type: Boolean,
      default: () => true,
    }
  },
  inject: [contextSymbol],
  setup (props) {
    const {
      graph,
      layout
    } = useContext()
    const { autoPin } = props
    const handleNodeDragStart = () => {
      const { instance = {} } = layout
      const { simulation } = instance
      if (simulation) {
        simulation.stop()
      }
    }
    const handleNodeDragEnd = (e) => {
      const { instance = {} } = layout
      const {
        simulation,
        type
      } = instance
      if (type !== 'graphin-force') {
        return
      }
      if (e.item) {
        console.log('e.item', instance)
        const nodeModel = e.item.get('model')
        nodeModel.x = e.x
        nodeModel.y = e.y
        nodeModel.layout = {
          ...nodeModel.layout,
          force: {
            mass: autoPin ? 1000000 : null
          }
        }
        const drageNodes = [nodeModel]
        simulation.restart(drageNodes, graph)
        graph.refreshPositions()
      }
    }
    onMounted(() => {
      graph.on('node:dragstart', handleNodeDragStart)
      graph.on('node:dragend', handleNodeDragEnd)
    })
    onUnmounted(() => {
      graph.off('node:dragstart', handleNodeDragStart)
      graph.off('node:dragend', handleNodeDragEnd)
    })
    return () => null
  }
})

export default DragNodeWithForce
