const path = require('path');
const webpack = require('webpack');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
    mode: 'production',

    bail: true,

    devtool: 'source-map',

    entry: {
        DPlayer: './src/ts/index.ts',
        ass: './src/plugins/ass.js',
    },

    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: (a) => {
            if (a.runtime === 'DPlayer') {
                return '[name].min.js';
            } else {
                return '[name]/[name].min.js';
            }
        },
        library: '[name]',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        publicPath: '/',
        clean: true,
    },

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.scss'],
        preferRelative: true,
    },

    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_module/,
                use: 'ts-loader',
            },
            {
                test: /\.js$/,
                use: [
                    'template-string-optimize-loader',
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
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader',
                options: {
                    limit: 40000,
                },
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader',
            },
            {
                test: /\.art$/,
                loader: 'art-template-loader',
            },
        ],
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
    optimization: {
        mangleWasmImports: false,
    },
};
