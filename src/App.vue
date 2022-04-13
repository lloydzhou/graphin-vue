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
    <MiniMap />
    <ContextMenu>
      <template #default="scope">
        <Menu @click="hendleContextMenuClick(scope, $event)">
          <MenuItem key="fishEye">鱼眼</MenuItem>
          <MenuItem key="1">item1</MenuItem>
          <MenuItem key="2">item2</MenuItem>
        </Menu>
      </template>
    </ContextMenu>
    <FishEye v-if="fishEyeVisible" :handleEscListener="handleEscListener" />
    <!-- <Hull :options="hullOptions" /> -->
    <SnapLine :options="snaplineOptions" :visible="true" />
    <Tooltip bindType="node" placement="right" :hasArrow="true">
      <template #default="scope">
        <div>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
          <li>{{scope.model.id}}</li>
        </div>
      </template>
    </Tooltip>
    <!-- <TreeCollapse /> -->
    <!-- <DragNodeWithForce /> -->
  </Graphin>
</template>
<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue'
import { Options, Vue as Component } from 'vue-class-component';
import { Menu } from 'ant-design-vue';
import 'ant-design-vue/es/menu/style/css'
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
import Graphin, { Behaviors, Components } from './index'
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

const {
  /** 内置组件 */
  MiniMap,
  ContextMenu,
  FishEye,
  Hull,
  SnapLine,
  Tooltip,
} = Components;

const MenuItem = Menu.Item

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
    MiniMap,
    ContextMenu,
    Menu, MenuItem,
    FishEye,
    Hull,
    SnapLine,
    Tooltip,
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
  hullOptions = [
    {
      members: ['node-1', 'node-2'], // 必须参数
    },
    {
      members: ['node-3', 'node-4'],
      type: 'bubble',
      padding: 10,
      style: {
        fill: 'lightgreen',
        stroke: 'green',
      },
    },
  ]
  snaplineOptions = {
    line: {
      stroke: 'lightgreen',
      lineWidth: 0.5,
    },
  }
  fishEyeVisible = false

  hendleContextMenuClick(data, event) {
    const { onClose } = data
    console.log('hendleContextMenuClick', data, event)
    onClose && onClose()
    if (event.key == 'fishEye') {
      this.fishEyeVisible = true
    }
  }

  handleEscListener(ev) {
    this.fishEyeVisible = false
  }

  created() {

    setTimeout(() => this.name = 'lloyd', 2000)
    console.log('created', this)
    // @ts-ignore
    this.data = Utils.mock(8).circle().graphin()
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
