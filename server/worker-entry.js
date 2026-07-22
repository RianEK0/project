export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const assetUrl = new URL(request.url);
    const isAssetLikePath =
      assetUrl.pathname === "/" ||
      /\.[a-z0-9]+$/i.test(assetUrl.pathname) ||
      assetUrl.pathname.startsWith("/src/");

    if (assetUrl.pathname === "/") {
      assetUrl.pathname = "/index.html";
    }

    let assetResponse = await env.ASSETS.fetch(new Request(assetUrl, request));

    if (assetResponse.status === 404 && !isAssetLikePath) {
      const fallbackUrl = new URL("/index.html", requestUrl);
      assetResponse = await env.ASSETS.fetch(new Request(fallbackUrl, request));
    }

    return assetResponse;
  },
};
