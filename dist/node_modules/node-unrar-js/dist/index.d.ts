import { Extractor } from './js/Extractor';
export * from './index.esm';
export interface ExtractorFromFileOptions {
    wasmBinary?: ArrayBuffer;
    filepath: string;
    targetPath?: string;
    password?: string;
    filenameTransform?: (filename: string) => string;
}
export declare function createExtractorFromFile({ wasmBinary, filepath, targetPath, password, filenameTransform, }: ExtractorFromFileOptions): Promise<Extractor>;
