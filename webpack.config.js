const path = require('path');
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin');
const ConvertProtoFilesPlugin = require('./ConvertProtoFilesPlugin.js');
const { spawn, exec, spawnSync } = require('child_process');
var FileListPlugin = require('./fileplugin.js');
const fs = require('fs');
var mkdirp = require('mkdirp');


module.exports = {
    mode: 'development',
    entry: {
        'polyfills': './src/polyfills.ts',
        // 'vendor': './src/vendor.ts',
        'app': './src/main.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].bundle.js",
        chunkFilename: '[id].chunk.js'
    },
    resolve: {
        extensions: ['.js', '.ts', '.html']
    },
    watch: false,
    devServer: {
        contentBase: './dist'
    },
    target: 'web',
    //externals: [nodeExternals()],
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            configFile: 'tsconfig.json'
                        }
                    },
                    'angular2-template-loader',
                    'angular2-router-loader'
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.css$/,
                use: ['to-string-loader', 'style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: 'url-loader?limit=25000'
            },
            {
                test: /\.(svg|eot|ttf|woff|woff2)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'images/[name].[hash].[ext]'
                    }
                }]
            }

        ]
    },
    plugins: [
        new WriteFilePlugin(),
        new CopyWebpackPlugin([
            {
                from: './../Libraries/YAMSLib/**/*.proto',
                to: 'proto',
                flatten: true,
                toType: 'dir',
            },
        ]),
        new ConvertProtoFilesPlugin({
            destFolder: './dist/proto/',
            protoFileName: 'proto-yams.proto',
            toAppend: 'import "',
            toPrepend: '";\n',
            jsFileName: 'proto-yams.js',
            tsFileName: 'proto-yams.d.ts'
        }),
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],
    stats: 'errors-only',
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    }
};