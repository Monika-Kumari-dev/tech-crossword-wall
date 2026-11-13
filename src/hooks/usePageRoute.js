import { useEffect, useState } from "react";

const pages = new Set(["/", "/game", "/results", "/organizer"]);

function readPage() {
  const path = window.location.hash.slice(1) || "/";
  return pages.has(path) ? path : "/";
}

export function navigate(page, replace = false) {
  if (replace) {
    window.history.replaceState(null, "", `#${page}`);
    window.dispatchEvent(new Event("hashchange"));
  } else {
    window.location.hash = page;
  }
}

export default function usePageRoute() {
  const [page, setPage] = useState(readPage);

  useEffect(() => {
    const onChange = () => {
      setPage(readPage());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    if (!pages.has(window.location.hash.slice(1))) navigate("/", true);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return page;
}
