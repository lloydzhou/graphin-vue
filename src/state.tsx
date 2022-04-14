// @ts-nocheck
import { shallowReactive, reactive, ref, toRefs } from 'vue'
import cloneDeep from '@antv/graphin/es/utils/cloneDeep';

export const useState = (defaultState: any) => {
  const state = shallowReactive(defaultState)

  const setState = (nextState: any, callback: any) => {
    const finalState = typeof nextState == 'function' ? nextState(state) : nextState
    for (const key in finalState) {
      state[key] = cloneDeep(finalState[key])
    }
    callback && callback(state)
  }

  return [state, setState]
}

export default useState

