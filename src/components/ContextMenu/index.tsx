// @ts-nocheck
import { defineComponent, CSSProperties, onMounted, onUnmounted, ref, watch } from 'vue';
import G6 from '@antv/g6'
import { useContext, contextSymbol } from '../../GraphinContext'

import useContextMenu from './useContextMenu'

const defaultStyle: CSSProperties = {
  width: '120px',
  boxShadow: '0 4px 12px rgb(0 0 0 / 15%)',
};

const ContextMenu = defineComponent({
  name: 'ContextMenu',
  props: {
    bindType: {
      type: String,
      default: () => 'node'
    },
    style: {
      type: Object,
      default: () => ({})
    },
  },
  inject: [contextSymbol],
  setup(props, { slots }) {
    const { bindType, style } = props;
    const container = ref<HTMLDivElement | null>(null);
    const contextmenu = useContextMenu({
      bindType,
      container,
    });

    return {
      ...contextmenu,
      container,
    }
  },

  render() {
    const { container, style, visible, x, y, item, onClose } = this

    const positionStyle: CSSProperties = {
      position: 'absolute',
      left: x + 'px',
      top: y + 'px',
    };
    const id = (item && !item.destroyed && item.getModel && item.getModel().id) || '';

    return (
      <div
        ref="container"
        className="graphin-components-contextmenu"
        style={{ ...defaultStyle, ...style, ...positionStyle }}
        key={id}
      >
        {visible && this.$slots.default &&
          this.$slots.default({
            visible, x, y, item, onClose,
            id,
          })}
      </div>
    );
  }
})

export default ContextMenu;

