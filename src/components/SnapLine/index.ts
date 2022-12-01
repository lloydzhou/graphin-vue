// @ts-nocheck
import G6 from '@antv/g6';
import { useContext, contextSymbol } from '../../GraphinContext';
import { defineComponent, onMounted, onUnmounted, watchEffect, DefineComponent } from 'vue';

const defaultOptions = {
  line: {
    stroke: '#FA8C16',
    lineWidth: 0.5,
  },
  itemAlignType: 'center',
};
export interface SnapLineProps {
  /**
   * @description 是否开启
   * @default false
   */
  visible: boolean;
  /**
   * @description 配置项
   * @default `https://github.com/antvis/G6/blob/master/packages/plugin/src/snapline/index.ts`
   */
  options?: Partial<typeof defaultOptions>;
}

export const SnapLine: DefineComponent<SnapLineProps> = defineComponent({
  name: 'SnapLine',
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
    options: {
      // type: typeof defaultOptions,
      type: Object,
      default: () => defaultOptions,
    }
  },
  inject: [contextSymbol],
  setup(props) {
    const { graph } = useContext();
    const { options, visible } = props;
    watchEffect((onInvalidate) => {
      const Options = {
        ...defaultOptions,
        ...options,
      }
      const snapLine = new G6.SnapLine(Options as any);

      if (visible) {
        graph.addPlugin(snapLine);
      }

      onInvalidate(() => {
        if (graph && !graph.destroyed) {
          graph.removePlugin(snapLine);
        }
      })
    })
    return () => null
  }
})

export default SnapLine;
