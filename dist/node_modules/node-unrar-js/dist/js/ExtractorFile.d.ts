import { Extractor, SeekMethod } from './Extractor';
export declare class ExtractorFile extends Extractor {
    private filenameTransform;
    protected _filePath: string;
    private _target;
    private fileMap;
    constructor(unrar: any, filepath: string, targetPath: string, password: string, filenameTransform: (filename: string) => string);
    protected open(filename: string): number;
    protected create(filename: string): number;
    protected closeFile(fd: number): void;
    protected read(fd: number, buf: number, size: number): number;
    protected write(fd: number, buf: number, size: number): boolean;
    protected tell(fd: number): number;
    protected seek(fd: number, pos: number, method: SeekMethod): boolean;
}
