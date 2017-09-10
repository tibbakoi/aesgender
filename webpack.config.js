const path    = require('path')
const webpack = require('webpack')

module.exports = {
	entry: path.resolve(__dirname, 'src', 'index.js'),
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	// Don't bundle these into the output
	externals: {
		//lodash: '_',
		//d3: 'd3',
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
		new webpack.HotModuleReplacementPlugin(),
	],
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		hot: true,              // Enable HMR
		watchContentBase: true, // Needed to auto update when index.html changes
	},
}
