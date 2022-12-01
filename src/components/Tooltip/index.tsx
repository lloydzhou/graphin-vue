// @ts-nocheck
import { defineComponent, CSSProperties, ref } from 'vue';
import getContainerStyles from './getContainerStyles';
import useTooltip from './useTooltip'
import '@antv/graphin/es/components/Tooltip/index.css'

const defaultStyle: CSSProperties = {
  width: '120px',
  boxShadow: '0 4px 12px rgb(0 0 0 / 15%)',
};

export interface TooltipProps {
  /**
   * @description tooltip绑定的图元素
   * @default node
   */
  bindType?: 'node' | 'edge';
  /**
   * @description children
   * @type  React.ReactChild | JSX.Element
   */
  // children: (props: TooltipValue) => React.ReactNode;
  /**
   * @description styles
   */
  style?: CSSProperties;
  /**
   * @description Tooltip 的位置
   */
  placement?: 'top' | 'bottom' | 'right' | 'left' | 'center';
  /**
   * @description 是否展示小箭头
   * @description.en-US display arrow
   */
  hasArrow?: boolean;
}

const Tooltip = defineComponent({
  name: 'Tooltip',
  props: {
    bindType: {
      type: String,
      default: () => 'node'
    },
    style: {
      type: Object,
      default: () => ({})
    },
    placement: {
      // type: 'top' | 'bottom' | 'right' | 'left' | 'center',
      type: String,
      default: () => 'top'
    },
    hasArrow: {
      type: Boolean,
      default: () => false,
    }
  },
  setup(props) {
    const { bindType } = props;
    const container = ref<HTMLDivElement | null>(null);
    const tooltip = useTooltip({ bindType, container });

    return {
      ...tooltip,
      container,
    }
  },

  render() {
    const { style, visible, x, y, item, placement='top', hasArrow, bindType='node' } = this
    let nodeSize = 40;

    try {
      if (item) {
        const { type } = item.getModel();
        if (type === 'graphin-cirle') {
          const { style } = item.getModel();
          if (style) {
            nodeSize = style.keyshape.size as number;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    const padding = 12;
    const containerPosition = getContainerStyles({ placement, nodeSize: nodeSize + padding, x, y, bindType, visible });

    const positionStyle: CSSProperties = {
      position: 'absolute',
      ...containerPosition,
      left: containerPosition.left + 'px',
      top: containerPosition.top + 'px',
    };

    const model = (item && !item.destroyed && item.getModel && item.getModel()) || {};
    const id = model.id || '';

    return (
      <div
        ref="container"
        className={`graphin-components-tooltip ${placement}`}
        style={{ ...defaultStyle, ...style, ...positionStyle }}
        key={id}
      >
        {visible && hasArrow ? <div className={`tooltip-arrow ${placement}`} /> : null}
        {visible && this.$slots.default && this.$slots.default({item, bindType, model, id})}
      </div>
    );
  }
})

export default Tooltip;

