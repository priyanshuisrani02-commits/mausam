import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/account/",
        "/orders/",
        "/checkout/",
        "/cart/",
        "/wishlist/",
        "/search",
      ],
    },
    sitemap: "https://mausamdesigner.com/sitemap.xml",
  };
}
