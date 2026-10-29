'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { settingsService, CompanySettings } from '@/services/settings.service';
import {
  Search,
  Settings,
  Wrench,
  FileText,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Tv,
  Wifi,
  Volume2,
  Layers,
  HelpCircle,
  X,
  ExternalLink,
  Download,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'How do I set up my Butterfly Smart TV for the first time?',
    answer:
      'Unbox your Butterfly TV and mount it or attach the table stands. Plug the power cord into a surge-protected outlet and turn on the power button. Use the remote control to select your language, connect to your home Wi-Fi network, and sign in with your Google account to access Google Play and your favorite streaming apps.',
  },
  {
    id: 'faq-2',
    category: 'General',
    question: 'What is the warranty period for Butterfly Smart TVs?',
    answer:
      'Every Butterfly Smart TV comes with a comprehensive 1-Year Comprehensive On-Site Manufacturer Warranty covering panels, motherboards, sound modules, and display circuitry. Additional 2-Year Extended Panel Protection plans are available during product registration.',
  },
  {
    id: 'faq-3',
    category: 'Connectivity',
    question: 'How can I connect my TV to Wi-Fi?',
    answer:
      'Press the Settings (gear) icon on your remote > select "Network & Internet" > toggle Wi-Fi "On". Choose your home Wi-Fi SSID from the list, enter your secure password, and select "Connect". For 4K UHD streaming, we recommend connecting to a 5GHz band.',
  },
  {
    id: 'faq-4',
    category: 'Picture & Sound',
    question: 'Why is there no sound coming from my TV?',
    answer:
      'First check if the TV or connected set-top box is muted. Go to Settings > Sound > Audio Output and ensure "TV Speakers" is selected (unless you are using an ARC/eARC Soundbar). If using HDMI, verify that HDMI CEC and Dolby Digital Pass-through are properly configured.',
  },
  {
    id: 'faq-5',
    category: 'Installation & Setup',
    question: 'Can I install third-party apps on my Butterfly Smart TV?',
    answer:
      'Yes, Butterfly Smart TVs run certified Android TV OS with the official Google Play Store pre-installed. You can download YouTube, Netflix, Disney+ Hotstar, Prime Video, SonyLIV, Zee5, and thousands of other verified smart apps directly.',
  },
  {
    id: 'faq-6',
    category: 'Warranty & Service',
    question: 'Where can I find the service center near me?',
    answer:
      'We have over 250+ authorized service centers across India including primary hubs in Coimbatore, Chennai, Bengaluru, Hyderabad, Mumbai, and Delhi. You can request free on-site service via our support helpline or online enquiry form.',
  },
  {
    id: 'faq-7',
    category: 'Picture & Sound',
    question: 'How do I activate 4K HDR and Dolby Audio modes?',
    answer:
      'Go to Settings > Display & Sound > Picture Mode and choose "Vivid" or "Cinema HDR". Dolby Audio is automatically detected on supported content from Netflix, Prime Video, and Hotstar.',
  },
  {
    id: 'faq-8',
    category: 'Connectivity',
    question: 'How do I cast my smartphone screen (Chromecast / AirPlay)?',
    answer:
      'Ensure both your TV and smartphone are on the same Wi-Fi network. Open Google Home or tap the Cast icon in any supported app (YouTube, Chrome, Photos). For Apple devices, select AirPlay & HomeKit in TV Settings.',
  },
  {
    id: 'faq-9',
    category: 'Installation & Setup',
    question: 'How do I request standard wall-mounting installation?',
    answer:
      'Complimentary wall-mount brackets are included in the box for all models 43" and above. To schedule professional technician installation within 24-48 hours of delivery, call +91 422 430 1234 or submit your order details on our Contact page.',
  },
  {
    id: 'faq-10',
    category: 'Others',
    question: 'How do I update my TV system software (OTA updates)?',
    answer:
      'Connect to Wi-Fi, navigate to Settings > Device Preferences > About > System Update, and tap "Check for Update". When available, the TV will download and install the latest firmware automatically.',
  },
];

