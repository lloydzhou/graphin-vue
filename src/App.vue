<template>
  <Graphin :data="data" :layout="layout">
    <ActivateRelations trigger="mouseenter" />
    <BrushSelect />
    <ClickSelect />
    <FontPaint />
    <ZoomCanvas />
    <DragCanvas />
    <DragCombo />
    <DragNode />
    <Hoverable />
    <LassoSelect />
    <FitView />
    <!-- <TreeCollapse /> -->
    <!-- <DragNodeWithForce /> -->
  </Graphin>
</template>
<script lang="ts">
// @ts-nocheck
import { Options, Vue as Component } from 'vue-class-component';
import Utils from '@antv/graphin/es/utils'
// import ZoomCanvas from './behaviors/ZoomCanvas'
// import FitView from './behaviors/FitView'
// import FontPaint from './behaviors/FontPaint'
// import ActivateRelations from './behaviors/ActivateRelations'
// import BrushSelect from './behaviors/BrushSelect'
// import ClickSelect from './behaviors/ClickSelect'
// import DragCanvas from './behaviors/DragCanvas'
// import DragCombo from './behaviors/DragCombo'
// import DragNode from './behaviors/DragNode'
// import Hoverable from './behaviors/Hoverable'
// import LassoSelect from './behaviors/LassoSelect'
// import TreeCollapse from './behaviors/TreeCollapse'
// import DragNodeWithForce from './behaviors/DragNodeWithForce'

// import Graphin from './Graphin'
// import Behaviors from './behaviors'
// import Graphin, { Behaviors } from '../dist/index.es'
import Graphin, { Behaviors } from './graphin'
const {
  /** 内置 */
  DragCanvas,
  ZoomCanvas,
  ClickSelect,
  BrushSelect,
  DragNode,
  // ResizeCanvas,
  LassoSelect,
  DragCombo,
  Hoverable,
  /** 可选 */
  ActivateRelations,
  TreeCollapse,
  FitView,
  FontPaint,
  DragNodeWithForce,
} = Behaviors;


@Options({
  components: {
    Graphin,
    ZoomCanvas,
    FitView,
    FontPaint,
    ActivateRelations,
    BrushSelect,
    ClickSelect,
    DragCanvas,
    DragCombo,
    DragNode,
    Hoverable,
    LassoSelect,
    TreeCollapse,
    DragNodeWithForce,
  },
})
export default class App extends Component {

  name = 'world'
  data = {nodes: [], edeges: []}
  layout = {
    type: 'graphin-force',
    preset: {
      type: 'grid',
    }
  }

  created() {

    setTimeout(() => this.name = 'lloyd', 2000)
    console.log('created', this)
    // @ts-ignore
    this.data = Utils.mock(5).circle().graphin()
    setTimeout(() => {
      // @ts-ignore
      this.data = Utils.mock(10).circle().graphin()
      console.log('update data', this.data)
    }, 3000)
    // setTimeout(() => {
    //   // @ts-ignore
    //   this.data = Utils.mock(100).circle().graphin()
    //   console.log('update data', this.data)
    // }, 10000)
  }

}
</script>

<style>
#app{
  width: 98vw;
  height: 98vh;
}
</style>
