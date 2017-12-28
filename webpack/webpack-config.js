let webpack = require('webpack'),
    path = require('path'),
    UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// Constants
const LIB_DIR = path.join(__dirname, '../lib'),
    SRC_DIR = path.join(__dirname, '../src'),
    NODE_MODULES_DIR = path.join(__dirname, '../node_modules')

module.exports = {

    entry: './src/nano-drag-and-drop.ts',

    output: {
        path: LIB_DIR,
        publicPath: '/',
        filename: 'nano-drag-and-drop.js',
		libraryTarget: 'commonjs2',
		library: 'NanoDragAndDrop'
    },

    resolve: {
        extensions: ['*', '.ts', '.js']
    },

    module: {

        rules: [
            {
                test: /\.ts?$/,
                use: 'awesome-typescript-loader',
                include: SRC_DIR,
                exclude: /node_modules/
            }
        ]

    },

    plugins: [
      new UglifyJsPlugin()
    ],

    stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true
    }
}