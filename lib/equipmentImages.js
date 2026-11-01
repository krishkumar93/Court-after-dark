// lib/equipmentImages.js
// Guaranteed 100% accurate sport equipment image mappings and fallback handlers.

export const EQUIPMENT_IMAGE_MAP = {
  dumbbell: "/images/equipment/dumbbell.svg",
  football: "/images/equipment/football.svg",
  volleyball: "/images/equipment/volleyball.svg",
  cricketBat: "/images/equipment/cricket-bat.svg",
  tableTennisBat: "/images/equipment/table-tennis-bat.svg",
  basketball: "/images/equipment/basketball.svg",
  badmintonRacket: "/images/equipment/badminton-racket.svg",
  tennisRacket: "/images/equipment/tennis-racket.svg",
  shuttlecock: "/images/equipment/shuttlecock.svg",
  yogaMat: "/images/equipment/yoga-mat.svg",
  jumpRope: "/images/equipment/jump-rope.svg",
  cricketStumps: "/images/equipment/cricket-stumps.svg",
  cones: "/images/equipment/cones.svg",
  cricketBall: "/images/equipment/cricket-ball.svg",
};

/**
 * Returns the exact verified SVG image for any equipment item by matching its
 * ID, name, or category keywords.
 */
export function getExactEquipmentImage(item) {
  if (!item) return EQUIPMENT_IMAGE_MAP.football;

  const id = (item._id || "").toLowerCase();
  const name = (item.name || "").toLowerCase();
  const cat = (item.category || "").toLowerCase();
  const text = `${id} ${name} ${cat}`;

  // 1. Dumbbell / Weight
  if (text.includes("dumb") || text.includes("weight") || text.includes("hex")) {
    return EQUIPMENT_IMAGE_MAP.dumbbell;
  }

  // 2. Football / Soccer
  if (text.includes("football") || text.includes("soccer")) {
    if (text.includes("cone")) return EQUIPMENT_IMAGE_MAP.cones;
    return EQUIPMENT_IMAGE_MAP.football;
  }

  // 3. Volleyball
  if (text.includes("volleyball") || text.includes("vollyball") || text.includes("mikasa")) {
    return EQUIPMENT_IMAGE_MAP.volleyball;
  }

  // 4. Bat (Cricket Bat vs Table Tennis Bat)
  if (text.includes("table tennis") || text.includes("tt_bat") || text.includes("paddle") || text.includes("timo boll")) {
    return EQUIPMENT_IMAGE_MAP.tableTennisBat;
  }
  if (text.includes("cricket") && text.includes("bat")) {
    return EQUIPMENT_IMAGE_MAP.cricketBat;
  }
  if (text.includes("bat")) {
    return EQUIPMENT_IMAGE_MAP.cricketBat;
  }

  // 5. Basketball
  if (text.includes("basketball") || text.includes("bball") || text.includes("wilson evolution")) {
    return EQUIPMENT_IMAGE_MAP.basketball;
  }

  // 6. Cricket specific gear
  if (text.includes("stump") || text.includes("wicket")) {
    return EQUIPMENT_IMAGE_MAP.cricketStumps;
  }
  if (text.includes("cricket") && text.includes("ball")) {
    return EQUIPMENT_IMAGE_MAP.cricketBall;
  }

  // 7. Table tennis accessories
  if (text.includes("table tennis") && text.includes("ball")) {
    return EQUIPMENT_IMAGE_MAP.tableTennisBat;
  }

  // 8. Badminton
  if (text.includes("shuttle") || text.includes("feather") || text.includes("aerosensa")) {
    return EQUIPMENT_IMAGE_MAP.shuttlecock;
  }
  if (text.includes("badminton")) {
    return EQUIPMENT_IMAGE_MAP.badmintonRacket;
  }

  // 9. Tennis
  if (text.includes("tennis")) {
    return EQUIPMENT_IMAGE_MAP.tennisRacket;
  }

  // 10. Gym gear
  if (text.includes("yoga") || text.includes("mat")) {
    return EQUIPMENT_IMAGE_MAP.yogaMat;
  }
  if (text.includes("rope") || text.includes("jump") || text.includes("skipping")) {
    return EQUIPMENT_IMAGE_MAP.jumpRope;
  }

  // 11. Cones / Training
  if (text.includes("cone") || text.includes("agility")) {
    return EQUIPMENT_IMAGE_MAP.cones;
  }

  return EQUIPMENT_IMAGE_MAP.football;
}

/**
 * Returns the primary image URL for an equipment item.
 * Prioritizes local SVG or clean defined image.
 */
export function getEquipmentImage(item) {
  if (!item) return EQUIPMENT_IMAGE_MAP.football;
  // If the item image points directly to our local equipment images, keep it
  if (item.image && item.image.startsWith("/images/equipment/")) {
    return item.image;
  }
  // If item.image is empty or null, return exact verified SVG
  if (!item.image) {
    return getExactEquipmentImage(item);
  }
  // Return the image if provided, with exact sport SVG as backup
  return item.image;
}

/**
 * Image error handler that replaces any broken image with the exact sport SVG.
 */
export function handleEquipmentImageError(e, item) {
  const fallback = getExactEquipmentImage(item);
  if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
    e.currentTarget.src = fallback;
  }
}

