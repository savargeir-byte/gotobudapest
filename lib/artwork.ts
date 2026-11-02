// The three shared design artworks (budapest, danube, city) are 2000 px wide and 250-740 KB. Cards and detail
// heroes use the 640 and 1280 px renditions of the SAME artwork (public/assets/<name>-640.webp, -1280.webp);
// the full-size file stays for the home page hero and the share image. Any other file is used as it is.
const SHARED = /^(budapest|danube|city)\.webp$/;

export function assetVariants(file: string): { src640: string; src1280: string } {
  if (SHARED.test(file)) {
    const name = file.replace(".webp", "");
    return { src640: `/assets/${name}-640.webp`, src1280: `/assets/${name}-1280.webp` };
  }
  return { src640: `/assets/${file}`, src1280: `/assets/${file}` };
}
