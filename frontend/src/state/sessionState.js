// Shape of the mirrored kiosk session — see the plan doc's "Mirrored session
// state shape" section. The executive is the sole source of truth for this;
// the display only ever applies snapshots/patches of it, never constructs
// its own. Wired up fully in the realtime stage.

export function createInitialSessionState(projectId) {
  return {
    projectId,
    entered: false,
    activeTab: "gallery",
    gallery: {
      selectedImageId: null,
      previewOpen: false,
      hoveredImageId: null,
      hoveredControl: null,
    },
    videos: {
      selectedVideoId: null,
      playing: false,
      currentTime: 0,
      playerOpen: false,
      hoveredVideoId: null,
      hoveredControl: null,
    },
    inventory: {
      selectedTowerId: null,
      hoveredUnitId: null,
      selectedUnitId: null,
      bookingDialog: {
        open: false,
        unitId: null,
      },
    },
    // Ratios (0-1 of viewport width/height), not raw pixels — so the
    // pointer lands on the same relative spot regardless of the two
    // devices' actual screen resolutions.
    pointer: {
      xRatio: 0.5,
      yRatio: 0.5,
      visible: false,
    },
    // Scroll position per scrollable section, as a 0-1 ratio (scrollTop /
    // maxScrollTop) rather than raw pixels, so it applies correctly even if
    // the two devices' containers aren't exactly the same size.
    scroll: {
      gallery: 0,
      videos: 0,
      inventory: 0,
    },
    updatedAt: Date.now(),
  };
}

// Every action name doubles as the mirror event name emitted in the realtime
// stage — the executive dispatches these, the display will (eventually)
// receive the same shape and apply it via this same reducer.
export function sessionReducer(state, action) {
  const updatedAt = Date.now();

  switch (action.type) {
    case "splash:enter":
      return { ...state, entered: true, updatedAt };

    case "tab:change":
      return { ...state, activeTab: action.tab, updatedAt };

    case "gallery:select":
      return { ...state, gallery: { ...state.gallery, selectedImageId: action.imageId }, updatedAt };

    case "gallery:previewOpen":
      return {
        ...state,
        gallery: { ...state.gallery, selectedImageId: action.imageId, previewOpen: true },
        updatedAt,
      };

    case "gallery:previewClose":
      return { ...state, gallery: { ...state.gallery, previewOpen: false }, updatedAt };

    case "gallery:hoverImage":
      return { ...state, gallery: { ...state.gallery, hoveredImageId: action.imageId }, updatedAt };

    case "gallery:hoverControl":
      return { ...state, gallery: { ...state.gallery, hoveredControl: action.control }, updatedAt };

    case "video:open":
      return {
        ...state,
        videos: { ...state.videos, selectedVideoId: action.videoId, playing: false, currentTime: 0, playerOpen: true },
        updatedAt,
      };

    case "video:close":
      return { ...state, videos: { ...state.videos, playerOpen: false }, updatedAt };

    case "video:hoverVideo":
      return { ...state, videos: { ...state.videos, hoveredVideoId: action.videoId }, updatedAt };

    case "video:hoverControl":
      return { ...state, videos: { ...state.videos, hoveredControl: action.control }, updatedAt };

    case "video:play":
      return {
        ...state,
        videos: { ...state.videos, playing: true, currentTime: action.currentTime },
        updatedAt,
      };

    case "video:pause":
      return {
        ...state,
        videos: { ...state.videos, playing: false, currentTime: action.currentTime },
        updatedAt,
      };

    case "video:seek":
      return { ...state, videos: { ...state.videos, currentTime: action.currentTime }, updatedAt };

    case "inventory:towerSelect":
      return {
        ...state,
        inventory: {
          ...state.inventory,
          selectedTowerId: action.towerId,
          hoveredUnitId: null,
          selectedUnitId: null,
        },
        updatedAt,
      };

    case "inventory:unitHover":
      return { ...state, inventory: { ...state.inventory, hoveredUnitId: action.unitId }, updatedAt };

    case "inventory:unitSelect":
      return { ...state, inventory: { ...state.inventory, selectedUnitId: action.unitId }, updatedAt };

    case "booking:dialogOpen":
      return {
        ...state,
        inventory: { ...state.inventory, bookingDialog: { open: true, unitId: action.unitId } },
        updatedAt,
      };

    case "booking:dialogClose":
      return {
        ...state,
        inventory: { ...state.inventory, bookingDialog: { open: false, unitId: null } },
        updatedAt,
      };

    case "pointer:move":
      return {
        ...state,
        pointer: { xRatio: action.xRatio, yRatio: action.yRatio, visible: true },
        updatedAt,
      };

    case "pointer:leave":
      return { ...state, pointer: { ...state.pointer, visible: false }, updatedAt };

    case "scroll:update":
      return { ...state, scroll: { ...state.scroll, [action.section]: action.ratio }, updatedAt };

    default:
      return state;
  }
}
