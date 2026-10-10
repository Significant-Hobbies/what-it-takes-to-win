import { galleryContent } from "@saas-maker/templates/schema";
import { studioFromProjects, studioProjectsFeed } from "@saas-maker/ui/footer-html";
import home from "../content/home.json";

const content = galleryContent.parse(home);
if (!content.footer) throw new Error("Paths requires its shared StudioFooter configuration.");

// Resolve once per build so home and inner pages share the same studio strip.
// The committed snapshot keeps offline builds complete.
const snapshot = content.footer.studio?.map(project => ({
  id: project.id, name: project.label, url: project.href,
})) ?? [];
const projects = await fetch(studioProjectsFeed, { signal: AbortSignal.timeout(1000) })
  .then(response => response.ok ? response.json() : snapshot)
  .catch(() => snapshot);

export const footerContent = {
  ...content.footer,
  studio: studioFromProjects(projects, { current: content.footer.catalogId }),
};
