import path from 'path';
import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';
import { GitRevisionPlugin } from 'git-revision-webpack-plugin';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import packageConfig from '../package.json';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
const gitRevisionPlugin = new GitRevisionPlugin();

const config: webpack.Configuration = {
    mode: 'development',

    // fastest mode, for more see: https://webpack.js.org/configuration/devtool/
    devtool: 'eval',

    entry: {
        DPlayer: './src/ts/index.ts',
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
        extensions: ['.js', '.scss', '.ts', '.art', '.svg'],
        preferRelative: true,
    },

    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.d\.ts$/,
                loader: 'ignore-loader',
            },
            {
                test: /(?<!\.d)\.ts$/,
                exclude: /node_module/,
                use: 'ts-loader',
            },
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
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                type: 'asset',
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
            DPLAYER_VERSION: `"${packageConfig.version}"`,
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
        minimizer: [
            '...',
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                        // Lossless optimization with custom option
                        // Feel free to experiment with options for better result for you
                        plugins: [
                            ['gifsicle', { interlaced: true }],
                            ['jpegtran', { progressive: true }],
                            ['optipng', { optimizationLevel: 5 }],
                            // Svgo configuration here https://github.com/svg/svgo#configuration
                            // TODO(#67):  look into that things, to have LOSSLESS optimization!
                            [
                                'svgo',
                                {
                                    plugins: 'preset-default',
                                },
                            ],
                        ],
                    },
                },
            }),
        ],
    },
};

export default config;
