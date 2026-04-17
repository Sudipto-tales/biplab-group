gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        // ===================== GLOBAL SCRUB CONFIG =====================
        // Unified timing constants for consistent scroll feel
        const SCRUB_SMOOTH = 0.6;      // main scroll-linked animations
        const SCRUB_TIGHT = 0.3;       // parallax layers (tighter = more responsive)
        const SCRUB_JOURNEY = 0.5;     // horizontal timeline
        const EASE_REVEAL = "power2.out";

        // ===================== WATER DRIP CURSOR =====================
        const cursorMain = document.getElementById('cursor-main');
        const trails = [
            document.getElementById('cursor-trail-1'),
            document.getElementById('cursor-trail-2'),
            document.getElementById('cursor-trail-3')
        ];
        let mouseX = 0, mouseY = 0;
        let ripplePool = [];
        const MAX_RIPPLES = 12;

        for (let i = 0; i < MAX_RIPPLES; i++) {
            const el = document.createElement('div');
            el.className = 'cursor-ripple';
            el.style.cssText = 'width:0;height:0;opacity:0;position:fixed;border-radius:50%;pointer-events:none;z-index:9997;';
            document.body.appendChild(el);
            ripplePool.push({ el, active: false });
        }

        let rippleTimer = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            rippleTimer++;
            if (rippleTimer % 5 === 0) {
                spawnRipple(mouseX, mouseY);
            }
        });

        function spawnRipple(x, y) {
            const r = ripplePool.find(r => !r.active);
            if (!r) return;
            r.active = true;
            gsap.set(r.el, { left: x, top: y, width: 0, height: 0, opacity: 0.6, xPercent: -50, yPercent: -50 });
            gsap.to(r.el, {
                width: 150, height: 150, opacity: 0, duration: 1.2, ease: "power2.out",
                onComplete: () => { r.active = false; }
            });
        }

        gsap.ticker.add(() => {
            gsap.to(cursorMain, { x: mouseX - 4, y: mouseY - 4, duration: 0.15, ease: "power2.out" });
            trails.forEach((trail, i) => {
                gsap.to(trail, {
                    x: mouseX - parseInt(trail.style.width) / 2,
                    y: mouseY - parseInt(trail.style.height) / 2,
                    duration: 0.3 + i * 0.12,
                    ease: "power2.out",
                    opacity: 0.4 - i * 0.1
                });
            });
        });

        window.addEventListener('click', (e) => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => spawnRipple(e.clientX, e.clientY), i * 80);
            }
        });

        // ===================== CHOREOGRAPHED ENTRANCE =====================
        // Master entrance timeline - nav and hero are synchronized
        const entranceTl = gsap.timeline({ delay: 0.2 });

        // Nav setup
        const topNav = document.getElementById('main-nav');
        const topNavItems = topNav.querySelectorAll(':scope > *');
        gsap.set(topNav, {
            width: 0, opacity: 0, xPercent: -50, left: "50%", transformOrigin: "center center"
        });
        gsap.set(topNavItems, { opacity: 0, y: 10 });

        const navEntryTl = gsap.timeline({
            paused: true,
            onComplete: () => { topNav.style.overflow = "visible"; },
            onReverseComplete: () => { topNav.style.overflow = "hidden"; }
        });
        navEntryTl.to(topNav, {
            width: "92%", opacity: 1, duration: 0.8, ease: "expo.inOut"
        }).to(topNavItems, {
            opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: EASE_REVEAL
        }, "-=0.4");

        // Beat 1 (0.0s): Nav stretches open
        entranceTl.add(() => navEntryTl.play(), 0);

        // Beat 2 (0.3s): Hero tag fades up — overlaps with nav stretch
        entranceTl.fromTo("#hero-tag",
            { opacity: 0, y: 20, letterSpacing: "0.2em" },
            { opacity: 1, y: 0, letterSpacing: "0.6em", duration: 0.8, ease: "power3.out" }, 0.3);

        // Beat 3 (0.6s): Hero title scales in — overlaps with tag
        entranceTl.fromTo("#hero-title",
            { opacity: 0, y: 50, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }, 0.6);

        // Beat 4 (1.1s): Description appears
        entranceTl.fromTo("#hero-desc",
            { opacity: 0, y: 20 },
            { opacity: 0.6, y: 0, duration: 0.7, ease: EASE_REVEAL }, 1.1);

        // Beat 5 (1.4s): CTA button
        entranceTl.fromTo(".scroll-cta",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: EASE_REVEAL }, 1.4);

        // ===================== HERO PARALLAX LAYERS =====================
        // Layer 1: Hero text rises faster (foreground feel)
        gsap.to("#hero-content", {
            y: -200, opacity: 0, ease: "none", force3D: true,
            scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: SCRUB_TIGHT }
        });

        // Layer 2: Hero BG moves slower and fades later (background depth)
        gsap.to("#hero-bg", {
            y: 80, opacity: 0, ease: "none", force3D: true,
            scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: SCRUB_TIGHT }
        });

        // Layer 3: Particles drift at medium speed
        const particleContainer = document.getElementById('hero-particles');
        for (let i = 0; i < 15; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `position:absolute;width:${2 + Math.random() * 3}px;height:${2 + Math.random() * 3}px;background:rgba(69,193,255,${0.15 + Math.random() * 0.2});border-radius:50%;left:${Math.random() * 100}%;top:${Math.random() * 100}%;`;
            particleContainer.appendChild(dot);
            gsap.to(dot, {
                y: -80 - Math.random() * 120, x: (Math.random() - 0.5) * 60,
                opacity: 0, duration: 3 + Math.random() * 4,
                repeat: -1, delay: Math.random() * 3, ease: "none"
            });
        }
        // Particles parallax - mid layer speed
        gsap.to("#hero-particles", {
            y: -100, ease: "none", force3D: true,
            scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: SCRUB_TIGHT }
        });

        // ===================== SCROLL FADE-IN (UNIFIED) =====================
        document.querySelectorAll('.scroll-fade-in').forEach(el => {
            gsap.to(el, {
                opacity: 1, y: 0, duration: 1, ease: EASE_REVEAL, force3D: true,
                scrollTrigger: { trigger: el, start: "top 88%", end: "top 60%", scrub: SCRUB_SMOOTH }
            });
        });

        // ===================== ABOUT SECTION - PARALLAX =====================
        // Image: slower parallax (background layer) + reveal
        gsap.fromTo("#about-img",
            { scale: 1.15, filter: "grayscale(100%)" },
            {
                scale: 1, filter: "grayscale(40%)",
                scrollTrigger: { trigger: "#about", start: "top 85%", end: "top 25%", scrub: SCRUB_SMOOTH }
            }
        );

        // Image parallax drift - moves slower than scroll = depth
        gsap.to(".skew-image-wrapper", {
            y: -40, ease: "none", force3D: true,
            scrollTrigger: { trigger: "#about", start: "top bottom", end: "bottom top", scrub: SCRUB_TIGHT }
        });

        // Text content parallax - moves slightly faster = foreground
        gsap.to(".about-content", {
            y: -20, ease: "none", force3D: true,
            scrollTrigger: { trigger: "#about", start: "top bottom", end: "bottom top", scrub: SCRUB_TIGHT }
        });

        // Accent line grows (synced with about entering view)
        ScrollTrigger.create({
            trigger: "#about",
            start: "top 60%",
            onEnter: () => { document.getElementById('about-line').style.width = '80px'; },
            onLeaveBack: () => { document.getElementById('about-line').style.width = '0'; }
        });

        // Counter animation
        document.querySelectorAll('.counter').forEach(counter => {
            const target = parseInt(counter.dataset.target);
            ScrollTrigger.create({
                trigger: counter,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to({ val: 0 }, {
                        val: target, duration: 2, ease: EASE_REVEAL,
                        onUpdate: function () {
                            const v = Math.round(this.targets()[0].val);
                            counter.textContent = target === 100 ? v + '%' : v;
                        }
                    });
                }
            });
        });

        // ===================== NEWS FEATURED SLIDESHOW =====================
        const slideshow = document.getElementById('featured-slideshow');
        const slides = gsap.utils.toArray('.feature-slide');
        const slideDots = gsap.utils.toArray('.slide-dot');
        const progressBar = document.getElementById('slide-progress-bar');
        let currentSlide = 0;
        const SLIDE_DURATION = 5;

        slides.forEach((slide, i) => {
            if (i !== 0) gsap.set(slide, { x: '-100%', opacity: 0 });
        });

        function goToSlide(nextIndex) {
            if (nextIndex === currentSlide) return;
            const outSlide = slides[currentSlide];
            const inSlide = slides[nextIndex];
            inSlide.classList.add('is-active');
            gsap.fromTo(inSlide, { x: '-100%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.8, ease: "power2.inOut" });
            gsap.to(outSlide, {
                x: '100%', opacity: 0, duration: 0.8, ease: "power2.inOut",
                onComplete: () => { outSlide.classList.remove('is-active'); gsap.set(outSlide, { x: '-100%', opacity: 0 }); }
            });
            slideDots.forEach((dot, i) => dot.classList.toggle('active', i === nextIndex));
            currentSlide = nextIndex;
        }

        function nextSlide() { goToSlide((currentSlide + 1) % slides.length); }

        function startSlideProgress() {
            gsap.fromTo(progressBar, { width: '0%' }, {
                width: '100%', duration: SLIDE_DURATION, ease: "none",
                onComplete: () => { nextSlide(); startSlideProgress(); }
            });
        }

        slideDots.forEach((dot, i) => {
            dot.addEventListener('click', () => { goToSlide(i); gsap.killTweensOf(progressBar); startSlideProgress(); });
        });

        if (slideshow) {
            slideshow.addEventListener('mouseenter', () => gsap.killTweensOf(progressBar));
            slideshow.addEventListener('mouseleave', () => startSlideProgress());
        }
        startSlideProgress();

        gsap.to(".bottom-card-small img", {
            y: -20, ease: "none", force3D: true,
            scrollTrigger: { trigger: ".bottom-card-small", start: "top bottom", end: "bottom top", scrub: SCRUB_TIGHT }
        });

        // ===================== SECTOR CAROUSEL - SCROLL DRIVEN =====================
        const carouselCards = gsap.utils.toArray('.sector-carousel-card');
        const numCards = carouselCards.length;
        const cardSpacing = window.innerWidth < 480 ? 280 : window.innerWidth < 768 ? 310 : 380;

        carouselCards.forEach((card, i) => {
            gsap.set(card, { x: 0, scale: 0.6, opacity: 0, zIndex: 1, rotateY: 0, force3D: true });
        });
        gsap.set(carouselCards[0], { x: 0, scale: 1, opacity: 1, zIndex: 10 });

        function positionCarouselCards(activeFloat) {
            carouselCards.forEach((card, i) => {
                const offset = i - activeFloat;
                const absOffset = Math.abs(offset);
                const dir = offset > 0 ? 1 : -1;
                if (absOffset > 2.2) {
                    gsap.set(card, { x: dir * 20, scale: 0.5, opacity: 0, zIndex: 1, rotateY: 0, force3D: true });
                } else {
                    const x = offset * cardSpacing;
                    const scale = Math.max(0.65, 1 - absOffset * 0.15);
                    const opacity = Math.max(0.25, 1 - absOffset * 0.35);
                    const zIdx = Math.round(10 - absOffset * 3);
                    const rotateY = offset * -5;
                    const translateZ = -absOffset * 80;
                    gsap.set(card, { x, scale, opacity, zIndex: zIdx, rotateY, z: translateZ, force3D: true });
                }
            });
        }

        ScrollTrigger.create({
            trigger: "#sectors",
            pin: true,
            start: "top top",
            end: () => "+=" + (Math.max(numCards, 3) * 400),
            scrub: SCRUB_SMOOTH,
            onUpdate: (self) => {
                const progress = self.progress;
                const activeFloat = progress * (numCards - 1);
                positionCarouselCards(activeFloat);
            },
            invalidateOnRefresh: true
        });

        document.querySelectorAll('[data-tilt]').forEach(card => {
            const glow = card.querySelector('.card-glow');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -8;
                const rotateY = (x - centerX) / centerX * 8;
                gsap.to(card, { rotateX, rotateY, transformPerspective: 800, duration: 0.4, ease: EASE_REVEAL });
                if (glow) gsap.to(glow, { left: x, top: y, duration: 0.3, ease: EASE_REVEAL });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
            });
        });

        // ===================== HORIZONTAL JOURNEY =====================
        const hContainer = document.querySelector(".horizontal-container");
        const journeyFill = document.getElementById('journey-progress-fill');
        const panels = gsap.utils.toArray(".horizontal-panel");

        const journeyScroll = gsap.to(hContainer, {
            x: () => -(hContainer.scrollWidth - window.innerWidth),
            ease: "none",
            force3D: true,
            scrollTrigger: {
                trigger: "#journey", pin: true, scrub: SCRUB_JOURNEY,
                end: () => "+=" + (panels.length * window.innerWidth),
                onUpdate: (self) => {
                    if (journeyFill) journeyFill.style.width = (self.progress * 100) + '%';
                },
                invalidateOnRefresh: true
            }
        });

        // Panel content reveals - synced with container scroll
        panels.forEach((panel) => {
            const content = panel.querySelector('.panel-content');
            if (!content) return;
            gsap.from(content.children, {
                y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: EASE_REVEAL,
                force3D: true,
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: journeyScroll,
                    start: "left 75%", end: "left 45%", scrub: SCRUB_TIGHT
                }
            });

            // Panel BG parallax - image drifts slower than scroll for depth
            const bg = panel.querySelector('.panel-bg');
            if (bg) {
                gsap.fromTo(bg,
                    { x: 60 },
                    {
                        x: -60, ease: "none", force3D: true,
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: journeyScroll,
                            start: "left right", end: "right left", scrub: SCRUB_TIGHT
                        }
                    }
                );
            }
        });

        // ===================== FOOTER PARALLAX =====================
        gsap.to(".footer-bg-text", {
            y: -60, ease: "none", force3D: true,
            scrollTrigger: { trigger: ".nock-footer", start: "top bottom", end: "bottom top", scrub: SCRUB_TIGHT }
        });

        // ===================== SECTION INDICATOR =====================
        const indicator = document.getElementById('section-indicator');
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            indicator.classList.add('visible');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => indicator.classList.remove('visible'), 1500);
        }, { passive: true });

        const sectionIds = ['hero', 'about', 'news', 'sectors', 'journey'];
        sectionIds.forEach(id => {
            ScrollTrigger.create({
                trigger: `#${id}`, start: "top center", end: "bottom center",
                onEnter: () => updateDots(id), onEnterBack: () => updateDots(id)
            });
        });
        function updateDots(id) {
            document.querySelectorAll('.dot-wrapper').forEach(el => {
                el.classList.toggle('active', el.dataset.section === id);
            });
        }

        // ===================== THEME TOGGLE =====================
        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            document.documentElement.classList.toggle('light');
        });

        // ===================== SMOOTH ANCHOR CLICKS =====================
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    gsap.to(window, { scrollTo: { y: target, autoKill: false }, duration: 1.2, ease: "power3.inOut" });
                }
            });
        });

        // ===================== NAV HIDE/SHOW ON SCROLL =====================
        let lastScroll = 0;
        let isNavVisible = true;

        window.addEventListener('scroll', () => {
            const current = window.pageYOffset;
            if (current > lastScroll && current > 100) {
                if (isNavVisible) {
                    isNavVisible = false;
                    topNav.style.overflow = "hidden";
                    navEntryTl.timeScale(1).reverse();
                }
            } else if (current < lastScroll || current <= 100) {
                if (!isNavVisible) {
                    isNavVisible = true;
                    navEntryTl.timeScale(1).play();
                }
            }
            lastScroll = current;
        }, { passive: true });

        // ===================== MAGNETIC BUTTONS =====================
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
                gsap.to(btn, { x, y, duration: 0.3, ease: EASE_REVEAL });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
            });
        });

        // ===================== NEWS CARDS HOVER LIFT =====================
        document.querySelectorAll('.bento-grid > div').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -5, duration: 0.3, ease: EASE_REVEAL });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, duration: 0.4, ease: EASE_REVEAL });
            });
        });

        // ===================== SCROLL HINT =====================
        const introHint = document.getElementById('intro-scroll-hint');
        let hintRemoved = false;

        function hideHint() {
            if (hintRemoved || !introHint) return;
            hintRemoved = true;
            introHint.style.opacity = '0';
            setTimeout(() => introHint.remove(), 1000);
        }

        // Hide after entrance completes (synced: entrance ~2s + 0.5s buffer)
        setTimeout(hideHint, 2500);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) hideHint();
        }, { passive: true });

        // ===================== BRANDING TYPEWRITER =====================
        const brandEl = document.getElementById('brand-typewriter');
        const brandCursor = document.getElementById('brand-cursor');
        const brandWords = ["BG", "Biplab Group"];
        let bWordIdx = 0;
        let bIsDeleting = false;
        let bCharIdx = 2;

        function brandTypeWriter() {
            const currentWord = brandWords[bWordIdx];

            if (bIsDeleting) {
                bCharIdx--;
            } else {
                bCharIdx++;
            }

            brandEl.textContent = currentWord.substring(0, bCharIdx);

            let typeSpeed = bIsDeleting ? 50 : 80;
            let isTyping = true;

            if (!bIsDeleting && bCharIdx === currentWord.length) {
                typeSpeed = bWordIdx === 0 ? 2500 : 10000;
                bIsDeleting = true;
                isTyping = false;
            } else if (bIsDeleting && bCharIdx === 0) {
                bIsDeleting = false;
                bWordIdx = (bWordIdx + 1) % brandWords.length;
                typeSpeed = 400;
                isTyping = false;
            }

            if (brandCursor) {
                brandCursor.style.display = isTyping ? 'none' : 'block';
            }

            setTimeout(brandTypeWriter, typeSpeed);
        }

        setTimeout(() => {
            bIsDeleting = true;
            brandTypeWriter();
        }, 2000);
