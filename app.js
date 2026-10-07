const canvas = document.querySelector("#posterCanvas");
const ctx = canvas.getContext("2d");
const logoMaskCache = new WeakMap();
const ASSET_VERSION = "20261007-73";

const state = {
  photos: [],
  templateId: "feature",
  theme: "pacific",
  title: "Formation des personnels",
  meta: "Date et lieu",
  showMeta: true,
  showAefeLogo: true,
  showZoneLogo: true,
  showMarianne: true,
  showRucheLogo: false,
  location: { label: "Bangkok, Thaïlande", latitude: 13.7563, longitude: 100.5018 },
  locationLabelColor: "#283178",
  locationActions: { establishment: false, zone: false, seminar: false },
  textBlocks: [],
  selectedTextId: null,
  draggingText: null,
  elementOffsets: {},
  elementScales: {},
  selectedElementId: null,
  draggingElement: null,
  resizingElement: null,
  logos: {
    aefe: null,
    aefeOriginal: null,
    zone: null,
    marianne: null,
    ruche: null,
  },
};

const themes = {
  pacific: {
    bg: "#283178",
    ink: "#283178",
    muted: "#5d658d",
    accent: "#ffca08",
    accent2: "#ffffff",
    cream: "#ffffff",
    ghost: "#ffffff",
  },
  coral: {
    bg: "#c20f7a",
    ink: "#c20f7a",
    muted: "#6a4260",
    accent: "#ffffff",
    accent2: "#ffca08",
    cream: "#ffffff",
    ghost: "#ffffff",
  },
  ink: {
    bg: "#9bd4cc",
    ink: "#063d73",
    muted: "#0b5a83",
    accent: "#ffd22e",
    accent2: "#ffffff",
    cream: "#ffffff",
    ghost: "#063d73",
  },
  orion: {
    bg: "#45476e",
    ink: "#45476e",
    muted: "#53679f",
    accent: "#f57963",
    accent2: "#53679f",
    cream: "#ffffff",
    ghost: "#ffffff",
  },
};

const templates = [
  {
    id: "poster",
    name: "Affiche formation",
    counts: [1, 2, 3, 4, 5],
    kind: "poster",
    icon: "file-text",
  },
  {
    id: "feature",
    name: "Photos rectangles",
    counts: [1, 2, 3, 4, 5],
    layout(count) {
      if (count === 1) return [{ x: 70, y: 72, w: 940, h: 760 }];
      if (count === 2) return [{ x: 70, y: 72, w: 458, h: 760 }, { x: 552, y: 72, w: 458, h: 760 }];
      if (count === 3) return [{ x: 70, y: 72, w: 580, h: 760 }, { x: 666, y: 72, w: 344, h: 372 }, { x: 666, y: 460, w: 344, h: 372 }];
      if (count === 4) return [{ x: 70, y: 72, w: 458, h: 470 }, { x: 552, y: 72, w: 458, h: 300 }, { x: 70, y: 566, w: 458, h: 266 }, { x: 552, y: 396, w: 458, h: 436 }];
      return [{ x: 70, y: 72, w: 458, h: 470 }, { x: 552, y: 72, w: 458, h: 300 }, { x: 70, y: 566, w: 220, h: 266 }, { x: 308, y: 566, w: 220, h: 266 }, { x: 552, y: 396, w: 458, h: 436 }];
    },
    icon: "panels-top-left",
  },
  {
    id: "circles",
    name: "Photos cercles",
    counts: [2, 3, 4, 5],
    kind: "circles",
    icon: "circle-pile",
  },
  {
    id: "location",
    name: "Localisation",
    counts: [1, 2, 3, 4, 5],
    kind: "location",
    icon: "globe",
  },
];

const formationActions = [
  ["establishment", "Action de formation Établissement"],
  ["zone", "Action de formation Zone"],
  ["seminar", "Séminaire"],
];

const trainingCities = [
  ["Bangkok, Thaïlande", 13.7563, 100.5018],
  ["Hanoï, Vietnam", 21.0285, 105.8542],
  ["Hô Chi Minh-Ville, Vietnam", 10.8231, 106.6297],
  ["Phnom Penh, Cambodge", 11.5564, 104.9282],
  ["Vientiane, Laos", 17.9757, 102.6331],
  ["Singapour", 1.3521, 103.8198],
  ["Kuala Lumpur, Malaisie", 3.139, 101.6869],
  ["Jakarta, Indonésie", -6.2088, 106.8456],
  ["Rangoun, Birmanie", 16.8409, 96.1735],
  ["Hong Kong", 22.3193, 114.1694],
  ["Pékin, Chine", 39.9042, 116.4074],
  ["Shanghai, Chine", 31.2304, 121.4737],
  ["Tokyo, Japon", 35.6762, 139.6503],
  ["Séoul, Corée du Sud", 37.5665, 126.978],
  ["Taipei, Taïwan", 25.033, 121.5654],
  ["Manille, Philippines", 14.5995, 120.9842],
  ["Sydney, Australie", -33.8688, 151.2093],
  ["Melbourne, Australie", -37.8136, 144.9631],
  ["Wellington, Nouvelle-Zélande", -41.2866, 174.7756],
  ["Auckland, Nouvelle-Zélande", -36.8485, 174.7633],
  ["Nouméa, Nouvelle-Calédonie", -22.2758, 166.458],
  ["Papeete, Polynésie française", -17.5516, -149.5585],
  ["Port-Vila, Vanuatu", -17.7333, 168.3273],
];

