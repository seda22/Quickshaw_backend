// pages/_app.js
import "@/styles/globals.css";
import Head from "next/head";
import Footer from "./footer";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Nav font (if you already have it, keep it) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&display=swap" rel="stylesheet" />

        {/* HERO title font */}
        <link href="https://fonts.googleapis.com/css2?family=Brawler:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
