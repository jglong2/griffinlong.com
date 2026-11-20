const slideInCards = document.querySelectorAll('.slide-in-card, .slide-in-left');

if ('IntersectionObserver' in window && slideInCards.length) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  slideInCards.forEach((card) => observer.observe(card));
} else {
  // Fallback: show cards immediately if IntersectionObserver is not supported
  slideInCards.forEach((card) => card.classList.add('is-visible'));
}

// Decrypted Text Animation
class DecryptedText {
  constructor(element, options = {}) {
    this.element = element;
    this.text = element.dataset.text || element.textContent;
    this.speed = options.speed || 50;
    this.maxIterations = options.maxIterations || 20;
    this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    this.animateOn = element.dataset.animateOn || options.animateOn || 'hover';
    this.revealDirection = element.dataset.revealDirection || options.revealDirection || 'left';
    this.animated = false;
    
    this.init();
  }

  init() {
    // Split text into characters
    this.chars = this.text.split('');
    this.currentIteration = 0;
    
    // Check if there's a red start index (for styling part of the text)
    this.redStartIndex = this.element.dataset.redStart ? parseInt(this.element.dataset.redStart) : null;
    
    // Create encrypted display
    this.element.innerHTML = '';
    this.chars.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'encrypted-char';
      
      // Apply red styling if this character is part of the red section
      if (this.redStartIndex !== null && index >= this.redStartIndex) {
        span.classList.add('text-danger');
      }
      
      span.dataset.index = index;
      span.dataset.original = char;
      if (char === ' ') {
        span.textContent = ' ';
        span.style.width = '0.25em';
        span.style.display = 'inline-block';
      } else {
        span.textContent = this.getRandomChar();
      }
      this.element.appendChild(span);
    });

    // Set up animation trigger
    if (this.animateOn === 'view') {
      this.setupViewAnimation();
    } else if (this.animateOn === 'hover') {
      this.element.addEventListener('mouseenter', () => this.animate());
      this.element.addEventListener('mouseleave', () => this.reset());
    } else {
      // Immediate animation
      this.animate();
    }
  }

  setupViewAnimation() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animated) {
            this.animate();
            this.animated = true;
            observer.unobserve(this.element);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(this.element);
  }

  getRandomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  animate() {
    // Always complete all iterations before finishing
    if (this.currentIteration >= this.maxIterations) {
      this.reveal();
      return;
    }

    const charElements = this.element.querySelectorAll('.encrypted-char');
    const total = this.chars.length;
    
    // Calculate progress (0 to 1) based on current iteration
    const progress = this.currentIteration / this.maxIterations;
    
    // Calculate how many characters should be revealed based on progress
    // This ensures we reveal progressively through all iterations
    const revealedCount = Math.min(total, Math.floor(progress * total) + 1);
    
    // Get which indices should be revealed based on direction
    const revealIndices = this.getRevealIndices(revealedCount, total);

    // Update all characters
    charElements.forEach((charEl, index) => {
      if (charEl.dataset.original === ' ') {
        return; // Skip spaces
      }

      // If this character should be revealed
      if (revealIndices.includes(index)) {
        // On the last iteration, always show correct character
        // On earlier iterations, show correct character (they're "locked in")
        if (this.currentIteration >= this.maxIterations - 1) {
          charEl.textContent = charEl.dataset.original;
        } else {
          // Show actual character but allow occasional flicker for effect
          charEl.textContent = Math.random() < 0.1 ? this.getRandomChar() : charEl.dataset.original;
        }
      } else {
        // Keep scrambling for characters not yet revealed
        charEl.textContent = this.getRandomChar();
      }
    });

    this.currentIteration++;
    setTimeout(() => this.animate(), this.speed);
  }

  getRevealIndices(revealedCount, total) {
    if (this.revealDirection === 'center') {
      // Reveal from center outward
      const center = Math.floor(total / 2);
      const indices = [];
      
      // Alternate between right and left of center
      for (let i = 0; i < revealedCount; i++) {
        const offset = Math.floor(i / 2);
        if (i % 2 === 0) {
          // Right side
          if (center + offset < total) {
            indices.push(center + offset);
          }
        } else {
          // Left side
          if (center - offset - 1 >= 0) {
            indices.push(center - offset - 1);
          }
        }
      }
      
      // Sort to ensure proper order
      return [...new Set(indices)].sort((a, b) => a - b);
    } else if (this.revealDirection === 'right') {
      // Reveal from right to left
      return Array.from({ length: revealedCount }, (_, i) => total - 1 - i).filter(i => i >= 0);
    } else {
      // Default: reveal from left to right
      return Array.from({ length: revealedCount }, (_, i) => i);
    }
  }

  reveal() {
    const charElements = this.element.querySelectorAll('.encrypted-char');
    charElements.forEach((charEl) => {
      charEl.textContent = charEl.dataset.original;
    });
    this.element.classList.add('revealed');
  }

  reset() {
    this.currentIteration = 0;
    const charElements = this.element.querySelectorAll('.encrypted-char');
    charElements.forEach((charEl) => {
      if (charEl.dataset.original !== ' ') {
        charEl.textContent = this.getRandomChar();
      }
    });
    this.element.classList.remove('revealed');
  }
}

