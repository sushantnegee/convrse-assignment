import VideoTile from "./VideoTile";

// Asymmetric grid: first video is the big featured tile, the rest wrap as
// medium tiles. Degrades gracefully for any video count.
export default function VideoGrid({ videos, onOpenVideo, interactive = true, hoveredVideoId = null, onHoverVideo }) {
  const [first, ...rest] = videos;

  return (
    <div className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-12" style={{ gridAutoRows: 280 }}>
      <div className={`row-span-2 ${rest.length > 0 ? "lg:col-span-8" : "lg:col-span-12"}`}>
        <VideoTile
          video={first}
          variant="feature"
          onOpen={onOpenVideo}
          interactive={interactive}
          isHovered={first?.id === hoveredVideoId}
          onHover={onHoverVideo}
        />
      </div>

      {rest.map((video) => (
        <div key={video.id} className="lg:col-span-4">
          <VideoTile
            video={video}
            variant="medium"
            onOpen={onOpenVideo}
            interactive={interactive}
            isHovered={video.id === hoveredVideoId}
            onHover={onHoverVideo}
          />
        </div>
      ))}
    </div>
  );
}
