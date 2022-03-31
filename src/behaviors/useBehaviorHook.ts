// @ts-nocheck
import { useContext, contextSymbol } from '../GraphinContext'
import { watchEffect, defineComponent, onMounted, watch, onUnmounted } from 'vue'

const useBehaviorHook = (params) => {
  return defineComponent({
    name: params.name,
    props: {
      disabled: {
        type: Boolean,
        default: false
      }
    },
    inject: [contextSymbol],
    setup (props, context) {
      const {
        type,
        defaultConfig,
        mode = 'default'
      } = params
      const { graph } = useContext()
      const { disabled } = props
      const { ...otherConfig } = context.attrs

      onMounted(() => {
        console.log('onMounted')
        graph.removeBehaviors(type, mode);
        if (disabled) {
          return
        }
        const config = {
          ...defaultConfig,
          ...otherConfig
        }
        graph!.addBehaviors({
          type,
          ...config
        }, mode)
      })
      onUnmounted(() => {
        if (!graph.destroyed) {
          graph!.removeBehaviors(type, mode)
        }
      })
      return () => null
    }
  })
}

export default useBehaviorHook
