import { useProject } from "../../context/ProjectContext";
import { useGallery } from "../../hooks/useGallery";
import { useScrollEmitter } from "../../hooks/useScrollMirror";
import ErrorBanner from "../common/ErrorBanner";
import AppTopBar from "../layout/AppTopBar";
import AppSideNav from "../layout/AppSideNav";
import GalleryGrid from "./GalleryGrid";
import GallerySkeletonGrid from "./GallerySkeletonGrid";
import ImagePreviewModal from "./ImagePreviewModal";

// Gallery's own app shell (topbar + icon rail + bento grid). No separate
// bottom list: the grid already shows every image, so a persistent strip
// of the same images was redundant.
export default function GalleryView({ projectId, state, dispatch, onNavigateTab }) {
  const { project } = useProject();
  const gallery = useGallery(projectId);
  const currentIndex = gallery.images.findIndex((img) => img.id === state.gallery.selectedImageId);
  const previewImage = state.gallery.previewOpen && currentIndex >= 0 ? gallery.images[currentIndex] : null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < gallery.images.length - 1;

  const handleOpenImage = (imageId) => dispatch({ type: "gallery:previewOpen", imageId });
  const scrollRef = useScrollEmitter((ratio) => dispatch({ type: "scroll:update", section: "gallery", ratio }));

  return (
    <div className="fixed inset-0 z-20 bg-[#111316]">
      <AppTopBar activeTab="gallery" onNavigate={onNavigateTab} projectId={projectId} />
      <AppSideNav activeTab="gallery" onNavigate={onNavigateTab} projectName={project?.name} />

      <main className="absolute bottom-0 left-[120px] right-0 top-20 overflow-hidden">
        <section ref={scrollRef} className="styled-scrollbar h-full overflow-y-auto p-5 lg:p-10">
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
              onOpenImage={handleOpenImage}
              hoveredImageId={state.gallery.hoveredImageId}
              onHoverImage={(imageId) => dispatch({ type: "gallery:hoverImage", imageId })}
            />
          )}
        </section>
      </main>

      <ImagePreviewModal
        image={previewImage}
        onClose={() => dispatch({ type: "gallery:previewClose" })}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={() => hasPrev && handleOpenImage(gallery.images[currentIndex - 1].id)}
        onNext={() => hasNext && handleOpenImage(gallery.images[currentIndex + 1].id)}
        hoveredControl={state.gallery.hoveredControl}
        onHoverControl={(control) => dispatch({ type: "gallery:hoverControl", control })}
      />
    </div>
  );
}
