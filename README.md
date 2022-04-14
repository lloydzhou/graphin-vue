# graphin-vue

## 核心思想
1. 直接使用@antv/graphin内置的shape和layout逻辑代码
> 使用一个移除react依赖的@antv/grapin核心库（详情 https://github.com/antvis/Graphin/pull/370）
> 可以在不依赖react的情况下使用graphin内置的shape和layout代码

2. 使用vue重写ui组件以及behaviors组件以及components组件

## Example

> 这个仓库现在已经发布到npmjs上面
```
yarn add antv-graphin-vue
```
这个是使用jsx实现的vue版本的示例
```
import { defineComponent, reactive } from 'vue'
import Graphin, { Utils, Behaviors, Components } from 'antv-graphin-vue'
const { DragCanvas, ZoomCanvas, DragNode, ResizeCanvas } = Behaviors
const { MiniMap } = Components

const App = definecomponent({
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


## Project setup
```
yarn install
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

## 感谢
前端UI组件代码有参考[vue-graphin](https://www.npmjs.com/package/vue-graphin)这个库里面的代码逻辑，感谢@hugoyang