const elements = {
  photoInput: document.querySelector("#photoInput"),
  photoList: document.querySelector("#photoList"),
  photoCount: document.querySelector("#photoCount"),
  templateGrid: document.querySelector("#templateGrid"),
  templateHint: document.querySelector("#templateHint"),
  titleInput: document.querySelector("#titleInput"),
  metaInput: document.querySelector("#metaInput"),
  metaToggle: document.querySelector("#metaToggle"),
  addTextButton: document.querySelector("#addTextButton"),
  freeTextInput: document.querySelector("#freeTextInput"),
  freeTextSize: document.querySelector("#freeTextSize"),
  freeTextColor: document.querySelector("#freeTextColor"),
  freeTextBox: document.querySelector("#freeTextBox"),
  freeTextList: document.querySelector("#freeTextList"),
  downloadButton: document.querySelector("#downloadButton"),
  downloadButtonPanel: document.querySelector("#downloadButtonPanel"),
  aefeLogoToggle: document.querySelector("#aefeLogoToggle"),
  zoneLogoToggle: document.querySelector("#zoneLogoToggle"),
  marianneToggle: document.querySelector("#marianneToggle"),
  rucheLogoToggle: document.querySelector("#rucheLogoToggle"),
  locationSection: document.querySelector("#locationSection"),
  locationCity: document.querySelector("#locationCity"),
  locationLabel: document.querySelector("#locationLabel"),
  locationLabelColor: document.querySelector("#locationLabelColor"),
};

async function init() {
  const [aefe, zone, marianne, ruche, aefeOriginal] = await Promise.all([
    loadImage(assetUrl("assets/aefe-logo-blanc.png")),
    loadImage(assetUrl("assets/irf-aefe-asie-pacifique.png")),
    loadImage(assetUrl("assets/marianne.png")),
    loadImage(assetUrl("assets/la-ruche.png")),
    loadImage(assetUrl("assets/aefe-logo.svg")),
  ]);
  state.logos.aefe = aefe;
  state.logos.aefeOriginal = aefeOriginal;
  state.logos.zone = zone;
  state.logos.marianne = marianne;
  state.logos.ruche = ruche;
  elements.locationCity.innerHTML = trainingCities.map(([label], index) => `<option value="${index}">${escapeHtml(label)}</option>`).join("");
  renderTemplatePicker();
  bindEvents();
  draw();
}

function bindEvents() {
  document.querySelectorAll('input[name="locationAction"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll('input[name="locationAction"]').forEach((option) => {
        option.checked = option === input && input.checked;
        state.locationActions[option.value] = option.checked;
      });
      draw();
    });
  });
  elements.locationCity.addEventListener("change", (event) => {
    const city = trainingCities[event.target.value];
    if (!city) return;
    const [label, latitude, longitude] = city;
    state.location = { label, latitude, longitude };
    elements.locationLabel.value = label;
    draw();
  });
  elements.locationLabel.addEventListener("input", (event) => {
    state.location.label = event.target.value;
    draw();
  });
  elements.locationLabelColor.addEventListener("change", (event) => {
    state.locationLabelColor = event.target.value;
    draw();
  });
  elements.photoInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5 - state.photos.length);
    const newPhotos = await Promise.all(files.map(readPhoto));
    state.photos.push(...newPhotos);
    event.target.value = "";
    if (!currentTemplate().counts.includes(photoCount())) state.templateId = bestTemplate().id;
    update();
  });

  elements.titleInput.addEventListener("input", (event) => {
    state.title = event.target.value;
    draw();
  });

  elements.metaInput.addEventListener("input", (event) => {
    state.meta = event.target.value;
    draw();
  });

  elements.metaToggle.addEventListener("change", (event) => {
    state.showMeta = event.target.checked;
    draw();
  });

  elements.aefeLogoToggle.addEventListener("change", (event) => {
    state.showAefeLogo = event.target.checked;
    draw();
  });

  elements.zoneLogoToggle.addEventListener("change", (event) => {
    state.showZoneLogo = event.target.checked;
    draw();
  });

  elements.marianneToggle.addEventListener("change", (event) => {
    state.showMarianne = event.target.checked;
    draw();
  });

  elements.rucheLogoToggle.addEventListener("change", (event) => {
    state.showRucheLogo = event.target.checked;
    draw();
  });

  elements.addTextButton.addEventListener("click", addTextBlock);
  elements.freeTextInput.addEventListener("input", updateSelectedText);
  elements.freeTextSize.addEventListener("input", updateSelectedText);
  elements.freeTextColor.addEventListener("change", updateSelectedText);
  elements.freeTextBox.addEventListener("change", updateSelectedText);

  canvas.addEventListener("pointerdown", startTextDrag);
  canvas.addEventListener("pointermove", moveTextDrag);
  canvas.addEventListener("pointerup", stopTextDrag);
  canvas.addEventListener("pointerleave", stopTextDrag);

  document.querySelectorAll(".theme-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.theme;
      document.querySelectorAll(".theme-button").forEach((item) => item.classList.toggle("is-active", item === button));
      draw();
    });
  });

  elements.downloadButton.addEventListener("click", exportInstagramPost);
  elements.downloadButtonPanel.addEventListener("click", exportInstagramPost);
}

