/** Tiny blurred previews for bundled photos, shown while the full image loads. Generated from public/images. */
export const BLUR: Record<string, string> = {
  "/images/fava-concept.webp": "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAAAwAgCdASoQAAoAA4BaJbACdAEPh7b9i4uAAAD+thvFuQ3+T+tpJ3cc/7jMOWpNHmLV3bV1J2x67t1Ct1YrDch/rcJYD2XzpoykI8K1uGF/sNKRFd93g3+mZa6U2OfSKLXg5hjoAAA=",
  "/images/flax-concept-back.webp": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoQAAUAA4BaJYwCdAEO+UXU6AD+2CGhcm7XXbgvyEyyaLCzdKmdTUHYtSzs2UPjKPkAAA==",
  "/images/flax-concept-front.webp": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoQAAUAA4BaJaACdAEN5iXfdAAA/uJ9NhfyNL8ph5RHdCXJuNEYuIQW2Hs2pWB/DTGKKQ22KKP7NkaiFK9Dl3rrokdViZBgAAA=",
  "/images/flax-label.webp": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoQAAkAA4BaJQBOgB6QBYmwJOAA/t/aEkxQmqNlXotr1FtSFqiBAR9+Py7Sik8KqAGZVi/yaTfQAA==",
  "/images/flax-photo.webp": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAACwAQCdASoQAAkAA4BaJQBOgCEQ+IHUAPRkmJvWgyv+ZaEZQqNEjIcr+MYOifOtlMsZm7lEICMLd5aGTg2c7DPp72lzF2AA",
  "/images/lentils-concept.webp": "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAACwAQCdASoQAAsAA4BaJbACdACd9+EAAP7rv3idhQA/AZh7jGGxQ1s156JowdWMKeuNqJFABSop818/SHZGUT6YYRqfOl/u3y5j0aBSELc7x6CrGJxqyGEwyl7v6Qh9kRkw9NSNQzYfTC6AAAA=",
  "/images/lentils-label.webp": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAgCdASoQAAgAA4BaJQBOgCIAQT9JXjsAAP6RsqCsabSB7w6s5xhsqGO8rzw49wbnJh/uNROjvc6BSDEj/OSTgAA=",
  "/images/lentils-photo.webp": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoQAAoAA4BaJaACdAEOADR3pDOwAM4sAyQKMdN8EcqKSEGkHkLUDSVhy3gqBFTsieGRMKB9oTxoYhXvguP11EfXYAA="
};

export const blurProps = (src: string) => (BLUR[src] ? { placeholder: "blur" as const, blurDataURL: BLUR[src] } : {});
