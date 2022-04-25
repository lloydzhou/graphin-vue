// @ts-nocheck
import { defineComponent, onMounted, onUnmounted, ref, watch, toRaw, toRef, markRaw, shallowReactive } from 'vue';

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
// import '@antv/graphin/es/index.css'
/** 内置布局 */
import LayoutController from '@antv/graphin/es/layout';
import { getDefaultStyleByTheme, ThemeData } from '@antv/graphin/es/theme/index';
/** types  */
import { GraphinData, GraphinProps, GraphinTreeData, IUserNode } from '@antv/graphin/es/typings/type';
import cloneDeep from '@antv/graphin/es/utils/cloneDeep';
/** utils */
// import shallowEqual from './utils/shallowEqual';
import deepEqual from '@antv/graphin/es/utils/deepEqual';

const { DragCanvas, ZoomCanvas, DragNode, DragCombo, ClickSelect, BrushSelect, ResizeCanvas } = Behaviors;
import {createContext} from './GraphinContext'


const Graphin = defineComponent({

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
    style: {
      type: Object,
      default: () => ({})
    },
    containerId: {
      type: String,
      default: () => ''
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    fitView: {
      type: Boolean,
      default: () => false
    },
    fitViewPadding: {
      type: Number,
      default: () => 0
    },
    fitCenter: {
      type: Boolean,
      default: () => false
    },
    linkCenter: {
      type: Boolean,
      default: () => false
    },
    groupByTypes: {
      type: Boolean,
      default: () => true
    },
    autoPaint: {
      type: Boolean,
      default: () => true
    },
    animate: {
      type: Boolean,
      default: () => false
    },
    animateCfg: {
      type: Object,
      default: () => ({})
    },
    minZoom: {
      type: Number,
      default: () => 0.2
    },
    maxZoom: {
      type: Number,
      default: () => 10
    },
    enabledStack: {
      type: Boolean,
      default: () => false
    },
  },

  components: { DragCanvas, ZoomCanvas, DragNode, DragCombo, ClickSelect, BrushSelect, ResizeCanvas },

  setup(props) {

    const { data, layout, width, height, layoutCache, ...otherOptions } = props;

    /** 传递给LayoutController的对象 */
    const self = markRaw({
      props,
      data,
      isTree:
        Boolean(props.data && (props.data as GraphinTreeData).children) ||
        TREE_LAYOUTS.indexOf(String(layout && layout.type)) !== -1,
      graph: {} as IGraph,
      height: Number(height),
      width: Number(width),

      theme: {} as ThemeData,
      apis: {} as ApisType,
      layoutCache,
      layout: {} as LayoutController,
      dragNodes: [] as IUserNode[],

      options: { ...otherOptions } as GraphOptions,

      isReady: false
    })
    // self.props不会同步变化
    watch(() => props, (newProps) => self.props = {...newProps})

    /** Graph的DOM */
    const graphDOM = ref<HTMLDivElement | null>(null);

    /** createContext内的数据 */
    const contextRef = shallowReactive({
      graph: {} as IGraph,
      apis: {} as ApisType,
      theme: {} as ThemeType,
      layout: {} as LayoutController,
      dragNodes: [],
    });

    createContext(contextRef);

    const initData = (newData: GraphinProps['data']) => {
      if ((newData as GraphinTreeData).children) {
        self.isTree = true;
      }
      self.data = cloneDeep(newData);
    };

    const initGraphInstance = () => {
      const {
        theme,
        data,
        layout,
        width,
        height,
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
        console.info('%c suggestion: you can use @antv/graphin Behaviors components', 'color:lightgreen');
      }

      /**  width and height */
      const { clientWidth, clientHeight } = graphDOM.value as HTMLDivElement;
      /** shallow clone */
      initData(props.data);

      /** 重新计算宽度 */
      self.width = Number(width) || clientWidth || 500;
      self.height = Number(height) || clientHeight || 500;

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
      self.isTree =
        Boolean((data as GraphinTreeData).children) || TREE_LAYOUTS.indexOf(String(props.layout && props.layout.type)) !== -1;

      const finalStyle = markRaw({
        defaultNode: { style: { ...defaultNode.style, _theme: theme }, type: defaultNode.type || 'graphin-circle' }, // isGraphinNodeType ? deepMix({}, defaultNodeStyle, defaultNode) : defaultNode,
        defaultEdge: { style: { ...defaultEdge.style, _theme: theme }, type: defaultEdge.type || 'graphin-line' }, // isGraphinEdgeType ? deepMix({}, defaultEdgeStyle, defaultEdge) : defaultEdge,
        defaultCombo: { style: { ...defaultCombo.style, _theme: theme }, type: defaultCombo.type || 'combo' }, // deepMix({}, defaultComboStyle, defaultCombo), // TODO:COMBO的样式需要内部自定义
        /** status 样式 */
        nodeStateStyles, // isGraphinNodeType ? deepMix({}, defaultNodeStatusStyle, nodeStateStyles) : nodeStateSty    les,
        edgeStateStyles, // isGraphinEdgeType ? deepMix({}, defaultEdgeStatusStyle, edgeStateStyles) : edgeStateSty    les,
        comboStateStyles, // deepMix({}, defaultComboStatusStyle, comboStateStyles),
      });

      contextRef.theme = self.theme = { ...finalStyle, ...otherTheme } as unknown as ThemeData;
      self.options = markRaw({
        container: graphDOM.value,
        renderer: 'canvas',
        width: self.width,
        height: self.height,
        animate: animate !== false,
        ...finalStyle,
        modes,
        ...otherOptions,
      }) as GraphOptions;

      if (self.isTree) {
        self.options.layout = layout || DEFAULT_TREE_LATOUT_OPTIONS,
        self.graph = new G6.TreeGraph(self.options as GraphOptions);
      } else {
        self.graph = new G6.Graph(self.options as GraphOptions);
      }
      contextRef.graph = self.graph

      /** 内置事件:AfterLayout 回调 */
      self.graph.on('afterlayout', () => {
        if (handleAfterLayout) {
          handleAfterLayout(self.graph as IGraph);
        }
      });

      /** 装载数据 */
      self.graph.data(self.data as GraphData | TreeGraphData);

      /** 初始化布局：仅限网图 */
      if (!self.isTree) {
        // 这里需要将self当作graphin的对象传到LayoutController里面，所以先将graphDOM赋值以下
        self.graphDOM = graphDOM.value
        self.context = contextRef
        self.props = markRaw({...props})
        contextRef.layout = self.layout = new LayoutController(self);
        self.layout.start();
      }

      /** 渲染 */
      self.graph.render();
      /** FitView 变为组件可选 */

      /** 初始化状态 */
      initStatus();
      /** 生成API */
      contextRef.apis = ApiController(self.graph as IGraph);

      self.isReady = true;
    };

    /** 初始化状态 */
    const initStatus = () => {
      if (!self.isTree) {
        const { nodes = [], edges = [] } = props.data as GraphinData;
        nodes.forEach((node) => {
          const { status } = node;
          if (status) {
            Object.keys(status).forEach((k) => {
              self.graph.setItemState(node.id, k, Boolean(status[k]));
            });
          }
        });
        edges.forEach((edge) => {
          const { status } = edge;
          if (status) {
            Object.keys(status).forEach((k) => {
              self.graph.setItemState(edge.id, k, Boolean(status[k]));
            });
          }
        });
      }
    };

    onMounted(() => {
      initGraphInstance();
    });

    // dataChange
    watch(
      () => props.data,
      (v) => {
        let newDragNodes: IUserNode[];

        /** 数据变化 */
        if (!deepEqual(toRaw(v), toRaw(self.data))) {
          initData(v);

          if (self.isTree) {
            self.graph.changeData(self.data as TreeGraphData);
          } else {
            // 若 dragNodes 中的节点已经不存在，则从数组中删去
            // @ts-ignore
            newDragNodes = self.dragNodes.filter(
              dNode => (self.data as GraphinData).nodes && (self.data as GraphinData).nodes.find(node => node.id === dNode.id),
            );
            // 更新拖拽后的节点的mass到data
            // @ts-ignore
            if (self.data.nodes && self.data.nodes.length > 0) {
              self.data.nodes.forEach(node => {
                const dragNode = newDragNodes.find(item => item.id === node.id);
                if (dragNode) {
                  const { force={} } = dragNode.layout || {}
                  node.layout = {
                    ...node.layout,
                    force: {
                      mass: force.mass,
                    },
                  };
                }
              })
            }
          }

          self.graph.data(self.data as GraphData | TreeGraphData);
          self.graph.set('layoutController', null);
          self.graph.changeData(self.data as GraphData | TreeGraphData);

          // 由于 changeData 是将 this.data 融合到 item models 上面，因此 changeData 后 models 与 this.data 不是同一个引用了
          // 执行下面一行以保证 graph item model 中的数据与 this.data 是同一份
          // @ts-ignore
          self.data = self.layout.getDataFromGraph();
          self.layout.changeLayout();

          initStatus();
          contextRef.apis = ApiController(self.graph as IGraph);
          contextRef.dragNodes = self.dragNodes = newDragNodes || self.dragNodes
          self.graph.emit('graphin:datachange');
        }
      },
    );
    // layout 更新
    watch(
      () => props.layout,
      (layout, prevLayout) => {
        if (self.isTree) {
          self.graph.updateLayout(layout);
          return
        }
        /**
         * TODO
         * 1. preset 前置布局判断问题
         * 2. enablework 问题
         * 3. G6 LayoutController 里的逻辑
         */
        /** 数据需要从画布中来 */
        // @ts-ignore
        self.data = self.layout.getDataFromGraph()
        self.layout.changeLayout();
        self.graph.emit('graphin:layoutchange', { prevLayout: prevLayout, layout });
      },
    );

    watch(
      () => props.layoutCache,
      (v) => {
        self.layoutCache = v;
      },
    );

    const clear = () => {
      if (self.layout && self.layout.destroy) {
        self.layout.destroy(); // tree graph
      }
      self.layout = {} as LayoutController;
      self.graph!.clear();
      self.data = { nodes: [], edges: [], combos: [] };
      self.graph!.destroy();
    };

    onUnmounted(() => {
      clear();
    });
    return {
      graphDOM,
      isReady: toRef(self, 'isReady'),
      theme: toRef(self, 'theme'),
    }
  },
  render() {
    const { theme, style, isReady, modes, graphDOM, containerId, containerStyle } = this;
    return (
      <div id={containerId || "graphin-container"} style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        ...containerStyle,
      }}>
        <div
          data-testid="custom-element"
          class="graphin-core"
          ref="graphDOM"
          style={{
            height: '100%',
            width: '100%',
            minHeight: '500px',
            background: theme ? theme.background : undefined,
            ...style
          }}
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