// Hide loader when page is loaded and initialize animations after
window.addEventListener('load', () => {
  const loaderOverlay = document.getElementById('loader-overlay');
  if (loaderOverlay) {
    // Hide content during loading
    document.body.style.overflow = 'hidden';

    const finishLoading = () => {
      loaderOverlay.classList.add('hidden');
      document.body.style.overflow = '';
      document.body.classList.remove('has-loader');
      
      // Initialize decrypted text animation after loader finishes
      setTimeout(() => {
        const decryptedElements = document.querySelectorAll('.decrypted-text');
        decryptedElements.forEach((element) => {
          new DecryptedText(element);
        });
      }, 100);
    };
    
    // Show loader for longer duration (3 seconds minimum)
    setTimeout(finishLoading, 3000);
  } else {
    // If no loader, initialize immediately
    const decryptedElements = document.querySelectorAll('.decrypted-text');
    decryptedElements.forEach((element) => {
      new DecryptedText(element);
    });
  }
});

// Initialize other effects on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

  // Initialize ChromaGrid effect
  const chromaGrids = document.querySelectorAll('.chroma-grid');
  chromaGrids.forEach((grid) => {
    new ChromaGrid(grid, {
      radius: 300,
      damping: 0.45,
      fadeOut: 0.6
    });
  });

  // Initialize card spotlight effects
  const cards = document.querySelectorAll('.experience-card, .expertise-card, .content-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Initialize GooeyNav
  const gooeyNav = document.querySelector('.gooey-nav-container');
  if (gooeyNav) {
    new GooeyNav(gooeyNav, {
      particleCount: 15,
      particleDistances: [90, 10],
      particleR: 100,
      initialActiveIndex: 0,
      animationTime: 600,
      timeVariance: 300,
      colors: [1, 2, 3, 1, 2, 3, 1, 4]
    });
  }
});

// ChromaGrid Effect
class ChromaGrid {
  constructor(element, options = {}) {
    this.element = element;
    this.radius = options.radius || 300;
    this.damping = options.damping || 0.45;
    this.fadeOut = options.fadeOut || 0.6;
    
    this.overlay = element.querySelector('.chroma-overlay');
    this.fade = element.querySelector('.chroma-fade');
    
    this.pos = { x: 0, y: 0 };
    this.targetPos = { x: 0, y: 0 };
    this.fadeOpacity = 1;
    this.targetFadeOpacity = 1;
    
    this.init();
  }

  init() {
    const rect = this.element.getBoundingClientRect();
    this.pos.x = rect.width / 2;
    this.pos.y = rect.height / 2;
    this.targetPos.x = this.pos.x;
    this.targetPos.y = this.pos.y;
    
    this.updateCSSVars();
    
    this.element.addEventListener('pointermove', (e) => this.handleMove(e));
    this.element.addEventListener('pointerleave', () => this.handleLeave());
    this.animate();
  }

  handleMove(e) {
    const rect = this.element.getBoundingClientRect();
    this.targetPos.x = e.clientX - rect.left;
    this.targetPos.y = e.clientY - rect.top;
    
    if (this.fade) {
      this.targetFadeOpacity = 0;
      this.fade.style.opacity = 0;
    }
  }

  handleLeave() {
    if (this.fade) {
      this.targetFadeOpacity = 1;
      this.fade.style.transition = `opacity ${this.fadeOut}s ease`;
      this.fade.style.opacity = 1;
    }
  }

