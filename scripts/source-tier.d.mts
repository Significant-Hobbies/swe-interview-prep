export type MediaSlot = 'video' | 'paper' | 'blog' | 'book';

export function isSTierSource(title: string, url: string, slot?: MediaSlot): boolean;
