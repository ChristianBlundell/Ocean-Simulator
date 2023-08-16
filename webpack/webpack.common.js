import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import fs from 'fs'

const webpackCommon = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    plugins:
    [
        new HtmlWebpackPlugin({
            favicon: 'src/favicon.png',
            meta: {
                'viewport': 'width=device-width, user-scalable=no, minimum-scale=1, maximum-scale=1'
            },
            title: 'PlayCanvas Webpack Example',
            minify: true
        })
    ],
    module:
    {
        rules:
        [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
    output: {
        filename: 'bundle.js',
        path: path.resolve('.', 'dist'),
    },
    devServer: {
        port: 8080,
        https: {
            key: fs.readFileSync("cert.key"),
            cert: fs.readFileSync("cert.crt"),
            ca: fs.readFileSync("ca.crt"),
        }
    }
}

export default webpackCommon;
