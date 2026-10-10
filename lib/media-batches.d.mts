export const MAX_MEDIA: number;
export function mediaBatches<T extends {name:string;type:string;size:number}>(files: T[], existingCount?: number): T[][];
