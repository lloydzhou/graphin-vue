// @ts-nocheck
import { defineComponent, CSSProperties, ref, watchEffect, toRaw } from 'vue';
import './index.less'
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
  console.log('render Legend', dataMap, options)
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
        dataMap,
        // @ts-ignore
        options,
      })}
    </div>
  )
}

Legend.props = ['bindType', 'sortKey', 'style']

Legend.Node = Node;
export default Legend;
