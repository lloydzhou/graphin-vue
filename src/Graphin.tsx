import { defineComponent, onMounted, onUnmounted, ref, provide, inject, reactive, nextTick, toRef, toRefs, ExtractPropTypes, PropType, CSSProperties, shallowReactive, watchEffect } from 'vue';

import G6, { Graph as IGraph, GraphData, GraphOptions, TreeGraphData } from '@antv/g6';
// import React, { ErrorInfo } from 'react';
/** 内置API */
import GraphinType  from '@antv/graphin/es/Graphin';
import ApiController from '@antv/graphin/es/apis';
import { ApisType } from '@antv/graphin/es/apis/types';
/** 内置 Behaviors */
// import Behaviors from './behaviors';
import { DEFAULT_TREE_LATOUT_OPTIONS, TREE_LAYOUTS } from '@antv/graphin/es/consts';
/** Context */
// import GraphinContext from './GraphinContext';
import './index.less';
/** 内置布局 */
import LayoutController from '@antv/graphin/es/layout';
import { getDefaultStyleByTheme, ThemeData } from '@antv/graphin/es/theme/index';
/** types  */
import { GraphinData, GraphinProps, GraphinTreeData, IconLoader, IUserNode, PlainObject } from '@antv/graphin/es/typings/type';
import cloneDeep from '@antv/graphin/es/utils/cloneDeep';
/** utils */
// import shallowEqual from './utils/shallowEqual';
import deepEqual from '@antv/graphin/es/utils/deepEqual';

// const { DragCanvas, ZoomCanvas, DragNode, DragCombo, ClickSelect, BrushSelect, ResizeCanvas } = Behaviors;
import {createContext} from './GraphinContext'
import ResizeCanvas from './behaviors/ResizeCanvas'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DiffValue = any;

export interface GraphinState {
  isReady: boolean;
  context: {
    graph: IGraph;
    apis: ApisType;
    theme: ThemeData;
    layout: LayoutController;
    dragNodes: IUserNode[];
    updateContext: (config: PlainObject) => void;
  };
}

// const T = {
//   style?: CSSProperties;
//   theme?: Partial<ThemeType>;
//   data: GraphinTreeData | GraphinData;
//   layout?: Layout;
//   modes?: any;
//   handleAfterLayout?: (graph: Graph) => void;
//   /** 宽度 */
//   width: number;
//   /** 高度 */
//   height: number;
// }
// 
// export type VGraphinProps = ExtractPropTypes<typeof T>;

