# Tooltip

Tooltip 提示框是一种快速浏览信息的交互组件，常用于图的节点和边上。通过鼠标悬停在节点或边上时，出现一个提示框，鼠标移出节点则取消提示框。这在快速查询元素详细信息时非常有帮助。

`<Tooltip/>`是提示框的容器，提供位置，触发元素，回调函数等信息，这些信息可以用户通过`context`获取。具体如何渲染，完全交给用户

## demo

```
// 模板中使用slot.default可以拿到tooltip中的值，包含item, node
<Tooltip>
  <template #default="scope">
    <div>
      <li>{{scope.model.id}}</li>
      <li>{{scope.model.id}}</li>
      <li>{{scope.model.id}}</li>
      <li>{{scope.model.id}}</li>
      <li>{{scope.model.id}}</li>
    </div>
  </template>
</Tooltip>
```