function exportInstagramPost() {
    draw({ showSelection: false });
    const link = document.createElement("a");
    link.download = `irf-instagram-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    draw();
}

function renderTemplatePicker() {
  elements.templateGrid.innerHTML = "";
  templates.forEach((template) => {
    const button = document.createElement("button");
    button.className = "template-card";
    button.type = "button";
    button.dataset.template = template.id;
    button.innerHTML = `<img class="template-icon" aria-hidden="true" alt="" src="assets/template-${template.icon}.svg" /><span class="template-title">${template.name}</span>`;
    button.addEventListener("click", () => {
      state.templateId = template.id;
      update();
    });
    elements.templateGrid.appendChild(button);
  });
}

function renderPhotoList() {
  elements.photoCount.textContent = `${state.photos.length}/5`;
  elements.photoList.innerHTML = "";
  state.photos.forEach((photo, index) => {
    const item = document.createElement("div");
    item.className = "photo-item";
    item.innerHTML = `
      <img src="${photo.url}" alt="">
      <span class="photo-name" title="${escapeHtml(photo.name)}">${escapeHtml(photo.name)}</span>
      <button class="icon-button" type="button" title="Monter">↑</button>
      <button class="icon-button" type="button" title="Descendre">↓</button>
      <button class="icon-button remove" type="button" title="Retirer">×</button>
    `;
    const [upButton, downButton, removeButton] = item.querySelectorAll("button");
    upButton.disabled = index === 0;
    downButton.disabled = index === state.photos.length - 1;
    upButton.addEventListener("click", () => {
      if (index === 0) return;
      [state.photos[index - 1], state.photos[index]] = [state.photos[index], state.photos[index - 1]];
      update();
    });
    downButton.addEventListener("click", () => {
      if (index === state.photos.length - 1) return;
      [state.photos[index], state.photos[index + 1]] = [state.photos[index + 1], state.photos[index]];
      update();
    });
    removeButton.addEventListener("click", () => {
      URL.revokeObjectURL(photo.url);
      state.photos.splice(index, 1);
      if (!currentTemplate().counts.includes(photoCount())) state.templateId = bestTemplate().id;
      update();
    });
    elements.photoList.appendChild(item);
  });
}

function addTextBlock() {
  const block = {
    id: `text-${Date.now()}`,
    text: elements.freeTextInput.value || "Titre de la formation",
    x: 140,
    y: 170,
    size: Number(elements.freeTextSize.value) || 42,
    color: elements.freeTextColor.value || "#ffffff",
    box: elements.freeTextBox.checked,
  };
  state.textBlocks.push(block);
  selectTextBlock(block.id);
  update();
}

function renderTextList() {
  elements.freeTextList.innerHTML = "";
  state.textBlocks.forEach((block) => {
    const item = document.createElement("div");
    item.className = "free-text-item";
    item.classList.toggle("is-active", block.id === state.selectedTextId);
    item.innerHTML = `
      <span title="${escapeHtml(block.text)}">${escapeHtml(block.text)}</span>
      <button class="icon-button remove" type="button" title="Retirer">x</button>
    `;
    item.addEventListener("click", () => selectTextBlock(block.id));
    item.querySelector("button").addEventListener("click", (event) => {
      event.stopPropagation();
      state.textBlocks = state.textBlocks.filter((itemBlock) => itemBlock.id !== block.id);
      if (state.selectedTextId === block.id) state.selectedTextId = state.textBlocks[0]?.id || null;
      syncTextControls();
      update();
    });
    elements.freeTextList.appendChild(item);
  });
}

function selectTextBlock(id) {
  state.selectedTextId = id;
  syncTextControls();
  renderTextList();
  draw();
}

function selectedTextBlock() {
  return state.textBlocks.find((block) => block.id === state.selectedTextId) || null;
}

function syncTextControls() {
  const block = selectedTextBlock();
  if (!block) return;
  elements.freeTextInput.value = block.text;
  elements.freeTextSize.value = block.size;
  elements.freeTextColor.value = block.color;
  elements.freeTextBox.checked = block.box;
}

function updateSelectedText() {
  const block = selectedTextBlock();
  if (!block) return;
  block.text = elements.freeTextInput.value;
  block.size = Number(elements.freeTextSize.value) || 42;
  block.color = elements.freeTextColor.value;
  block.box = elements.freeTextBox.checked;
  renderTextList();
  draw();
}

function update() {
  renderPhotoList();
  renderTextList();
  updateTemplateCards();
  draw();
}

function updateTemplateCards() {
  const count = photoCount();
  const current = currentTemplate();
  elements.locationSection.hidden = current.kind !== "location";
  document.querySelectorAll(".template-card").forEach((button) => {
    const template = templates.find((item) => item.id === button.dataset.template);
    const available = template.counts.includes(count);
    button.disabled = !available && count > 0;
    button.style.opacity = available || count === 0 ? "1" : "0.4";
    button.classList.toggle("is-active", template.id === current.id);
  });
  elements.templateHint.textContent = current.kind === "location" ? current.name : `${current.name} - ${count || 1} photo${count > 1 ? "s" : ""}`;
}

function draw(options = {}) {
  const showSelection = options.showSelection !== false;
  const theme = themes[state.theme];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, 1080, 1080);

  drawBackgroundMarks(theme);

  const count = photoCount();
  const template = currentTemplate();

  if (template.kind === "location") {
    drawLocationTemplate(theme, showSelection);
    drawRucheLogo();
    drawTextBlocks(theme, showSelection);
    return;
  }

  if (template.kind === "poster") {
    drawPosterTemplate(theme, showSelection);
    drawRucheLogo();
    drawTextBlocks(theme, showSelection);
    return;
  }
  if (template.kind === "circles") {
    drawCircleTemplate(theme, showSelection);
    drawRucheLogo();
    drawTextBlocks(theme, showSelection);
    return;
  }

  const rects = template.layout(Math.max(count, 1));

  if (count === 0) {
    drawEmptyPlaceholder(rects[0], theme);
  } else {
    state.photos.slice(0, rects.length).forEach((photo, index) => {
      drawImageCover(photo.image, visualRect(rects[index], `photo-${index}`), 24);
    });
  }

  if (template.id === "feature") drawMarianne(isMosaicLayout() ? 64 : 59, isMosaicLayout() ? 30 : 35, 132, 48, "marianne");
  drawFooter(theme, "footer");
  drawRucheLogo();
  if (showSelection) drawImageResizeHandle(theme);
  drawTextBlocks(theme, showSelection);
}

function locationProjection() {
  const coordinates = [state.location.longitude, state.location.latitude];
  const center = d3.geoDistance([135, 15], coordinates) < Math.PI / 2 - 0.12 ? [135, 15] : coordinates;
  const projection = d3.geoOrthographic().rotate([-center[0], -center[1]]).scale(315).translate([960, 505]).clipAngle(90);
  if (projection(coordinates)[0] > 1040) projection.rotate([-coordinates[0], -coordinates[1]]);
  return projection;
}

function locationLabelLayout() {
  const [pointX, pointY] = locationProjection()([state.location.longitude, state.location.latitude]);
  const left = pointX > 850;
  const width = Math.min(300, left ? pointX - 24 - 642.5 : 1060 - pointX - 24);
  const text = state.location.label.trim();
  const lines = text ? getTextLines(text, 26, width) : [];
  const height = lines.length * 30;
  const x = left ? pointX - 24 - width : pointX + 24;
  const y = clamp(pointY - height / 2, 187.5, 822.5 - height);
  const globe = applyElementTransform(rectElement("location-globe", 622.5, 167.5, 675, 675, true));
  const scale = globe.w / 675;
  return {
    x: globe.x + (x - 622.5) * scale,
    y: globe.y + (y - 167.5) * scale,
    w: width * scale,
    h: height * scale,
    size: 26 * scale,
    lineHeight: 30 * scale,
    lines,
    left,
  };
}

function formationActionLayout() {
  const lines = formationActions.filter(([key]) => state.locationActions[key]).flatMap(([, label]) => getTextLines(label, 24, 552));
  ctx.save();
  ctx.font = "900 24px system-ui, sans-serif";
  const width = Math.ceil(Math.max(0, ...lines.map((line) => ctx.measureText(line).width))) + 48;
  ctx.restore();
  const height = lines.length * 32 + 32;
  const layout = locationTitleLayout();
  const lastRow = layout.meta.at(-1) || layout.title.at(-1);
  const title = applyElementTransform(rectElement("location-title", 70, 132, 940, 170, true));
  const scale = title.w / 940;
  const x = title.x + ((lastRow?.x ?? 70) - 70) * scale;
  const y = title.y + ((lastRow ? lastRow.y + lastRow.size * 0.25 : 184) - 132) * scale + 16;
  return { x, y, w: width, h: height, lines };
}

function locationTextSpan(baseline, size) {
  const text = applyElementTransform(rectElement("location-title", 70, 132, 940, 170, true));
  const globe = applyElementTransform(rectElement("location-globe", 622.5, 167.5, 675, 675, true));
  const scale = text.w / 940;
  const radius = 315 * globe.w / 675;
  const centerX = globe.x + globe.w / 2;
  const centerY = globe.y + globe.h / 2;
  const top = text.y + (baseline - size - 132) * scale;
  const bottom = text.y + (baseline + size * 0.25 - 132) * scale;
  const distance = Math.abs(clamp(centerY, top, bottom) - centerY);
  if (distance >= radius) return { x: 70, width: 940 };
  const halfWidth = Math.sqrt(radius * radius - distance * distance);
  const leftWidth = Math.max(0, Math.min(text.w, centerX - halfWidth - 24 - text.x));
  const rightX = Math.max(text.x, centerX + halfWidth + 24);
  const rightWidth = Math.max(0, text.x + text.w - rightX);
  return leftWidth >= rightWidth
    ? { x: 70, width: leftWidth / scale }
    : { x: 70 + (rightX - text.x) / scale, width: rightWidth / scale };
}

function flowLocationText(text, size, baseline, lineHeight, weight) {
  ctx.save();
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  const rows = [];
  for (const paragraph of text.split(/\r\n|\r|\n/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      baseline += lineHeight;
      continue;
    }
    while (words.length) {
      let span = locationTextSpan(baseline, size);
      while (span.width < size && baseline < 4000) {
        baseline += lineHeight;
        span = locationTextSpan(baseline, size);
      }
      let line = "";
      while (words.length) {
        const candidate = line ? `${line} ${words[0]}` : words[0];
        if (ctx.measureText(candidate).width > span.width) break;
        line = candidate;
        words.shift();
      }
      if (!line) {
        const characters = Array.from(words.shift());
        while (characters.length && ctx.measureText(line + characters[0]).width <= span.width) line += characters.shift();
        if (characters.length) words.unshift(characters.join(""));
      }
      rows.push({ text: line, x: span.x, y: baseline, width: ctx.measureText(line).width, size });
      baseline += lineHeight;
    }
  }
  ctx.restore();
  return rows;
}

function locationTitleLayout() {
  const title = flowLocationText(state.title || "Formation des personnels", 52, 184, 58.24, "900");
  const metaY = (title.at(-1)?.y ?? 184) + 36;
  const meta = state.showMeta ? flowLocationText(state.meta || "Date et lieu", 26, metaY, 30, "800") : [];
  return { title, meta };
}

function drawLocationTemplate(theme, showSelection) {
  drawMarianne(876, 48, 132, 48, "marianne");
  drawResizableElement("location-globe", () => {
    const projection = locationProjection();
    const path = d3.geoPath(projection, ctx);
    ctx.beginPath();
    path({ type: "Sphere" });
    ctx.fillStyle = "#e9f2fa";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    path(window.STUDIO_IRF_LAND);
    ctx.fillStyle = theme.ink;
    ctx.fill();
    ctx.beginPath();
    path(d3.geoGraticule10());
    ctx.strokeStyle = "rgba(83,103,159,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
    const marker = { type: "Point", coordinates: [state.location.longitude, state.location.latitude] };
    ctx.beginPath();
    path.pointRadius(14)(marker);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.beginPath();
    path.pointRadius(9)(marker);
    ctx.fillStyle = state.locationLabelColor;
    ctx.fill();
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });
  const label = locationLabelLayout();
  if (label.lines.length) drawResizableElement("location-label", () => {
    ctx.textAlign = label.left ? "right" : "left";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${label.size}px system-ui, sans-serif`;
    ctx.fillStyle = state.locationLabelColor;
    label.lines.forEach((line, index) => {
      const x = label.left ? label.x + label.w : label.x;
      const y = label.y + label.lineHeight * (index + 0.5);
      ctx.fillText(line, x, y);
    });
  });
  drawResizableElement("location-title", () => {
    const layout = locationTitleLayout();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px system-ui, sans-serif";
    layout.title.forEach((row) => ctx.fillText(row.text, row.x, row.y));
    ctx.fillStyle = theme.accent;
    ctx.font = "800 26px system-ui, sans-serif";
    layout.meta.forEach((row) => ctx.fillText(row.text, row.x, row.y));
  });
  drawLogoCluster(818, 984, theme, "logo-cluster");
  const actions = formationActionLayout();
  if (actions.lines.length) drawResizableElement("formation-actions", () => {
    ctx.fillStyle = theme.accent;
    roundedRect(actions.x, actions.y, actions.w, actions.h, 8);
    ctx.fill();
    ctx.fillStyle = theme.ink;
    ctx.font = "900 24px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    actions.lines.forEach((line, index) => ctx.fillText(line, actions.x + 24, actions.y + 32 + index * 32));
  });
  if (showSelection) drawImageResizeHandle(theme);
}

