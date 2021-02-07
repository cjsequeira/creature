const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index_bundle.js',
    path: path.resolve(__dirname, './dist'),
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        type: 'asset/resource'
      },
      {
        test: /\.html$/,
        use: [
          'html-loader'
        ]
      },
    ]
  },

  externals: {
    moment: 'moment',
  },

  plugins: [
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
  ]
};