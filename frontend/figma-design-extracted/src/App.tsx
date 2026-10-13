import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type IconName =
  | "arrow"
  | "cart"
  | "chat"
  | "check"
  | "chevron"
  | "close"
  | "email"
  | "heart"
  | "manual"
  | "menu"
  | "phone"
  | "pin"
  | "play"
  | "search"
  | "settings"
  | "shield"
  | "sound"
  | "spark"
  | "user"
  | "wifi";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    cart: <><path d="M3 4h2l2.2 10h9.9l2-7H6.2" /><circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
    chat: <><path d="M20 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" />,
    manual: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" /><path d="M4 6.5v13" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></>,
    play: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    sound: <><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></>,
    wifi: <><path d="M5 12.6a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="1" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const heroPhoto = "https://images.unsplash.com/photo-1663811397007-010e535ffcd7?auto=format&fit=crop&w=1800&q=86";
const storyPhoto = "https://images.unsplash.com/photo-1667510436110-79d3dabc2008?auto=format&fit=crop&w=1400&q=84";
const roomPhoto = "https://images.unsplash.com/photo-1724582586508-8f06117dc979?auto=format&fit=crop&w=1500&q=84";
const supportPhoto = "https://images.unsplash.com/photo-1749545849681-37e7b302fdb6?auto=format&fit=crop&w=1400&q=86";

type Product = { id: string; name: string; size: number; resolution: string; platform: string; color: string; specs: string[] };
const products: Product[] = [
  { id: "bt32-hd", name: "Butterfly 32 Smart HD", size: 32, resolution: "HD Ready", platform: "Smart OS", color: "ocean", specs: ["HD Ready", "Smart OS", "20W Audio"] },
  { id: "bt43-fhd", name: "Butterfly 43 Vision", size: 43, resolution: "Full HD", platform: "Smart OS", color: "violet", specs: ["Full HD", "Bezel-less", "Dolby Audio"] },
  { id: "bt43-4k", name: "Butterfly 43 Ultra", size: 43, resolution: "4K UHD", platform: "Google TV", color: "ember", specs: ["4K UHD", "Google TV", "HDR"] },
  { id: "bt55-4k", name: "Butterfly 55 Aura", size: 55, resolution: "4K UHD", platform: "Google TV", color: "aurora", specs: ["4K UHD", "Google TV", "Dolby Audio"] },
  { id: "bt55-qled", name: "Butterfly 55 Q Vision", size: 55, resolution: "QLED 4K", platform: "Google TV", color: "flora", specs: ["QLED 4K", "HDR", "Voice Control"] },
  { id: "bt65-4k", name: "Butterfly 65 Cinema", size: 65, resolution: "4K UHD", platform: "Google TV", color: "sunset", specs: ["4K UHD", "Cinema Sound", "MEMC"] },
  { id: "bt65-qled", name: "Butterfly 65 Q Max", size: 65, resolution: "QLED 4K", platform: "Google TV", color: "coral", specs: ["QLED 4K", "120Hz Mode", "HDR"] },
  { id: "bt32-smart", name: "Butterfly 32 Connect", size: 32, resolution: "HD Ready", platform: "Smart OS", color: "sky", specs: ["HD Ready", "Screen Cast", "20W Audio"] },
  { id: "bt75-4k", name: "Butterfly 75 Grand", size: 75, resolution: "4K UHD", platform: "Google TV", color: "ocean", specs: ["4K UHD", "Google TV", "Dolby Audio"] },
];

