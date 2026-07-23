import { useProject } from "../../context/ProjectContext";
import { useGallery } from "../../hooks/useGallery";
import { useScrollReceiver } from "../../hooks/useScrollMirror";
import ErrorBanner from "../common/ErrorBanner";
import AppTopBar from "../layout/AppTopBar";
import AppSideNav from "../layout/AppSideNav";
import GalleryGrid from "./GalleryGrid";
import GallerySkeletonGrid from "./GallerySkeletonGrid";
import ImagePreviewModal from "./ImagePreviewModal";

const NOOP = () => {};

// Read-only counterpart to GalleryView — same shell, same visuals, driven
// entirely by the mirrored session state instead of local dispatch.
export default function MirrorGalleryView({ projectId, state }) {
  const { project } = useProject();
  const gallery = useGallery(projectId);
  const currentIndex = gallery.images.findIndex((img) => img.id === state.gallery.selectedImageId);
  const previewImage = state.gallery.previewOpen && currentIndex >= 0 ? gallery.images[currentIndex] : null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < gallery.images.length - 1;
  const scrollRef = useScrollReceiver(state.scroll.gallery);

  return (
    <div className="fixed inset-0 z-20 bg-[#111316]">
      <AppTopBar activeTab="gallery" onNavigate={NOOP} interactive={false} />
      <AppSideNav activeTab="gallery" onNavigate={NOOP} projectName={project?.name} interactive={false} />

      <main className="absolute bottom-0 left-[120px] right-0 top-20 overflow-hidden">
        <section ref={scrollRef} className="styled-scrollbar h-full overflow-y-auto p-5 pointer-events-none lg:p-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1
                className="text-2xl text-[#e2e2e6] lg:text-4xl"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
              >
                {project?.name ?? "Gallery"}
              </h1>
              <p className="mt-2 text-base text-[#bcc9cc] lg:text-lg">Curated visuals of the masterplan.</p>
            </div>
          </div>

          {gallery.status === "loading" && <GallerySkeletonGrid />}
          {gallery.status === "error" && <ErrorBanner message={gallery.error} onRetry={gallery.reload} />}
          {gallery.status === "ready" && gallery.images.length === 0 && (
            <ErrorBanner message="No gallery images yet for this project." />
          )}
          {gallery.status === "ready" && gallery.images.length > 0 && (
            <GalleryGrid
              images={gallery.images}
              onOpenImage={NOOP}
              interactive={false}
              hoveredImageId={state.gallery.hoveredImageId}
              onHoverImage={NOOP}
            />
          )}
        </section>
      </main>

      <ImagePreviewModal
        image={previewImage}
        onClose={NOOP}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={NOOP}
        onNext={NOOP}
        interactive={false}
        hoveredControl={state.gallery.hoveredControl}
        onHoverControl={NOOP}
      />
    </div>
  );
}
