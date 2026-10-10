(function loadPostHog(document, posthog) {
  if (posthog.__SV) return;

  window.posthog = posthog;
  posthog._i = [];
  posthog.init = function init(token, config, name) {
    function stub(target, method) {
      target[method] = function queuePostHogCall() {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    }

    // Keep the queue ready, but let the page paint before fetching analytics.
    let started = false;
    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    function load() {
      if (started) return;
      started = true;
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, load));
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.crossOrigin = "anonymous";
      script.async = true;
      script.src = config.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    }
    events.forEach((event) => window.addEventListener(event, load, { passive: true, once: true }));
    const timer = setTimeout(load, 30000);

    let instance = posthog;
    if (name) instance = posthog[name] = [];
    instance.people = instance.people || [];
    [
      "capture",
      "identify",
      "set_config",
      "opt_in_capturing",
      "opt_out_capturing",
      "has_opted_in_capturing",
      "has_opted_out_capturing",
    ].forEach((method) => stub(instance, method));
    posthog._i.push([token, config, name]);
  };
  posthog.__SV = 1;
})(document, window.posthog || []);

window.posthog.init("phc_qgiAarw4Co4pw9fz3Fxj4UJaHmqzFetqs4JrXhGc35Nd", {
  api_host: "https://us.i.posthog.com",
  person_profiles: "always",
  capture_pageview: false,
  autocapture: false,
  loaded(posthog) {
    posthog.capture("page_view", { project_id: "what-it-takes-to-win" });
  },
});
