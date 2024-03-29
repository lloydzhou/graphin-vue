# graphin-vue

<a href="https://www.npmjs.com/package/antv-graphin-vue"><img alt="NPM Package" src="https://img.shields.io/npm/v/antv-graphin-vue.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/antv-graphin-vue"><img alt="NPM Size" src="https://img.shields.io/bundlephobia/minzip/antv-graphin-vue"></a>
<a href="https://www.npmjs.com/package/antv-graphin-vue"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/antv-graphin-vue?logo=npm&style=flat-square"></a>
<a href="/LICENSE"><img src="https://img.shields.io/github/license/lloydzhou/graphin-vue?style=flat-square" alt="MIT License"></a>

## 核心思想
1. 直接使用@antv/graphin内置的shape和layout逻辑代码
> 使用一个移除react依赖的@antv/grapin核心库（详情[antvis/Graphin#370](https://github.com/antvis/Graphin/pull/370)）
> 可以在不依赖react的情况下使用graphin内置的shape和layout代码

2. 使用vue重写ui组件以及behaviors组件以及components组件

## Install
```
yarn add antv-graphin-vue @antv/graphin
```

## Example

[online demo](https://codesandbox.io/s/graphin-vue-demo-460uf7)


这个是使用jsx实现的vue版本的示例
```
import { defineComponent, reactive } from 'vue'
import Graphin, { Utils, Behaviors, Components } from 'antv-graphin-vue'
const { DragCanvas, ZoomCanvas, DragNode, ResizeCanvas } = Behaviors
const { MiniMap } = Components

const App = defineComponent({
  components: { Graphin, DragCanvas, ZoomCanvas, DragNode, ResizeCanvas, MiniMap },
  setup(props) {
    const state = reactive({
      data: {},
      layout: {
        type: 'force'
      }
    })
    onMounted(() => {
      state.data = Utils.mock(10).circle().graphin()
    })
    return () => (
      <Graphin :data="data" :layout="layout">
        <DragCanvas />
        <ZoomCanvas />
        <DragNode />
        <ResizeCanvas />
        <MiniMap />
      </Graphin>
    )
  }
})

export default App

```


