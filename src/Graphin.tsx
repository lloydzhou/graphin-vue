// @ts-nocheck
import { defineComponent, onMounted, onUnmounted, ref, watch, toRaw, shallowRef, computed } from 'vue';

import G6, { Graph as IGraph, GraphData, GraphOptions, TreeGraphData } from '@antv/g6';
// import React, { ErrorInfo } from 'react';
/** 内置API */
// import GraphinType  from '@antv/graphin/es/Graphin';
import ApiController from '@antv/graphin/es/apis';
import { ApisType } from '@antv/graphin/es/apis/types';
/** 内置 Behaviors */
import Behaviors from './behaviors';
import { DEFAULT_TREE_LATOUT_OPTIONS, TREE_LAYOUTS } from '@antv/graphin/es/consts';
/** Context */
// import GraphinContext from './GraphinContext';
import './index.less';
/** 内置布局 */
import LayoutController from '@antv/graphin/es/layout';
import { getDefaultStyleByTheme, ThemeData } from '@antv/graphin/es/theme/index';
/** types  */
import { GraphinData, GraphinProps, GraphinTreeData, IconLoader } from '@antv/graphin/es/typings/type';
// import cloneDeep from '@antv/graphin/es/utils/cloneDeep';
/** utils */
// import shallowEqual from './utils/shallowEqual';
import deepEqual from '@antv/graphin/es/utils/deepEqual';

const { DragCanvas, ZoomCanvas, DragNode, DragCombo, ClickSelect, BrushSelect, ResizeCanvas } = Behaviors;
import {createContext} from './GraphinContext'
import { omit } from 'lodash'


