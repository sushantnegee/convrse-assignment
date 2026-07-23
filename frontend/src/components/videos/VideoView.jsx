import { useRef } from "react";
import { useProject } from "../../context/ProjectContext";
import { useVideos } from "../../hooks/useVideos";
import { useScrollEmitter } from "../../hooks/useScrollMirror";
import Spinner from "../common/Spinner";
import ErrorBanner from "../common/ErrorBanner";
import AppTopBar from "../layout/AppTopBar";
import AppSideNav from "../layout/AppSideNav";
import VideoGrid from "./VideoGrid";
import VideoPlayerModal from "./VideoPlayerModal";

// Videos' own app shell (topbar + icon rail + asymmetric grid + custom
// player modal), scoped to this screen — same pattern as Gallery/Inventory.
export default function VideoView({ projectId, state, dispatch, onNavigateTab }) {
  const { project } = useProject();
  const videos = useVideos(projectId);
  const lastSeekEmitRef = useRef(0);

  const currentIndex = videos.videos.findIndex((v) => v.id === state.videos.selectedVideoId);
  const activeVideo = state.videos.playerOpen && currentIndex >= 0 ? videos.videos[currentIndex] : null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < videos.videos.length - 1;

  const openVideo = (videoId) => dispatch({ type: "video:open", videoId });
  const scrollRef = useScrollEmitter((ratio) => dispatch({ type: "scroll:update", section: "videos", ratio }));

  return (
    <div className="fixed inset-0 z-20 bg-[#111316]">
      <AppTopBar activeTab="videos" onNavigate={onNavigateTab} projectId={projectId} />
      <AppSideNav activeTab="videos" onNavigate={onNavigateTab} projectName={project?.name} />

      <main className="absolute bottom-0 left-[120px] right-0 top-20 overflow-hidden">
        <section ref={scrollRef} className="styled-scrollbar h-full overflow-y-auto p-5 lg:p-10">
          <div className="mb-10">
            <h1 className="mb-2 text-2xl text-[#e2e2e6] lg:text-4xl" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
              Project Showcases
            </h1>
            <p className="max-w-2xl text-base text-[#bcc9cc] lg:text-lg">
              Explore {project?.name ?? "the project"} through cinematic tours and design walkthroughs.
            </p>
          </div>

          {videos.status === "loading" && <Spinner label="Loading videos…" />}
          {videos.status === "error" && <ErrorBanner message={videos.error} onRetry={videos.reload} />}
          {videos.status === "ready" && videos.videos.length === 0 && (
            <ErrorBanner message="No videos yet for this project." />
          )}
          {videos.status === "ready" && videos.videos.length > 0 && (
            <VideoGrid
              videos={videos.videos}
              onOpenVideo={openVideo}
              hoveredVideoId={state.videos.hoveredVideoId}
              onHoverVideo={(videoId) => dispatch({ type: "video:hoverVideo", videoId })}
            />
          )}
        </section>
      </main>

      <VideoPlayerModal
        video={activeVideo}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={() => hasPrev && openVideo(videos.videos[currentIndex - 1].id)}
        onNext={() => hasNext && openVideo(videos.videos[currentIndex + 1].id)}
        onClose={() => dispatch({ type: "video:close" })}
        onPlay={(currentTime) => dispatch({ type: "video:play", currentTime })}
        onPause={(currentTime) => dispatch({ type: "video:pause", currentTime })}
        onTimeUpdate={(currentTime) => {
          const now = Date.now();
          if (now - lastSeekEmitRef.current > 500) {
            lastSeekEmitRef.current = now;
            dispatch({ type: "video:seek", currentTime });
          }
        }}
        hoveredControl={state.videos.hoveredControl}
        onHoverControl={(control) => dispatch({ type: "video:hoverControl", control })}
      />
    </div>
  );
}
