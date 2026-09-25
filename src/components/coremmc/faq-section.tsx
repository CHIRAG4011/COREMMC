'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqs } from '@/data/products';

export function FaqSection() {
  const [search, setSearch] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Frequently Asked{' '}
            <span className="gradient-text-animated">Questions</span>
          </h2>
          <p className="mt-3 text-white/50 text-lg">
            Find answers to common questions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search frequently asked questions"
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50 h-11 rounded-xl focus-visible:border-[#6366f1]/50 focus-visible:ring-[#6366f1]/20"
            />
          </div>

          {/* FAQ Accordion */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/40">No questions match your search.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AccordionItem
                    value={`faq-${index}`}
                    className="glass rounded-xl px-5 border-0 data-[state=open]:bg-white/[0.04]"
                  >
                    <AccordionTrigger className="text-sm md:text-base font-medium text-white/90 hover:no-underline hover:text-white py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-white/50 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          )}
        </motion.div>
      </div>
    </section>
  );
}