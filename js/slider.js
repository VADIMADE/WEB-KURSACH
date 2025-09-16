class ReviewSlider {
    constructor() {
        this.slider = document.querySelector('.slider-container');
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.isAutoPlay = true;
        this.autoPlayInterval = null;
        this.slideDuration = 5000;
        
        this.init();
    }

    init() {
        if (!this.slider || this.slides.length === 0) return;

        this.createControls();
        this.updateSlide();
        this.startAutoPlay();
        this.addEventListeners();
    }

    createControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'slider-controls';


        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-btn slider-prev';
        prevBtn.innerHTML = '←';
        prevBtn.setAttribute('aria-label', 'Previous slide');

        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-btn slider-next';
        nextBtn.innerHTML = '→';
        nextBtn.setAttribute('aria-label', 'Next slide');

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';

        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('data-slide', index);
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotsContainer.appendChild(dot);
        });

        const autoplayContainer = document.createElement('div');
        autoplayContainer.className = 'slider-autoplay';
        
        const autoplayBtn = document.createElement('button');
        autoplayBtn.className = 'slider-autoplay-btn';
        autoplayBtn.textContent = 'Pause Auto Play';
        autoplayBtn.setAttribute('aria-label', 'Toggle autoplay');

        controlsContainer.appendChild(prevBtn);
        controlsContainer.appendChild(dotsContainer);
        controlsContainer.appendChild(nextBtn);

        const sliderWrapper = this.slider.parentElement;
        sliderWrapper.appendChild(controlsContainer);
        sliderWrapper.appendChild(autoplayContainer);
        autoplayContainer.appendChild(autoplayBtn);

        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
        this.dots = dotsContainer.querySelectorAll('.slider-dot');
        this.autoplayBtn = autoplayBtn;
    }

    updateSlide() {
        this.slider.style.transform = `translateX(-${this.currentSlide * 100}%)`;

        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === this.slides.length - 1;
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        this.currentSlide = index;
        this.updateSlide();
        this.restartAutoPlay();
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.updateSlide();
            this.restartAutoPlay();
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlide();
            this.restartAutoPlay();
        }
    }

    startAutoPlay() {
        if (this.isAutoPlay) {
            this.autoPlayInterval = setInterval(() => {
                if (this.currentSlide === this.slides.length - 1) {
                    this.goToSlide(0);
                } else {
                    this.nextSlide();
                }
            }, this.slideDuration);
        }
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        if (this.isAutoPlay) {
            this.startAutoPlay();
        }
    }

    toggleAutoPlay() {
        this.isAutoPlay = !this.isAutoPlay;
        
        if (this.isAutoPlay) {
            this.startAutoPlay();
            this.autoplayBtn.textContent = 'Pause Auto Play';
        } else {
            this.stopAutoPlay();
            this.autoplayBtn.textContent = 'Play Auto Play';
        }
    }

    addEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        this.autoplayBtn.addEventListener('click', () => this.toggleAutoPlay());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            } else if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoPlay();
            }
        });

        this.slider.addEventListener('mouseenter', () => {
            if (this.isAutoPlay) {
                this.stopAutoPlay();
            }
        });

        this.slider.addEventListener('mouseleave', () => {
            if (this.isAutoPlay) {
                this.startAutoPlay();
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;

        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide(); 
                } else {
                    this.prevSlide(); 
                }
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ReviewSlider();
});