/**
 * NEXA - Premium Streetwear E-Commerce Engine
 * Developed with vanilla JavaScript (ES6+)
 */

// 1. DATA DE PRODUCTOS (BASE DE DATOS EN MEMORIA LOCAL)
const PRODUCTS = [
    {
        id: "nexa-01",
        title: "Oversized Boxy Tee",
        category: "camisetas",
        price: 45.00,
        colors: ["#0D0D0D", "#EAEAEA", "#2563EB"],
        img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "nexa-02",
        title: "Signature Heavy Hoodie",
        category: "hoodies",
        price: 115.00,
        colors: ["#0D0D0D", "#A0A0A0"],
        img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "nexa-03",
        title: "Cargo Minimal Pants",
        category: "pantalones",
        price: 125.00,
        colors: ["#0D0D0D", "#EAEAEA"],
        img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "nexa-04",
        title: "Technical Cap Black",
        category: "accesorios",
        price: 35.00,
        colors: ["#0D0D0D"],
        img: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "nexa-05",
        title: "Raw Edge Heavy Tee",
        category: "camisetas",
        price: 50.00,
        colors: ["#EAEAEA"],
        img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "nexa-06",
        title: "Luxury Tech Hoodie",
        category: "hoodies",
        price: 130.00,
        colors: ["#2563EB", "#0D0D0D"],
        img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "nexa-07",
        title: "Classic Track Denim",
        category: "pantalones",
        price: 140.00,
        colors: ["#0D0D0D"],
        img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "nexa-08",
        title: "Premium Duffel Bag",
        category: "accesorios",
        price: 150.00,
        colors: ["#0D0D0D"],
        img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80"
    }
];

// Estado global de la App
let cart = JSON.parse(localStorage.getItem('NEXA_CART')) || [];
let activeCategory = "all";
let maxPrice = 150;

// ==========================================================================
// DOM COMPONENT LOAD
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // 1. Quitar Loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 1200);

    // 2. Render de UI inicial
    renderProducts();
    updateCartUI();
    setupHeaderScroll();
    setupNavigation();
    setupSearch();
    setupFilters();
    setupCartControls();
    setupCarousel();
    setupIntersectionObserver();
    setupThemeToggle();
    setupNewsletter();
    setupLazyLoading();
}

