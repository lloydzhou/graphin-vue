# graphin-vue

## 核心思想
1. 直接使用@antv/graphin内置的shape和layout逻辑代码
> 使用一个移除react依赖的@antv/grapin核心库（详情 https://github.com/antvis/Graphin/pull/370）
> 可以在不依赖react的情况下使用graphin内置的shape和layout代码

2. 使用vue重写ui组件以及behaviors组件


## Project setup
```
yarn install
```

使用的时候还需要依赖这个更改过的@antv/graphin库
```
yarn add @antv/graphin@https://gitpkg.now.sh/lloydzhou/Graphin/packages/graphin\?f2123cc07fc8834be2d34692951cdaa6139a0fa1
```
### Example

```
import { defineComponent, reactive } from 'vue'
import Graphin, { Utils, Behaviors } from 'antv-graphin-vue'
const { DragCanvas, ZoomCanvas, DragNode, ResizeCanvas } = Behaviors

const App = definecomponent({
  components: { Graphin, DragCanvas, ZoomCanvas, DragNode, ResizeCanvas },
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
      </Graphin>
    )
  }
})

export default App

```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
