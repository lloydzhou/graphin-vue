// @ts-nocheck
import useBehaviorHook, { BehaviorComponent } from './useBehaviorHook'

const DEFAULT_TRIGGER = 'shift'
// const ALLOW_EVENTS = ['shift', 'ctrl', 'alt', 'control'];
const defaultConfig = {
  /** 是否禁用该功能 */
  disabled: false,
  /** 是否允许多选，默认为 true，当设置为 false，表示不允许多选，此时 trigger 参数无效； */
  multiple: true,
  /** 指定按住哪个键进行多选，默认为 shift，按住 Shift 键多选，用户可配置 shift、ctrl、alt； */
  trigger: DEFAULT_TRIGGER,
  /** 选中的样式，默认为 selected */
  selectedState: 'selected'
}
export type ClickSelectProps = typeof defaultConfig
export const ClickSelect: BehaviorComponent<ClickSelectProps> = useBehaviorHook<ClickSelectProps>({
  name: 'ClickSelect',
  type: 'click-select',
  defaultConfig
})