function drawPosterTemplate(theme, showSelection = true) {
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, 1080, 90);
  drawMarianne(876, 66, 132, 48, "marianne");

  const title = state.title || "Formation des personnels";
  const titlePoint = offsetPoint(94, 610, "poster-title");
  wrapText(title, titlePoint.x, titlePoint.y, 640, 64, 68, "#ffffff", "900");
  const metaY = titlePoint.y + (Math.min(getTextLines(title, 64, 640).length, 4) - 1) * 68 + 44;
  if (state.showMeta) wrapText(state.meta || "Date et lieu", titlePoint.x + 4, metaY, 620, 30, 36, theme.accent, "900");
  const photo = state.photos[0];
  const posterPhoto = visualCircle(888, 480, 384, "photo-0");
  if (photo) drawCircleImage(photo.image, posterPhoto.cx, posterPhoto.cy, posterPhoto.radius);

  drawResizableElement("poster-irf", () => {
    drawIrfWord(154, 420, 176, theme.accent);
  });

  drawResizableElement("labels-group", () => {
    drawAngledLabel("L'ENSEIGNEMENT", 146, 190, 214, 38, -11, theme.accent, "#101820");
    drawAngledLabel("FRANCAIS", 178, 236, 160, 38, -4, "#b7d7ec", "#ffffff");
    drawAngledLabel("A L'ETRANGER", 196, 276, 190, 38, -7, "#69b69a", "#101820");
  });

  drawLogoCluster(818, 984, theme, "logo-cluster");
  if (showSelection) drawImageResizeHandle(theme);
}

