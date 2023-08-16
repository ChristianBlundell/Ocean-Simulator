import { merge } from 'webpack-merge'
import commonConfiguration from './webpack.common.js'
import portFinderSync from 'portfinder-sync'

const configuration = merge(
    commonConfiguration,
    {
        mode: 'development',
    }
)
export default configuration;