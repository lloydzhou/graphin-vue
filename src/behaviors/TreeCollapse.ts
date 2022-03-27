// @ts-nocheck
import { watchEffect, defineComponent } from 'vue'
import { useContext, contextSymbol } from '../GraphinContext'

const defaultConfig = {
  /** 收起和展开树图的方式，支持 'click' 和 'dblclick' 两种方式。默认为 'click'，即单击； */
  trigger: 'click'
  /**
   * 收起或展开的回调函数。
   * 警告：G6 V3.1.2 版本中将移除；itemcollapsed：当 collapse-expand 发生时被触发。
   * 请使用 graph.on('itemcollapsed', e => {...}) 监听，参数 e 有以下字段：
   *  */
}
const type = 'collapse-expand'
const mode = 'default'
const TreeCollapse = defineComponent({
  name: 'TreeCollapse',
  props: {
    disabled: {
      type: Boolean
    },
    onChange: {
      type: Function
    }
  },
  inject: [contextSymbol],
  setup (props, context) {
    const {
      disabled,
      onChange
    } = props
    const { ...otherConfig } = context
    const { graph } = useContext()
    watchEffect((onInvalidate) => {
      graph.removeBehaviors(type, mode)
      if (disabled) {
        return
      }
      graph.addBehaviors({
        type,
        ...defaultConfig,
        ...otherConfig
      }, mode)
      const handleChange = (e) => {
        const {
          item,
          collapsed
        } = e
        const model = item.get('model')
        model.collapsed = collapsed
        if (onChange) {
          onChange(item, collapsed) // callback
        }
      }
      graph.on('itemcollapsed', handleChange)
      onInvalidate(() => {
        graph.off('itemcollapsed', handleChange)
        if (!graph.destroyed) {
          graph.removeBehaviors(type, mode)
        }
      })
    })
    return () => null
  }
})
export default TreeCollapse
