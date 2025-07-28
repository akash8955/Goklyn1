// useAnimateOnView.js
import { useEffect } from 'react';

/**
 * Adds IntersectionObserver-based animation trigger to all elements with .hover-effect.
 * When entering viewport, .hover-effect-animate is added (re-triggered every time).
 * Usage: Import and call useAnimateOnView() once in your main App or Layout component.
 */
export default function useAnimateOnView() {
  useEffect(() => {
    let observer;
    const observeAll = () => {
      const animatedEls = Array.from(document.querySelectorAll('.hover-effect'));
      if (animatedEls.length === 0) return;
      if (observer) observer.disconnect();
      observer = new window.IntersectionObserver((entries) => {
        for (const entry of entries) {
          const el = entry.target;
          if (entry.intersectionRatio > 0) {
            el.classList.remove('hover-effect-animate');
            void el.offsetWidth;
            el.classList.add('hover-effect-animate');
          } else {
            el.classList.remove('hover-effect-animate');
          }
        }
      }, {
        threshold: 0.1 // more sensitive
      });
      animatedEls.forEach(el => observer.observe(el));
    };
    observeAll();
    // Re-observe if new elements are added
    const mutationObs = new MutationObserver(() => {
      observeAll();
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (observer) observer.disconnect();
      mutationObs.disconnect();
    };
  }, []);
}

