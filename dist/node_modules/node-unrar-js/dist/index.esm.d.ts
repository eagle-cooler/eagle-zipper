import { Extractor } from './js/Extractor';
export * from './js/Extractor';
export interface ExtractorFromDataOptions {
    wasmBinary?: ArrayBuffer;
    data: ArrayBuffer;
    password?: string;
}
export declare function createExtractorFromData({ wasmBinary, data, password, }: ExtractorFromDataOptions): Promise<Extractor<Uint8Array>>;
