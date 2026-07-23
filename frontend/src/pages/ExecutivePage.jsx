import { useProject } from "../context/ProjectContext";
import { useMirrorEmitter } from "../hooks/useMirrorEmitter";
import { usePointerEmitter } from "../hooks/usePointerEmitter";
import Spinner from "../components/common/Spinner";
import ErrorBanner from "../components/common/ErrorBanner";
import GalleryView from "../components/gallery/GalleryView";
import VideoView from "../components/videos/VideoView";
import InventoryView from "../components/inventory/InventoryView";
import EntrySplash from "../components/splash/EntrySplash";

// Gallery, Videos, and Inventory each bring their own full-screen app shell
// (topbar + icon rail) — this page just picks which one to render.
export default function ExecutivePage() {
  const { projectId, status, error, reload } = useProject();
  const [state, dispatch] = useMirrorEmitter(projectId);
  usePointerEmitter(dispatch);

  if (status === "loading") return <Spinner label="Loading project…" />;
  if (status === "error") return <ErrorBanner message={error} onRetry={reload} />;

  if (!state.entered) {
    return <EntrySplash onEnter={() => dispatch({ type: "splash:enter" })} />;
  }

  const handleNavigateTab = (tab) => dispatch({ type: "tab:change", tab });
  const commonProps = { projectId, state, dispatch, onNavigateTab: handleNavigateTab };

  if (state.activeTab === "videos") return <VideoView {...commonProps} />;
  if (state.activeTab === "inventory") return <InventoryView {...commonProps} />;
  return <GalleryView {...commonProps} />;
}
