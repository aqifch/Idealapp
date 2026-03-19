import React, { useEffect, useRef, useState, useMemo } from 'react';

interface FullPageScrollProps {
  children: React.ReactNode[];
}

export const FullPageScroll: React.FC<FullPageScrollProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  const validChildren = useMemo(
    () => React.Children.toArray(children).filter(Boolean),
    [children]
  );
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Use IntersectionObserver to detect the visible section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio (best visible section)
        let bestEntry: IntersectionObserverEntry | null = null;
        entries.forEach((entry) => {
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        });
        if (bestEntry && (bestEntry as IntersectionObserverEntry).isIntersecting) {
          const idx = sectionRefs.current.findIndex(
            (r) => r === (bestEntry as IntersectionObserverEntry).target
          );
          if (idx !== -1) setActiveSection(idx);
        }
      },
      {
        root: container,
        threshold: [0.3, 0.5, 0.7],
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [validChildren.length]);

  const scrollToSection = (index: number) => {
    const ref = sectionRefs.current[index];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Main snap-scroll container — fullscreen, fixed to viewport */}
      <div
        ref={containerRef}
        className="hide-scrollbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          zIndex: 0,
        }}
      >
        {validChildren.map((child, index) => (
          <section
            key={index}
            ref={(el) => { sectionRefs.current[index] = el; }}
            style={{
              width: '100%',
              height: '100dvh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              paddingTop: '80px',   // navbar height
              paddingBottom: '80px', // bottom nav height (mobile)
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {child}
          </section>
        ))}
      </div>

      {/* Navigation Dots — fixed over the scroll container */}
      <div
        style={{
          position: 'fixed',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '8px',
        }}
      >
        {validChildren.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            style={{
              width: activeSection === index ? '12px' : '8px',
              height: activeSection === index ? '12px' : '8px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
              background: activeSection === index ? '#F97316' : '#D1D5DB',
              boxShadow: activeSection === index ? '0 0 8px rgba(249,115,22,0.6)' : 'none',
            }}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};
