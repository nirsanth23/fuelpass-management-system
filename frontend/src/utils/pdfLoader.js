/**
 * @file pdfLoader.js
 * @description Dynamic on-demand loader for pdfMake and its embedded virtual fonts.
 * Keeping pdfMake as a dynamic import prevents bundling >1.5MB of font data into the initial load.
 */

let pdfMakeInstance = null;

export const getPdfMake = async () => {
  if (pdfMakeInstance) {
    return pdfMakeInstance;
  }

  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  // vfs_fonts exports the font dictionary directly or inside .pdfMake / .vfs
  pdfMake.vfs = pdfFonts.pdfMake
    ? pdfFonts.pdfMake.vfs
    : (pdfFonts.vfs || pdfFonts);

  pdfMakeInstance = pdfMake;
  return pdfMakeInstance;
};

export default getPdfMake;

