import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalCarouselProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function HorizontalCarousel({ title, children, className = "" }: HorizontalCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position and update button states
  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Update button states on mount and when children change
  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [children]);

  // Scroll left by one viewport width
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: -container.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  // Scroll right by one viewport width
  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: container.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section className={`relative ${className}`} data-testid="carousel-section">
      {/* Section Header */}
      <h2 
        className="text-2xl font-semibold mb-6 px-6 lg:px-8"
        data-testid="carousel-title"
      >
        {title}
      </h2>

      {/* Carousel Container with Navigation - Arrows only on desktop */}
      <div className="relative group">
        {/* Left Navigation Button - Hidden on mobile */}
        {canScrollLeft && (
          <div className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 items-center pl-2 pointer-events-none">
            <Button
              size="icon"
              variant="secondary"
              onClick={scrollLeft}
              className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
              data-testid="button-scroll-left"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Right Navigation Button - Hidden on mobile */}
        {canScrollRight && (
          <div className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 items-center pr-2 pointer-events-none">
            <Button
              size="icon"
              variant="secondary"
              onClick={scrollRight}
              className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
              data-testid="button-scroll-right"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Scrollable Content - Grid on mobile, horizontal scroll on desktop */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          className="
            grid grid-cols-2 gap-4 px-6 lg:px-8 pb-4
            md:flex md:overflow-x-auto md:snap-x md:snap-mandatory md:scrollbar-hide md:scroll-smooth
          "
          data-testid="carousel-container"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
