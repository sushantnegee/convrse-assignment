import { useProject } from "../../context/ProjectContext";
import { useVideos } from "../../hooks/useVideos";
import { useScrollReceiver } from "../../hooks/useScrollMirror";
import Spinner from "../common/Spinner";
import ErrorBanner from "../common/ErrorBanner";
import AppTopBar from "../layout/AppTopBar";
import AppSideNav from "../layout/AppSideNav";
import VideoGrid from "./VideoGrid";
import MirrorVideoPlayerModal from "./MirrorVideoPlayerModal";

const NOOP = () => {};

// Read-only counterpart to VideoView — same shell, same visuals, driven
// entirely by the mirrored session state instead of local dispatch.
export default function MirrorVideoView({ projectId, state }) {
  const { project } = useProject();
  const videos = useVideos(projectId);

  const currentIndex = videos.videos.findIndex((v) => v.id === state.videos.selectedVideoId);
  const activeVideo = state.videos.playerOpen && currentIndex >= 0 ? videos.videos[currentIndex] : null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < videos.videos.length - 1;
  const scrollRef = useScrollReceiver(state.scroll.videos);

  return (
    <div className="fixed inset-0 z-20 bg-[#111316]">
      <AppTopBar activeTab="videos" onNavigate={NOOP} interactive={false} />
      <AppSideNav activeTab="videos" onNavigate={NOOP} projectName={project?.name} interactive={false} />

      <main className="absolute bottom-0 left-[120px] right-0 top-20 overflow-hidden">
        <section ref={scrollRef} className="styled-scrollbar h-full overflow-y-auto p-10 pointer-events-none">
          <div className="mb-10">
            <h1 className="mb-2 text-4xl text-[#e2e2e6]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
              Project Showcases
            </h1>
            <p className="max-w-2xl text-lg text-[#bcc9cc]">
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
              onOpenVideo={NOOP}
              interactive={false}
              hoveredVideoId={state.videos.hoveredVideoId}
              onHoverVideo={NOOP}
            />
          )}
        </section>
      </main>

      <MirrorVideoPlayerModal
        video={activeVideo}
        playing={state.videos.playing}
        currentTime={state.videos.currentTime}
        hasPrev={hasPrev}
        hasNext={hasNext}
        hoveredControl={state.videos.hoveredControl}
      />
    </div>
  );
}