export interface RegisterFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (name: string, options: { [key: string]: any }, extendName?: string): void;
}

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
        return matchIcon?.unicode;
      },
    });
  },

  registerLayout(layoutName: string, layout: any) {
    G6.registerLayout(layoutName, layout);
  },

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
    }
  },

  components: { ResizeCanvas },

  setup(props, { slots }) {
    // @ts-ignore
    const { data, layout, width, height, layoutCache, ...otherOptions } = props as GraphinProps;
    

    const self = reactive({
      data,
      isTree: Boolean(data && (data as GraphinTreeData).children) || TREE_LAYOUTS.indexOf(String(layout && layout.type)) !== -1,
      graph: {} as IGraph,
      height: Number(height),
      width: Number(width),
      theme: {} as ThemeData,
      apis: {} as ApisType,
      layoutCache,
      layout: {} as LayoutController,
      dragNodes: [] as IUserNode[],
      options: { ...otherOptions } as GraphOptions,

      isReady: false,

      graphDOM: {} as HTMLDivElement,
      props: cloneDeep(props)
    })

    // 这个变量用来处理provide的内容，避免self中变量过多导致watchEffect执行多次
    const context = reactive({
      graph: {} as IGraph,
      apis: {} as ApisType,
      theme: {} as ThemeData,
      layout: {} as LayoutController,
    })
    createContext(context)

    const initData = (data: GraphinProps['data']) => {
      if ((data as GraphinTreeData).children) {
        self.isTree = true;
      }
      self.data = cloneDeep(data);
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
        // @ts-ignore
      } = props as GraphinProps;
      if (modes.default.length > 0) {
        // TODO :给用户正确的引导，推荐使用Graphin的Behaviors组件
        console.info('%c suggestion: you can use @antv/graphin Behaviors components', 'color:lightgreen');
      }
      /**  width and height */
      const { clientWidth, clientHeight } = self.graphDOM as HTMLDivElement;
      /** shallow clone */
      initData(data);

      /** 重新计算宽度 */
      self.width = Number(width) || clientWidth || 500;
      self.height = Number(height) || clientHeight || 500;

      const themeResult = getDefaultStyleByTheme(theme);

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
        Boolean((data as GraphinTreeData).children) || TREE_LAYOUTS.indexOf(String(layout && layout.type)) !== -1;

      const finalStyle = {
        defaultNode: { style: { ...defaultNode.style, _theme: theme }, type: defaultNode.type || 'graphin-circle' }, // isGraphinNodeType ? deepMix({}, defaultNodeStyle, defaultNode) : defaultNode,
        defaultEdge: { style: { ...defaultEdge.style, _theme: theme }, type: defaultEdge.type || 'graphin-line' }, // isGraphinEdgeType ? deepMix({}, defaultEdgeStyle, defaultEdge) : defaultEdge,
        defaultCombo: { style: { ...defaultCombo.style, _theme: theme }, type: defaultCombo.type || 'combo' }, // deepMix({}, defaultComboStyle, defaultCombo), // TODO:COMBO的样式需要内部自定义
        /** status 样式 */
        nodeStateStyles, // isGraphinNodeType ? deepMix({}, defaultNodeStatusStyle, nodeStateStyles) : nodeStateStyles,
        edgeStateStyles, // isGraphinEdgeType ? deepMix({}, defaultEdgeStatusStyle, edgeStateStyles) : edgeStateStyles,
        comboStateStyles, // deepMix({}, defaultComboStatusStyle, comboStateStyles),
      };
      // @ts-ignore
      self.theme = { ...finalStyle, ...otherTheme } as ThemeData;

      self.options = {
        container: self.graphDOM,
        renderer: 'canvas',
        width: self.width,
        height: self.height,
        animate: animate !== false,
        ...finalStyle,
        modes,
        ...otherOptions,
      } as GraphOptions;

      if (self.isTree) {
        self.options.layout = layout || DEFAULT_TREE_LATOUT_OPTIONS;
        // @ts-ignore
        self.graph = new G6.TreeGraph(self.options);
      } else {
        // @ts-ignore
        self.graph = new G6.Graph(self.options);
      }

      /** 内置事件:AfterLayout 回调 */
      self.graph.on('afterlayout', () => {
        if (handleAfterLayout) {
          handleAfterLayout(self.graph as IGraph);
        }
      });

      /** 装载数据 */
      self.graph.data(self.data as GraphData | TreeGraphData);

      /** 渲染 */
      self.graph.render();

      /** 初始化布局：仅限网图 */
      if (!self.isTree) {
        // @ts-ignore
        self.layout = new LayoutController(self as typeof Graphin);
        self.layout.start();
      }

      // self.graph.get('canvas').set('localRefresh', true);

      /** FitView 变为组件可选 */

      /** 初始化状态 */
      initStatus();
      /** 生成API */
      self.apis = ApiController(self.graph as IGraph);
      self.isReady = true
      context.graph = self.graph
      context.apis = self.apis
      context.theme = self.theme
      context.layout = self.layout
      /** 设置Context */
      // 使用
      // this.setState({
      //   isReady: true,
      //   context: {
      //     graph: this.graph,
      //     apis: this.apis,
      //     theme: this.theme,
      //     layout: this.layout,
      //     dragNodes: this.dragNodes,
      //     updateContext: this.updateContext,
      //   },
      // });
    };


    const updateLayout = () => {
      self.layout.changeLayout();
    };

    /**
     * 组件更新的时候
     * @param prevProps
     */
    const updateOptions = () => {
      const { ...options } = props;
      return options;
    };

    /** 初始化状态 */
    const initStatus = () => {
      if (!self.isTree) {
        // @ts-ignore
        const { data } = props as GraphinProps;
        const { nodes = [], edges = [] } = data as GraphinData;
        nodes.forEach(node => {
          const { status } = node;
          if (status) {
            Object.keys(status).forEach(k => {
              self.graph.setItemState(node.id, k, Boolean(status[k]));
            });
          }
        });
        edges.forEach(edge => {
          const { status } = edge;
          if (status) {
            Object.keys(status).forEach(k => {
              self.graph.setItemState(edge.id, k, Boolean(status[k]));
            });
          }
        });
      }
    };

    const updateContext = (config: PlainObject) => {
      // this.setState(prevState => ({
      //   context: {
      //     ...prevState.context,
      //     ...config,
      //   },
      // }));
    };

    const clear = () => {
      if (self.layout && self.layout.destroy) {
        self.layout.destroy(); // tree graph
      }
      self.layout = {} as LayoutController;
      self.graph!.clear();
      self.data = { nodes: [], edges: [], combos: [] };
      self.graph!.destroy();
    };

    onMounted(() => {
      nextTick(() => initGraphInstance())
      watchEffect((onInvalidate) => {
        onInvalidate(() => {
          clear()
        })
      })
    })
    // onUnmounted(() => clear())


    return () => (
      <div id="graphin-container">
        <div
          data-testid="custom-element"
          class="graphin-core"
          ref={(ref) => {
            // @ts-ignore
            self.graphDOM = ref
          }}
        />
        <div class="graphin-components">
          {/** @ts-ignore */}
          {self.isReady && <>
            {slots.default ? slots.default() : null}
            {/** resize 画布 */}
            <ResizeCanvas graphDOM={self.graphDOM as HTMLDivElement} />
          </>}
        </div>
      </div>
    )
  },

  // componentDidUpdate(prevProps: GraphinProps) {
  //   // console.time('did-update');
  //   const isDataChange = this.shouldUpdate(prevProps, 'data');
  //   const isLayoutChange = this.shouldUpdate(prevProps, 'layout');
  //   const isOptionsChange = this.shouldUpdate(prevProps, 'options');
  //   const isThemeChange = this.shouldUpdate(prevProps, 'theme');
  //   // console.timeEnd('did-update');
  //   const { data, layoutCache, layout } = this.$attrs;
  //   this.layoutCache = layoutCache;
  //   // const isGraphTypeChange = (prevProps.data as GraphinTreeData).children !== (data as GraphinTreeData).children;

  //   if (isThemeChange) {
  //     // TODO :Node/Edge/Combo 批量调用 updateItem 来改变
  //   }

  //   /** 图类型变化 */
  //   // if (isGraphTypeChange) {
  //   //   console.error(
  //   //     'The data types of pervProps.data and props.data are inconsistent,Graphin does not support the dynamic switching of TreeGraph and NetworkGraph',
  //   //   );
  //   //   return;
  //   // }

  //   /** 配置变化 */
  //   if (isOptionsChange) {
  //     // this.updateOptions();
  //   }

  //   /** 数据变化 */
  //   if (isDataChange) {
  //     this.initData(data);

  //     if (this.isTree) {
  //       // this.graph.data(this.data as TreeGraphData);
  //       this.graph.changeData(this.data as TreeGraphData);
  //     } else {
  //       const {
  //         context: { dragNodes },
  //       } = this.state;
  //       // 更新拖拽后的节点的mass到data
  //       // @ts-ignore
  //       this.data?.nodes?.forEach(node => {
  //         const dragNode = dragNodes.find(item => item.id === node.id);
  //         if (dragNode) {
  //           node.layout = {
  //             ...node.layout,
  //             force: {
  //               mass: dragNode.layout?.force?.mass,
  //             },
  //           };
  //         }
  //       });

  //       this.graph.data(this.data as GraphData | TreeGraphData);
  //       this.graph.set('layoutController', null);
  //       this.graph.changeData(this.data as GraphData | TreeGraphData);

  //       // 由于 changeData 是将 this.data 融合到 item models 上面，因此 changeData 后 models 与 this.data 不是同一个引用了
  //       // 执行下面一行以保证 graph item model 中的数据与 this.data 是同一份
  //       // @ts-ignore
  //       this.data = this.layout.getDataFromGraph();
  //       this.layout.changeLayout();
  //     }

  //     this.initStatus();
  //     this.apis = ApiController(this.graph);
  //     // console.log('%c isDataChange', 'color:grey');
  //     // this.setState(
  //     //   preState => {
  //     //     return {
  //     //       ...preState,
  //     //       context: {
  //     //         graph: this.graph,
  //     //         apis: this.apis,
  //     //         theme: this.theme,
  //     //         layout: this.layout,
  //     //         dragNodes: preState.context.dragNodes,
  //     //         updateContext: this.updateContext,
  //     //       },
  //     //     };
  //     //   },
  //     //   () => {
  //     //     this.graph.emit('graphin:datachange');
  //     //     if (isLayoutChange) {
  //     //       this.graph.emit('graphin:layoutchange', { prevLayout: prevProps.layout, layout });
  //     //     }
  //     //   },
  //     // );
  //     return;
  //   }
  //   /** 布局变化 */
  //   if (isLayoutChange) {
  //     if (this.isTree) {
  //       // @ts-ignore
  //       // eslint-disable-next-line react/destructuring-assignment
  //       this.graph.updateLayout(this.$attrs.layout);
  //       return;
  //     }
  //     /**
  //      * TODO
  //      * 1. preset 前置布局判断问题
  //      * 2. enablework 问题
  //      * 3. G6 LayoutController 里的逻辑
  //      */
  //     /** 数据需要从画布中来 */
  //     // @ts-ignore
  //     this.data = this.layout.getDataFromGraph();
  //     this.layout.changeLayout();
  //     this.layout.refreshPosition();

  //     /** 走G6的layoutController */
  //     // this.graph.updateLayout();
  //     // console.log('%c isLayoutChange', 'color:grey');
  //     this.graph.emit('graphin:layoutchange', { prevLayout: prevProps.layout, layout });
  //   }
  // }

  // /**
  //  * 组件移除的时候
  //  */
  // componentWillUnmount() {
  //   this.clear();
  // }

  // /**
  //  * 组件崩溃的时候
  //  * @param error
  //  * @param info
  //  */
  // componentDidCatch(error: Error, info: ErrorInfo) {
  //   console.error('Catch component error: ', error, info);
  // }

  // shouldUpdate(prevProps: GraphinProps, key: string) {
  //   /* eslint-disable react/destructuring-assignment */
  //   const prevVal = prevProps[key];
  //   const currentVal = this.$attrs[key] as DiffValue;
  //   const isEqual = deepEqual(prevVal, currentVal);
  //   return !isEqual;
  // }

    // return (
    //   <GraphinContext.Provider value={this.state.context}>
    //     <div id="graphin-container">
    //       <div
    //         data-testid="custom-element"
    //         className="graphin-core"
    //         ref={node => {
    //           this.graphDOM = node;
    //         }}
    //         style={{ background: this.theme?.background, ...style }}
    //       />
    //       <div className="graphin-components">
    //         {isReady && (
    //           <>
    //             {
    //               /** modes 不存在的时候，才启动默认的behaviors，否则会覆盖用户自己传入的 */
    //               !modes && (
    //                 <>
    //                   {/* 拖拽画布 */}
    //                   <DragCanvas />
    //                   {/* 缩放画布 */}
    //                   <ZoomCanvas />
    //                   {/* 拖拽节点 */}
    //                   <DragNode />
    //                   {/* 点击节点 */}
    //                   <DragCombo />
    //                   {/* 点击节点 */}
    //                   <ClickSelect />
    //                   {/* 圈选节点 */}
    //                   <BrushSelect />
    //                 </>
    //               )
    //             }
    //             {/** resize 画布 */}
    //             <ResizeCanvas graphDOM={this.graphDOM as HTMLDivElement} />
    //             {/* <Hoverable bindType="edge" /> */}
    //             {this.props.children}
    //             {/* <Hoverable bindType="node" /> 2.3.3 版本移除 */}
    //           </>
    //         )}
    //       </div>
    //     </div>
    //   </GraphinContext.Provider>
    // );
  // }
})

export default Graphin
