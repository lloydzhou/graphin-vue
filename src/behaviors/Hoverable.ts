// @ts-nocheck
import { watchEffect } from 'vue'
import { useContext, contextSymbol } from '../GraphinContext'
const Hoverable = {
  name: 'Hoverable',
  props: {
    bindType: {
      type: String
    }
  },
  inject: [contextSymbol],
  setup (props) {
    const { bindType = 'node' } = props
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      const handleNodeMouseEnter = (evt) => {
        graph.setItemState(evt.item, 'hover', true)
      }
      const handleNodeMouseLeave = (evt) => {
        graph.setItemState(evt.item, 'hover', false)
      }
      const handleEdgeMouseEnter = (evt) => {
        graph.setItemState(evt.item, 'hover', true)
      }
      const handleEdgeMouseLeave = (evt) => {
        graph.setItemState(evt.item, 'hover', false)
      }
      if (bindType === 'node') {
        graph.on('node:mouseenter', handleNodeMouseEnter)
        graph.on('node:mouseleave', handleNodeMouseLeave)
      }
      if (bindType === 'edge') {
        graph.on('edge:mouseenter', handleEdgeMouseEnter)
        graph.on('edge:mouseleave', handleEdgeMouseLeave)
      }
      onInvalidate(() => {
        if (bindType === 'node') {
          graph.off('node:mouseenter', handleNodeMouseEnter)
          graph.off('node:mouseleave', handleNodeMouseLeave)
        }
        if (bindType === 'edge') {
          graph.off('edge:mouseenter', handleEdgeMouseEnter)
          graph.off('edge:mouseleave', handleEdgeMouseLeave)
        }
      })
    })
    return () => null
  }
}

export default Hoverable
