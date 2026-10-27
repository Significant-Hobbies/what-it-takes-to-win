export const identity: { name: string; url: string; summary: string; contact: string; sitemap: string; openapi: string; trainingAllowed: boolean; updatedAt: string; excludedPaths: string[] };
export function handleReadability(request: Request, assets?: { fetch: (request: Request) => Promise<Response> }): Promise<Response | null>;
export function advertisePublic(request: Request, response: Response, assets?: { fetch: (request: Request) => Promise<Response> }): Promise<Response>;
export function robots(): string;
export const preservedMarkdownPaths: string[];
