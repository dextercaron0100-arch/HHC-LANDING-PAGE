// Hero Slider
const heroSlider = {
  slides: null,
  dots: null,
  progressBar: null,
  currentDisplay: null,
  currentSlide: 0,
  slideInterval: null,
  slideDuration: 4000,
  isAnimating: false,
  hoverEnabled: false,

  init() {
    // Query elements fresh
    this.slides = document.querySelectorAll('.hero-slide');
    this.dots = document.querySelectorAll('.slider-dot');
    this.progressBar = document.querySelector('.slider-progress-bar');
    this.currentDisplay = document.querySelector('.slide-counter .current');
    
    if (!this.slides || this.slides.length === 0) {
      console.warn('No slides found');
      return;
    }
    
    // First slide is already visible via CSS, just ensure active class
    this.slides[0].classList.add('active');
    if (this.dots && this.dots.length > 0) this.dots[0].classList.add('active');
    this.updateCounter();
    
    // Start auto slideshow
    this.bindEvents();
    
    // Use setTimeout for first interval to ensure everything is ready
    const self = this;
    setTimeout(function() {
      self.startAutoSlide();
    }, 100);
    
    // Enable hover pause after first slide change
    setTimeout(function() {
      self.hoverEnabled = true;
    }, self.slideDuration + 500);
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
    const self = this;
    this.slideInterval = setInterval(function() {
      if (!self.isAnimating) {
        self.nextSlide();
      }
    }, this.slideDuration);
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

    // Pause on hover - only after first slide transition
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => {
        if (this.hoverEnabled && this.slideInterval) this.stopAutoSlide();
      });
      hero.addEventListener('mouseleave', () => {
        if (this.hoverEnabled) this.startAutoSlide();
      });
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

// Initialize slider as soon as possible
(function initSlider() {
  function doInit() {
    if (!heroSlider.slideInterval) {
      heroSlider.init();
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInit);
  } else {
    doInit();
  }
  
  // Backup: also init on window load in case DOMContentLoaded missed
  window.addEventListener('load', doInit);
  
  // Restart slider when tab becomes visible again
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && heroSlider.slides && heroSlider.slides.length > 0) {
      heroSlider.startAutoSlide();
    }
  });
})();

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

// Contact form with AJAX submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    const formNote = document.getElementById('formNote');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <span>⏳</span>';
    
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Success
        contactForm.reset();
        formNote.style.display = 'none';
        formSuccess.style.display = 'block';
        submitBtn.innerHTML = 'Sent! <span>✓</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      // Error
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit inquiry <span>📨</span>';
      alert('Oops! Something went wrong. Please try again.');
    }
  });
}

// About Section Tabs
const aboutTabBtns = document.querySelectorAll('.about-tab-btn');
const aboutPanels = document.querySelectorAll('.about-panel');

aboutTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-about-tab');
    
    // Remove active from all buttons and panels
    aboutTabBtns.forEach(b => b.classList.remove('active'));
    aboutPanels.forEach(p => p.classList.remove('active'));
    
    // Add active to clicked button and corresponding panel
    btn.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

// Handle dropdown links to About subsections
const dropdownLinks = document.querySelectorAll('.dropdown-link');

dropdownLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').replace('#', '');
    const targetPanel = document.getElementById(targetId);
    const targetBtn = document.querySelector(`[data-about-tab="${targetId}"]`);
    
    if (targetPanel && targetBtn) {
      // Remove active from all buttons and panels
      aboutTabBtns.forEach(b => b.classList.remove('active'));
      aboutPanels.forEach(p => p.classList.remove('active'));
      
      // Activate the target tab and panel
      targetBtn.classList.add('active');
      targetPanel.classList.add('active');
    }
  });
});

// Franchise Carousel
const franchiseCarousel = {
  currentIndex: 0,
  cardWidth: 340,
  visibleCards: 3,
  
  init() {
    this.tabBtns = document.querySelectorAll('.tab-btn-underline');
    this.tracks = document.querySelectorAll('.franchise-carousel-track');
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');
    
    if (!this.tabBtns.length || !this.tracks.length) return;
    
    this.bindEvents();
    this.updateVisibleCards();
    window.addEventListener('resize', () => this.updateVisibleCards());
  },
  
  updateVisibleCards() {
    const width = window.innerWidth;
    this.cardWidth = this.measureCardWidth();
    if (width < 640) {
      this.visibleCards = 1;
    } else if (width < 900) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 3;
    }
  },

  measureCardWidth() {
    const track = this.getActiveTrack();
    if (!track) return this.cardWidth;
    const firstCard = track.querySelector('.franchise-carousel-card');
    if (!firstCard) return this.cardWidth;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return firstCard.getBoundingClientRect().width + gap;
  },
  
  bindEvents() {
    // Tab switching
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetCategory = btn.dataset.tab;
        
        // Update active tab
        this.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding track
        this.tracks.forEach(track => {
          if (track.dataset.category === targetCategory) {
            track.style.display = 'flex';
          } else {
            track.style.display = 'none';
          }
        });
        
        // Reset carousel position
        this.currentIndex = 0;
        this.cardWidth = this.measureCardWidth();
        this.updateCarousel();
      });
    });
    
    // Arrow navigation
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
  },
  
  getActiveTrack() {
    return document.querySelector('.franchise-carousel-track[style*="flex"], .franchise-carousel-track:not([style*="none"])');
  },
  
  getMaxIndex() {
    const track = this.getActiveTrack();
    if (!track) return 0;
    const cards = track.querySelectorAll('.franchise-carousel-card');
    return Math.max(0, cards.length - this.visibleCards);
  },
  
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  },
  
  next() {
    if (this.currentIndex < this.getMaxIndex()) {
      this.currentIndex++;
      this.updateCarousel();
    }
  },
  
  updateCarousel() {
    const track = this.getActiveTrack();
    if (!track) return;
    this.cardWidth = this.measureCardWidth();
    
    const offset = -this.currentIndex * this.cardWidth;
    track.style.transform = `translateX(${offset}px)`;
  }
};

// Initialize franchise carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => franchiseCarousel.init());
} else {
  franchiseCarousel.init();
}
