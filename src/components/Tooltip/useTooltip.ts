// @ts-no-check
import { onMounted, onUnmounted, toRefs, shallowReactive, ref } from 'vue'
import { IG6GraphEvent } from '@antv/g6'
import { useContext } from '../../GraphinContext';

export interface Props {
  bindType?: 'node' | 'edge';
  // container: React.RefObject<HTMLDivElement>;
  container: any;  // ref
}

export interface State {
  /** 当前状态 */
  visible: boolean;
  x: number;
  y: number;
  /** 触发的元素 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: IG6GraphEvent['item'];
}

export const useTooltip = (props: Props) => {
  const { bindType = 'node', container } = props;
  // @ts-ignore
  const { graph } = useContext();

  const state = shallowReactive({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  } as State)

  const timer = ref()

  const handleShow = (e: IG6GraphEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (timer.value) {
      clearTimeout(timer.value)
    }

    const point = graph.getPointByClient(e.clientX, e.clientY);
    let { x, y } = graph.getCanvasByPoint(point.x, point.y);
    if (bindType === 'node') {
      // 如果是节点，则x，y指定到节点的中心点
      // eslint-disable-next-line no-underscore-dangle
      if (e.item) {
        const { x: PointX = 0, y: PointY = 0 } = e.item.getModel();
        const CenterCanvas = graph.getCanvasByPoint(PointX, PointY);

        const daltX = e.canvasX - CenterCanvas.x;
        const daltY = e.canvasY - CenterCanvas.y;
        x = x - daltX;
        y = y - daltY;
      }
    }

    /** 设置变量 */
    state.visible = true
    state.item = e.item
    state.x = x
    state.y = y
  };
  const handleClose = () => {
    if (timer.value) {
      clearTimeout(timer.value)
    }
    timer.value = setTimeout(() => {
      state.visible = false
      state.x = 0
      state.y = 0
    }, 200)
  };

  const handleDragStart = () => {
    state.visible = false
    state.x = 0
    state.y = 0
    state.item = null
  };

  const handleDragEnd = (e: IG6GraphEvent) => {
    const point = graph.getPointByClient(e.clientX, e.clientY);
    let { x, y } = graph.getCanvasByPoint(point.x, point.y);
    if (bindType === 'node') {
      // 如果是节点，则x，y指定到节点的中心点
      // eslint-disable-next-line no-underscore-dangle
      if (e.item) {
        const { x: PointX = 0, y: PointY = 0 } = e.item.getModel();
        const CenterCanvas = graph.getCanvasByPoint(PointX, PointY);

        const daltX = e.canvasX - CenterCanvas.x;
        const daltY = e.canvasY - CenterCanvas.y;
        x = x - daltX;
        y = y - daltY;
      }

      state.visible = true
      state.x = x
      state.y = y
    }
  };

  const removeTimer = () => {
    clearTimeout(timer.value);
  };

  onMounted(() => {
    // @ts-ignore
    graph.on(`${bindType}:mouseenter`, handleShow);
    graph.on(`${bindType}:mouseleave`, handleClose);
    graph.on(`afterremoveitem`, handleClose);
    graph.on(`node:dragstart`, handleDragStart);
    graph.on(`node:dragend`, handleDragEnd);

    if (container.value) {
      container.value.addEventListener('mouseenter', removeTimer);
      container.value.addEventListener('mouseleave', handleClose);
    }
  })
  onUnmounted(() => {
    // @ts-ignore
    console.log('effect..remove....');
    graph.off(`${bindType}:mouseenter`, handleShow);
    graph.off(`${bindType}:mouseleave`, handleClose);
    graph.off(`afterremoveitem`, handleClose);
    graph.off(`node:dragstart`, handleDragStart);
    graph.off(`node:dragend`, handleDragEnd);
    if (container.value) {
      container.value.removeEventListener('mouseenter', removeTimer);
      container.value.removeEventListener('mouseleave', handleClose);
    }
  })

  return state;
};

export default useTooltip;
