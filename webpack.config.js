const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|jpg|gif|svg)$/i, type: 'asset/resource' },
      { test: /\.m?js$/, exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } } }
    ],
  },
  plugins: [ new HtmlWebpackPlugin({ template: './src/index.html' }) ],
  devServer: { open: true, port: 8080 }
};