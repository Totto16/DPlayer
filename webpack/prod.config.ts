import path from 'path';
import webpack from 'webpack';
import { GitRevisionPlugin } from 'git-revision-webpack-plugin';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import packageConfig from '../package.json';
const gitRevisionPlugin = new GitRevisionPlugin();

const config: webpack.Configuration = {
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
        extensions: ['.js', '.scss', '.ts', '.art', '.svg'],
        preferRelative: true,
    },

    module: {
        strictExportPresence: true,
        rules: [
                /* { 
                    test: /\.d\.ts$/,
                    loader: 'ignore-loader',
                }, */
            {
                test: /\.ts$/,
                exclude: /node_module/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            context: path.join(__dirname, '..'),
                            configFile: path.join(__dirname, '../tsconfig.json'),
                        },
                    },
                ],
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
            // see dev.webpack.ts
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
    optimization: {
        mangleWasmImports: false,
    },
};

export default config;