import { useCallback, useEffect } from "react";
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
import BookingDialog from "./BookingDialog";

// Inventory's own app shell (topbar + left icon rail + sidebar). The tower
// + SVG polygon overlay + hover card + booking dialog underneath are
// unchanged from earlier stages.
export default function InventoryView({ projectId, state, dispatch, onNavigateTab }) {
  const { project } = useProject();
  const towers = useTowers(projectId);
  const selectedTowerId = state.inventory.selectedTowerId;

  useEffect(() => {
    if (!selectedTowerId && towers.towers.length > 0) {
      dispatch({ type: "inventory:towerSelect", towerId: towers.towers[0].id });
    }
  }, [towers.towers, selectedTowerId, dispatch]);

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

  const handleSelectUnit = (unitId) => {
    dispatch({ type: "inventory:unitSelect", unitId });
    dispatch({ type: "booking:dialogOpen", unitId });
  };

  return (
    <div className="fixed inset-0 z-20 bg-[#111316]">
      <AppTopBar activeTab="inventory" onNavigate={onNavigateTab} />
      <AppSideNav activeTab="inventory" onNavigate={onNavigateTab} projectName={project?.name} />

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
              onSelectTower={(towerId) => dispatch({ type: "inventory:towerSelect", towerId })}
              units={units.units}
              selectedUnitId={state.inventory.selectedUnitId}
              hoveredUnitId={state.inventory.hoveredUnitId}
              onHoverUnit={(unitId) => dispatch({ type: "inventory:unitHover", unitId })}
              onSelectUnit={handleSelectUnit}
              onScrollChange={(ratio) => dispatch({ type: "scroll:update", section: "inventory", ratio })}
              statusFilter={state.inventory.statusFilter}
              configFilter={state.inventory.configFilter}
              onStatusFilterChange={(status) => dispatch({ type: "inventory:statusFilter", status })}
              onConfigFilterChange={(config) => dispatch({ type: "inventory:configFilter", config })}
            />

            <div className="h-full flex-1 overflow-hidden">
              {units.status === "loading" && <Spinner label="Loading units…" />}
              {units.status === "error" && <ErrorBanner message={units.error} onRetry={units.reload} />}
              {units.status === "ready" && units.units.length === 0 && (
                <ErrorBanner message="No units configured for this tower." />
              )}
              {units.status === "ready" && units.units.length > 0 && selectedTower && (
                <InventoryStage
                  tower={selectedTower}
                  units={units.units}
                  hoveredUnitId={state.inventory.hoveredUnitId}
                  selectedUnitId={state.inventory.selectedUnitId}
                  onHoverUnit={(unitId) => dispatch({ type: "inventory:unitHover", unitId })}
                  onSelectUnit={handleSelectUnit}
                />
              )}
            </div>
          </>
        )}
      </div>

      <BookingDialog
        open={state.inventory.bookingDialog.open}
        unit={bookingUnit}
        onClose={() => dispatch({ type: "booking:dialogClose" })}
        onBooked={(unitId) => units.markUnitBooked(unitId)}
      />
    </div>
  );
}
