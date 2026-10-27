import Link from "next/link";
import { T } from "./T";
import { Info } from "lucide-react";

export function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/"><T k="nav.home" /></Link><span>/</span><span>{title}</span></nav>
        <h1>{title}</h1>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap"><div className="legal">
        <p className="note"><Info /><span>Draft for review. Have this page checked by a qualified professional before the site goes live.<span className="l-am" lang="am"> <T k="legal.enOnly" /></span></span></p>
        {children}
      </div></div></section>
    </>
  );
}
