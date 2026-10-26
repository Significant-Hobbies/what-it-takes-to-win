// Content-free exposure events for the six static explanations on /insights/.
// Opening every explanation is an exposure proxy, not evidence of reading or comprehension.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var section = document.querySelector('[data-clarity-contract="comprehension-check"]');
    if (!section) return;

    var track = function (name) {
      if (window.appHealth && typeof window.appHealth.track === "function") {
        window.appHealth.track(name);
      }
    };

    if (typeof IntersectionObserver === "function") {
      var reached = false;
      var observer = new IntersectionObserver(function (entries) {
        if (!reached && entries.some(function (entry) { return entry.isIntersecting; })) {
          reached = true;
          track("comprehension_reached");
          observer.disconnect();
        }
      });
      observer.observe(section);
    }

    var explanations = Array.from(section.querySelectorAll("details"));
    if (explanations.length === 0) return;

    var opened = new Set();
    var reported = false;
    explanations.forEach(function (explanation, index) {
      explanation.addEventListener("toggle", function () {
        if (explanation.open) opened.add(index);
        if (!reported && opened.size === explanations.length) {
          reported = true;
          track("comprehension_explanations_opened");
        }
      });
    });
  }, { once: true });
})();
