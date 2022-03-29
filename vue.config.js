// const { resolve } = require('path')
// const path = require('path')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  pages: {
    index: {
      entry: './src/main.ts',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  productionSourceMap: false
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin({
  //       sourceMap: false
  //     })
  //   ]
  // }
}
