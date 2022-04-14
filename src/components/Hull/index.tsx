// @ts-nocheck
import G6 from '@antv/g6';
import { useContext, contextSymbol } from '../../GraphinContext';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { debounce } from '@antv/util'

const defaultHullCfg = {
  members: [],
  type: 'round-convex',
  nonMembers: [],
  style: {
    fill: 'lightblue',
    stroke: 'blue',
    opacity: 0.2,
  },
  padding: 10,
};

/**
 * deep merge hull config
 * @param defaultCfg
 * @param cfg
 */
const deepMergeCfg = (defaultCfg: typeof defaultHullCfg, cfg: HullCfg) => {
  const { style: DefaultCfg = {}, ...defaultOtherCfg } = defaultCfg;
  const { style = {}, ...others } = cfg;
  return {
    ...defaultOtherCfg,
    ...others,
    style: {
      ...DefaultCfg,
      ...style,
    },
  };
};

export interface HullCfgStyle {
  /**
   * @description 填充颜色
   * @default 'lightblue'
   */
  fill: string;
  /**
   * @description 描边颜色
   * @default 'blue'
   */
  stroke: string;
  /**
   *
   * @description 透明度
   * @default 0.2
   */
  opacity: number;
}
export interface HullCfg {
  /**
   * @description 在包裹内部的节点实例或节点 Id 数组
   * @default []
   *
   */
  members: string[];
  /**
   * 包裹的 id
   */
  id?: string;
  /**
   * @description 包裹的类型
   * round-convex: 生成圆角凸包轮廓，
   * smooth-convex: 生成平滑凸包轮廓
   * bubble: 产生一种可以避开 nonMembers 的平滑凹包轮廓（算法）。
   * @default round-convex
   */
  type?: 'round-convex' | 'smooth-convex' | 'bubble';
  /** 不在轮廓内部的节点数组，只在 bubble 类型的包裹中生效 */
  nonMembers?: string[];
  /** 轮廓的样式属性 */
  style?: Partial<HullCfgStyle>;
  /**
   * @description 轮廓边缘和内部成员的间距
   * @default 10
   */
  padding?: number;
}

export interface IHullProps {
  /**
   * @description 配置
   */
  options: HullCfg[];
}

const Hull = defineComponent({
  name: 'Hull',
  props: {
    options: {
      type: Array,
      default: () => []
    }
  },
  inject: [contextSymbol],
  setup(props) {
    const { graph } = useContext();
    const hullInstances = ref([])

    const handleAfterUpdateItem = debounce(() => {
      hullInstances.value.forEach((item, index) => {
        // 这里有bug，Hull.updateData报错，实际上是因为数据更新后hull已经被destroy了，需要重新生成
        if (item.group.destroyed) {
          hullInstances.value[index] = graph.createHull(
            // @ts-ignore
            deepMergeCfg(defaultHullCfg, {
              id: `${Math.random()}`, // Utils.uuid(),
              ...props.options[index],
            }),
          )
        } else {
          item.updateData(item.members);
        }
      });
    })
    onMounted(() => {
      hullInstances.value = props.options.map(item => {
        return graph.createHull(
          // @ts-ignore
          deepMergeCfg(defaultHullCfg, {
            id: `${Math.random()}`, // Utils.uuid(),
            ...item,
          }),
        );
      })
      graph.on('afterupdateitem', handleAfterUpdateItem);
      graph.on('aftergraphrefreshposition', handleAfterUpdateItem);
    })
    onUnmounted(() => {
      graph.off('afterupdateitem', handleAfterUpdateItem);
      graph.off('aftergraphrefreshposition', handleAfterUpdateItem);
    })

    return () => null
  }
})

export default Hull;