function go(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Link({ to, className = "", children, onClick }: { to: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return <a href={to} className={className} onClick={(e) => { e.preventDefault(); onClick?.(); go(to); }}>{children}</a>;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return <Link to="/" className="logo" aria-label="Butterfly Smart TV home">
    <span className="brand-wordmark"><img src={inverse ? "/brand/butterfly-white.png" : "/brand/butterfly-red.png"} alt="Butterfly" /><small>SMART TV</small></span>
  </Link>;
}

function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const links = [["Home", "/"], ["Products", "/products"], ["About Us", "/about"], ["Support", "/support"], ["Contact", "/contact"]];
  const submit = (e: FormEvent) => { e.preventDefault(); if (term.trim()) go(`/products?q=${encodeURIComponent(term.trim())}`); setSearchOpen(false); setOpen(false); };
  return <header className="site-header">
    <div className="nav-wrap">
      <Logo />
      <nav className={open ? "main-nav open" : "main-nav"} aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={href} to={href} onClick={() => setOpen(false)} className={(href === "/" ? path === "/" : path.startsWith(href)) ? "active" : ""}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search"><Icon name="search" /></button>
        <Link to="/login" className={`icon-btn ${path === "/login" || path === "/signup" ? "active-account" : ""}`} aria-label="Account"><Icon name="user" /></Link>
        <button className="icon-btn mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Icon name={open ? "close" : "menu"} /></button>
      </div>
    </div>
    {searchOpen && <form className="header-search" onSubmit={submit}><Icon name="search" /><input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search televisions by size, model or feature..." /><button type="submit">Search</button></form>}
  </header>;
}

function ButtonLink({ to, children, outline = false, dark = false }: { to: string; children: ReactNode; outline?: boolean; dark?: boolean }) {
  return <Link to={to} className={`btn ${outline ? "btn-outline" : ""} ${dark ? "btn-dark" : ""}`}>{children}<Icon name="arrow" size={18} /></Link>;
}

function TVVisual({ product, compact = false }: { product: Product; compact?: boolean }) {
  return <div className={`tv ${compact ? "compact" : ""}`}><div className={`tv-screen ${product.color}`}><span className="screen-glow" /><span className="screen-copy">B</span></div><div className="tv-neck" /><div className="tv-base" /></div>;
}

function SectionTitle({ eyebrow, title, copy, center = false }: { eyebrow?: string; title: string; copy?: string; center?: boolean }) {
  return <div className={`section-title ${center ? "center" : ""}`}>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{copy && <p>{copy}</p>}</div>;
}

function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  return <article className="product-card">
    <div className="product-art"><span className="badge">{product.size}" SMART TV</span><button className={`wish ${liked ? "liked" : ""}`} onClick={() => setLiked(!liked)} aria-label="Toggle wishlist"><Icon name="heart" size={18} /></button><TVVisual product={product} compact /></div>
    <div className="product-info"><p className="product-kicker">BUTTERFLY SMART TV</p><h3>{product.name}</h3><div className="specs">{product.specs.map((s) => <span key={s}>{s}</span>)}</div><p className="price-note">Price available on enquiry</p><div className="card-actions"><Link to={`/products/${product.id}`} className="btn btn-small btn-dark">View Details</Link><Link to={`/contact?model=${product.id}`} className="text-link">Enquire <Icon name="arrow" size={16} /></Link></div></div>
  </article>;
}

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const submit = (e: FormEvent) => { e.preventDefault(); setMessage(/^\S+@\S+\.\S+$/.test(email) ? "Thank you. You’re on the list." : "Enter a valid email address."); };
  return <footer>
    <div className="footer-main">
      <div className="footer-brand"><Logo inverse /><p>Smart Choices. Better Living.</p><div className="social-marks"><span>f</span><span>◎</span><span>▶</span><span>×</span></div></div>
      <div><h4>Quick Links</h4><Link to="/">Home</Link><Link to="/products">Products</Link><Link to="/about">About Us</Link><Link to="/support">Support</Link><Link to="/contact">Contact</Link></div>
      <div><h4>Support</h4><Link to="/support">FAQs</Link><Link to="/support#manuals">User Manuals</Link><Link to="/contact">Service Enquiry</Link><p>Warranty details pending</p><p>Privacy Policy</p></div>
      <div className="footer-connect"><h4>Stay Connected</h4><p>Get the latest updates and offers.</p><form onSubmit={submit}><div><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" aria-label="Email address" /><button aria-label="Subscribe"><Icon name="arrow" size={15}/></button></div>{message && <small>{message}</small>}</form></div>
      <img className="footer-watermark" src="/brand/butterfly-red.png" alt="" />
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Butterfly Smart TV. All rights reserved.</span><span><Icon name="pin" size={11}/> Coimbatore, Tamil Nadu</span></div>
  </footer>;
}

