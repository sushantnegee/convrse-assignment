import { useCallback } from "react";
import { useProject } from "../../context/ProjectContext";
import { useTowers } from "../../hooks/useTowers";
import { useUnits } from "../../hooks/useUnits";
import { useInventoryLive } from "../../hooks/useInventoryLive";
import Spinner from "../common/Spinner";
import ErrorBanner from "../common/ErrorBanner";
import AppTopBar from "../layout/AppTopBar";
import AppSideNav from "../layout/AppSideNav";
import InventorySidebar from "./InventorySidebar";
import InventoryStage from "./InventoryStage";
import MirrorBookingDialog from "./MirrorBookingDialog";

const NOOP = () => {};

// Read-only counterpart to InventoryView — same shell, same visuals, but
// every interactive callback is a no-op and every piece of selection state
// (tower, hover, selection, dialog) comes from the mirrored session state
// instead of local state.
export default function MirrorInventoryView({ projectId, state }) {
  const { project } = useProject();
  const towers = useTowers(projectId);
  const selectedTowerId = state.inventory.selectedTowerId;
  const units = useUnits(selectedTowerId);

  const handleUnitBooked = useCallback(
    (payload) => {
      if (payload.towerId === selectedTowerId) units.markUnitBooked(payload.unitId);
    },
    [selectedTowerId, units]
  );
  useInventoryLive(projectId, handleUnitBooked);

  const selectedTower = towers.towers.find((t) => t.id === selectedTowerId) ?? null;
  const bookingUnit = units.units.find((u) => u.id === state.inventory.bookingDialog.unitId) ?? null;

  return (
    <div className="fixed inset-0 z-20 bg-[#111316]">
      <AppTopBar activeTab="inventory" onNavigate={NOOP} interactive={false} />
      <AppSideNav activeTab="inventory" onNavigate={NOOP} projectName={project?.name} interactive={false} />

      <div className="absolute bottom-0 left-[120px] right-0 top-20 flex flex-col lg:flex-row">
        {towers.status === "loading" && <Spinner label="Loading towers…" />}
        {towers.status === "error" && <ErrorBanner message={towers.error} onRetry={towers.reload} />}
        {towers.status === "ready" && towers.towers.length === 0 && (
          <ErrorBanner message="No towers configured for this project." />
        )}

        {towers.status === "ready" && towers.towers.length > 0 && (
          <>
            <InventorySidebar
              towers={towers.towers}
              selectedTowerId={selectedTowerId}
              onSelectTower={NOOP}
              units={units.units}
              selectedUnitId={state.inventory.selectedUnitId}
              hoveredUnitId={state.inventory.hoveredUnitId}
              onHoverUnit={NOOP}
              onSelectUnit={NOOP}
              interactive={false}
              scrollRatio={state.scroll.inventory}
              statusFilter={state.inventory.statusFilter}
              configFilter={state.inventory.configFilter}
              onStatusFilterChange={NOOP}
              onConfigFilterChange={NOOP}
            />

            <div className="h-full flex-1 overflow-hidden">
              {!selectedTower && (
                <div className="flex h-full w-full items-center justify-center text-white/50">
                  Waiting for executive…
                </div>
              )}
              {units.status === "loading" && <Spinner label="Loading units…" />}
              {units.status === "error" && <ErrorBanner message={units.error} onRetry={units.reload} />}
              {units.status === "ready" && units.units.length > 0 && selectedTower && (
                <InventoryStage
                  tower={selectedTower}
                  units={units.units}
                  hoveredUnitId={state.inventory.hoveredUnitId}
                  selectedUnitId={state.inventory.selectedUnitId}
                  onHoverUnit={NOOP}
                  onSelectUnit={NOOP}
                  interactive={false}
                />
              )}
            </div>
          </>
        )}
      </div>

      <MirrorBookingDialog open={state.inventory.bookingDialog.open} unit={bookingUnit} />
    </div>
  );
}
