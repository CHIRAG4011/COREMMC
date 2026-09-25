'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { testimonials } from '@/data/products';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <Star
            key={i}
            className={`size-4 ${
              filled
                ? 'fill-[#f59e0b] text-[#f59e0b]'
                : half
                  ? 'fill-[#f59e0b]/50 text-[#f59e0b]'
                  : 'fill-white/10 text-white/10'
            }`}
          />
        );
      })}
    </div>
  );
}

export function TestimonialsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const handler = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    // Defer initial sync to avoid synchronous setState in effect
    const id = requestAnimationFrame(handler);
    api.on('select', handler);
    api.on('reInit', handler);
    return () => {
      cancelAnimationFrame(id);
      api.off('select', handler);
    };
  }, [api]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      if (api) {
        const nextIndex = (api.selectedScrollSnap() + 1) % testimonials.length;
        api.scrollTo(nextIndex);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            What Our Customers <span className="gradient-text-animated">Say</span>
          </h2>
          <div className="mt-8 glass rounded-2xl p-10 max-w-md mx-auto">
            <p className="text-white/50">Be the first to review!</p>
            <Button className="mt-4" variant="outline">
              Join our Discord
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            What Our Customers{' '}
            <span className="gradient-text-animated">Say</span>
          </h2>
          <p className="mt-3 text-white/50 text-lg">
            Real reviews from our amazing community
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          {/* Desktop arrows */}
          <div className="hidden md:block absolute -left-14 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Previous testimonial"
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 h-9 w-9"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
          <div className="hidden md:block absolute -right-14 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Next testimonial"
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 h-9 w-9"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Carousel
            setApi={setApi}
            opts={{ loop: true, align: 'center' }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="glass rounded-2xl p-6 md:p-8 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <StarRating rating={testimonial.rating} />
                    </div>
                    <blockquote className="text-white/70 text-sm md:text-base leading-relaxed italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="mt-5 pt-5 border-t border-white/5">
                      <p className="font-semibold text-white text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {testimonial.service}
                      </p>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex
                    ? 'w-6 bg-[#6366f1]'
                    : 'w-2 bg-white/20 hover:bg-white/30'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}