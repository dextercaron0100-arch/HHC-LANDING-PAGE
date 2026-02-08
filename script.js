// Hero Slider
const heroSlider = {
  slides: document.querySelectorAll('.hero-slide'),
  dots: document.querySelectorAll('.slider-dot'),
  prevBtn: document.querySelector('.slider-arrow.prev'),
  nextBtn: document.querySelector('.slider-arrow.next'),
  progressBar: document.querySelector('.slider-progress-bar'),
  currentDisplay: document.querySelector('.slide-counter .current'),
  currentSlide: 0,
  slideInterval: null,
  slideDuration: 6000,
  isAnimating: false,

  init() {
    if (this.slides.length === 0) return;
    
    this.slides[0].classList.add('active');
    if (this.dots.length > 0) this.dots[0].classList.add('active');
    this.updateCounter();
    this.startAutoSlide();
    this.bindEvents();
  },

  updateCounter() {
    if (this.currentDisplay) {
      this.currentDisplay.textContent = String(this.currentSlide + 1).padStart(2, '0');
    }
  },

  goToSlide(index, direction = 'next') {
    if (this.isAnimating || index === this.currentSlide) return;
    this.isAnimating = true;

    const currentEl = this.slides[this.currentSlide];
    const nextEl = this.slides[index];

    currentEl.classList.remove('active');
    currentEl.classList.add('prev');

    nextEl.classList.add('active');

    if (this.dots.length > 0) {
      this.dots[this.currentSlide].classList.remove('active');
      this.dots[index].classList.add('active');
    }

    this.currentSlide = index;
    this.updateCounter();
    this.resetProgressBar();

    setTimeout(() => {
      currentEl.classList.remove('prev');
      this.isAnimating = false;
    }, 1200);
  },

  nextSlide() {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(next, 'next');
  },

  prevSlide() {
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev, 'prev');
  },

  startAutoSlide() {
    this.stopAutoSlide();
    this.resetProgressBar();
    this.slideInterval = setInterval(() => this.nextSlide(), this.slideDuration);
  },

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  },

  resetProgressBar() {
    if (!this.progressBar) return;
    this.progressBar.classList.remove('running');
    void this.progressBar.offsetWidth;
    this.progressBar.classList.add('running');
  },

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prevSlide();
        this.startAutoSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.startAutoSlide();
      });
    }

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.startAutoSlide();
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
        this.startAutoSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
        this.startAutoSlide();
      }
    });

    // Pause on hover
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => this.stopAutoSlide());
      hero.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderWrapper = document.querySelector('.hero-slider-wrapper');
    
    if (sliderWrapper) {
      sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      sliderWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
          this.startAutoSlide();
        }
      }, { passive: true });
    }
  }
};

// Initialize slider
heroSlider.init();

// Nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => revealObserver.observe(el));

// Back to top
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  document.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Animate stats
const statNumbers = document.querySelectorAll('.stat-number');
const statsSection = document.querySelector('.stats-strip');

if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(stat => {
          const finalText = stat.getAttribute('data-value') || stat.textContent;
          const numericMatch = finalText.match(/[\d,]+/);
          if (numericMatch) {
            const finalNumber = parseInt(numericMatch[0].replace(/,/g, ''));
            const duration = 1500;
            const start = Date.now();
            const prefix = finalText.substring(0, finalText.indexOf(numericMatch[0]));
            const suffix = finalText.substring(finalText.indexOf(numericMatch[0]) + numericMatch[0].length);
            
            const animate = () => {
              const elapsed = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(finalNumber * eased);
              stat.textContent = prefix + current.toLocaleString() + suffix;
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                stat.textContent = finalText;
              }
            };
            animate();
          }
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statsObserver.observe(statsSection);
}
