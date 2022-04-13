// @ts-no-check
import { onMounted, onUnmounted, toRefs, reactive, ref } from 'vue'
import { IG6GraphEvent } from '@antv/g6'
import { useContext } from '../../GraphinContext';


const useState = (defaultState: any) => {
  const state = reactive(defaultState)

  const setState = (nextState: any, callback: any) => {
    const finalState = typeof nextState == 'function' ? nextState(state) : nextState
    for (const key in finalState) {
      state[key] = finalState[key]
    }
    callback && callback(state)
  }

  return [state, setState]
}

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

const useTooltip = (props: Props) => {
  const { bindType = 'node', container } = props;
  // @ts-ignore
  const { graph } = useContext();

  const [state, setState] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  })

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
    // @ts-ignore
    setState(preState => {
      return {
        ...preState,
        visible: true,
        item: e.item,
        x,
        y,
      };
    })
  };
  const handleClose = () => {
    if (timer.value) {
      clearTimeout(timer.value)
    }
    timer.value = setTimeout(() => {
      // @ts-ignore
      setState(preState => {
        return {
          ...preState,
          visible: false,
          item: null,
          x: 0,
          y: 0,
        };
      })
    }, 200)
  };

  const handleDragStart = () => {
    setState({
      ...state,
      visible: false,
      x: 0,
      y: 0,
      item: null,
    })
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
      setState({
        ...state,
        visible: true,
        x,
        y,
        item: e.item,
      })
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

    container.value?.addEventListener('mouseenter', removeTimer);
    container.value?.addEventListener('mouseleave', handleClose);
  })
  onUnmounted(() => {
    // @ts-ignore
    console.log('effect..remove....');
    graph.off(`${bindType}:mouseenter`, handleShow);
    graph.off(`${bindType}:mouseleave`, handleClose);
    graph.off(`afterremoveitem`, handleClose);
    graph.off(`node:dragstart`, handleDragStart);
    graph.off(`node:dragend`, handleDragEnd);
    container.current?.removeEventListener('mouseenter', removeTimer);
    container.current?.removeEventListener('mouseleave', handleClose);
  })

  return {
    ...toRefs(state),
  };
};

export default useTooltip;
