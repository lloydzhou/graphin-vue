import { onMounted, onUnmounted, toRefs, reactive, shallowReactive } from 'vue'
import { IG6GraphEvent } from '@antv/g6'
import { useContext } from '../../GraphinContext';

export interface ContextMenuProps {
  bindType?: 'node' | 'edge' | 'canvas';
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

const useContextMenu = (props: ContextMenuProps) => {
  const { bindType = 'node', container } = props;
  // @ts-ignore
  const { graph } = useContext();

  const state = reactive<State>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  })

  const handleShow = (e: IG6GraphEvent) => {
    console.log('handleShow', e)
    e.preventDefault();
    e.stopPropagation();

    const width: number = graph.get('width');
    const height: number = graph.get('height');
    if (!container.value) {
      return;
    }

    const bbox = container.value.getBoundingClientRect();

    const offsetX = graph.get('offsetX') || 0;
    const offsetY = graph.get('offsetY') || 0;

    const graphTop = graph.getContainer().offsetTop;
    const graphLeft = graph.getContainer().offsetLeft;

    let x = e.canvasX + graphLeft + offsetX;
    let y = e.canvasY + graphTop + offsetY;

    // when the menu is (part of) out of the canvas

    if (x + bbox.width > width) {
      x = e.canvasX - bbox.width - offsetX + graphLeft;
    }
    if (y + bbox.height > height) {
      y = e.canvasY - bbox.height - offsetY + graphTop;
    }

    if (bindType === 'node') {
      // 如果是节点，则x，y指定到节点的中心点
      // eslint-disable-next-line no-underscore-dangle
      const { x: PointX, y: PointY } = (e.item && e.item.getModel()) as { x: number; y: number };
      const CenterCanvas = graph.getCanvasByPoint(PointX, PointY);

      const daltX = e.canvasX - CenterCanvas.x;
      const daltY = e.canvasY - CenterCanvas.y;
      x = x - daltX;
      y = y - daltY;
    }

    /** 设置变量 */
    state.visible = true
    state.x = x
    state.y = y
    state.item = e.item
  };
  const handleClose = () => {
    if (state.visible) {
      state.visible = false
      state.x = 0
      state.y = 0
    }
  };

  onMounted(() => {
    // @ts-ignore
    graph.on(`${bindType}:contextmenu`, handleShow);
    graph.on('canvas:click', handleClose);
    graph.on('canvas:drag', handleClose);
    graph.on('wheelzoom', handleClose);
  })
  onUnmounted(() => {
    // @ts-ignore
    graph.off(`${bindType}:contextmenu`, handleShow);
    graph.off('canvas:click', handleClose);
    graph.off('canvas:drag', handleClose);
    graph.off('wheelzoom', handleClose);
  })

  return {
    ...toRefs(state),
    oneShow: handleShow,
    onClose: handleClose,
  };
};

export default useContextMenu;
