/** Runs before first paint (inlined in <head>) so the chosen language and theme never flash. */
export const PREFS_SCRIPT = `(function(){try{var d=document.documentElement,l=localStorage.getItem('ethio-lang');if(l==='am'){d.dataset.lang='am';d.lang='am'}var t=localStorage.getItem('ethio-theme');if(t==='dark'||t==='light')d.dataset.theme=t}catch(e){}})()`;