// ==========================================================================
// RENDER DE PRODUCTOS
// ==========================================================================
function renderProducts(searchQuery = "") {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    const filtered = PRODUCTS.filter(prod => {
        const matchesCategory = activeCategory === "all" || prod.category === activeCategory;
        const matchesPrice = prod.price <= maxPrice;
        const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              prod.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesPrice && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="no-products">NO SE ENCONTRARON PIEZAS DISPONIBLES EN ESTE RANGO.</div>`;
        return;
    }

    filtered.forEach(prod => {
        const colorsHtml = prod.colors.map(col => `<span class="color-dot" style="background-color: ${col}"></span>`).join('');
        
        const card = document.createElement("div");
        card.className = "product-card scroll-reveal";
        card.innerHTML = `
            <div class="product-img-container">
                <img data-src="${prod.img}" alt="${prod.title}" class="lazy-image">
                <div class="product-actions">
                    <button class="btn btn-primary w-100 btn-add-cart" data-id="${prod.id}">AGREGAR AL CARRITO</button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-colors">
                    ${colorsHtml}
                </div>
                <h3 class="product-title">${prod.title}</h3>
                <span class="product-price">$${prod.price.toFixed(2)}</span>
            </div>
        `;
        grid.appendChild(card);
    });

    // Reasignar manejadores de eventos a botones creados dinámicamente
    document.querySelectorAll(".btn-add-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            addToCart(id);
        });
    });

    // Volver a activar Lazy Loading para las nuevas imágenes cargadas
    setupLazyLoading();
}

// ==========================================================================
// SCRIPT DE CARRITO NATIVO
// ==========================================================================
function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    openCartSidebar();
}

function updateCartUI() {
    localStorage.setItem('NEXA_CART', JSON.stringify(cart));
    
    const cartCount = document.getElementById("cart-count");
    const sidebarCount = document.getElementById("cart-sidebar-count");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalPrice = document.getElementById("cart-total-price");

    // Contador total
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalQty;
    sidebarCount.textContent = totalQty;

    // Items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div class="cart-empty-message">TU CARRITO ESTÁ VACÍO</div>`;
        cartTotalPrice.textContent = "$0.00";
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";
        itemElement.innerHTML = `
            <img src="${item.img}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartTotalPrice.textContent = `$${total.toFixed(2)}`;

    // Manejadores de Cantidad / Borrado
    document.querySelectorAll(".qty-plus").forEach(b => b.addEventListener("click", (e) => adjustQty(e.target.dataset.id, 1)));
    document.querySelectorAll(".qty-minus").forEach(b => b.addEventListener("click", (e) => adjustQty(e.target.dataset.id, -1)));
    document.querySelectorAll(".cart-item-remove").forEach(b => b.addEventListener("click", (e) => removeItem(e.target.dataset.id)));
}

function adjustQty(id, amount) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            removeItem(id);
        } else {
            updateCartUI();
        }
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function openCartSidebar() {
    document.getElementById("cart-sidebar").classList.add("active");
    document.getElementById("cart-overlay").classList.add("active");
}

function closeCartSidebar() {
    document.getElementById("cart-sidebar").classList.remove("active");
    document.getElementById("cart-overlay").classList.remove("active");
}

function setupCartControls() {
    document.getElementById("cart-trigger").addEventListener("click", openCartSidebar);
    document.getElementById("cart-close").addEventListener("click", closeCartSidebar);
    document.getElementById("cart-overlay").addEventListener("click", closeCartSidebar);
}

// ==========================================================================
// CONTROLES DE FILTRADO (CATEGORÍA & PRECIO)
// ==========================================================================
function setupFilters() {
    // 1. Filtros por Botones de Categorías
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            filterButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.getAttribute("data-filter");
            renderProducts();
        });
    });

    // 2. Click Directo en Tarjeta de Categoría
    const catCards = document.querySelectorAll(".card-btn");
    catCards.forEach(card => {
        card.addEventListener("click", (e) => {
            const filterValue = e.target.getAttribute("data-filter");
            activeCategory = filterValue;
            
            // Sincronizar botones principales
            filterButtons.forEach(b => {
                if (b.getAttribute("data-filter") === filterValue) {
                    b.classList.add("active");
                } else {
                    b.classList.remove("active");
                }
            });
            renderProducts();
        });
    });

    // 3. Rango de Precios
    const priceRange = document.getElementById("price-range");
    const priceDisplay = document.getElementById("price-display");
    priceRange.addEventListener("input", (e) => {
        maxPrice = parseFloat(e.target.value);
        priceDisplay.textContent = `$${maxPrice}`;
        renderProducts();
    });
}

// ==========================================================================
// SCRIPT DE BUSCADOR CON ANIMACIÓN DESLIZANTE
// ==========================================================================
function setupSearch() {
    const trigger = document.getElementById("search-trigger");
    const overlay = document.getElementById("search-overlay");
    const close = document.getElementById("search-close");
    const input = document.getElementById("search-input");

    trigger.addEventListener("click", () => {
        overlay.classList.add("active");
        setTimeout(() => input.focus(), 300);
    });

    close.addEventListener("click", () => {
        overlay.classList.remove("active");
        input.value = "";
        renderProducts();
    });

    input.addEventListener("input", (e) => {
        renderProducts(e.target.value);
    });
}

// ==========================================================================
// SCROLL NAVBAR & ACCESORIOS DE VISUALIZACIÓN
// ==========================================================================
function setupHeaderScroll() {
    const header = document.getElementById("main-header");
    const scrollTopBtn = document.getElementById("scroll-top-btn");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
            header.classList.remove("header-transparent");
            scrollTopBtn.classList.add("active");
        } else {
            header.classList.remove("scrolled");
            header.classList.add("header-transparent");
            scrollTopBtn.classList.remove("active");
        }
    });

    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ==========================================================================
// MENÚ DE HAMBURGUESA RESPONSIVE
// ==========================================================================
function setupNavigation() {
    const trigger = document.getElementById("mobile-menu-trigger");
    const menu = document.getElementById("nav-menu");
    const links = document.querySelectorAll(".nav-link");

    trigger.addEventListener("click", () => {
        menu.classList.toggle("active");
        trigger.classList.toggle("active");
    });

    links.forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            trigger.classList.remove("active");
            
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });
}

// ==========================================================================
// CARRUSEL DE ARRASTRE NATIVO AUTOMÁTICO/MANUAL
// ==========================================================================
function setupCarousel() {
    const track = document.getElementById("carousel-track");
    const container = document.getElementById("carousel-container");
    const prev = document.getElementById("carousel-prev");
    const next = document.getElementById("carousel-next");
    
    let isDragging = false;
    let startPosition = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let currentIndex = 0;

    // Eventos Mouse & Touch para arrastre manual
    container.addEventListener('mousedown', dragStart);
    container.addEventListener('touchstart', dragStart, { passive: true });
    container.addEventListener('mouseup', dragEnd);
    container.addEventListener('mouseleave', dragEnd);
    container.addEventListener('touchend', dragEnd);
    container.addEventListener('mousemove', drag);
    container.addEventListener('touchmove', drag, { passive: true });

    function dragStart(e) {
        isDragging = true;
        startPosition = getPositionX(e);
        animationID = requestAnimationFrame(animation);
        track.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;
        const currentPosition = getPositionX(e);
        currentTranslate = prevTranslate + currentPosition - startPosition;
    }

    function dragEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -100 && currentIndex < 4) currentIndex += 1;
        if (movedBy > 100 && currentIndex > 0) currentIndex -= 1;

        setPositionByIndex();
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    function animation() {
        setTransformX(currentTranslate);
        if (isDragging) requestAnimationFrame(animation);
    }

    function setTransformX(x) {
        track.style.transform = `translateX(${x}px)`;
    }

    function setPositionByIndex() {
        const itemWidth = document.querySelector('.carousel-item').offsetWidth + 30;
        currentTranslate = currentIndex * -itemWidth;
        prevTranslate = currentTranslate;
        setTransformX(currentTranslate);
    }

    // Navegación con Botones Flechas
    next.addEventListener("click", () => {
        if (currentIndex < 4) {
            currentIndex++;
            setPositionByIndex();
        }
    });

    prev.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            setPositionByIndex();
        }
    });

    // Auto-reproducción suave
    let autoPlay = setInterval(() => {
        if (currentIndex < 4) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        setPositionByIndex();
    }, 5000);

    container.addEventListener('mouseenter', () => clearInterval(autoPlay));
    container.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => {
            if (currentIndex < 4) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            setPositionByIndex();
        }, 5000);
    });
}

// ==========================================================================
// INTERSECTION OBSERVER (REVEAL ANIMATIONS)
// ==========================================================================
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Adjuntar a todas las secciones y elementos configurados
    document.querySelectorAll(".scroll-reveal").forEach(elem => {
        observer.observe(elem);
    });
}

// ==========================================================================
// ALTERNANCIA DE MODO OSCURO (NATIVO)
// ==========================================================================
function setupThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    
    // Validar preferencia previa guardada
    const currentTheme = localStorage.getItem("nexa-theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);

    toggleBtn.addEventListener("click", () => {
        const theme = document.documentElement.getAttribute("data-theme");
        let targetTheme = "light";

        if (theme === "light") {
            targetTheme = "dark";
        }

        document.documentElement.setAttribute("data-theme", targetTheme);
        localStorage.setItem("nexa-theme", targetTheme);
    });
}

// ==========================================================================
// LAZY LOADING OPTIMIZADO PARA RENDIMIENTO
// ==========================================================================
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll(".lazy-image");

    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.add("fade-in");
                    imageObserver.unobserve(image);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores antiguos
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ==========================================================================
// CONTROL DE NEWSLETTER
// ==========================================================================
function setupNewsletter() {
    const form = document.getElementById("newsletter-form");
    const msg = document.getElementById("newsletter-msg");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("newsletter-email").value;
        
        // Simulación de envío a base de datos de marketing con feedback de marca
        msg.style.color = "#2563EB";
        msg.textContent = "SUSCRIBIENDO...";

        setTimeout(() => {
            msg.style.color = "green";
            msg.textContent = "TE HAS UNIDO A LA COMUNIDAD NEXA.";
            form.reset();
        }, 1500);
    });
}