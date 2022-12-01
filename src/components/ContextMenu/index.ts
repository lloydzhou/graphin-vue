// @ts-nocheck
import { defineComponent, CSSProperties, ref, h, DefineComponent } from 'vue';
import '@antv/graphin/es/components/ContextMenu/index.css'

import { useContextMenu, ContextMenuProps } from './useContextMenu'

const defaultStyle: CSSProperties = {
  width: '120px',
  boxShadow: '0 4px 12px rgb(0 0 0 / 15%)',
};

export const ContextMenu: DefineComponent<ContextMenuProps> = defineComponent({
  name: 'ContextMenu',
  props: {
    bindType: {
      type: String,
      default: () => 'node'
    },
    bindEvent: {
      type: String,
      default: () => 'contextmenu'
    },
    style: {
      type: Object,
      default: () => ({})
    },
  },
  setup(props, { slots }) {
    const { bindType, bindEvent } = props;
    const container = ref<HTMLDivElement | null>(null);
    const contextmenu = useContextMenu({
      bindType,
      bindEvent,
      container,
    });

    return () => {
      const { visible, x, y, item, onClose, selectedItems } = contextmenu
      const { style } = props

      const positionStyle: CSSProperties = {
        position: 'absolute',
        left: x + 'px',
        top: y + 'px',
      };

      const id = (item && !item.destroyed && item.getModel && item.getModel().id) || '';

      return h('div', {
        ref: container,
        className: "graphin-components-contextmenu",
        style: { ...defaultStyle, ...style, ...positionStyle },
        key: id,
      }, visible && slots.default ? slots.default({
        visible, x, y, item, onClose,
        id,
        selectedItems,
      }) : null);
    }
  }
})

export * from './useContextMenu'
export default ContextMenu;