const CATEGORIES = [
  { name: 'General', icon: HelpCircle },
  { name: 'Installation & Setup', icon: Wrench },
  { name: 'Picture & Sound', icon: Volume2 },
  { name: 'Connectivity', icon: Wifi },
  { name: 'Warranty & Service', icon: ShieldCheck },
  { name: 'Others', icon: Layers },
];

export default function SupportPage() {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('General');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    settingsService.getSettings()
      .then((data) => {
        if (data) setCompanySettings(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (!hash) return;

      if (hash === '#faq' || hash === '#faqs' || hash === '#faq-section') {
        const el = document.getElementById('faq') || document.getElementById('faqs') || document.getElementById('faq-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (hash === '#warranty') {
        const el = document.getElementById('warranty');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setActiveModal('warranty');
      } else if (
        hash === '#quick-help' ||
        hash === '#how-can-we-help' ||
        hash === '#service-centers' ||
        hash === '#service' ||
        hash === '#service-options'
      ) {
        const el =
          document.getElementById('quick-help') ||
          document.getElementById('how-can-we-help') ||
          document.getElementById('service-centers');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    const timer = setTimeout(handleHash, 200);
    window.addEventListener('hashchange', handleHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        searchQuery.trim() !== '' ? true : item.category === activeCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900">
      
      {/* 1. HERO SECTION (Dark Ambient Living Room with TV) */}
      <section className="relative bg-[#070b12] text-white pt-12 pb-20 overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-radial-at-c from-zinc-900/60 via-[#070b12] to-[#070b12] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block text-xs font-black tracking-widest text-[#E50914] uppercase">
                SUPPORT
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                We&apos;re Here to{' '}
                <span className="text-[#E50914]">Help You</span>
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Get the assistance you need for your Butterfly Smart TV. Find quick solutions, explore helpful resources, or reach out to our dedicated support team.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl pt-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const el = document.getElementById('faqs');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    placeholder="Search for help articles, setup guides, or FAQs..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white text-zinc-900 placeholder-zinc-500 text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-xs font-semibold text-zinc-400 hover:text-zinc-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Display: TV in Living Room */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/hero_tv.jpg"
                    alt="Butterfly Smart TV Display"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-300 bg-zinc-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Butterfly Smart TV Customer Care</span>
                  </div>
                  <span className="font-semibold text-white">24/7 Assisted Self-Service</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. QUICK HELP: "How Can We Help You?" */}
      <section id="quick-help" className="scroll-mt-24 py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span id="how-can-we-help" className="sr-only" />
        <span id="service-centers" className="sr-only" />
        <span id="service-options" className="sr-only" />
        <span id="service" className="sr-only" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-black tracking-widest text-[#E50914] uppercase block mb-1">
              QUICK HELP
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
              How Can We Help You?
            </h2>
          </div>
          <p className="text-sm text-zinc-500 max-w-md">
            Choose a topic below to get started or browse our complete support resources.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Product Setup */}
          <div
            onClick={() => setActiveModal('setup')}
            className="group bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl hover:border-[#E50914]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] mb-5 group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                Product Setup
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Get help with initial setup, configuration and settings.
              </p>
            </div>
            <div className="pt-6 flex justify-end">
              <span className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:border-[#E50914] group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 2: Troubleshooting */}
          <div
            onClick={() => {
              setActiveCategory('Picture & Sound');
              const faqElem = document.getElementById('faq-section');
              if (faqElem) faqElem.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl hover:border-[#E50914]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] mb-5 group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                Troubleshooting
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Fix common issues and performance problems.
              </p>
            </div>
            <div className="pt-6 flex justify-end">
              <span className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:border-[#E50914] group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 3: User Manuals */}
          <div
            onClick={() => setActiveModal('manuals')}
            className="group bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl hover:border-[#E50914]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] mb-5 group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                User Manuals
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Download user guides and product manuals.
              </p>
            </div>
            <div className="pt-6 flex justify-end">
              <span className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:border-[#E50914] group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 4: Warranty & Service */}
          <div
            id="warranty"
            onClick={() => setActiveModal('warranty')}
            className="group bg-white p-7 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl hover:border-[#E50914]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between scroll-mt-28"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] mb-5 group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                Warranty &amp; Service
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Check warranty details and service information.
              </p>
            </div>
            <div className="pt-6 flex justify-end">
              <span className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 group-hover:border-[#E50914] group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. GET IN TOUCH: "Still Need Help?" Split Section */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Dark Card with Headset visual */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden bg-[#0A0E17] text-white p-8 sm:p-10 flex flex-col justify-between shadow-xl min-h-[360px]">
            {/* Background image with moody gradient */}
            <div className="absolute inset-0 z-0 opacity-40">
              <Image
                src="/support_headset.jpg"
                alt="Customer Support Headset"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/80 to-transparent" />
            </div>

            <div className="relative z-10 space-y-3">
              <span className="text-xs font-black tracking-widest text-[#E50914] uppercase">
                GET IN TOUCH
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Still Need <span className="text-[#E50914]">Help?</span>
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-sm">
                Our support team is always ready to assist you. Reach out through your preferred channel.
              </p>
            </div>

            <div className="relative z-10 pt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E50914] hover:bg-[#c70811] text-white text-sm font-bold shadow-lg shadow-red-900/40 hover:scale-105 transition-all"
              >
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right 2x2 Grid of Channels */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            
            {/* 1. Phone Support */}
            <a
              href={`tel:${companySettings?.phone || '+914224301234'}`}
              className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#E50914] transition-colors">
                  Phone Support
                </h4>
                <p className="text-base font-extrabold text-zinc-900 mt-0.5">
                  {companySettings?.phone || '+91 422 430 1234'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {companySettings?.supportHours || 'Mon - Sat | 9:00 AM - 6:00 PM'}
                </p>
              </div>
            </a>

            {/* 2. Email Support */}
            <a
              href={`mailto:${companySettings?.supportEmail || companySettings?.email || 'support@butterflytv.in'}`}
              className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#E50914] transition-colors">
                  Email Support
                </h4>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">
                  {companySettings?.supportEmail || companySettings?.email || 'support@butterflytv.in'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  We&apos;ll respond within 24 hours
                </p>
              </div>
            </a>

            {/* 3. Live Chat */}
            <div
              onClick={() => setActiveModal('chat')}
              className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#E50914] transition-colors">
                  Live Chat
                </h4>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">
                  Chat with our support team
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Mon - Sat | 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>

            {/* 4. On-Site Support */}
            <div
              onClick={() => {
                const el = document.getElementById('quick-help');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#E50914] transition-colors">
                  On-Site Service
                </h4>
                <p className="text-sm font-bold text-zinc-900 mt-0.5">
                  Doorstep technician support
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Available across 250+ cities
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. POPULAR TOPICS: FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="scroll-mt-24 py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span id="faqs" className="sr-only" />
        <span id="faq-section" className="sr-only" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-xs font-black tracking-widest text-[#E50914] uppercase block mb-1">
              POPULAR TOPICS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
              Frequently Asked Questions
            </h2>
          </div>
          <button
            onClick={() => {
              setActiveCategory('General');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-[#E50914] transition-colors cursor-pointer"
          >
            View All FAQs
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2 Column Layout: Categories on Left, Accordion on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Category Tabs */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-1.5">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.name && !searchQuery;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-red-50 text-[#E50914] border-l-4 border-[#E50914] shadow-xs'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-[#E50914]' : 'text-zinc-400'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Accordion List */}
          <div className="lg:col-span-8 space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-zinc-200 text-zinc-500">
                <HelpCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="font-semibold text-zinc-700">No matching questions found.</p>
                <p className="text-xs text-zinc-400 mt-1">Try another search term or contact our live support.</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:border-zinc-300 transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-zinc-900">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#E50914]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 bg-zinc-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* 5. NEED FURTHER ASSISTANCE? BANNER */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-white border border-zinc-200 shadow-sm p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Text */}
          <div className="space-y-4 max-w-md">
            <span className="text-xs font-black tracking-widest text-[#E50914] uppercase">
              NEED FURTHER ASSISTANCE?
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
              We&apos;re Just a{' '}
              <span className="text-[#E50914]">Message Away</span>
            </h3>
            <p className="text-sm text-zinc-500">
              Our support team will get back to you as soon as possible.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#E50914] hover:bg-[#c70811] text-white text-sm font-bold shadow-lg shadow-red-900/20 hover:scale-105 transition-all"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Middle Decorative Handwriting Note */}
          <div className="hidden lg:flex flex-col items-center justify-center transform -rotate-3 select-none">
            <span className="text-2xl font-black text-[#E50914] italic tracking-tight font-serif">
              Better Support.
            </span>
            <span className="text-2xl font-black text-[#E50914] italic tracking-tight font-serif mt-1">
              Brighter Experience.
            </span>
            <div className="w-24 h-1 bg-[#E50914]/80 rounded-full mt-2" />
          </div>

          {/* Right Image: Headphones on Desk */}
          <div className="relative w-full md:w-80 h-48 sm:h-56 rounded-2xl overflow-hidden border border-zinc-200 shadow-inner">
            <Image
              src="/support_headphones.jpg"
              alt="Butterfly Customer Support Team"
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
            />
          </div>

        </div>
      </section>

      {/* --- POPUP MODALS FOR ACTIONS --- */}

      {/* Modal 1: Product Setup Guide */}
      {activeModal === 'setup' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center mb-4">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">
              Butterfly Smart TV Setup Guide
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Follow these simple steps for quick first-time installation and Wi-Fi pairing.
            </p>
            <div className="space-y-4 text-xs sm:text-sm text-zinc-700">
              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-red-100 text-[#E50914] font-bold flex items-center justify-center text-xs shrink-0">1</span>
                <p>Connect HDMI and power cables. Ensure standard grounding.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-red-100 text-[#E50914] font-bold flex items-center justify-center text-xs shrink-0">2</span>
                <p>Pair Bluetooth Remote by holding the Home + Back buttons for 3 seconds.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-red-100 text-[#E50914] font-bold flex items-center justify-center text-xs shrink-0">3</span>
                <p>Select Wi-Fi network and sign in with your Google account.</p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: User Manuals Download */}
      {activeModal === 'manuals' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">
              Download User Manuals
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Official PDF user documentation for Butterfly Smart TVs.
            </p>
            <div className="space-y-3">
              {[
                { name: 'Butterfly 4K UHD Series (43" - 65")', size: '3.4 MB' },
                { name: 'Butterfly Full HD Smart Series (32" - 40")', size: '2.8 MB' },
                { name: 'Remote Control & Voice Assistant Guide', size: '1.2 MB' },
              ].map((manual, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200"
                >
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{manual.name}</p>
                    <span className="text-[10px] text-zinc-500">PDF Document • {manual.size}</span>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${manual.name}...`);
                    }}
                    className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-[#E50914] hover:border-[#E50914]"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Warranty Checker */}
      {activeModal === 'warranty' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">
              Warranty &amp; Service Coverage
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Check on-site manufacturer warranty terms for your Butterfly Smart TV.
            </p>
            <div className="space-y-3 text-xs text-zinc-700 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <p>• <strong>1-Year Comprehensive Warranty:</strong> Covers all electronic parts, motherboards, power supplies, and TV panels.</p>
              <p>• <strong>Pan-India On-Site Service:</strong> Authorized technician visit directly to your home within 24-48 business hours.</p>
              <p>
                • <strong>Customer Care Toll-Free:</strong>{' '}
                <a
                  href={`tel:${(companySettings?.phone || '+91 422 430 120').replace(/\s+/g, '')}`}
                  className="font-bold text-zinc-900 hover:text-[#E50914] transition-colors"
                >
                  {companySettings?.phone || '+91 422 430 120'}
                </a>
                {companySettings?.alternatePhone ? ` / ${companySettings.alternatePhone}` : ''}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811]"
              >
                Register Warranty / File Claim
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Live Chat Launcher */}
      {activeModal === 'chat' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95 text-center">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">
              Butterfly Live Support
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Our agents are available Monday to Saturday, 9:00 AM - 6:00 PM IST.
            </p>
            <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200 mb-6">
              ✓ 3 Support Representatives currently online
            </div>
            <Link
              href="/contact"
              className="w-full inline-block py-3 px-6 rounded-full bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md"
            >
              Start Chat / Send Message
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
