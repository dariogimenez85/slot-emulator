const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')

var outputPath = './dist';

module.exports = {
    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true
    },
    
    watch:true,

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    
    plugins: [
        new CleanWebpackPlugin(outputPath),
        new CopyWebpackPlugin([
            { context: 'src/template', from: '**/*', to: '' },
            { context: 'src/resources', from: '**/*', to: './assets/' }
        ])
    ]
}