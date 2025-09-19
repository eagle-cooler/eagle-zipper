export type SeekMethod = 'CUR' | 'SET' | 'END';
declare const ERROR_CODE: {
    readonly 0: "ERAR_SUCCESS";
    readonly 10: "ERAR_END_ARCHIVE";
    readonly 11: "ERAR_NO_MEMORY";
    readonly 12: "ERAR_BAD_DATA";
    readonly 13: "ERAR_BAD_ARCHIVE";
    readonly 14: "ERAR_UNKNOWN_FORMAT";
    readonly 15: "ERAR_EOPEN";
    readonly 16: "ERAR_ECREATE";
    readonly 17: "ERAR_ECLOSE";
    readonly 18: "ERAR_EREAD";
    readonly 19: "ERAR_EWRITE";
    readonly 20: "ERAR_SMALL_BUF";
    readonly 21: "ERAR_UNKNOWN";
    readonly 22: "ERAR_MISSING_PASSWORD";
    readonly 23: "ERAR_EREFERENCE";
    readonly 24: "ERAR_BAD_PASSWORD";
};
export type FailReason = Exclude<(typeof ERROR_CODE)[keyof typeof ERROR_CODE], 'ERAR_SUCCESS' | 'ERAR_END_ARCHIVE'>;
export declare class UnrarError extends Error {
    reason: FailReason;
    file?: string | undefined;
    constructor(reason: FailReason, message: string, file?: string | undefined);
}
export type CompressMethod = 'Storing' | 'Fastest' | 'Fast' | 'Normal' | 'Good' | 'Best' | 'Unknown';
export interface FileHeader {
    name: string;
    flags: {
        encrypted: boolean;
        solid: boolean;
        directory: boolean;
    };
    packSize: number;
    unpSize: number;
    crc: number;
    time: string;
    unpVer: string;
    method: CompressMethod;
    comment: string;
}
export interface ArcHeader {
    comment: string;
    flags: {
        volume: boolean;
        lock: boolean;
        solid: boolean;
        authInfo: boolean;
        recoveryRecord: boolean;
        headerEncrypted: boolean;
    };
}
export interface ArcList {
    arcHeader: ArcHeader;
    fileHeaders: Generator<FileHeader>;
}
export type ArcFile<withContent = never> = {
    fileHeader: FileHeader;
    extraction?: withContent;
};
export interface ArcFiles<withContent = never> {
    arcHeader: ArcHeader;
    files: Generator<ArcFile<withContent>>;
}
export interface ExtractOptions {
    files?: string[] | ((fileHeader: FileHeader) => boolean);
    password?: string;
}
export declare abstract class Extractor<withContent = never> {
    protected unrar: any;
    protected abstract _filePath: string;
    private _password;
    private _archive;
    constructor(unrar: any, password?: string);
    getFileList(): ArcList;
    extract({ files, password }?: ExtractOptions): ArcFiles<withContent>;
    protected fileCreated(filename: string): void;
    protected abstract open(filename: string): number;
    protected abstract create(filename: string): number;
    protected abstract read(fd: number, buf: number, size: number): number;
    protected abstract write(fd: number, buf: number, size: number): boolean;
    protected abstract tell(fd: number): number;
    protected abstract seek(fd: number, pos: number, method: SeekMethod): boolean;
    protected abstract closeFile(fd: number): void;
    protected close(fd: number): void;
    private openArc;
    private processNextFile;
    private closeArc;
    private getFailException;
}
export {};
