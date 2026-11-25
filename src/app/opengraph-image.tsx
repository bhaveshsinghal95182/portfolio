import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from "@/lib/og-image";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.roles.join(", ")}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    title: site.name,
    subtitle: `${site.roles.join(" · ")}. Building developer tools, desktop apps and small products.`,
  });
}