const Graphin = defineComponent({
  registerNode (nodeName: string, options: { [key: string]: any }, extendedNodeName?: string) {
    G6.registerNode(nodeName, options, extendedNodeName);
  },

  registerEdge (edgeName: string, options: { [key: string]: any }, extendedEdgeName?: string) {
    G6.registerEdge(edgeName, options, extendedEdgeName);
  },

  registerCombo (comboName: string, options: { [key: string]: any }, extendedComboName?: string) {
    G6.registerEdge(comboName, options, extendedComboName);
  },

  registerBehavior(behaviorName: string, behavior: any) {
    G6.registerBehavior(behaviorName, behavior);
  },

  registerFontFamily(iconLoader: IconLoader): { [icon: string]: any } {
    /**  注册 font icon */
    const iconFont = iconLoader();
    const { glyphs, fontFamily } = iconFont;
    const icons = glyphs.map(item => {
      return {
        name: item.name,
        unicode: String.fromCodePoint(item.unicode_decimal),
      };
    });

    return new Proxy(icons, {
      get: (target, propKey: string) => {
        const matchIcon = target.find(icon => {
          return icon.name === propKey;
        });
        if (!matchIcon) {
          console.error(`%c fontFamily:${fontFamily},does not found ${propKey} icon`);
          return '';
        }
        return matchIcon ? matchIcon.unicode : null;
      },
    });
  },

  registerLayout(layoutName: string, layout: any) {
    G6.registerLayout(layoutName, layout);
  },

  name: "Graphin",

  props: {
    data: {
      type: Object,
      default: () => ({} as GraphinProps['data'])
    },
    layout: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: Number,
      default: () => 600
    },
    width: {
      type: Number,
      default: () => 800
    },
    layoutCache: {
      type: Boolean,
      default: () => false
    },
    modes: {
      type: Object,
      default: () => ({default: []})
    },
    graphStyle: {
      type: Object,
      default: () => ({})
    }
  },

  components: { ResizeCanvas },

  setup(props, { slots }) {
    const isReady = shallowRef(false);

    /** Graph的DOM */
    const graphDOM = ref<HTMLDivElement | null>(null);
    /** G6 instance */
    const graph = shallowRef<IGraph>({} as IGraph);
    /** layout */
    const layout = shallowRef<LayoutController>({} as LayoutController);

    const layoutCache = shallowRef(props.layoutCache);
    const width = ref(props.width);
    const height = ref(props.height);
    const animateRef = ref(props.animate);

    /** 是否为 Tree Graph */
    const isTree = shallowRef(
      Boolean(props.data && (props.data as GraphinTreeData).children) ||
        TREE_LAYOUTS.indexOf(String(props.layout && props.layout.type)) !== -1,
    );

    /** G6实例中的 nodes,edges,combos 的 model，会比props.data中多一些引用赋值产生的属性，比如node中的 x,y */
    const data = shallowRef<GraphinTreeData | GraphinData | undefined>(props.data);

    const options = shallowRef<GraphOptions>(
      omit(props, ['data', 'layout', 'width', 'height', 'layoutCache']) as unknown as GraphOptions,
    );

    const apis = shallowRef<ApisType>({} as ApisType);
    const theme = shallowRef<ThemeData>({} as ThemeData);

    const contextRef = computed<GraphinContextType>(() => {
      return {
        apis: apis.value,
        theme: theme.value,
        graph: (graph.value || {}) as IGraph,
        layout: layout as LayoutController,
      };
    });

    createContext(contextRef);

    const initData = (newData: GraphinProps['data']) => {
      if ((newData as GraphinTreeData).children) {
        isTree.value = true;
      }
      data.value = { ...newData };
    };

    /** 初始化状态 */
    const initStatus = () => {
      if (!isTree.value) {
        const { nodes = [], edges = [] } = props.data as GraphinData;
        nodes.forEach((node) => {
          const { status } = node;
          if (status) {
            Object.keys(status).forEach((k) => {
              graph.value.setItemState(node.id, k, Boolean(status[k]));
            });
          }
        });
        edges.forEach((edge) => {
          const { status } = edge;
          if (status) {
            Object.keys(status).forEach((k) => {
              graph.value.setItemState(edge.id, k, Boolean(status[k]));
            });
          }
        });
      }
    };

    const initGraphInstance = () => {
      const {
        defaultCombo = { style: {}, type: 'graphin-combo' },
        defaultEdge = { style: {}, type: 'graphin-line' },
        defaultNode = { style: {}, type: 'graphin-circle' },
        nodeStateStyles,
        edgeStateStyles,
        comboStateStyles,
        modes = { default: [] },
        animate,
        handleAfterLayout,
        ...otherOptions
      } = props;

      if (modes.default.length > 0) {
        // TODO :给用户正确的引导，推荐使用Graphin的Behaviors组件
        console.info(
          '%c suggestion: you can use @antv/graphin Behaviors components',
          'color:lightgreen',
        );
      }

      /**  width and height */
      const { clientWidth, clientHeight } = graphDOM.value as HTMLDivElement;
      /** shallow clone */
      initData(props.data);

      /** 重新计算宽度 */
      width.value = Number(props.width) || clientWidth || 500;
      height.value = Number(props.height) || clientHeight || 500;

      const themeResult = getDefaultStyleByTheme(props.theme);

      const {
        defaultNodeStyle,
        defaultEdgeStyle,
        defaultComboStyle,
        defaultNodeStatusStyle,
        defaultEdgeStatusStyle,
        defaultComboStatusStyle,
        ...otherTheme
      } = themeResult;

      /** graph type */
      isTree.value =
        Boolean((props.data as GraphinTreeData).children) ||
        TREE_LAYOUTS.indexOf(String(props.layout && props.layout.type)) !== -1;

      const finalStyle = {
        defaultNode: {
          style: { ...defaultNode.style, _theme: theme.value },
          type: defaultNode.type || 'graphin-circle',
        }, // isGraphinNodeType ? deepMix({}, defaultNodeStyle, defaultNode) : defaultNode,
        defaultEdge: {
          style: { ...defaultEdge.style, _theme: theme.value },
          type: defaultEdge.type || 'graphin-line',
        }, // isGraphinEdgeType ? deepMix({}, defaultEdgeStyle, defaultEdge) : defaultEdge,
        defaultCombo: {
          style: { ...defaultCombo.style, _theme: theme.value },
          type: defaultCombo.type || 'combo',
        },
        // deepMix({}, defaultComboStyle, defaultCombo), // TODO:COMBO的样式需要内部自定义
        /** status 样式 */
        nodeStateStyles, // isGraphinNodeType ? deepMix({}, defaultNodeStatusStyle, nodeStateStyles) : nodeStateSty    les,
        edgeStateStyles, // isGraphinEdgeType ? deepMix({}, defaultEdgeStatusStyle, edgeStateStyles) : edgeStateSty    les,
        comboStateStyles, // deepMix({}, defaultComboStatusStyle, comboStateStyles),
      };

      theme.value = { ...finalStyle, ...otherTheme } as unknown as ThemeData;
      options.value = {
        container: graphDOM.value,
        renderer: 'canvas',
        width: width.value,
        height: height.value,
        animate: animate !== false,
        ...finalStyle,
        modes,
        ...otherOptions,
      } as GraphOptions;

      if (isTree.value) {
        options.value = {
          ...options.value,
          layout: props.layout || DEFAULT_TREE_LATOUT_OPTIONS,
        };
        graph.value = new G6.TreeGraph(toRaw(options.value) as GraphOptions);
      } else {
        graph.value = new G6.Graph(toRaw(options.value) as GraphOptions);
      }

      /** 内置事件:AfterLayout 回调 */
      graph.value.on('afterlayout', () => {
        if (handleAfterLayout) {
          handleAfterLayout(toRaw(graph.value) as IGraph);
        }
      });

      /** 装载数据 */
      graph.value.data(toRaw(data.value) as GraphData | TreeGraphData);

      /** 初始化布局：仅限网图 */
      if (!isTree.value) {
        layout.value = new LayoutController({
          context: contextRef.value,
          props,
          width: width.value,
          height: height.value,
          graphDOM: graphDOM.value,
          data: toRaw(data.value),
          graph: graph.value,
          options: options,
        });

        layout.value.start();
      }

      /** 渲染 */
      graph.value.render();
      /** FitView 变为组件可选 */

      /** 初始化状态 */
      initStatus();
      /** 生成API */
      apis.value = ApiController(toRaw(graph.value) as IGraph);

      isReady.value = true;
    };

    onMounted(() => {
      initGraphInstance();
    });

    // dataChange
    watch(
      () => props.data,
      (v) => {
        console.log('watch dataChange')
        if (!deepEqual(toRaw(v), toRaw(data.value))) {
          console.log('dataChange')
          initData(v);
          const newData = toRaw(data.value)
          graph.value.data(newData as GraphData | TreeGraphData);
          // graph.value.set('layoutController', null);
          graph.value.changeData(newData as GraphData | TreeGraphData);
          layout.value.changeLayout();
          data.value = layout.value.getDataFromGraph();
          initStatus();
          apis.value = ApiController(toRaw(graph.value) as IGraph);
          graph.value.emit('graphin:datachange');
        }
      },
    );
    // layout 更新
    watch(
      () => props.layout,
      () => {
        layout.value.changeLayout();
      },
    );

    watch(
      () => props.layoutCache,
      (v) => {
        layoutCache.value = v;
      },
    );

    const clear = () => {
      if (layout.value && layout.value.destroy) {
        layout.value.destroy(); // tree graph
      }
      layout.value = {} as LayoutController;
      graph.value!.clear();
      data.value = { nodes: [], edges: [], combos: [] };
      graph.value!.destroy();
    };

    onUnmounted(() => {
      clear();
    });
    return {
      graphDOM,
      themeRef: theme,
      isReady,
    }
  },
  render() {
    const { themeRef, graphStyle, isReady, modes, graphDOM } = this;
    return (
      <div id="graphin-container">
        <div
          data-testid="custom-element"
          class="graphin-core"
          ref="graphDOM"
          style={{ background: themeRef ? themeRef.background : undefined, ...graphStyle }}
        />
        <div class="graphin-components">
          {/** @ts-ignore */}
          {isReady && <div>
            {
              /** @ts-ignore modes 不存在的时候，才启动默认的behaviors，否则会覆盖用户自己传入的 */
              !modes && (
                <div>
                  {/* 拖拽画布 */}
                  <DragCanvas />
                  {/* 缩放画布 */}
                  <ZoomCanvas />
                  {/* 拖拽节点 */}
                  <DragNode />
                  {/* 点击节点 */}
                  <DragCombo />
                  {/* 点击节点 */}
                  <ClickSelect />
                  {/* 圈选节点 */}
                  <BrushSelect />
                </div>
              )
            }
            {this.$slots.default ? this.$slots.default() : null}
            {/** resize 画布 */}
            {graphDOM && <ResizeCanvas graphDOM={graphDOM as HTMLDivElement} />}
          </div>}
        </div>
      </div>
    )
  }
})

export default Graphin
