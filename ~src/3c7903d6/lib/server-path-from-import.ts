import sitemap from "@/shared/sitemap";

export function serverPathFromImport(path: string) {
    return sitemap.public.static.staticAsset({ path }).toString();
}
