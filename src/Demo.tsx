import { defineComponent, onMounted, ref, provide, inject } from 'vue';

export const Parent = defineComponent({
  registerNode() {
    console.log('registerNode')
  },
  setup(props, { slots }) {

    const graph = ref('graph')
    const callback = () => {
      graph.value = 'callback'
    }
    provide('provide', {
      graph,
      callback,
    })

    onMounted(() => {
      setTimeout(() => {
        graph.value = 'onMounted'
      }, 1000)
    })

    return () => {
      return (
        <div>
          <h2>Parent</h2>
          {slots.default && slots.default()}
        </div>
      )
    }
  }
})

export const Child = defineComponent({
  setup(props, context) {

    const p = inject('provide', {
      graph: ref(),
      callback: () => null,
    })

    const appp = inject('app', {})
    const app1 = inject('app1', {})

    console.log('inject graph', p, this, appp, app1)

    return () => {
      return (
        <div>
          <h3>Child</h3>
        </div>
      )
    }
  }
})

console.log('Parent', Parent)
