// @ts-nocheck
import { onMounted, onUnmounted, defineComponent, DefineComponent } from 'vue'
import { debounce } from '@antv/util'
import { useContext, contextSymbol } from '../GraphinContext'

export const ResizeCanvas: DefineComponent<{graphDOM: HTMLDivElement}> = defineComponent({
  name: 'ResizeCanvas',
  props: {
    graphDOM: {
      type: HTMLDivElement,
      default: () => ({} as HTMLDivElement),
    }
  },
  inject: [contextSymbol],
  setup (props) {
    const { graphDOM } = props
    const { graph } = useContext()

    const handleResizeEvent = debounce(() => {
      const {
        clientWidth,
        clientHeight
      } = graphDOM
      graph!.set('width', clientWidth)
      graph!.set('height', clientHeight)
      const canvas = graph!.get('canvas')
      if (canvas) {
        canvas.changeSize(clientWidth, clientHeight)
        graph!.autoPaint()
      }
    }, 200)

    onMounted(() => {
      /** 先执行一次 */
      handleResizeEvent()
      /** 内置 drag force node */
      window.addEventListener('resize', handleResizeEvent, false)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', handleResizeEvent, false)
    })
    return () => null
  }
})

