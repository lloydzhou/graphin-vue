// @ts-nocheck
import { defineComponent, watch, toRefs } from 'vue';
import './index.less';
import { useContext } from '../../GraphinContext';
import useState from '../../state';
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
  setup(props) {
    const { graph, theme } = useContext()
    const { mode } = theme;

    const [state, setState] = useState({
      items: props.options,
    });

    watch(() => props.options, (items, prevItem) => {
      if (deepEqual(items, prevItem)) {
        setState({ items })
      }
    })

    const handleClick = (option: OptionType) => {
      const checkedValue = { ...option, checked: !option.checked };
      const result = state.items.map((c: any) => {
        const matched = c.value === option.value;
        return matched ? checkedValue : c;
      });
      setState({
        items: result,
      });
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

    return { ...toRefs(state), handleClick, mode }
  },
  render() {
    const { options, items, mode, handleClick, dataMap } = this
    console.log('dataMap', dataMap, options, items)
    return (
      <ul className="graphin-components-legend-content">
        {items.map((option: OptionType) => {
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

          return (
            <li
              key={option.value}
              className="item"
              onClick={() => {
                handleClick(option);
              }}
              onKeyDown={() => {
                handleClick(option);
              }}
            >
              <span className="dot" style={{ background: dotColors[mode][status] }} />
              <span className="label" style={{ color: labelColor[mode][status] }}>
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    )
  }
})

export default LegendNode;