function drawCircleTemplate(theme, showSelection = true) {
  drawMarianne(876, 66, 132, 48, "marianne");

  const firstCircle = visualCircle(192, 238, 346, "photo-0");
  const secondCircle = visualCircle(792, 828, 370, "photo-1");
  if (state.photos[0]) drawCircleImage(state.photos[0].image, firstCircle.cx, firstCircle.cy, firstCircle.radius);
  else drawCirclePlaceholder(firstCircle.cx, firstCircle.cy, firstCircle.radius, theme);
  if (state.photos[1]) drawCircleImage(state.photos[1].image, secondCircle.cx, secondCircle.cy, secondCircle.radius);
  else drawCirclePlaceholder(secondCircle.cx, secondCircle.cy, secondCircle.radius, theme);

  state.photos.slice(2, 5).forEach((photo, index) => {
    const point = visualCircle(212 + index * 130, 780 + (index % 2) * 70, 80, `photo-${index + 2}`);
    drawCircleImage(photo.image, point.cx, point.cy, point.radius);
  });

  drawLogoCluster(24, 984, theme, "logo-cluster");
  if (showSelection) drawImageResizeHandle(theme);
}

function drawBackgroundMarks(theme) {
  ctx.save();
  ctx.strokeStyle = theme.ghost;
  ctx.globalAlpha = state.theme === "ink" ? 0.34 : 0.22;
  ctx.lineWidth = 5;
  ctx.font = "900 italic 420px Arial Black, Impact, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.strokeText("IRF", -18, 350);
  ctx.font = "900 italic 360px Arial Black, Impact, system-ui, sans-serif";
  ctx.strokeText("ZAP", 122, 1068);
  ctx.globalAlpha = 1;
  if (!isMosaicLayout()) {
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, 0, 1080, 18);
  }
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 862, 1080, 18);
  ctx.restore();
}

