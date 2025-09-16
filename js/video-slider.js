class VideoSlider {
    constructor() {
        this.slider = document.querySelector('.video-slider-container');
        this.slides = document.querySelectorAll('.video-slide');
        this.currentSlide = 0;
        this.isAutoPlay = true;
        this.autoPlayInterval = null;
        this.slideDuration = 6000;
        
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
        const descriptionContainer = document.querySelector('.intro-sec-description-container');
        if (!descriptionContainer) return;

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'video-controls';

        controlsContainer.innerHTML = `
            <button class="control-btn control-prev" aria-label="Previous video">←</button>
            <div class="control-dots"></div>
            <button class="control-btn control-next" aria-label="Next video">→</button>
        `;


        const dotsContainer = controlsContainer.querySelector('.control-dots');
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `control-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('data-slide', index);
            dot.setAttribute('aria-label', `Go to video ${index + 1}`);
            dotsContainer.appendChild(dot);
        });

        descriptionContainer.appendChild(controlsContainer);

        this.prevBtn = controlsContainer.querySelector('.control-prev');
        this.nextBtn = controlsContainer.querySelector('.control-next');
        this.dots = controlsContainer.querySelectorAll('.control-dot');
    }

    updateSlide() {
        this.slider.style.transform = `translateX(-${this.currentSlide * 100}%)`;

        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === this.slides.length - 1;

        this.pauseAllVideos();
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

    playVideo(slideIndex) {
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.slides[slideIndex].classList.add('active');
        this.stopAutoPlay();
    }

    pauseAllVideos() {
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
    }

    addEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        document.querySelectorAll('.video-play-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.playVideo(index));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            else if (e.key === 'ArrowRight') this.nextSlide();
            else if (e.key === 'Escape') this.pauseAllVideos();
        });

        this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.slider.addEventListener('mouseleave', () => {
            if (this.isAutoPlay) this.startAutoPlay();
        });

        let touchStartX = 0;
        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.slider.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.nextSlide();
                else this.prevSlide();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VideoSlider();
});