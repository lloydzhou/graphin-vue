// @ts-nocheck
import Graphin from './Graphin'

//utils 工具
import Utils from "@antv/graphin/es/utils/index"
import Behaviors from './behaviors';
import GraphinContext  from './GraphinContext';

import registerGraphinForce from '@antv/graphin/es/layout/inner/registerGraphinForce';
import registerPresetLayout from '@antv/graphin/es/layout/inner/registerPresetLayout';
import { registerGraphinCircle, registerGraphinLine } from '@antv/graphin/es/shape';
import {registerNode, registerEdge, registerCombo, registerBehavior, registerFontFamily} from "./registers"
// install 是默认的方法。当外界在 use 这个组件的时候，就会调用本身的 install 方法，同时传一个 Vue 这个类的参数。
const components = [
  Graphin,
]
Graphin.install = function (Vue) {
  components.forEach(component => {
    Vue.component(component.name, component);
  });
}

/** 注册 Graphin force 布局 */
registerGraphinForce();
/** 注册 Graphin preset 布局 */
registerPresetLayout();

/** 注册 Graphin Circle Node */
registerGraphinCircle();

/** 注册 Graphin line Edge */
registerGraphinLine();

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  Graphin.install(window.Vue);
}

//导出
export {
  Graphin,
  Utils,
  Behaviors,
  GraphinContext,
  registerNode,
  registerEdge,
  registerCombo,
  registerBehavior,
  registerFontFamily
}

export {
  /** export G6 */
  default as G6,
  /** export G6 Type  */
  // Graph,
  // IG6GraphEvent,
  // GraphData,
  // TreeGraphData,
  // NodeConfig,
  // EdgeConfig,
} from '@antv/g6';

export interface GraphEvent extends MouseEvent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any;
}
export default Graphin

