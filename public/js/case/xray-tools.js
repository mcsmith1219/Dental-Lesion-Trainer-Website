// Selection box and ruler tools on the x-ray.
["mousedown", "click"].forEach(function (eventName) {
  viewerControls.addEventListener(eventName, function (event) {
    event.stopPropagation();
  });
});

xrayViewer.addEventListener("click", function (event) {
  if (!rulerActive) {
    return;
  }

  const rect = xrayViewer.getBoundingClientRect();
  const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
  const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

  addRulerPoint(xPercent, yPercent);
});

xrayViewer.addEventListener("mousedown", function (event) {
  if (rulerActive || questionUnlocked) {
    return;
  }

  event.preventDefault();

  const rect = xrayViewer.getBoundingClientRect();
  const xPercent = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
  const yPercent = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

  clearSelection();

  isDraggingSelection = true;
  dragStartPoint = {x: xPercent, y: yPercent};

  selectionBoxElement = document.createElement("div");
  selectionBoxElement.className = "selection-box";
  xrayViewer.appendChild(selectionBoxElement);

  updateSelectionBox(xPercent, yPercent);
});

document.addEventListener("mousemove", function (event) {
  if (!isDraggingSelection) {
    return;
  }

  const rect = xrayViewer.getBoundingClientRect();
  const xPercent = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
  const yPercent = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

  updateSelectionBox(xPercent, yPercent);
});

document.addEventListener("mouseup", function () {
  if (!isDraggingSelection) {
    return;
  }

  isDraggingSelection = false;

  if (!selectionRegion || selectionRegion.width < 1.5 || selectionRegion.height < 1.5) {
    clearSelection();
  }
});

function clampPercent(value) {
  return Math.min(100, Math.max(0, value));
}

function updateSelectionBox(currentX, currentY) {
  const x = Math.min(dragStartPoint.x, currentX);
  const y = Math.min(dragStartPoint.y, currentY);
  const width = Math.abs(currentX - dragStartPoint.x);
  const height = Math.abs(currentY - dragStartPoint.y);

  selectionRegion = {x: x, y: y, width: width, height: height};

  selectionBoxElement.style.left = `${x}%`;
  selectionBoxElement.style.top = `${y}%`;
  selectionBoxElement.style.width = `${width}%`;
  selectionBoxElement.style.height = `${height}%`;
}

function setRulerActive(active) {
  rulerActive = active;
  rulerBtn.classList.toggle("active", rulerActive);
  zoomRulerBtn.classList.toggle("active", rulerActive);
  zoomRulerBtn.setAttribute("aria-pressed", String(rulerActive));
  updateZoomCaption();
}

function toggleRuler() {
  setRulerActive(!rulerActive);
}

function clearRuler() {
  rulerElements.forEach(function (el) {
    el.remove();
  });
  rulerElements = [];
  rulerPoints = [];
}

function addRulerPoint(xPercent, yPercent) {
  if (rulerPoints.length >= 2) {
    clearRuler();
  }

  const point = {x: xPercent, y: yPercent};
  rulerPoints.push(point);

  const dot = document.createElement("div");
  dot.className = "ruler-point";
  dot.style.left = `${xPercent}%`;
  dot.style.top = `${yPercent}%`;
  xrayViewer.appendChild(dot);
  rulerElements.push(dot);

  if (rulerPoints.length === 2) {
    drawRulerLine();
  }
}

function drawRulerLine() {
  const [p1, p2] = rulerPoints;
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "ruler-svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");

  const line = document.createElementNS(svgNS, "line");
  line.setAttribute("x1", p1.x);
  line.setAttribute("y1", p1.y);
  line.setAttribute("x2", p2.x);
  line.setAttribute("y2", p2.y);
  line.setAttribute("vector-effect", "non-scaling-stroke");
  svg.appendChild(line);

  xrayViewer.appendChild(svg);
  rulerElements.push(svg);

  const imageWidth = image.naturalWidth || xrayViewer.clientWidth;
  const imageHeight = image.naturalHeight || xrayViewer.clientHeight;
  const dx = ((p2.x - p1.x) / 100) * imageWidth;
  const dy = ((p2.y - p1.y) / 100) * imageHeight;
  const distancePx = Math.sqrt(dx * dx + dy * dy);

  const label = document.createElement("div");
  label.className = "ruler-label";
  label.style.left = `${(p1.x + p2.x) / 2}%`;
  label.style.top = `${(p1.y + p2.y) / 2}%`;
  label.textContent = `${Math.round(distancePx)} px`;
  xrayViewer.appendChild(label);
  rulerElements.push(label);
}

function clearMarkings() {
  clearSelection();
  clearRuler();
}
