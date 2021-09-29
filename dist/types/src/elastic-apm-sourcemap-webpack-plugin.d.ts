import webpack, { WebpackPluginInstance } from 'webpack';
import { Level, Logger } from 'webpack-log';
export interface Config {
    serviceName: string;
    serviceVersion: string;
    publicPath: string;
    serverURL: string;
    secret?: string;
    apiKey?: string;
    logLevel?: Level;
    ignoreErrors?: boolean;
}
export default class ElasticAPMSourceMapPlugin implements WebpackPluginInstance {
    config: Config;
    logger: Logger;
    constructor(config: Config);
    emit(compilation: webpack.Compilation, callback: (error?: Error) => void): Promise<void>;
    apply(compiler: webpack.Compiler): void;
}
