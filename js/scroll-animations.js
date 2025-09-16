class ScrollAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {

        this.createScrollProgress();
        
        this.createBackToTopButton();
        
        this.initIntersectionObserver();

        this.initHeaderScroll();

        this.initParallax();

        this.addScrollListeners();
    }

    createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
    }

    createBackToTopButton() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.innerHTML = '↑';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(backToTopBtn);

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    if (entry.target.classList.contains('staggered-container')) {
                        this.animateStaggeredItems(entry.target);
                    }
                }
            });
        }, options);

        const animatedElements = document.querySelectorAll(
            '.fade-in, .slide-in-left, .slide-in-right, .zoom-in, .staggered-container, .gradient-overlay'
        );
        
        animatedElements.forEach(el => {
            this.observer.observe(el);
        });
    }

    animateStaggeredItems(container) {
        const items = container.querySelectorAll('.staggered-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 150);
        });
    }

    initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    initParallax() {
        const parallaxSections = document.querySelectorAll('.parallax');
        if (parallaxSections.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxSections.forEach(section => {
                const speed = 0.5;
                section.style.backgroundPositionY = -(scrolled * speed) + 'px';
            });
        });
    }

    addScrollListeners() {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            document.querySelector('.scroll-progress').style.width = scrolled + '%';

            const backToTopBtn = document.querySelector('.back-to-top');
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
});