function drawEmptyPlaceholder(rect, theme) {
  roundedRect(rect.x, rect.y, rect.w, rect.h, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#cddbe4";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = theme.muted;
  ctx.font = "700 34px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Ajoutez vos photographies", rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function drawFooter(theme, elementId) {
  const offset = getElementOffset(elementId);
  const footerY = 900;
  const footerHeight = isMosaicLayout() ? 130 : 140;
  ctx.fillStyle = theme.cream;
  roundedRect(70 + offset.x, footerY + offset.y, 940, footerHeight, 22);
  ctx.fill();

  ctx.fillStyle = theme.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const title = state.title || "Formation des personnels";
  const titleHeight = footerHeight - 40 - (state.showMeta ? 41 : 0);
  let titleSize = 36;
  let titleLines;
  let titleLineHeight;
  do {
    titleLines = title.split(/\r?\n/).flatMap((paragraph) => paragraph.trim() ? getTextLines(paragraph, titleSize, 560) : [""]);
    titleLineHeight = titleSize * 1.12;
    ctx.font = `900 ${titleSize}px system-ui, sans-serif`;
    if (titleLines.length * titleLineHeight <= titleHeight && titleLines.every((line) => ctx.measureText(line).width <= 560)) break;
    titleSize -= 1;
  } while (titleSize > 1);
  const titleTop = footerY + 20 + offset.y;
  ctx.font = `900 ${titleSize}px system-ui, sans-serif`;
  titleLines.forEach((line, index) => {
    ctx.fillText(line, 108 + offset.x, titleTop + titleSize + index * titleLineHeight);
  });

  ctx.fillStyle = theme.muted;
  ctx.font = "700 23px system-ui, sans-serif";
  const metaY = titleTop + titleLines.length * titleLineHeight + 26;
  if (state.showMeta) fitText(state.meta || "Date et lieu", 108 + offset.x, metaY, 560, 23, theme.muted);

  if (state.showAefeLogo && state.logos.aefe) {
    drawLogo(state.logos.aefeOriginal || state.logos.aefe, 677 + offset.x, 926.4 + offset.y, 136, 83.2);
  }
  if (state.showZoneLogo && state.logos.zone) {
    drawLogo(state.logos.zone, 840 + offset.x, 934 + offset.y, 130, 68);
  }
}

function drawLogo(image, x, y, w, h, background = null) {
  ctx.save();
  const ratio = Math.min(w / image.width, h / image.height);
  const dw = image.width * ratio;
  const dh = image.height * ratio;
  const left = x + (w - dw) / 2;
  const top = y + (h - dh) / 2;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(left - 6, top - 6, dw + 12, dh + 12);
  }
  ctx.drawImage(image, left, top, dw, dh);
  ctx.restore();
}

function getLogoMask(image, color) {
  const cached = logoMaskCache.get(image);
  if (cached?.color === color) return cached.canvas;

  const mask = document.createElement("canvas");
  mask.width = image.naturalWidth || image.width;
  mask.height = image.naturalHeight || image.height;
  const maskCtx = mask.getContext("2d");
  maskCtx.drawImage(image, 0, 0, mask.width, mask.height);
  maskCtx.globalCompositeOperation = "source-in";
  maskCtx.fillStyle = color;
  maskCtx.fillRect(0, 0, mask.width, mask.height);
  maskCtx.globalCompositeOperation = "source-over";
  logoMaskCache.set(image, { color, canvas: mask });
  return mask;
}

function drawTextBlocks(theme, showSelection = true) {
  state.textBlocks.forEach((block) => {
    const metrics = measureTextBlock(block);
    if (block.box) {
      ctx.fillStyle = block.color === "#ffffff" ? "rgba(40,49,120,0.82)" : "rgba(255,255,255,0.92)";
      roundedRect(metrics.x - 24, metrics.top - 12, metrics.width + 48, metrics.height + 24, 18);
      ctx.fill();
    }
    ctx.fillStyle = block.color;
    ctx.font = `900 ${block.size}px system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    metrics.lines.forEach((line, index) => {
      ctx.fillText(line, block.x, block.y + index * metrics.lineHeight);
    });
  });
}

function startTextDrag(event) {
  const point = canvasPoint(event);
  const hit = hitTextBlock(point.x, point.y);
  if (hit) {
    selectTextBlock(hit.id);
    state.draggingText = {
      id: hit.id,
      offsetX: point.x - hit.x,
      offsetY: point.y - hit.y,
    };
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  const resizeHit = hitResizeHandle(point.x, point.y);
  if (resizeHit) {
    state.selectedElementId = resizeHit.id;
    state.resizingElement = {
      id: resizeHit.id,
      startX: point.x,
      startY: point.y,
      startScale: getElementScale(resizeHit.id),
      baseSize: Math.max(resizeHit.baseW, resizeHit.baseH),
    };
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  const elementHit = hitTemplateElement(point.x, point.y);
  if (!elementHit) return;
  state.selectedElementId = elementHit.id;
  state.draggingElement = {
    id: elementHit.id,
    offsetX: point.x - elementHit.x,
    offsetY: point.y - elementHit.y,
  };
  canvas.setPointerCapture(event.pointerId);
  draw();
}

function moveTextDrag(event) {
  const point = canvasPoint(event);
  if (state.draggingText) {
    const block = state.textBlocks.find((item) => item.id === state.draggingText.id);
    if (!block) return;
    block.x = clamp(point.x - state.draggingText.offsetX, 28, 1000);
    block.y = clamp(point.y - state.draggingText.offsetY, 42, 1040);
    draw();
    return;
  }
  if (state.draggingElement) {
    setElementPosition(state.draggingElement.id, point.x - state.draggingElement.offsetX, point.y - state.draggingElement.offsetY);
    draw();
    return;
  }
  if (state.resizingElement) {
    const deltaX = state.resizingElement.startX - point.x;
    const deltaY = point.y - state.resizingElement.startY;
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    setElementScale(state.resizingElement.id, state.resizingElement.startScale + delta / state.resizingElement.baseSize);
    draw();
    return;
  }
}

function stopTextDrag() {
  state.draggingText = null;
  state.draggingElement = null;
  state.resizingElement = null;
}

function hitTextBlock(x, y) {
  for (let index = state.textBlocks.length - 1; index >= 0; index -= 1) {
    const block = state.textBlocks[index];
    const metrics = measureTextBlock(block);
    if (x >= metrics.x - 28 && x <= metrics.x + metrics.width + 28 && y >= metrics.top - 12 && y <= metrics.top + metrics.height + 12) {
      return block;
    }
  }
  return null;
}

function hitTemplateElement(x, y) {
  const hitList = currentTemplateElements();
  for (let index = hitList.length - 1; index >= 0; index -= 1) {
    const item = hitList[index];
    if (item.textRows && !item.textRows.some((row) => x >= row.x - 6 && x <= row.x + row.w + 6 && y >= row.y && y <= row.y + row.h)) continue;
    if (x >= item.x && x <= item.x + item.w && y >= item.y && y <= item.y + item.h) {
      return item;
    }
  }
  return null;
}

function hitResizeHandle(x, y) {
  const selected = currentTemplateElements().find((item) => item.id === state.selectedElementId && item.resizable);
  if (!selected) return null;
  const handle = resizeHandleRect(selected);
  if (x >= handle.x && x <= handle.x + handle.w && y >= handle.y && y <= handle.y + handle.h) return selected;
  return null;
}

function drawImageResizeHandle(theme) {
  const selected = currentTemplateElements().find((item) => item.id === state.selectedElementId && item.resizable);
  if (!selected) return;
  const handle = resizeHandleRect(selected);
  ctx.save();
  ctx.fillStyle = theme.accent;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  roundedRect(handle.x, handle.y, handle.w, handle.h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function resizeHandleRect(item) {
  return { x: item.x - 6, y: item.y + item.h - 22, w: 28, h: 28 };
}

function currentTemplateElements() {
  const items = rawTemplateElements();
  if (state.showRucheLogo) items.push(rectElement("ruche-logo", 890, 140, 112, 126, true));
  return items.map((item) => {
    const transformed = applyElementTransform(item);
    if (item.id === "location-title") {
      const layout = locationTitleLayout();
      const scale = transformed.w / item.w;
      transformed.textRows = [...layout.title, ...layout.meta].map((row) => ({
        x: transformed.x + (row.x - item.x) * scale,
        y: transformed.y + (row.y - row.size - item.y) * scale,
        w: row.width * scale,
        h: row.size * 1.25 * scale,
      }));
      transformed.h = Math.max(transformed.h, ...transformed.textRows.map((row) => row.y + row.h - transformed.y));
    }
    return transformed;
  });
}

function rawTemplateElements() {
  const template = currentTemplate();
  if (template.kind === "location") {
    const label = locationLabelLayout();
    const actions = formationActionLayout();
    return [
      rectElement("marianne", 876, 48, 132, 48),
      rectElement("location-globe", 622.5, 167.5, 675, 675, true),
      ...(label.lines.length ? [rectElement("location-label", label.x, label.y, label.w, label.h, true)] : []),
      rectElement("location-title", 70, 132, 940, 170, true),
      rectElement("logo-cluster", 818, 972, 238, 82),
      ...(actions.lines.length ? [rectElement("formation-actions", actions.x, actions.y, actions.w, actions.h)] : []),
    ];
  }
  if (template.kind === "poster") {
    return [
      rectElement("marianne", 876, 66, 132, 48),
      rectElement("poster-title", 94, 548, 640, 280),
      circleElement("photo-0", 888, 480, 384, true),
      rectElement("poster-irf", 154, 272, 360, 170, true),
      rectElement("labels-group", 132, 172, 282, 150, true),
      rectElement("logo-cluster", 818, 972, 238, 82),
    ];
  }
  if (template.kind === "circles") {
    const items = [
      rectElement("marianne", 876, 66, 132, 48),
      circleElement("photo-0", 192, 238, 346, true),
      circleElement("photo-1", 792, 828, 370, true),
      rectElement("logo-cluster", 24, 972, 238, 82),
    ];
    state.photos.slice(2, 5).forEach((photo, index) => {
      items.push(circleElement(`photo-${index + 2}`, 212 + index * 130, 780 + (index % 2) * 70, 80, true));
    });
    return items;
  }

  const rects = template.layout(Math.max(photoCount(), 1)).map((rect, index) => rectElement(`photo-${index}`, rect.x, rect.y, rect.w, rect.h, true));
  if (template.id === "feature") rects.push(rectElement("marianne", isMosaicLayout() ? 64 : 59, isMosaicLayout() ? 30 : 35, 132, 48));
  rects.push(rectElement("footer", 70, 900, 940, isMosaicLayout() ? 130 : 140));
  return rects;
}

function rectElement(id, x, y, w, h, resizable = false) {
  return { id, x, y, w, h, resizable, shape: "rect" };
}

function drawResizableElement(elementId, render) {
  const base = baseElement(elementId);
  const rect = applyElementTransform(base);
  ctx.save();
  ctx.translate(rect.x, rect.y);
  ctx.scale(rect.w / base.w, rect.h / base.h);
  ctx.translate(-base.x, -base.y);
  render();
  ctx.restore();
}

function circleElement(id, cx, cy, radius, resizable = false) {
  return { id, x: cx - radius, y: cy - radius, w: radius * 2, h: radius * 2, cx, cy, radius, resizable, shape: "circle" };
}

function applyElementTransform(item) {
  const offset = getElementOffset(item.id);
  const scale = item.resizable ? getElementScale(item.id) : 1;
  const w = item.w * scale;
  const h = item.h * scale;
  const x = item.x + item.w / 2 + offset.x - w / 2;
  const y = item.y + item.h / 2 + offset.y - h / 2;
  const transformed = { ...item, x, y, w, h, baseX: item.x, baseY: item.y, baseW: item.w, baseH: item.h };
  if (item.shape === "circle") {
    transformed.radius = item.radius * scale;
    transformed.cx = item.cx + offset.x;
    transformed.cy = item.cy + offset.y;
  }
  return transformed;
}

function offsetRect(rect, elementId) {
  return visualRect(rect, elementId);
}

function visualRect(rect, elementId) {
  return applyElementTransform({ id: elementId, x: rect.x, y: rect.y, w: rect.w, h: rect.h, resizable: true, shape: "rect" });
}

function visualCircle(cx, cy, radius, elementId) {
  return applyElementTransform({ id: elementId, x: cx - radius, y: cy - radius, w: radius * 2, h: radius * 2, cx, cy, radius, resizable: true, shape: "circle" });
}

function offsetPoint(x, y, elementId) {
  const offset = getElementOffset(elementId);
  return { x: x + offset.x, y: y + offset.y };
}

function getElementOffset(elementId) {
  if (!elementId) return { x: 0, y: 0 };
  return state.elementOffsets[elementOffsetKey(elementId)] || { x: 0, y: 0 };
}

function getElementScale(elementId) {
  if (!elementId) return 1;
  return state.elementScales[elementOffsetKey(elementId)] || 1;
}

function setElementScale(elementId, scale) {
  state.elementScales[elementOffsetKey(elementId)] = clamp(scale, 0.35, 2.4);
}

function setElementPosition(elementId, x, y) {
  const base = baseElement(elementId);
  if (!base) return;
  const scale = getElementScale(elementId);
  state.elementOffsets[elementOffsetKey(elementId)] = {
    x: clamp(x + (base.w * scale) / 2 - (base.x + base.w / 2), -900, 900),
    y: clamp(y + (base.h * scale) / 2 - (base.y + base.h / 2), -900, 900),
  };
}

function baseElement(elementId) {
  if (elementId === "ruche-logo") return rectElement("ruche-logo", 890, 140, 112, 126, true);
  return rawTemplateElements()
    .find((item) => item.id === elementId);
}

function elementOffsetKey(elementId) {
  return `${currentTemplate().id}:${elementId}`;
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function measureTextBlock(block) {
  ctx.save();
  ctx.font = `900 ${block.size}px system-ui, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const lines = (block.text || "Texte").split(/\r\n|\r|\n/).flatMap((paragraph) => paragraph.trim() ? getTextLines(paragraph, block.size, 640) : [""]);
  const lineHeight = block.size * 1.12;
  const measurements = lines.map((line) => ctx.measureText(line || "Mg"));
  const width = Math.max(...measurements.map((measurement, index) => lines[index] ? measurement.width : 0), 1);
  const top = block.y + Math.min(...measurements.map((measurement, index) => index * lineHeight - (measurement.actualBoundingBoxAscent ?? block.size * 0.8)));
  const bottom = block.y + Math.max(...measurements.map((measurement, index) => index * lineHeight + (measurement.actualBoundingBoxDescent ?? block.size * 0.2)));
  ctx.restore();
  return {
    x: block.x,
    y: block.y,
    width,
    top,
    height: bottom - top,
    lines,
    lineHeight,
  };
}

function getTextLines(text, size, maxWidth) {
  ctx.save();
  ctx.font = `900 ${size}px system-ui, sans-serif`;
  const words = (text || "Texte").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  ctx.restore();
  return lines.length ? lines : ["Texte"];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function drawRucheLogo() {
  if (!state.showRucheLogo || !state.logos.ruche) return;
  const rect = applyElementTransform(baseElement("ruche-logo"));
  ctx.save();
  ctx.translate(rect.x, rect.y);
  ctx.scale(rect.w / 558, rect.h / 628);
  // Clip the original artwork to its hexagon, keeping the logo intact.
  ctx.beginPath();
  ctx.moveTo(277, 0);
  ctx.lineTo(555, 143);
  ctx.lineTo(558, 482);
  ctx.lineTo(280, 628);
  ctx.lineTo(3, 487);
  ctx.lineTo(0, 146);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(state.logos.ruche, 408, 214, 558, 628, 0, 0, 558, 628);
  ctx.restore();
}

function drawLogoCluster(x, y, theme, elementId) {
  const point = offsetPoint(x, y, elementId);
  if (["poster", "location", "circles"].includes(currentTemplate().id)) {
    if (state.showZoneLogo && state.logos.zone) drawLogo(state.logos.zone, point.x, point.y, 116, 66);
    if (state.showAefeLogo && state.logos.aefe) drawLogo(state.logos.aefe, point.x + 138, point.y - 12, 100, 82);
    return;
  }
  const aefeOffset = ["poster", "location", "circles"].includes(currentTemplate().id) ? 110 : 140;
  if (state.showZoneLogo && state.logos.zone) drawLogo(state.logos.zone, point.x, point.y, 116, 66);
  if (state.showAefeLogo && state.logos.aefe) drawLogo(state.logos.aefe, point.x + aefeOffset, point.y - 14, 154, 100);
}

function drawMarianne(x, y, w, h, elementId) {
  if (!state.showMarianne) return;
  if (!state.logos.marianne) return;
  const point = offsetPoint(x, y, elementId);
  ctx.save();
  ctx.fillStyle = "#ffffff";
  roundedRect(point.x - 5, point.y - 5, w + 10, h + 10, 4);
  ctx.fill();
  drawLogo(state.logos.marianne, point.x, point.y, w, h);
  ctx.restore();
}

function drawIrfWord(x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `900 italic ${size}px Arial Black, Impact, system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("IRF", x, y);
  ctx.restore();
}

function drawYellowPill(x, y, w, h, text, theme) {
  ctx.save();
  ctx.fillStyle = theme.accent;
  roundedRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  wrapText(text, x + 48, y + 44, w - 96, 28, 34, "#ffffff", "900", "center");
  ctx.restore();
}

function drawAngledLabel(text, x, y, w, h, angle, bg, color) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillStyle = bg;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = color;
  ctx.font = "900 23px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, 0, 9);
  ctx.restore();
}

function drawTapeStrip(x, y, w, h, angle) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawRotatedPhoto(image, rect, angle, radius) {
  ctx.save();
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-rect.w / 2 - 14, -rect.h / 2 - 14, rect.w + 28, rect.h + 28);
  drawImageCover(image, { x: -rect.w / 2, y: -rect.h / 2, w: rect.w, h: rect.h }, radius);
  ctx.restore();
}

function drawCircleImage(image, cx, cy, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  drawImageCover(image, { x: cx - radius, y: cy - radius, w: radius * 2, h: radius * 2 }, 0);
  ctx.restore();
}

function drawCirclePlaceholder(cx, cy, radius, theme) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.fillStyle = theme.muted;
  ctx.font = "800 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Photo", cx, cy + 8);
  ctx.restore();
}

function drawZoneMark(x, y, theme) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.ellipse(x, y, 158, 64, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.bg;
  ctx.font = "900 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ASIE-PACIFIQUE", x, y + 8);
  ctx.restore();
}

function fitText(text, x, y, maxWidth, baseSize, fill) {
  let size = baseSize;
  ctx.fillStyle = fill;
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 18) {
    size -= 2;
    ctx.font = `800 ${size}px system-ui, sans-serif`;
  }
  ctx.fillText(text, x, y);
}

function wrapText(text, x, y, maxWidth, baseSize, lineHeight, fill, weight = "800", align = "left") {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.font = `${weight} ${baseSize}px system-ui, sans-serif`;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  const textX = align === "center" ? x + maxWidth / 2 : x;
  lines.slice(0, 4).forEach((item, index) => ctx.fillText(item, textX, y + index * lineHeight));
}

function drawImageCover(image, rect, radius) {
  ctx.save();
  roundedRect(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.clip();
  ctx.fillStyle = "#e5edf2";
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const scale = Math.max(rect.w / image.width, rect.h / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.drawImage(image, rect.x + (rect.w - width) / 2, rect.y + (rect.h - height) / 2, width, height);
  ctx.restore();
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function isMosaicLayout() {
  return currentTemplate().id === "feature" && photoCount() > 1;
}

function currentTemplate() {
  const count = photoCount();
  const selected = templates.find((template) => template.id === state.templateId);
  if (selected && (count === 0 || selected.counts.includes(count))) return selected;
  return bestTemplate();
}

function bestTemplate() {
  const count = photoCount();
  return templates.find((template) => template.counts.includes(Math.max(count, 1))) || templates[0];
}

function photoCount() {
  return state.photos.length;
}

function stackRects(count, x, y, w, h, gap) {
  const height = (h - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, index) => ({ x, y: y + index * (height + gap), w, h: height }));
}

function gridRects(cols, rows, x, y, w, h, gap) {
  const cellW = (w - gap * (cols - 1)) / cols;
  const cellH = (h - gap * (rows - 1)) / rows;
  return Array.from({ length: cols * rows }, (_, index) => ({
    x: x + (index % cols) * (cellW + gap),
    y: y + Math.floor(index / cols) * (cellH + gap),
    w: cellW,
    h: cellH,
  }));
}

function twoColumns(x = 70, y = 92, w = 940, h = 760) {
  return gridRects(2, 1, x, y, w, h, 16);
}

function twoRows() {
  return gridRects(1, 2, 70, 112, 940, 704, 16);
}

function readPhoto(file) {
  const url = URL.createObjectURL(file);
  return loadImage(url).then((image) => ({ name: file.name, url, image }));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function assetUrl(path) {
  return `${path}?v=${ASSET_VERSION}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

init();
