export interface ClipData {
  id: string;
  title: string;
  broadcasterName: string;
  viewCount: number;
  createdAt: string;
  thumbnailUrl: string;
  duration: number;
}

// Sorted by viewCount descending — real clip IDs to be provided by Raiden
export const CLIPS: ClipData[] = [];
