// @ts-nocheck
import { useContext, contextSymbol } from '../GraphinContext'
import { defineComponent, onMounted, onUnmounted, DefineComponent } from 'vue'

export type BehaviorComponent<T> = DefineComponent<T>

function useBehaviorHook<T>(params: {defaultConfig: T, name: string, type: string}): DefineComponent<T> {
  return defineComponent({
    name: params.name,
    inject: [contextSymbol],
    setup (props, context) {
      const {
        type,
        defaultConfig,
        mode = "default"
      } = params
      const { graph } = useContext()
      const { disabled, ...otherConfig } = context.attrs

      onMounted(() => {
        /** 保持单例 */
        graph!.removeBehaviors(type, mode);
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
