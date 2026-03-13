import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gao Architect",
    short_name: "Gao Architect",
    description: "Architecture & Design — Client Portal and Portfolio",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#1c1917",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/projects/courtyard-house/ext-front-far.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
      },
    ],
    categories: ["design", "business"],
  };
}
