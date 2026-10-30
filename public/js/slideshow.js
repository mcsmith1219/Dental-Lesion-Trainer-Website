// Home page slideshow.
(function () {
  const frame = document.getElementById("homeSlideshow");
  if (!frame) {
    return;
  }

  const SLIDE_INTERVAL_MS = 5000;
  const FALLBACK_IMAGES = ["./images/train_0.png"];

  let slides = [];
  let activeIndex = 0;

  async function loadImageList() {
    try {
      const response = await fetch("/api/slideshow-images");
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const images = await response.json();
      return Array.isArray(images) && images.length > 0 ? images : FALLBACK_IMAGES;
    } catch (error) {
      console.warn("Slideshow images unavailable, showing the sample x-ray:", error);
      return FALLBACK_IMAGES;
    }
  }

  function createSlide(src) {
    const slide = document.createElement("img");
    slide.className = "home-slide";
    slide.src = src;
    slide.alt = "";
    slide.draggable = false;
    return slide;
  }

  function advance() {
    if (document.hidden || slides.length < 2) {
      return;
    }

    const current = slides[activeIndex];
    activeIndex = (activeIndex + 1) % slides.length;
    const next = slides[activeIndex];

    current.classList.remove("is-active");
    current.classList.add("is-leaving");
    next.classList.add("is-active");

    let parked = false;
    function park() {
      if (parked) {
        return;
      }
      parked = true;
      current.classList.remove("is-leaving");
    }
    current.addEventListener("transitionend", park, {once: true});
    window.setTimeout(park, 800);
  }

  function sizeFrameTo(slide) {
    function apply() {
      if (slide.naturalWidth && slide.naturalHeight) {
        frame.style.setProperty("--slide-aspect", String(slide.naturalWidth / slide.naturalHeight));
      }
    }
    if (slide.complete) {
      apply();
    } else {
      slide.addEventListener("load", apply, {once: true});
    }
  }

  loadImageList().then(function (images) {
    slides = images.map(createSlide);
    sizeFrameTo(slides[0]);
    slides[0].classList.add("is-active");
    frame.replaceChildren(...slides);
    activeIndex = 0;

    if (slides.length > 1) {
      window.setInterval(advance, SLIDE_INTERVAL_MS);
    }
  });
})();
