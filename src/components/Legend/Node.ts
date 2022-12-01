// @ts-nocheck
import { defineComponent, watch, shallowReactive, h, Fragment } from 'vue';
import '@antv/graphin/es/components/Legend/index.css'
import { useContext } from '../../GraphinContext';
import deepEqual from '@antv/graphin/es/utils/deepEqual';


const LegendNode = defineComponent({
  name: 'LegendNode',
  props: {
    options: {
      type: Object,
    },
    dataMap: {
      type: Object,
    }
  },
  setup(props, { slots }) {
    const { graph, theme } = useContext()
    const { mode='light' } = theme;

    const state = shallowReactive({
      items: props.options
    })

    watch(() => props.options, (items) => state.items = items)

    const handleClick = (option: OptionType) => {
      const checkedValue = { ...option, checked: !option.checked };
      const result = state.items.map((c: any) => {
        const matched = c.value === option.value;
        return matched ? checkedValue : c;
      });
      state.items = result
      const nodes = props.dataMap.get(checkedValue.value);

      /** highlight */
      // const nodesId = nodes.map((c) => c.id);
      // apis.highlightNodeById(nodesId);

      // @ts-ignore
      nodes.forEach((node: any) => {
        graph.setItemState(node.id, 'active', checkedValue.checked);
        graph.setItemState(node.id, 'inactive', !checkedValue.checked);
      });
    };

    return () => {
      return h('ul', {class: 'graphin-components-legend-content'}, state.items.map((option: OptionType, index: number) => {
        const { label, checked, color } = option;
        const dotColors = {
          light: {
            active: color,
            inactive: '#ddd',
          },
          dark: {
            active: color,
            inactive: '#2f2f2f',
          },
        };
        const labelColor = {
          light: {
            active: '#000',
            inactive: '#ddd',
          },
          dark: {
            active: '#fff',
            inactive: '#2f2f2f',
          },
        };
        const status = checked ? 'active' : 'inactive';
        return h('li', {
          key: option.value,
          class: 'item',
          onClick: () => handleClick(option),
          onKeyDown: () => handleClick(option)
        }, slots.default ? slots.default({
          dotColor: dotColors[mode][status],
          labelColor: labelColor[mode][status],
          label,
          option,
          data: props.dataMap.get(option.value),
        }) : h(Fragment, {}, [
          h('span', {class: 'dot', style: {background: dotColors[mode][status] }}),
          h('span', {class: 'label', style: {color: labelColor[mode][status] }}, label),
        ]))
      }))
    }
  }
})

export default LegendNode;
