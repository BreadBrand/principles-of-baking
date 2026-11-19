import { useEffect, useState, type RefObject } from "react";

export const useIsBelowViewport = (ref: RefObject<Element | null>): boolean => {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsBelow(!entry.isIntersecting && entry.boundingClientRect.top > 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [ref]);

  return isBelow;
};
