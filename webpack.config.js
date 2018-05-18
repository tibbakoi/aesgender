const path    = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
	entry: path.resolve(__dirname, 'src', 'index.js'),
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'docs')
	},
	// Don't bundle these into the output
	externals: {
		lodash: '_',
		d3: 'd3',
	},
	// Load any js files through babel for polyfills etc
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.csv$/,
				use: {
					loader: 'dsv-loader'
				}
			}
		]
	},
	// Hot module reloading for CSS etc
	plugins: [
		//new webpack.HotModuleReplacementPlugin(),
		new CopyWebpackPlugin([{from: 'src/assets/**/*', to: 'assets/[name].[ext]'}]),
		new UglifyJSPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),
	],
	/*
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.join(__dirname, "docs"),
		hot: true,              // Enable HMR
		watchContentBase: true, // Needed to auto update when index.html changes
	},*/
}
