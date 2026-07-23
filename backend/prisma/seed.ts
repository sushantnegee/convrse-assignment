import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:4000";
const TOWERS_DIR = path.join(__dirname, "..", "public", "assets", "towers");
const OVERLAY_SVGS_DIR = path.join(TOWERS_DIR, "tower svgs");

// Parses the <svg width="W" height="H" viewBox="0 0 W H"> root tag so the
// stored image_width/image_height exactly match the coordinate space the
// unit polygons were authored against (not necessarily the compressed
// photo's own pixel dimensions — see units below).
function parseSvgCanvasSize(svgPath: string): { width: number; height: number } {
  const content = readFileSync(svgPath, "utf-8");
  const match = content.match(/viewBox="[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)"/);
  if (!match) throw new Error(`Could not parse viewBox from ${svgPath}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

// Extracts each unit's polygon from the hand-authored overlay SVG:
// <g id="A701"><polygon points="690.5,205.5 432,566 ..." .../></g>
function parseUnitPolygons(svgPath: string): Array<{ unitId: string; polygonPoints: string }> {
  const content = readFileSync(svgPath, "utf-8");
  const regex = /<g id="([^"]+)">\s*<polygon points="([^"]+)"/g;
  const results: Array<{ unitId: string; polygonPoints: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    results.push({ unitId: match[1], polygonPoints: match[2] });
  }
  return results;
}

// Unit ids follow `${towerCode}${floor}0${unitInFloor}`, e.g. "A701" =
// Tower A, floor 7, unit 1. Unit-in-floor "1" is the 2BHK, "2" is the 3BHK
// (arbitrary but consistent convention carried over from the placeholder
// seed this replaced).
function unitIdToDetails(unitId: string) {
  const parsed = unitId.match(/^([A-Z])(\d)0(\d)$/);
  if (!parsed) throw new Error(`Unexpected unit id format: ${unitId}`);
  const floor = Number(parsed[2]);
  const isThreeBhk = parsed[3] === "2";
  return {
    floor,
    config: isThreeBhk ? "3BHK" : "2BHK",
    areaSqft: isThreeBhk ? 1350 : 950,
    price: isThreeBhk ? 10500000 : 7500000,
  };
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.tower.deleteMany();
  await prisma.video.deleteMany();
  await prisma.galleryImage.deleteMany();

  // Upsert (not delete + create) so the project keeps the same id across
  // every reseed — re-running this script shouldn't invalidate URLs/bookmarks
  // that are already pointing at ?projectId=<this-id>.
  const project = await prisma.project.upsert({
    where: { slug: "skyline-residences" },
    update: {},
    create: {
      slug: "skyline-residences",
      name: "Skyline Residences",
    },
  });

  const galleryCaptions = [
    "Grand Entrance Lobby",
    "Rooftop Infinity Pool",
    "Clubhouse Lounge",
    "Landscaped Gardens",
    "Kids Play Area",
    "Fitness Center",
    "Sky Deck at Dusk",
    "Master Bedroom Interior",
  ];
  const picsumIds = [1029, 1031, 1040, 1044, 1050, 1056, 1060, 1074];

  await prisma.galleryImage.createMany({
    data: galleryCaptions.map((caption, i) => ({
      projectId: project.id,
      url: `https://picsum.photos/id/${picsumIds[i]}/1600/1000`,
      caption,
      sortOrder: i,
    })),
  });

  // Self-hosted rather than linked to an external sample-video bucket —
  // those are unofficial public buckets that can (and did, mid-build) start
  // returning 403 with no warning. Serving our own copy removes that risk
  // for the deployed app and for grading.
  const videoDefs = [
    {
      title: "Project Walkthrough",
      url: `${PUBLIC_BASE_URL}/assets/videos/project-walkthrough.mp4`,
      thumbId: 201,
    },
    {
      title: "Amenities Tour",
      url: `${PUBLIC_BASE_URL}/assets/videos/amenities-tour.mp4`,
      thumbId: 202,
    },
    {
      title: "Clubhouse Preview",
      url: `${PUBLIC_BASE_URL}/assets/videos/clubhouse-preview.mp4`,
      thumbId: 203,
    },
  ];

  await prisma.video.createMany({
    data: videoDefs.map((v, i) => ({
      projectId: project.id,
      url: v.url,
      thumbnailUrl: `https://picsum.photos/id/${v.thumbId}/640/360`,
      title: v.title,
      sortOrder: i,
    })),
  });

  // Real tower photos + hand-authored unit polygon overlays, provided
  // directly rather than generated placeholders.
  const towerDefs = [
    { label: "Tower A — Orchid", imageFile: "tower-a.jpeg", svgFile: "tower-a1.svg" },
    { label: "Tower B — Magnolia", imageFile: "tower-b.jpeg", svgFile: "tower-b1.svg" },
  ];

  let firstUnitNumberForBooking: string | null = null;

  for (let i = 0; i < towerDefs.length; i++) {
    const def = towerDefs[i];
    const svgPath = path.join(OVERLAY_SVGS_DIR, def.svgFile);
    const { width, height } = parseSvgCanvasSize(svgPath);
    const unitEntries = parseUnitPolygons(svgPath);

    const tower = await prisma.tower.create({
      data: {
        projectId: project.id,
        name: def.label,
        imageUrl: `${PUBLIC_BASE_URL}/assets/towers/${def.imageFile}`,
        imageWidth: width,
        imageHeight: height,
        sortOrder: i,
      },
    });

    await prisma.unit.createMany({
      data: unitEntries.map((entry) => {
        const details = unitIdToDetails(entry.unitId);
        return {
          towerId: tower.id,
          unitNumber: entry.unitId,
          floor: details.floor,
          config: details.config,
          areaSqft: details.areaSqft,
          price: details.price,
          polygonPoints: entry.polygonPoints,
          status: "available",
        };
      }),
    });

    if (i === 0 && unitEntries.length > 0) {
      firstUnitNumberForBooking = unitEntries[0].unitId;
    }
  }

  // Pre-book one unit so the app has a real "Booked" example out of the box.
  if (firstUnitNumberForBooking) {
    const unit = await prisma.unit.findFirst({
      where: { unitNumber: firstUnitNumberForBooking },
    });
    if (unit) {
      await prisma.$transaction([
        prisma.unit.update({ where: { id: unit.id }, data: { status: "booked" } }),
        prisma.booking.create({
          data: {
            unitId: unit.id,
            customerName: "Ravi Shankar",
            phoneNumber: "+91 98765 43210",
          },
        }),
      ]);
    }
  }

  console.log(`Seeded project "${project.slug}" with ${towerDefs.length} towers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
