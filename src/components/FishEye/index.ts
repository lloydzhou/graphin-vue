// @ts-nocheck
import G6 from '@antv/g6';
import { useContext, contextSymbol } from '../../GraphinContext';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';

const defaultOptions = {
  r: 249,
  scaleRByWheel: true,
  minR: 100,
  maxR: 500,
  /**
   * @description 放大镜样式
   */
  delegateStyle: {
    stroke: '#000',
    strokeOpacity: 0.8,
    lineWidth: 2,
    fillOpacity: 0.1,
    fill: '#ccc',
  },
  showLabel: false,
};
export interface FishEyeProps {
  /**
   * @description 是否开启
   * @default false
   */
  visible: boolean;
  /**
   * @description FishEye的配置项
   * @default { r: 249,scaleRByWheel: true,minR: 100,maxR: 500 }
   */
  options?: Partial<typeof defaultOptions>;
  /**
   * @description 监听用户按下 ESC 键的回调函数
   * @default ()=>{}
   */
  handleEscListener?: () => void;
}


const FishEye = defineComponent({
  name: 'FishEye',
  props: {
    handleEscListener: {
      type: Function as FishEyeProps['handleEscListener']
    },
    visible: {
      type: Boolean as FishEyeProps['visible'],
      default: () => true,
    },
    options: {
      type: Object as FishEyeProps['options'],
      default: () => ({})
    }
  },
  inject: [contextSymbol],
  setup(props) {
    const { graph } = useContext();
    const { options, visible, handleEscListener } = props;

    const escListener = e => {
      if (e.keyCode === 27) {
        if (handleEscListener) {
          handleEscListener();
        }
        graph.get('canvas').setCursor('default');
      }
    };
    const fishEye = ref()
    onMounted(() => {
      const FishEyeOptions = {
        ...defaultOptions,
        ...options,
      };

      if (FishEyeOptions.showLabel) {
        // 先将图上的label全部隐藏

        graph.getNodes().forEach(node => {
          node
            .getContainer()
            .getChildren()
            .forEach(shape => {
              if (shape.get('type') === 'text') shape.hide();
            });
        });
      }
      fishEye.value = new G6.Fisheye(FishEyeOptions);
      if (visible) {
        graph.addPlugin(fishEye.value);
        graph.get('canvas').setCursor('zoom-in');
      }

      if (handleEscListener) {
        window.addEventListener('keydown', escListener);
      }
    })
    onUnmounted(() => {
      if (graph && !graph.destroyed) {
        graph.get('canvas').setCursor('default');
        graph.removePlugin(fishEye.value);
      }
      if (handleEscListener) {
        window.removeEventListener('keydown', escListener);
      }
    })
    return () => null
  }
});

export default FishEye;