  updateCSSVars() {
    this.element.style.setProperty('--x', `${this.pos.x}px`);
    this.element.style.setProperty('--y', `${this.pos.y}px`);
  }

  animate() {
    // Smooth interpolation for position
    const dx = this.targetPos.x - this.pos.x;
    const dy = this.targetPos.y - this.pos.y;
    
    this.pos.x += dx * (1 - this.damping);
    this.pos.y += dy * (1 - this.damping);
    
    this.updateCSSVars();
    
    requestAnimationFrame(() => this.animate());
  }
}

// GooeyNav Effect
class GooeyNav {
  constructor(element, options = {}) {
    this.container = element;
    this.nav = element.querySelector('nav');
    this.filter = element.querySelector('.effect.filter');
    this.text = element.querySelector('.effect.text');
    this.listItems = element.querySelectorAll('nav ul li');
    
    this.particleCount = options.particleCount || 15;
    this.particleDistances = options.particleDistances || [90, 10];
    this.particleR = options.particleR || 100;
    this.animationTime = options.animationTime || 600;
    this.timeVariance = options.timeVariance || 300;
    this.colors = options.colors || [1, 2, 3, 1, 2, 3, 1, 4];
    this.activeIndex = options.initialActiveIndex || 0;
    
    this.init();
  }

  noise(n = 1) {
    return n / 2 - Math.random() * n;
  }

  getXY(distance, pointIndex, totalPoints) {
    const angle = ((360 + this.noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }

  createParticle(i, t, d, r) {
    let rotate = this.noise(r / 10);
    return {
      start: this.getXY(d[0], this.particleCount - i, this.particleCount),
      end: this.getXY(d[1] + this.noise(7), this.particleCount - i, this.particleCount),
      time: t,
      scale: 1 + this.noise(0.2),
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  }

  makeParticles(element) {
    const d = this.particleDistances;
    const r = this.particleR;
    const bubbleTime = this.animationTime * 2 + this.timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < this.particleCount; i++) {
      const t = this.animationTime * 2 + this.noise(this.timeVariance * 2);
      const p = this.createParticle(i, t, d, r);
      
      element.classList.remove('active');
      
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => {
          element.classList.add('active');
        });

        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Do nothing
          }
        }, t);
      }, 30);
    }
  }

  updateEffectPosition(element) {
    if (!this.container || !this.filter || !this.text) return;
    
    const containerRect = this.container.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    
    Object.assign(this.filter.style, styles);
    Object.assign(this.text.style, styles);
    this.text.textContent = element.textContent.trim();
  }

  handleClick(e, index) {
    const liEl = e.currentTarget;
    if (this.activeIndex === index) return;
    
    this.activeIndex = index;
    
    // Update active class
    this.listItems.forEach((li, i) => {
      li.classList.toggle('active', i === index);
    });
    
    this.updateEffectPosition(liEl);
    
    // Clear existing particles
    if (this.filter) {
      const particles = this.filter.querySelectorAll('.particle');
      particles.forEach(p => {
        try {
          this.filter.removeChild(p);
        } catch {
          // Do nothing
        }
      });
    }
    
    // Reset text effect
    if (this.text) {
      this.text.classList.remove('active');
      void this.text.offsetWidth; // Force reflow
      this.text.classList.add('active');
    }
    
    // Create new particles
    if (this.filter) {
      this.filter.classList.add('active');
      this.makeParticles(this.filter);
    }
  }

  init() {
    // Set up click handlers
    this.listItems.forEach((li, index) => {
      const link = li.querySelector('a');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleClick({ currentTarget: li }, index);
          
          // Scroll to section
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
        
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClick({ currentTarget: li }, index);
            
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
              const target = document.querySelector(href);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        });
      }
    });
    
    // Initialize active state
    const activeLi = this.listItems[this.activeIndex];
    if (activeLi) {
      this.updateEffectPosition(activeLi);
      if (this.text) {
        this.text.classList.add('active');
      }
      if (this.filter) {
        this.filter.classList.add('active');
      }
    }
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = this.listItems[this.activeIndex];
      if (currentActiveLi) {
        this.updateEffectPosition(currentActiveLi);
      }
    });
    
    if (this.container) {
      resizeObserver.observe(this.container);
    }
  }
}
