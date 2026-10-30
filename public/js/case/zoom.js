// Enlarges and shrinks the x-ray.
let isZoomed = false;
let viewerPlaceholder = null;
let zoomBackdropPress = false;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncXrayAspect() {
  if (image.naturalWidth && image.naturalHeight) {
    xrayViewer.style.setProperty("--xray-aspect", String(image.naturalWidth / image.naturalHeight));
  }
}

image.addEventListener("load", syncXrayAspect);
if (image.complete) {
  syncXrayAspect();
}

function updateZoomCaption() {
  if (!zoomCaption) {
    return;
  }

  if (rulerActive) {
    zoomCaption.textContent = "Ruler on: click two points on the x-ray to measure between them.";
  } else if (!questionUnlocked) {
    zoomCaption.textContent = "Drag to draw a box around the most likely lesion, then press Check.";
  } else {
    zoomCaption.textContent = "Shrink the x-ray to answer the question.";
  }
}

function updateZoomTools() {
  zoomCheckBtn.disabled = questionUnlocked;
}

function setZoomToggle(zoomed) {
  const label = zoomed ? "Shrink x-ray" : "Enlarge x-ray";
  zoomToggleIcon.src = zoomed ? "images/icons/shrink-icon.png" : "images/icons/enlarge-icon.png";
  zoomToggleBtn.setAttribute("aria-label", label);
  zoomToggleBtn.title = label;
}

function animateViewerFrom(firstRect) {
  if (reducedMotionQuery.matches || typeof xrayViewer.animate !== "function") {
    return;
  }

  const lastRect = xrayViewer.getBoundingClientRect();
  if (!lastRect.width) {
    return;
  }

  const dx = firstRect.left - lastRect.left;
  const dy = firstRect.top - lastRect.top;
  const scale = firstRect.width / lastRect.width;

  xrayViewer.animate(
    [
      {transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${scale})`},
      {transformOrigin: "top left", transform: "none"}
    ],
    {duration: 280, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)"}
  );
}

function enlargeXray() {
  if (isZoomed) {
    return;
  }

  syncXrayAspect();
  const firstRect = xrayViewer.getBoundingClientRect();

  viewerPlaceholder = document.createElement("div");
  viewerPlaceholder.className = "viewer-placeholder";
  viewerPlaceholder.style.height = `${firstRect.height}px`;
  xrayViewer.parentNode.insertBefore(viewerPlaceholder, xrayViewer);
  zoomStage.insertBefore(xrayViewer, zoomCaption);

  isZoomed = true;
  xrayViewer.classList.add("is-zoomed");
  document.body.classList.add("zoom-open");
  setZoomToggle(true);
  updateZoomTools();
  updateZoomCaption();

  zoomOverlay.hidden = false;
  window.requestAnimationFrame(function () {
    zoomOverlay.classList.add("is-open");
  });

  animateViewerFrom(firstRect);
  zoomToggleBtn.focus();
}

function shrinkXray() {
  if (!isZoomed) {
    return;
  }

  const firstRect = xrayViewer.getBoundingClientRect();

  isZoomed = false;
  document.body.classList.remove("zoom-open");
  xrayViewer.classList.remove("is-zoomed");
  if (viewerPlaceholder) {
    viewerPlaceholder.replaceWith(xrayViewer);
    viewerPlaceholder = null;
  }
  setZoomToggle(false);

  zoomOverlay.classList.remove("is-open");
  zoomOverlay.hidden = true;

  animateViewerFrom(firstRect);
  zoomToggleBtn.focus();
}

function toggleZoom() {
  if (isZoomed) {
    shrinkXray();
  } else {
    enlargeXray();
  }
}

zoomToggleBtn.addEventListener("click", toggleZoom);
zoomCheckBtn.addEventListener("click", function () {
  checkRegion();
});
zoomClearBtn.addEventListener("click", clearMarkings);
zoomRulerBtn.addEventListener("click", toggleRuler);

zoomOverlay.addEventListener("mousedown", function (event) {
  zoomBackdropPress = event.target === zoomOverlay || event.target === zoomStage;
});
zoomOverlay.addEventListener("click", function (event) {
  if (zoomBackdropPress && (event.target === zoomOverlay || event.target === zoomStage)) {
    shrinkXray();
  }
  zoomBackdropPress = false;
});

document.addEventListener("keydown", function (event) {
  if (!isZoomed || (typeof isResultPopupOpen === "function" && isResultPopupOpen())) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    shrinkXray();
  } else if (event.key === "Tab") {
    const focusable = Array.from(zoomOverlay.querySelectorAll("button:not([disabled])"))
      .filter(function (el) { return el.offsetParent !== null; });
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!zoomOverlay.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
