import { ArcFiles, ExtractOptions, Extractor, SeekMethod } from './Extractor';
export declare class ExtractorData extends Extractor<Uint8Array> {
    protected _filePath: string;
    private dataFiles;
    private dataFileMap;
    private currentFd;
    constructor(unrar: any, data: ArrayBuffer, password: string);
    extract(options?: ExtractOptions): ArcFiles<Uint8Array>;
    private getExtractedFileName;
    protected open(filename: string): number;
    protected create(filename: string): number;
    protected closeFile(fd: number): void;
    protected read(fd: number, buf: number, size: number): number;
    protected write(fd: number, buf: number, size: number): boolean;
    protected tell(fd: number): number;
    protected seek(fd: number, pos: number, method: SeekMethod): boolean;
}
