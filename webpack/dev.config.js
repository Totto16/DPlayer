const path = require('path');
const webpack = require('webpack');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
module.exports = {
    mode: 'development',

    // fastest mode, for more see: https://webpack.js.org/configuration/devtool/
    devtool: 'eval',

    entry: {
        DPlayer: './src/js/index.js',
        ass: './src/plugins/ass.js',
    },

    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: (a) => {
            if (a.runtime === 'DPlayer') {
                return '[name].js';
            } else {
                return '[name]/[name].js';
            }
        },
        library: '[name]',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        publicPath: '/',
    },

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.scss', '.art', '.svg'],
        preferRelative: true,
    },

    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: ['@babel/preset-env'],
                            plugins: [
                                [
                                    '@babel/plugin-transform-runtime',
                                    {
                                        absoluteRuntime: false,
                                        corejs: false,
                                        helpers: false,
                                        regenerator: true,
                                        version: '^7.0.0',
                                    },
                                ],
                            ],
                        },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [autoprefixer, cssnano],
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
            // using https://webpack.js.org/guides/asset-modules TODO(#75): test png and jpg
            {
                test: /\.(jpe?g|png|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.svg$/i,
                type: 'asset/inline',
                generator: {
                    dataUrl: (content) => content.toString(), // important!!!
                },
            },
            {
                test: /\.art$/,
                loader: 'art-template-loader',
            },
        ],
    },

    watchOptions: {
        ignored: /node_modules/,
    },

    devServer: {
        compress: true,
        static: [
            {
                directory: path.resolve(__dirname, '..', 'demo'),
            },
            {
                directory: path.resolve(__dirname, '..', 'dist/ass'), // you should put these into root!!!! (only ass.js is not bound to that, but the subtitle octopus files cant't be set to other dirs :( )
            },
        ],
        open: true,
        historyApiFallback: {
            disableDotRule: true,
        },
        client: {
            logging: 'none',
        },
        port: 9090,
        // quiet: false,
    },

    plugins: [
        new webpack.DefinePlugin({
            DPLAYER_VERSION: `"${require('../package.json').version}"`,
            GIT_TIME: JSON.stringify(gitRevisionPlugin.lastcommitdatetime()),
            GIT_HASH: JSON.stringify(gitRevisionPlugin.version()),
            BUILD_TIME: `"${new Date().toISOString()}"`,
        }),
    ],

    node: {
        global: false,
        __filename: false,
        __dirname: false,
    },

    performance: {
        hints: false,
    },
    optimization: {
        mangleWasmImports: false,
    },
};
