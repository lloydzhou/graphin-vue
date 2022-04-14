# ContextMenu 右键菜单

ContextMenu 是右键菜单，通常是对节点进行进一步操作的组件。例如：通过右键菜单实现节点的复制、删除、反选等。同时，用户也可以对选中的节点进行进一步打标、分析、关系扩散、数据请求等高级的交互行为。图分析产品中的右键菜单往往是和浏览器网页的右键菜单交互与展示形式保持一致，但在展示形式上也可以有更多特殊的设计，如仪表盘形状的菜单

## demo

```
import { Menu } from 'ant-design-vue';
import 'ant-design-vue/es/menu/style/css'

const MenuItem = Menu.Item


// 定义点击回调
hendleContextMenuClick(data, ev) {
  console.log('hendleContextMenuClick', data, ev)
  const { onClose } = data
  onClose && onClose()
}

// 模板中使用slot.default可以拿到contextmenu中的值，包含visible, x, y, item，以及onClose，可以点击后关闭菜单
<ContextMenu>
  <template #default="scope">
    <Menu @click="hendleContextMenuClick(scope, $event)">
      <MenuItem key="1">item1</MenuItem>
      <MenuItem key="2">item2</MenuItem>
    </Menu>
  </template>
</ContextMenu>
```
