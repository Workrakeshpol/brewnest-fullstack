/* ==========================================================================
   BREWNEST CAFE INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize All Sub-systems
    initFloatingBeans();
    initCustomCursor();
    initScrollAnimations();
    initNavigation();
    initTestimonialSlider();
    initShoppingCart();
    initNewsletterForm();
});

/* ==========================================================================
   1. FLOATING COFFEE BEANS SYSTEM
   ========================================================================== */
function initFloatingBeans() {
    const container = document.getElementById('beans-container');
    if (!container) return;

    // SVG path representing an artistic minimal coffee bean outline
    const beanSVG = `
        <svg viewBox="0 0 50 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M46.7 17.5C46.7 26.2 38.3 33.2 28 33.2C17.7 33.2 3.3 25.2 3.3 16.5C3.3 7.8 11.7 0.8 22 0.8C32.3 0.8 46.7 8.8 46.7 17.5Z" fill="#3D291F" fill-opacity="0.75"/>
            <path d="M4.5 16C12.5 19 18.5 13 25 15.5C31.5 18 36.5 14 45.5 17" stroke="#160F0D" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
    `;

    const BEAN_COUNT = 15;

    for (let i = 0; i < BEAN_COUNT; i++) {
        createSingleBean(container, beanSVG);
    }
}

function createSingleBean(container, svgContent) {
    const bean = document.createElement('div');
    bean.className = 'floating-bean';
    bean.innerHTML = svgContent;

    // Randomize initial properties
    const size = Math.random() * 20 + 15; // sizes between 15px and 35px
    const startLeft = Math.random() * 100; // start anywhere horizontally
    const duration = Math.random() * 15 + 20; // slow moving floating: 20s to 35s
    const delay = Math.random() * -30; // negative delay so beans are already on screen

    bean.style.width = `${size}px`;
    bean.style.height = `${size * 0.7}px`;
    bean.style.left = `${startLeft}vw`;
    bean.style.animationDuration = `${duration}s`;
    bean.style.animationDelay = `${delay}s`;
    
    // Vary opacity slightly for depth of field
    bean.style.opacity = Math.random() * 0.12 + 0.05;

    container.appendChild(bean);

    // Re-position when animation loop ends
    bean.addEventListener('animationiteration', () => {
        bean.style.left = `${Math.random() * 100}vw`;
    });
}

/* ==========================================================================
   2. CUSTOM CURSOR & FOLLOWER SYSTEM
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    if (!cursor || !follower) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    // Follower damping/delay variables
    const damping = 0.12;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant cursor movement
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Animate follower loop
    function animateFollower() {
        // Linear interpolation to make the follower lag behind smoothly
        posX += (mouseX - posX) * damping;
        posY += (mouseY - posY) * damping;

        follower.style.left = `${posX}px`;
        follower.style.top = `${posY}px`;

        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Scale cursor on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .coffee-card, .gallery-item, .add-to-cart');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            follower.style.transform = 'translate(-50%, -50%) scale(1.8)';
            follower.style.borderColor = 'var(--color-gold-deep)';
            follower.style.backgroundColor = 'rgba(212, 175, 55, 0.06)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
            follower.style.borderColor = 'var(--color-gold-brushed)';
            follower.style.backgroundColor = 'transparent';
        });
    });
}

/* ==========================================================================
   3. SCROLL TRIGGERS & REVEAL SYSTEM
   ========================================================================== */
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // only reveal once
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Add parallax effect to hero elements
    const heroBag = document.querySelector('.floating-hero-bag');
    const heroSpecs = document.querySelector('.hero-specs-card');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroBag) {
            heroBag.style.transform = `translateY(${scrolled * 0.15}px) rotate(${scrolled * 0.02}deg)`;
        }
        if (heroSpecs) {
            heroSpecs.style.transform = `translateY(${scrolled * -0.08}px)`;
        }
    });
}

/* ==========================================================================
   4. NAVIGATION & HEADER STICKY SYSTEM
   ========================================================================== */
function initNavigation() {
    const header = document.querySelector('.main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    // Scroll styling helper
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link tracking
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.pageYOffset >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => {
            mobileDrawer.classList.toggle('open');
            mobileToggle.classList.toggle('active');
            
            // Toggle hamburger icon animation
            const bars = mobileToggle.querySelectorAll('.bar');
            if (mobileDrawer.classList.contains('open')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                bars[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.transform = 'none';
            }
        });

        // Close drawer on link clicks
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                mobileToggle.classList.remove('active');
                const bars = mobileToggle.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.transform = 'none';
            });
        });
    }
}

