/**
 * Pool of public, CORS-friendly sample videos used for previewing scenes
 * before real renders exist. Each scene gets a stable assignment by index,
 * so opening Scene 1 always shows the same clip, Scene 2 the same, etc.
 *
 * Switch to your own CDN / object-store URLs in production.
 */
export const SAMPLE_VIDEO_POOL = [
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

export function sampleVideoFor(sceneIndex: number): string {
  if (sceneIndex < 0) return SAMPLE_VIDEO_POOL[0];
  return SAMPLE_VIDEO_POOL[sceneIndex % SAMPLE_VIDEO_POOL.length];
}
