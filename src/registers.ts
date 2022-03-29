// @ts-nocheck
import type { BehaviorOption, ShapeDefine, ShapeOptions } from '@antv/g6';
import G6 from '@antv/g6';
import type { RegisterFunction } from './Graphin';
import type { IconLoader } from './typings/type';

export const registerNode = (
  shapeType: string,
  options: ShapeOptions | ShapeDefine,
  extendShapeType?: string,
): RegisterFunction => {
  return G6.registerNode(shapeType, options, extendShapeType);
};

export const registerEdge = (
  edgeName: string,
  options,
  extendedEdgeName: string,
): RegisterFunction => {
  return G6.registerEdge(edgeName, options, extendedEdgeName);
};

export const registerCombo = (comboName, options, extendedComboName): RegisterFunction => {
  return G6.registerCombo(comboName, options, extendedComboName);
};
export const registerBehavior = (
  behaviorName: string,
  behavior: BehaviorOption,
): RegisterFunction => {
  // @ts-ignore
  return G6.registerBehavior(behaviorName, behavior);
};

export const registerFontFamily = (iconLoader: IconLoader): Record<string, any> => {
  /**  注册 font icon */
  const iconFont = iconLoader();
  const { glyphs, fontFamily } = iconFont;
  const icons = glyphs.map((item) => {
    return {
      name: item.name,
      unicode: String.fromCodePoint(item.unicode_decimal),
    };
  });

  return new Proxy(icons, {
    get: (target, propKey: string) => {
      const matchIcon = target.find((icon) => {
        return icon.name === propKey;
      });
      if (!matchIcon) {
        console.error(`%c fontFamily:${fontFamily},does not found ${propKey} icon`);
        return '';
      }
      return matchIcon ? matchIcon.unicode : undefined;
    },
  });
};

export const registerLayout = function (layoutName: string, layout: any) {
  return G6.registerLayout(layoutName, layout);
};
