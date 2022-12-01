// @ts-nocheck
import { defineComponent, CSSProperties, onMounted, onUnmounted, ref, h } from 'vue';
import G6 from '@antv/g6'
import { useContext, contextSymbol } from '../../GraphinContext'


const defaultOptions = {
  className: 'graphin-minimap',
  viewportClassName: 'graphin-minimap-viewport',
  // Minimap 中默认展示和主图一样的内容，KeyShape 只展示节点和边的 key shape 部分，delegate表示展示自定义的rect，用户可自定义样式
  type: 'default' as 'default' | 'keyShape' | 'delegate' | undefined,
  padding: 50,
  size: [200, 120],
  delegateStyle: {
    fill: '#40a9ff',
    stroke: '#096dd9',
  },
  refresh: true,
};
export interface MiniMapProps {
  /**
   * @description 是否开启
   * @default false
   */
  visible: boolean;
  /**
   * @description MiniMap 配置项
   * @default
   */
  options?: Partial<typeof defaultOptions>;

  style?: CSSProperties;
}
const styles: {
  [key: string]: CSSProperties;
} = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    background: '#fff',
    boxShadow:
      '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)',
  },
};

const MiniMap = defineComponent({
  name: 'MiniMap',
  props: {
    style: {
      type: Object as MiniMapProps['style'],
      default: () => ({}),
    },
    visible: {
      type: Boolean as MiniMapProps['visible'],
      default: () => false,
    },
    options: {
      type: Object as MiniMapProps['options'],
      default: () => ({})
    }
  },
  inject: [contextSymbol],
  setup(props) {
    const { graph } = useContext();
    const { options, style = {} } = props;
    const mergedStyle = {
      ...styles.container,
      ...style,
    };
    const miniMap = ref()
    // const containerRef: null | HTMLDivElement = null;
    const containerRef = ref<HTMLDivElement | null>();
    const containerHeight = 120;

    onMounted(() => {
      const width = graph.getWidth();
      const height = graph.getHeight();
      const padding = graph.get('fitViewPadding');

      const containerSize = [((width - padding * 2) / (height - padding * 2)) * containerHeight, containerHeight];

      const miniMapOptions = {
        container: containerRef.value,
        ...defaultOptions,
        size: containerSize,
        ...options,
      };

      miniMap.value = new G6.Minimap(miniMapOptions);

      graph.addPlugin(miniMap.value);
    })
    onUnmounted(() => {
      if (miniMap.value && !miniMap.value.destroyed) {
        graph.removePlugin(miniMap.value);
      }
    })
    return () => h('div', {
      ref: containerRef,
      style: mergedStyle
    })
  }
});

export default MiniMap;