function Home() {
  const slides = [
    { image: heroPhoto, eyebrow: "BUTTERFLY SMART TV", line1: "Brighter Colours.", line2: "Smarter Living.", copy: "Experience stunning visuals, immersive sound and smart features—all in one." },
    { image: roomPhoto, eyebrow: "DESIGNED FOR YOUR HOME", line1: "Cinema at Home.", line2: "Beautifully Simple.", copy: "A brilliant screen and thoughtful design made for every living space." },
    { image: storyPhoto, eyebrow: "SMARTER ENTERTAINMENT", line1: "Every Story.", line2: "Brought to Life.", copy: "Enjoy effortless access to the entertainment you love with vivid picture and clear sound." },
  ];
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);
  const moveSlide = (direction: number) => setSlide((current) => (current + direction + slides.length) % slides.length);
  const categories = [{ size: 32, label: "Compact & clever", c: "sky" }, { size: 43, label: "Made for every day", c: "violet" }, { size: 55, label: "The cinema sweet spot", c: "aurora" }, { size: 65, label: "Immersive by design", c: "sunset" }];
  return <main>
    <section className="home-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Featured televisions">
      <div className="hero-slides">{slides.map((item, index) => <div key={item.line1} className={`hero-slide ${slide === index ? "active" : ""}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(5,8,12,.96) 0%, rgba(5,8,12,.74) 43%, rgba(5,8,12,.08) 78%), url(${item.image})` }} />)}</div>
      <div className="hero-content" key={slide}><span className="eyebrow light">{slides[slide].eyebrow}</span><h1>{slides[slide].line1}<br /><em>{slides[slide].line2}</em></h1><p>{slides[slide].copy}</p><div className="button-row"><ButtonLink to="/products">Explore our TVs</ButtonLink><ButtonLink to="/contact" outline>Enquire now</ButtonLink></div><div className="hero-features"><span><Icon name="spark" />4K UHD Resolution</span><span><Icon name="sound" />Dolby Audio</span><span><Icon name="wifi" />Smart TV</span></div></div>
      <div className="carousel-controls"><button onClick={() => moveSlide(-1)} aria-label="Previous slide">‹</button><div>{slides.map((item,index) => <button key={item.line1} className={slide===index?"active":""} onClick={() => setSlide(index)} aria-label={`Go to slide ${index+1}`} />)}</div><button onClick={() => moveSlide(1)} aria-label="Next slide">›</button></div>
    </section>

    <section className="section sizes"><div className="section-head-row"><SectionTitle eyebrow="CHOOSE YOUR PERFECT SIZE" title="TVs for Every Space" /><Link className="text-link" to="/products">View all products <Icon name="arrow" size={15}/></Link></div>
      <div className="size-grid">{categories.map((item) => <Link to={`/products?size=${item.size}`} className="size-card" key={item.size}><div className={`mini-tv ${item.c}`}><span>B</span></div><div><strong>{item.size}<sup>″</sup></strong><h3>{item.size}-inch TVs</h3><p>{item.label}</p><span className="round-arrow"><Icon name="arrow" /></span></div></Link>)}</div>
    </section>

    <section className="section featured"><div className="section-head-row"><SectionTitle eyebrow="FEATURED PRODUCTS" title="Our Best Selling TVs" /><Link className="text-link" to="/products">View all products <Icon name="arrow" /></Link></div><div className="product-grid home-products">{products.slice(0, 4).map((p) => <ProductCard product={p} key={p.id} />)}</div></section>

    <section className="story-split"><div className="story-copy"><SectionTitle eyebrow="ABOUT BUTTERFLY" title="A Legacy of Quality, A Vision for Tomorrow" /><p>Butterfly Smart TV brings modern viewing experiences to homes with a focus on thoughtful design, clear picture quality, and everyday simplicity.</p><ButtonLink to="/about" outline>Learn more</ButtonLink></div><div className="story-image" style={{ backgroundImage: `url(${storyPhoto})` }} /></section>

    <section className="section benefits"><div className="benefit-grid">{[["shield","Warranty Information","Verified terms to be provided"],["cart","Service Guidance","Location details coming soon"],["sound","Product Support","Helpful answers when needed"],["spark","Thoughtful Design","Made for everyday viewing"]].map(([icon,title,copy]) => <article key={title}><span><Icon name={icon as IconName} /></span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></section>
  </main>;
}

function PageHero({ eyebrow, title, copy, image = heroPhoto, children }: { eyebrow: string; title: string; copy: string; image?: string; children?: ReactNode }) {
  return <section className="page-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(4,7,11,.94), rgba(4,7,11,.48)), url(${image})` }}><div><p className="breadcrumb"><Link to="/">Home</Link> / {eyebrow}</p><h1>{title}</h1><p>{copy}</p>{children}</div></section>;
}

function Products() {
  const params = new URLSearchParams(location.search);
  const [query, setQuery] = useState(params.get("q") || "");
  const [sizes, setSizes] = useState<number[]>(params.get("size") ? [Number(params.get("size"))] : []);
  const [resolutions, setResolutions] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(() => {
    let list = products.filter((p) => (!query || `${p.name} ${p.size} ${p.resolution} ${p.platform}`.toLowerCase().includes(query.toLowerCase())) && (!sizes.length || sizes.includes(p.size)) && (!resolutions.length || resolutions.includes(p.resolution)) && (!platforms.length || platforms.includes(p.platform)));
    if (sort === "size-low") list = [...list].sort((a,b) => a.size-b.size);
    if (sort === "size-high") list = [...list].sort((a,b) => b.size-a.size);
    if (sort === "name") list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [query, sizes, resolutions, platforms, sort]);
  const perPage = 6;
  useEffect(() => setPage(1), [query, sizes, resolutions, platforms, sort]);
  const toggle = <T,>(v: T, arr: T[], set: (x: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const clear = () => { setQuery(""); setSizes([]); setResolutions([]); setPlatforms([]); setSort("featured"); };
  return <main><PageHero eyebrow="Products" title="Explore our Smart TVs" copy="Brilliant picture. Thoughtful design. Find the Butterfly TV made for your space." />
    <section className="catalog section">
      <button className="filter-toggle btn btn-dark" onClick={() => setFiltersOpen(!filtersOpen)}>Filters <Icon name="settings" /></button>
      <aside className={filtersOpen ? "filters open" : "filters"}>
        <div className="filter-title"><h3>Filter televisions</h3><button onClick={clear}>Reset all</button></div>
        <label className="catalog-search"><Icon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search models..." /></label>
        <FilterGroup title="Screen size">{[32,43,55,65].map((s) => <Check key={s} label={`${s}-inch`} checked={sizes.includes(s)} onChange={() => toggle(s, sizes, setSizes)} />)}</FilterGroup>
        <FilterGroup title="Resolution">{["HD Ready","Full HD","4K UHD","QLED 4K"].map((r) => <Check key={r} label={r} checked={resolutions.includes(r)} onChange={() => toggle(r, resolutions, setResolutions)} />)}</FilterGroup>
        <FilterGroup title="Smart platform">{["Google TV","Smart OS"].map((p) => <Check key={p} label={p} checked={platforms.includes(p)} onChange={() => toggle(p, platforms, setPlatforms)} />)}</FilterGroup>
        <div className="filter-note"><Icon name="chat" /><p>Need help choosing?<br/><Link to="/contact">Talk to our team</Link></p></div>
      </aside>
      <div className="catalog-main">
        <div className="catalog-toolbar"><p><strong>{filtered.length}</strong> televisions found</p><label>Sort by <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="size-low">Size: low to high</option><option value="size-high">Size: high to low</option><option value="name">Model name</option></select></label></div>
        {filtered.length ? <div className="product-grid">{filtered.slice((page-1)*perPage, page*perPage).map((p) => <ProductCard product={p} key={p.id} />)}</div> : <div className="empty"><Icon name="search" size={34} /><h3>No televisions found</h3><p>Try changing your search or filters.</p><button className="btn btn-dark" onClick={clear}>Reset filters</button></div>}
        {filtered.length > perPage && <div className="pagination">{Array.from({ length: Math.ceil(filtered.length/perPage) },(_,i) => <button className={page===i+1?"active":""} onClick={() => setPage(i+1)} key={i}>{i+1}</button>)}</div>}
      </div>
    </section>
  </main>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div className="filter-group"><h4>{title}</h4>{children}</div>;
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="check"><input type="checkbox" checked={checked} onChange={onChange} /><span><Icon name="check" size={13} /></span>{label}</label>;
}

function ProductDetail({ id }: { id: string }) {
  const product = products.find((p) => p.id === id);
  if (!product) return <main className="not-found"><h1>Television not found</h1><ButtonLink to="/products" dark>Back to products</ButtonLink></main>;
  return <main><div className="detail-breadcrumb section"><Link to="/products">Products</Link> / {product.name}</div><section className="product-detail section"><div className="detail-art"><TVVisual product={product} /></div><div className="detail-copy"><span className="eyebrow">BUTTERFLY SMART TV</span><h1>{product.name}</h1><p className="detail-lead">{product.size}-inch {product.resolution} television with {product.platform}.</p><div className="detail-specs">{product.specs.map((s) => <span key={s}><Icon name="check" />{s}</span>)}</div><div className="notice">Pricing and stock information are available on enquiry.</div><ButtonLink to={`/contact?model=${product.id}`}>Enquire about this TV</ButtonLink><Link to="/products" className="back-link">← Back to all televisions</Link></div></section><section className="detail-strip section"><SectionTitle eyebrow="AT A GLANCE" title="Made for effortless entertainment" /><div className="benefit-grid">{[["spark","Vivid picture"],["sound","Clear sound"],["wifi","Easy connection"]].map(([i,t])=><article key={t}><span><Icon name={i as IconName}/></span><h3>{t}</h3><p>Designed to make everyday viewing feel simple and immersive.</p></article>)}</div></section></main>;
}

function About() {
  return <main><PageHero eyebrow="About Us" title="Bringing the world closer to your home" copy="We believe great television should make every story feel more vivid, more connected, and more yours." image={roomPhoto} />
    <section className="about-story section"><div className="about-copy"><SectionTitle eyebrow="OUR STORY" title="Made in Coimbatore. Designed for everyday wonder." /><p>Butterfly Smart TV is a Coimbatore-based consumer electronics brand focused on creating thoughtful home entertainment experiences.</p><p>Our approach is simple: listen carefully, remove complexity, and bring together picture, sound, and smart features in a television that feels at home from day one.</p><p className="placeholder-note">Company history details will be added once verified.</p></div><div className="about-image" style={{ backgroundImage: `url(${storyPhoto})` }} /></section>
    <section className="principles section"><SectionTitle eyebrow="WHAT GUIDES US" title="Purpose behind every screen" center /><div className="principle-grid">{[["spark","Our mission","To make quality smart entertainment feel accessible, intuitive, and enjoyable for every household."],["play","Our vision","To build a trusted home entertainment brand shaped by how people truly live and watch."],["heart","Our values","Thoughtful design, honest communication, dependable experiences, and respect for every customer."]].map(([i,t,c])=><article key={t}><span><Icon name={i as IconName}/></span><h3>{t}</h3><p>{c}</p></article>)}</div></section>
    <section className="about-feature"><div className="about-feature-image" style={{ backgroundImage: `linear-gradient(0deg,rgba(4,8,12,.88),rgba(4,8,12,.02) 70%),url(${heroPhoto})` }}><div><span className="eyebrow light">WHY CHOOSE US</span><h2>More Than Just a TV</h2><p>Cutting-edge technology, creative design, and reliable service for an unmatched viewing experience.</p></div></div><div className="about-feature-grid">{[["spark","Stunning Picture Quality","Experience lifelike visuals with vivid colour."],["sound","Immersive Sound","Feel every moment with powerful audio."],["settings","Smart Technology","Access entertainment with ease."],["shield","Reliable Support","Helpful guidance when you need it."],["play","Energy Conscious","Designed for thoughtful everyday use."],["pin","Based in Coimbatore","Serving homes from Tamil Nadu."]].map(([i,t,c])=><article key={t}><Icon name={i as IconName}/><h3>{t}</h3><p>{c}</p></article>)}</div></section>
  </main>;
}

const faqs = [
  ["How do I set up my Butterfly Smart TV?","Connect the TV to power, follow the on-screen language and network prompts, then sign in to the available smart platform. Model-specific setup guides will be added when verified."],
  ["How do I connect my TV to Wi-Fi?","Open Settings, choose Network or Wi-Fi, select your home network, and enter its password. Menu names may vary by model."],
  ["What should I check if there is no picture or sound?","Confirm the power and input source, check connected cables, and restart the TV. If the issue continues, contact support with your model details."],
  ["Where can I find a user manual?","Verified model manuals will be listed in this support centre. Until then, contact the team with your model number to request the correct document."],
  ["How do I request product support?","Use the contact form and include your TV model plus a clear description of the issue. Phone and email support details will be published once confirmed."],
];

function Support() {
  const [open, setOpen] = useState(0);
  const [query, setQuery] = useState("");
  const visible = faqs.filter(([q,a]) => `${q} ${a}`.toLowerCase().includes(query.toLowerCase()));
  return <main><section className="support-hero"><div><span className="eyebrow">SUPPORT</span><h1>We’re Here to<br/><em>Help You</em></h1><p>Get the assistance you need for your Butterfly Smart TV. Find quick solutions, explore helpful resources, or reach out to our support team.</p><label className="support-search"><Icon name="search" /><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search for help articles, setup guides, or FAQs..." /></label></div><div style={{backgroundImage:`url(${heroPhoto})`}} /></section>
    <section className="section help"><SectionTitle eyebrow="SUPPORT CENTRE" title="What do you need help with?" center /><div className="help-grid">{[["settings","Product setup","Get started with your new TV."],["play","Troubleshooting","Solve common picture and sound issues."],["manual","User manuals","Find model-specific guidance."],["shield","Warranty & service","Learn how to request assistance."]].map(([i,t,c])=><button key={t} onClick={()=>setQuery(t==="Troubleshooting"?"picture sound":t==="Product setup"?"set up":t==="User manuals"?"manual":"support")}><span><Icon name={i as IconName}/></span><h3>{t}</h3><p>{c}</p><Icon name="arrow"/></button>)}</div></section>
    <section className="support-connect section"><div className="support-connect-image" style={{backgroundImage:`linear-gradient(90deg,rgba(3,7,11,.92),rgba(3,7,11,.38)),url(${supportPhoto})`}}><span className="eyebrow light">GET IN TOUCH</span><h2>Still Need <em>Help?</em></h2><p>Our support team is ready to assist. Reach out through your preferred channel.</p><ButtonLink to="/contact">Contact support</ButtonLink></div><div className="support-connect-grid">{[["phone","Phone Support","Number to be provided","Contact details pending"],["email","Email Support","Address to be provided","Contact details pending"],["chat","Live Chat","Currently unavailable","Future service placeholder"],["pin","Service Centres","Locations to be provided","Verified details coming soon"]].map(([i,t,v,c])=><article key={t}><Icon name={i as IconName}/><div><h3>{t}</h3><strong>{v}</strong><p>{c}</p></div></article>)}</div></section>
    <section className="faq-section section"><div className="faq-side"><span className="eyebrow">FREQUENTLY ASKED</span><h2>Answers, without the runaround.</h2><p>Browse common questions about setup, connection, and product care.</p><ButtonLink to="/contact" dark>Still need help?</ButtonLink></div><div className="accordion">{visible.map(([q,a],i)=><article className={open===i?"open":""} key={q}><button onClick={()=>setOpen(open===i?-1:i)}><span>{q}</span><Icon name="chevron"/></button><div><p>{a}</p></div></article>)}{!visible.length && <p>No matching support topics. Try a different search.</p>}</div></section>
    <section className="support-banner section"><div><span className="eyebrow">NEED FURTHER ASSISTANCE?</span><h2>We’re Just a <em>Message Away</em></h2><p>Our support team will get back to you as soon as possible.</p><ButtonLink to="/contact">Contact us</ButtonLink></div><div style={{backgroundImage:`linear-gradient(90deg,#f7f7f7 0%,transparent 35%),url(${supportPhoto})`}} /></section>
  </main>;
}

type FormFields = { name: string; email: string; phone: string; subject: string; model: string; message: string };
function Contact() {
  const modelParam = new URLSearchParams(location.search).get("model") || "";
  const [fields,setFields] = useState<FormFields>({name:"",email:"",phone:"",subject:"",model:modelParam,message:""});
  const [errors,setErrors] = useState<Record<string,string>>({});
  const [sent,setSent] = useState(false);
  const set = (key: keyof FormFields, value: string) => setFields({...fields,[key]:value});
  const submit = (e:FormEvent) => { e.preventDefault(); const next:Record<string,string>={}; if(!fields.name.trim())next.name="Please enter your full name."; if(!/^\S+@\S+\.\S+$/.test(fields.email))next.email="Enter a valid email address."; if(!/^[0-9+\s-]{8,}$/.test(fields.phone))next.phone="Enter a valid phone number."; if(!fields.subject)next.subject="Please select a subject."; if(fields.message.trim().length<10)next.message="Please add a little more detail."; setErrors(next); if(!Object.keys(next).length)setSent(true); };
  return <main><PageHero eyebrow="Contact" title="Let’s talk about your TV needs" copy="Whether you’re choosing a new screen or need product guidance, start the conversation here." image={roomPhoto}/>
    <section className="contact-intro section"><SectionTitle eyebrow="GET IN TOUCH" title="We’d love to hear from you." copy="Contact details below are placeholders until verified business information is supplied."/><div className="contact-card-grid compact">{[["phone","Phone","To be provided"],["email","Email","To be provided"],["pin","Location","Coimbatore, Tamil Nadu"]].map(([i,t,v])=><article key={t}><Icon name={i as IconName}/><div><h3>{t}</h3><p>{v}</p></div></article>)}</div></section>
    <section className="contact-layout section"><div className="form-wrap">{sent?<div className="success"><span><Icon name="check" size={30}/></span><h2>Thank you for reaching out.</h2><p>Your enquiry has been captured in this demo. No message was sent to a backend.</p><button className="btn btn-dark" onClick={()=>{setSent(false);setFields({name:"",email:"",phone:"",subject:"",model:"",message:""});}}>Send another enquiry</button></div>:<><div className="form-heading"><span className="eyebrow">SEND AN ENQUIRY</span><h2>Tell us how we can help.</h2></div><form className="contact-form" onSubmit={submit}><Field label="Full Name" error={errors.name}><input value={fields.name} onChange={e=>set("name",e.target.value)} placeholder="Your full name"/></Field><Field label="Email" error={errors.email}><input value={fields.email} onChange={e=>set("email",e.target.value)} placeholder="you@example.com"/></Field><Field label="Phone Number" error={errors.phone}><input value={fields.phone} onChange={e=>set("phone",e.target.value)} placeholder="+91"/></Field><Field label="Subject" error={errors.subject}><select value={fields.subject} onChange={e=>set("subject",e.target.value)}><option value="">Select a topic</option><option>Product enquiry</option><option>Product support</option><option>Service request</option><option>General question</option></select></Field><Field label="Product Model (optional)"><input value={fields.model} onChange={e=>set("model",e.target.value)} placeholder="Model name or number"/></Field><Field label="Message" error={errors.message} wide><textarea value={fields.message} onChange={e=>set("message",e.target.value)} placeholder="Tell us a little more..." rows={5}/></Field><div className="form-submit"><button className="btn" type="submit">Send enquiry <Icon name="arrow"/></button><small>This form is a prototype and is not connected to a backend.</small></div></form></>}</div><div className="map-card"><div className="map-placeholder"><Icon name="pin" size={34}/><span>Map placeholder</span><small>Exact address and map location to be provided</small></div><div><span className="eyebrow">OUR LOCATION</span><h3>Coimbatore, Tamil Nadu</h3><p>We’ll add verified address and visiting information here once provided.</p></div></div></section>
  </main>;
}

function Field({label,error,wide=false,children}:{label:string;error?:string;wide?:boolean;children:ReactNode}) {
  return <label className={`field ${wide?"wide":""} ${error?"invalid":""}`}><span>{label}</span>{children}{error&&<small>{error}</small>}</label>;
}

function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [complete, setComplete] = useState(false);
  const [remember, setRemember] = useState(false);
  const [resetNote, setResetNote] = useState(false);
  const update = (key: string, value: string) => setValues({ ...values, [key]: value });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (signup && !values.name.trim()) next.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (signup && !/^[0-9+\s-]{8,}$/.test(values.phone)) next.phone = "Enter a valid phone number.";
    if (values.password.length < 8) next.password = "Use at least 8 characters.";
    if (signup && values.confirm !== values.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (!Object.keys(next).length) setComplete(true);
  };
  return <main className="auth-page">
    <section className="auth-visual" style={{ backgroundImage: `linear-gradient(180deg, rgba(5,8,12,.08), rgba(5,8,12,.78)), url(${heroPhoto})` }}>
      <div className="auth-visual-copy"><span className="eyebrow light">BUTTERFLY SMART TV</span><h1>{signup ? "A smarter world of entertainment awaits." : "Welcome back to brighter viewing."}</h1><p>Discover televisions designed to make every story feel closer.</p><div className="auth-feature-row"><span><Icon name="spark"/>Vivid picture</span><span><Icon name="sound"/>Immersive sound</span><span><Icon name="wifi"/>Smart connection</span></div></div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <Logo />
        {complete ? <div className="auth-success"><span><Icon name="check" size={28}/></span><h1>{signup ? "Account created" : "Welcome back"}</h1><p>This is a front-end demonstration. Authentication is not connected to a backend.</p><ButtonLink to="/" dark>Continue to home</ButtonLink></div> : <>
          <div className="auth-heading"><span className="eyebrow">{signup ? "CREATE YOUR ACCOUNT" : "MEMBER SIGN IN"}</span><h1>{signup ? "Join Butterfly" : "Welcome back"}</h1><p>{signup ? "Create an account to save favourites and manage enquiries." : "Sign in to continue to your Butterfly account."}</p></div>
          <form className="auth-form" onSubmit={submit}>
            {signup && <Field label="Full Name" error={errors.name}><input autoComplete="name" value={values.name} onChange={(e)=>update("name",e.target.value)} placeholder="Your full name"/></Field>}
            <Field label="Email Address" error={errors.email}><input type="email" autoComplete="email" value={values.email} onChange={(e)=>update("email",e.target.value)} placeholder="you@example.com"/></Field>
            {signup && <Field label="Phone Number" error={errors.phone}><input autoComplete="tel" value={values.phone} onChange={(e)=>update("phone",e.target.value)} placeholder="+91"/></Field>}
            <Field label="Password" error={errors.password}><input type="password" autoComplete={signup ? "new-password" : "current-password"} value={values.password} onChange={(e)=>update("password",e.target.value)} placeholder="Minimum 8 characters"/></Field>
            {signup && <Field label="Confirm Password" error={errors.confirm}><input type="password" autoComplete="new-password" value={values.confirm} onChange={(e)=>update("confirm",e.target.value)} placeholder="Enter password again"/></Field>}
            {!signup && <><div className="auth-options"><Check label="Remember me" checked={remember} onChange={()=>setRemember(!remember)}/><button type="button" onClick={()=>setResetNote(true)}>Forgot password?</button></div>{resetNote && <p className="auth-reset-note">Password recovery requires a connected authentication service. Please contact support for assistance.</p>}</>}
            {signup && <p className="auth-terms">By creating an account, you agree to the placeholder Terms and Privacy Policy.</p>}
            <button className="btn auth-submit" type="submit">{signup ? "Create account" : "Sign in"}<Icon name="arrow"/></button>
          </form>
          <p className="auth-switch">{signup ? "Already have an account?" : "New to Butterfly?"} <Link to={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link></p>
          <p className="auth-note">Secure account services require backend integration and are not active in this prototype.</p>
        </>}
      </div>
    </section>
  </main>;
}

function App() {
  const [route,setRoute] = useState(location.pathname + location.search);
  const path = location.pathname;
  useEffect(()=>{ const change=()=>setRoute(location.pathname + location.search); window.addEventListener("popstate",change); return()=>window.removeEventListener("popstate",change);},[]);
  let page:ReactNode;
  if(path==="/") page=<Home/>;
  else if(path==="/products") page=<Products key={route}/>;
  else if(path.startsWith("/products/")) page=<ProductDetail id={path.split("/")[2]}/>;
  else if(path==="/about") page=<About/>;
  else if(path==="/support") page=<Support/>;
  else if(path==="/contact") page=<Contact/>;
  else if(path==="/login") page=<AuthPage key="login" mode="login"/>;
  else if(path==="/signup") page=<AuthPage key="signup" mode="signup"/>;
  else page=<main className="not-found"><span className="eyebrow">404</span><h1>This page has flown away.</h1><ButtonLink to="/" dark>Back to home</ButtonLink></main>;
  const isAuthPage = path === "/login" || path === "/signup";
  return <><Header path={path}/>{page}{!isAuthPage && <Footer/>}</>;
}

export default App;
