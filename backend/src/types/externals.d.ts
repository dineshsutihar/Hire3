declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export interface TextItem {
    str: string;
    dir?: string;
    transform?: number[];
    width?: number;
    height?: number;
    fontName?: string;
    hasEOL?: boolean;
  }

  export interface TextContent {
    items: TextItem[];
    styles: Record<string, any>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(params: {
    data: Uint8Array;
    useSystemFonts?: boolean;
  }): PDFDocumentLoadingTask;

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
}

declare module "@google/generative-ai" {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(opts: { model: string }): any;
  }
}

declare module "express-rate-limit" {
  import { RequestHandler } from "express";
  interface RateLimitOptions {
    windowMs?: number;
    max?: number | ((req: any, res: any) => number | Promise<number>);
    message?: any;
    statusCode?: number;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    skip?: (req: any, res: any) => boolean;
  }
  function rateLimit(opts?: RateLimitOptions): RequestHandler;
  export default rateLimit;
}

declare module "multer" {
  import { RequestHandler } from "express";
  interface StorageEngine {}
  interface Options {
    dest?: string;
    storage?: StorageEngine;
  }
  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination?: string;
    filename?: string;
    path?: string;
    size: number;
    buffer?: Buffer;
  }
  interface MulterRequest {
    file?: MulterFile;
  }
  interface Multer {
    single(field: string): RequestHandler;
    memoryStorage(): StorageEngine;
  }
  function multer(opts?: Options): Multer;
  export default multer;
}

declare module "pdf-parse" {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }
  interface PDFMeta {
    info?: PDFInfo;
    metadata?: any;
  }
  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    text: string;
    version: string;
  }
  function pdfParse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  export default pdfParse;
}

declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }
  function pdfParse(dataBuffer: Buffer, options?: any): Promise<PDFData>;
  export default pdfParse;
}
