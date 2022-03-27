
import Graphin from './Graphin.vue'

import registerGraphinForce from './layout/inner/registerGraphinForce';
import registerPresetLayout from './layout/inner/registerPresetLayout';
import { registerGraphinCircle, registerGraphinLine } from './shape';
import {registerNode, registerEdge, registerCombo, registerBehavior, registerFontFamily} from "./register/index"
//utils 工具
import Utils from "./utils/index"
import Behaviors from './behaviors/index';

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
  VGraphin.install(window.Vue);
}
//导出
export default VGraphin
export {
  VGraphin,
  Utils,
  Behaviors,
  registerNode,
  registerEdge,
  registerCombo,
  registerBehavior,
  registerFontFamily
}
export {
  /** export G6 */
  default as G6,
} from "@antv/g6"
