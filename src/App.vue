<template>
  <h1>Hello {{name}}</h1>
  <Parent>
    <Child />
  </Parent>
  <Graphin :data="data">
    <ActivateRelations trigger="mouseenter" />
    <BrushSelect />
    <ClickSelect />
    <FitView />
    <FontPaint />
    <ZoomCanvas />
    <DragCanvas />
    <DragCombo />
    <DragNode />
    <Hoverable />
    <LassoSelect />
    <!-- <TreeCollapse /> -->
    <DragNodeWithForce />
  </Graphin>
</template>
<script lang="ts">
import type { ExtractPropTypes } from 'vue';
import { defineComponent, onMounted, ref, provide, inject } from 'vue';

import Graphin from './Graphin'
import { Parent, Child } from './Demo'

import { Options, Vue as Component } from 'vue-class-component';
import Utils from '@antv/graphin/es/utils'
import { GraphinData } from '@antv/graphin/es/typings/type';
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

import Behaviors from './behaviors'
const {
  /** 内置 */
  DragCanvas,
  ZoomCanvas,
  ClickSelect,
  BrushSelect,
  DragNode,
  ResizeCanvas,
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
    Parent,
    Child,
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

  created() {
    setTimeout(() => this.name = 'lloyd', 2000)
    console.log('created', this)
    // @ts-ignore
    this.data = Utils.mock(10).circle().graphin()
  }

}
</script>

<style>
</style>
