import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'
import jsx from "acorn-jsx";
import less from 'rollup-plugin-less';
import pkg from './package.json'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import optimizeLodashImports from "rollup-plugin-optimize-lodash-imports"


export default {
  input: 'src/graphin.ts',
  output: [{
    name: 'graphin-vue',
    format: 'umd',
    file: pkg.main,
  }, {
    format: 'es',
    file: pkg.module,
  }],
  plugins: [
    less({
      output: 'dist/index.css'
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    babel({
      // extensions: ['.ts', '.js', '.tsx'],
      // babelHelpers: "bundled",
      runtimeHelpers: true,
      // exclude: 'node_modules/**',
      presets: [
        '@vue/cli-plugin-babel/preset'
      ],
      plugins: [
        "@vue/babel-plugin-jsx",
        "transform-vue-jsx",
        "lodash"
      ]
    }),
    typescript({
      // tsconfig: false,
      // experimentalDecorators: true,
      // module: 'es2015'
    }),
    optimizeLodashImports(),
    vue(),
    buble({
      objectAssign: 'Object.assign',
      jsx: 'h'
    }),
  ],
  acornInjectPlugins: [jsx()],
  external: [
    "vue",
    "@antv/g6",
    // "@antv/graphin",
  ]
}
