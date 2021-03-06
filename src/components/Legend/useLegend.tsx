// @ts-no-check
import { onMounted, onUnmounted, toRefs, reactive, ref, watchEffect } from 'vue'
import { IG6GraphEvent } from '@antv/g6'
import { useContext } from '../../GraphinContext';
import useState from '../../state'
import { LegendProps } from './typing'
import { getEnumValue, getEnumDataMap } from '@antv/graphin/es/utils/processGraphData';

const useLegend = (props: LegendProps) => {
  const { bindType = 'node', sortKey } = props;
  // @ts-ignore
  const { graph } = useContext();
  const [state, setState] = useState({ dataMap: new Map(), options: {}, data: {} })

  watchEffect(() => {
    const data = graph.save();

    /** 暂时不支持treeGraph的legend */
    if (data.children) {
      console.error('not support tree graph');
      setState({
        dataMap: new Map(),
        options: {},
      })
    } else {
      // @ts-ignore
      const dataMap = getEnumDataMap(data[`${bindType}s`], sortKey);

      /** 计算legend.content 的 options */
      const keys = Array.from(dataMap.keys());
      const options = keys.map(key => {
        const item = (dataMap.get(key) || [{}])[0];

        const graphinStyleColor = getEnumValue(item, 'style.keyshape.fill');
        const g6StyleCcolor = getEnumValue(item, 'style.color');

        const color = graphinStyleColor || g6StyleCcolor;
        return {
          /** 颜色 */
          color,
          /** 值 */
          value: key,
          /** 标签 */
          label: key,
          /** 是否选中 */
          checked: true,
        };
      });
      setState({ dataMap, options })
    }
  })
  return toRefs(state)
};
export default useLegend;

