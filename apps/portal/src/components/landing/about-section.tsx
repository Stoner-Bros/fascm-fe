'use client';

import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import { Shield, Cpu, Package } from 'lucide-react';

export function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section id='about' className='bg-agri-background py-20 lg:py-32'>
      <div className='container mx-auto max-w-7xl px-6 lg:px-20'>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'
        >
          {/* Left side - Images/Icons */}
          <div className='relative'>
            <div className='grid grid-cols-2 gap-4'>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='from-agri-primary to-agri-primary-light flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br p-8 text-white shadow-lg transition-shadow hover:shadow-xl'
              >
                <Shield className='mb-4 h-16 w-16' />
                <h3 className='text-center text-xl font-bold'>
                  Blockchain Security
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className='mt-8 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#F9A825] to-[#FBC02D] p-8 text-white shadow-lg transition-shadow hover:shadow-xl'
              >
                <Cpu className='mb-4 h-16 w-16' />
                <h3 className='text-center text-xl font-bold'>
                  IoT Monitoring
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className='col-span-2 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#1976D2] to-[#42A5F5] p-8 text-white shadow-lg transition-shadow hover:shadow-xl'
              >
                <Package className='mb-4 h-16 w-16' />
                <h3 className='text-center text-xl font-bold'>
                  Supply Chain Tracking
                </h3>
              </motion.div>
            </div>
          </div>

          {/* Right side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className='text-agri-text mb-6 text-3xl leading-tight font-bold lg:text-4xl'>
              Modernizing Vietnam&apos;s{' '}
              <span className='text-agri-primary'>
                Fresh Produce Supply Chain
              </span>
            </h2>
            <div className='text-agri-text space-y-6 text-lg leading-relaxed'>
              <p>
                FASCM connects <strong>farmers</strong>,{' '}
                <strong>distributors</strong>, and <strong>retailers</strong> in
                one transparent ecosystem. By combining{' '}
                <span className='text-agri-primary font-semibold'>
                  Blockchain
                </span>{' '}
                and{' '}
                <span className='text-agri-secondary font-semibold'>
                  IoT technologies
                </span>
                , it ensures real-time freshness monitoring, traceability, and
                trustworthy transactions.
              </p>
              <p>
                Our platform provides end-to-end visibility across the entire
                supply chain, from harvest to retail, ensuring food safety,
                reducing waste, and building trust between all stakeholders.
              </p>
              <div className='grid grid-cols-3 gap-4 pt-6'>
                <div className='text-center'>
                  <div className='text-agri-primary mb-2 text-4xl font-bold'>
                    100%
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    Traceability
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-agri-primary mb-2 text-4xl font-bold'>
                    24/7
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    Monitoring
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-agri-primary mb-2 text-4xl font-bold whitespace-nowrap'>
                    Real-time
                  </div>
                  <div className='text-muted-foreground text-sm'>Updates</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
