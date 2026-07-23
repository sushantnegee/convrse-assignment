import { useProject } from "../context/ProjectContext";
import { useMirrorReceiver } from "../hooks/useMirrorReceiver";
import Spinner from "../components/common/Spinner";
import ErrorBanner from "../components/common/ErrorBanner";
import MirrorPointer from "../components/common/MirrorPointer";
import MirrorGalleryView from "../components/gallery/MirrorGalleryView";
import MirrorVideoView from "../components/videos/MirrorVideoView";
import MirrorInventoryView from "../components/inventory/MirrorInventoryView";
import EntrySplash from "../components/splash/EntrySplash";

const NOOP = () => {};

// Pure mirror — never dispatches, never emits. Gallery/Videos/Inventory
// each have a read-only counterpart that renders the same shell, driven
// entirely by the mirrored session state (useMirrorReceiver) instead of
// local dispatch. MirrorPointer additionally renders the executive's live
// cursor on top of whatever screen is showing, so the client can see
// exactly where the sales person is pointing.
export default function DisplayPage() {
  const { projectId, status, error, reload } = useProject();
  const state = useMirrorReceiver(projectId);

  if (status === "loading") return <Spinner label="Loading project…" />;
  if (status === "error") return <ErrorBanner message={error} onRetry={reload} />;

  let view;
  if (!state.entered) {
    view = <EntrySplash onEnter={NOOP} interactive={false} />;
  } else if (state.activeTab === "videos") {
    view = <MirrorVideoView projectId={projectId} state={state} />;
  } else if (state.activeTab === "inventory") {
    view = <MirrorInventoryView projectId={projectId} state={state} />;
  } else {
    view = <MirrorGalleryView projectId={projectId} state={state} />;
  }

  return (
    <>
      {view}
      <MirrorPointer pointer={state.pointer} />
    </>
  );
}
