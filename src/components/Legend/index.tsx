// @ts-nocheck
import { defineComponent, CSSProperties, ref, watchEffect, toRaw } from 'vue';
import Node from './Node';
import type { LegendProps } from './typing';
import useLegend from './useLegend';
import { useContext, contextSymbol } from '../../GraphinContext'

const defaultStyle: CSSProperties = {
  position: 'absolute',
  top: '0px',
  right: '0px',
};

function Legend(props, { slots }) {
  const { bindType = 'node', sortKey, style } = props;
  const { dataMap, options } = useLegend({ bindType, sortKey })
  return (
    <div
      className="graphin-components-legend"
      // @ts-ignore
      style={{ ...defaultStyle, ...style }}
    >
      {slots.default && slots.default({
        bindType,
        sortKey,
        // @ts-ignore
        dataMap: dataMap.value,
        // @ts-ignore
        options: options.value,
      })}
    </div>
  )
}

Legend.props = ['bindType', 'sortKey', 'style']

Legend.Node = Node;
export default Legend;