/* ==========================================================================
   5. TESTIMONIAL SLIDER CAROUSEL
   ========================================================================== */
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoPlayTimer;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Handle bounds wrap-around
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        resetAutoplay();
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Set up click handlers
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => showSlide(idx));
    });

    // Autoplay functionality
    function startAutoplay() {
        autoPlayTimer = setInterval(nextSlide, 7000); // cycle reviews every 7s
    }

    function resetAutoplay() {
        clearInterval(autoPlayTimer);
        startAutoplay();
    }

    startAutoplay();
}

/* ==========================================================================
   6. SHOPPING CART SYSTEM
   ========================================================================== */
function initShoppingCart() {
    const cartTrigger = document.querySelector('.cart-trigger');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartElements = document.querySelectorAll('.close-cart, .close-cart-btn, #cart-overlay');
    
    const cartBadge = document.querySelector('.cart-badge');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalText = document.querySelector('.subtotal-amount');

    let cartList = [];

    // Trigger opening cart
    if (cartTrigger && cartDrawer && cartOverlay) {
        cartTrigger.addEventListener('click', () => {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('show');
        });
    }

    // Close cart triggers
    closeCartElements.forEach(el => {
        el.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('show');
        });
    });

    // Add to cart buttons
    const addButtons = document.querySelectorAll('.add-to-cart');
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.coffee-card');
            if (!card) return;

            const name = card.querySelector('.coffee-name').textContent;
            const priceStr = card.querySelector('.price').textContent;
            const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
            const imageSrc = card.querySelector('.card-img').getAttribute('src');
            const classes = card.querySelector('.card-img').className; // capture color classes

            // Add item to state array
            addToCartList(name, price, imageSrc, classes);
            
            // Auto open cart on addition
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('show');
        });
    });

    function addToCartList(name, price, imageSrc, imgClass) {
        const existing = cartList.find(item => item.name === name);
        if (existing) {
            existing.qty += 1;
        } else {
            cartList.push({ name, price, imageSrc, imgClass, qty: 1 });
        }
        updateCartUI();
    }

    function updateCartUI() {
        // Update badge
        const totalItems = cartList.reduce((acc, curr) => acc + curr.qty, 0);
        cartBadge.textContent = totalItems;
        
        // Show item list or empty notice
        if (cartList.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fa-solid fa-mug-hot"></i>
                    <p>Your bag is currently empty.</p>
                    <a href="#featured" class="btn-primary btn-gold btn-sm close-cart-btn">Explore Single Origins</a>
                </div>
            `;
            
            // Re-bind click event on dynamically injected close button
            const injectedBtn = cartItemsContainer.querySelector('.close-cart-btn');
            if (injectedBtn) {
                injectedBtn.addEventListener('click', () => {
                    cartDrawer.classList.remove('open');
                    cartOverlay.classList.remove('show');
                });
            }

            subtotalText.textContent = '$0.00';
            return;
        }

        let cartHTML = '';
        let totalSum = 0;

        cartList.forEach((item, index) => {
            const itemSum = item.price * item.qty;
            totalSum += itemSum;

            cartHTML += `
                <div class="cart-item">
                    <img src="${item.imageSrc}" class="cart-item-img ${item.imgClass}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        <div class="cart-item-qty">
                            <button class="qty-btn dec-qty" data-index="${index}"><i class="fa-solid fa-minus"></i></button>
                            <span class="qty-num">${item.qty}</span>
                            <button class="qty-btn inc-qty" data-index="${index}"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        subtotalText.textContent = `$${totalSum.toFixed(2)}`;

        // Re-bind listeners for qty changes
        bindCartActionListeners();
    }

    function bindCartActionListeners() {
        // Decrease Qty
        cartItemsContainer.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                if (cartList[idx].qty > 1) {
                    cartList[idx].qty -= 1;
                } else {
                    cartList.splice(idx, 1);
                }
                updateCartUI();
            });
        });

        // Increase Qty
        cartItemsContainer.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cartList[idx].qty += 1;
                updateCartUI();
            });
        });

        // Remove item entirely
        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                cartList.splice(idx, 1);
                updateCartUI();
            });
        });
    }
}

/* ==========================================================================
   7. NEWSLETTER FORM HANDLER
   ========================================================================== */
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const input = form.querySelector('input');
        
        if (!submitBtn || !input) return;

        // Show elegant glass loading indicator
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.classList.remove('loading');
            
            // Show premium success feedback
            const container = form.parentElement;
            container.innerHTML = `
                <div class="success-message reveal-on-scroll revealed" style="text-align: center; padding: 20px 0;">
                    <div class="success-icon" style="font-size: 3rem; color: var(--color-gold-brushed); margin-bottom: 20px;">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h3 style="font-size: 2rem; margin-bottom: 12px; color: var(--color-primary-espresso);">You're In The Circle</h3>
                    <p style="color: var(--color-text-muted); max-width: 420px; margin: 0 auto;">We have sent a confirmation email to <strong>${input.value}</strong>. Get ready to experience single-origins at their absolute peaks.</p>
                </div>
            `;
        }, 1800);
    });
}
