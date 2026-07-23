import GalleryTile from "./GalleryTile";

// Bento-style layout: first image is the big feature card, next two stack
// beside it, everything else wraps as a row of smaller tiles. Degrades
// gracefully for any image count (not just the reference's exact 6).
export default function GalleryGrid({ images, onOpenImage, interactive = true, hoveredImageId = null, onHoverImage }) {
  const [first, second, third, ...rest] = images;
  const hasSecondary = Boolean(second || third);

  return (
    <div className="grid grid-cols-12 gap-6 pb-24">
      <div className={`h-[400px] ${hasSecondary ? "col-span-8" : "col-span-12"}`}>
        <GalleryTile
          image={first}
          variant="feature"
          onOpen={onOpenImage}
          interactive={interactive}
          isHovered={first?.id === hoveredImageId}
          onHover={onHoverImage}
        />
      </div>

      {hasSecondary && (
        <div className="col-span-4 flex h-[400px] flex-col gap-6">
          {second && (
            <div className="flex-1">
              <GalleryTile
                image={second}
                variant="secondary"
                onOpen={onOpenImage}
                interactive={interactive}
                isHovered={second.id === hoveredImageId}
                onHover={onHoverImage}
              />
            </div>
          )}
          {third && (
            <div className="flex-1">
              <GalleryTile
                image={third}
                variant="secondary"
                onOpen={onOpenImage}
                interactive={interactive}
                isHovered={third.id === hoveredImageId}
                onHover={onHoverImage}
              />
            </div>
          )}
        </div>
      )}

      {rest.map((image) => (
        <div key={image.id} className="col-span-4 h-[240px]">
          <GalleryTile
            image={image}
            variant="small"
            onOpen={onOpenImage}
            interactive={interactive}
            isHovered={image.id === hoveredImageId}
            onHover={onHoverImage}
          />
        </div>
      ))}
    </div>
  );
}
