// @ts-nocheck
import { defineComponent, CSSProperties, ref, watchEffect, toRaw, h } from 'vue';
import Node from './Node';
import type { LegendProps } from './typing';
import useLegend from './useLegend';
import { useContext, contextSymbol } from '../../GraphinContext'

const defaultStyle: CSSProperties = {
  position: 'absolute',
  top: '0px',
  right: '0px',
};

const Legend = defineComponent({
  name: 'Legend',
  props: ['bindType', 'sortKey', 'style'],
  setup(props, { slots }) {
    const { bindType = 'node', sortKey, style } = props;
    const legend = useLegend({ bindType, sortKey })
    return () => {
      const { dataMap, options=[] } = legend
      return h('div', {
        class: 'graphin-components-legend',
        style: { ...defaultStyle, ...style },
      }, slots.default && slots.default({
        bindType,
        sortKey,
        dataMap,
        options,
      }))
    }
  }
})

export default Legend

