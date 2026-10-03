document.addEventListener("DOMContentLoaded", () => {
  const sections = [...document.querySelectorAll("[data-page]")];
  const pageLinks = [...document.querySelectorAll("[data-page-link]")];
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const basketButton = document.querySelector("#basket-button");
  const basketPopover = document.querySelector("#basket-popover");
  const closeBasket = document.querySelector("#close-basket");
  const basketCount = document.querySelector("#basket-count");
  const basketItems = document.querySelector("#basket-items");
  const basketTotal = document.querySelector("#basket-total");
  const toast = document.querySelector("#toast");
  const toastMessage = document.querySelector("#toast-message");
  const basketCheckout = document.querySelector("#basket-checkout");
  const featuredGrid = document.querySelector(".product-grid-featured");
  const shopGrid = document.querySelector(".shop-grid");
  const basket = [];
  let allProducts = [];
  let toastTimer;

  // Category display names (walang "load" para hindi lumabas sa Shop)
  const categoryLabels = {
    coffee:    { name: "Coffee",               icon: "coffee",      emoji: "☕" },
    seasoning: { name: "Seasonings",           icon: "soup",        emoji: "🧂" },
    snack:     { name: "Snacks",               icon: "cookie",      emoji: "🍪" },
    canned:    { name: "Canned Goods",         icon: "package",     emoji: "🥫" },
    noodles:   { name: "Instant Noodles",      icon: "soup",        emoji: "🍜" },
    drink:     { name: "Softdrinks",           icon: "cup-soda",    emoji: "🥤" },
    household: { name: "Household Essentials", icon: "home",        emoji: "🧼" },
    school:    { name: "School Supplies",      icon: "pencil",      emoji: "✏️" },
    frozen:    { name: "Frozen Foods",         icon: "snowflake",   emoji: "🧊" },
    biscuit:   { name: "Biscuits",             icon: "cookie",      emoji: "🍪" },
    candy:     { name: "Candies",              icon: "candy",       emoji: "🍬" }
  };

  const money = (value) => `₱${Number(value).toFixed(2)}`;

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function closeMobileMenu() {
    primaryNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2700);
  }

  function renderBasket() {
    const count = basket.reduce((total, item) => total + item.quantity, 0);
    const total = basket.reduce((sum, item) => sum + item.price * item.quantity, 0);

    basketCount.textContent = count;
    basketTotal.textContent = money(total);

    if (!basket.length) {
      basketItems.innerHTML = `
        <div class="basket-empty">
          <span class="empty-icon"><i data-lucide="shopping-basket"></i></span>
          <strong>Your basket is ready.</strong>
          <span>Add a few kapitbahay favorites to get started.</span>
        </div>
      `;
      refreshIcons();
      return;
    }

    basketItems.innerHTML = basket.map((item) => `
      <div class="basket-line">
        <span>
          <strong>${item.name}</strong>
          <small>${item.quantity} × ${money(item.price)}</small>
        </span>
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    `).join("");
  }

  function showPage(pageName, updateHash = true) {
    const requestedSection = sections.find((section) => section.dataset.page === pageName);
    const activePage = requestedSection ? pageName : "home";

    sections.forEach((section) => {
      const isActive = section.dataset.page === activePage;
      section.hidden = !isActive;
      section.classList.toggle("page-section-active", isActive);
    });

    pageLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.pageLink === activePage);
    });

    closeMobileMenu();
    basketPopover.classList.remove("open");
    basketButton.setAttribute("aria-expanded", "false");

    document.title = activePage === "home"
      ? "Tindahan ni Judiel | Kasama sa araw-araw"
      : `${activePage[0].toUpperCase()}${activePage.slice(1)} | Tindahan ni Judiel`;

    if (updateHash && window.location.hash !== `#${activePage}`) {
      window.history.replaceState(null, "", `#${activePage}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    refreshIcons();
  }

  function productCard(product) {
    const visual = product.image_url
      ? `<img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend', '<span class=\\'product-emoji\\' aria-hidden=\\'true\\'>${product.emoji || '🛒'}</span>');" />`
      : `<span class="product-emoji" aria-hidden="true">${product.emoji || "🛒"}</span>`;

    return `
      <article class="product-card">
        <div class="product-art ${product.art_class || "product-art-snack"}">
          ${visual}
          <span class="art-label">${product.label || ""}</span>
        </div>
        <div class="product-info">
          <div>
            <h3>${product.name}</h3>
            <p class="product-meta">${product.meta || ""}</p>
          </div>
          <strong class="price">${money(product.price)}</strong>
        </div>
        <button
          class="add-button"
          type="button"
          data-add-product
          data-product-id="${product.id}"
          data-name="${product.name}"
          data-price="${product.price}"
        >
          <i data-lucide="plus"></i> Add
        </button>
      </article>
    `;
  }

  function renderProducts() {
    if (featuredGrid) {
      const featured = allProducts.filter((p) => p.featured);
      featuredGrid.innerHTML = featured.map(productCard).join("");
    }

    if (shopGrid) {
      const grouped = {};
      allProducts
        .filter((p) => !p.featured)
        .forEach((p) => {
          const cat = p.category || "others";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(p);
        });

      let html = "";
      for (const [key, info] of Object.entries(categoryLabels)) {
        const items = grouped[key];
        if (!items || items.length === 0) continue;

        html += `
          <div class="shop-category-block" id="category-${key}">
            <div class="shop-category-header">
              <span class="shop-category-icon">
                <i data-lucide="${info.icon}"></i>
              </span>
              <div>
                <h2>${info.name}</h2>
                <p>${items.length} ${items.length === 1 ? "item" : "items"} available</p>
              </div>
            </div>
            <div class="product-grid shop-category-grid">
              ${items.map(productCard).join("")}
            </div>
          </div>
        `;
      }
      shopGrid.innerHTML = html;
    }

    bindAddButtons();
    refreshIcons();
  }

  async function loadProducts() {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Could not load products");
      allProducts = await res.json();
      renderProducts();
    } catch (err) {
      console.error(err);
      bindAddButtons();
    }
  }

  function bindAddButtons() {
    document.querySelectorAll("[data-add-product]").forEach((button) => {
      if (button.dataset.bound === "true") return;
      button.dataset.bound = "true";

      button.addEventListener("click", () => {
        const productId = Number(button.dataset.productId) || null;
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        const existing = basket.find(
          (item) => item.name === name && item.productId === productId
        );

        if (existing) {
          existing.quantity += 1;
        } else {
          basket.push({ productId, name, price, quantity: 1 });
        }

        renderBasket();
        showToast(`${name} added to your basket.`);
        basketButton.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }],
          { duration: 360, easing: "ease-out" }
        );
      });
    });
  }

  pageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPage(link.dataset.pageLink);
    });
  });

  window.addEventListener("hashchange", () => {
    showPage(window.location.hash.slice(1), false);
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    refreshIcons();
  });

  basketButton.addEventListener("click", () => {
    const isOpen = basketPopover.classList.toggle("open");
    basketButton.setAttribute("aria-expanded", String(isOpen));
  });

  closeBasket.addEventListener("click", () => {
    basketPopover.classList.remove("open");
    basketButton.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("click", (event) => {
    if (!basketPopover.contains(event.target) && !basketButton.contains(event.target)) {
      basketPopover.classList.remove("open");
      basketButton.setAttribute("aria-expanded", "false");
    }
  });

  basketCheckout.addEventListener("click", () => {
    if (!basket.length) {
      showToast("Add something first, kapitbahay.");
      return;
    }
    showPage("contact");
    showToast("Your basket is ready — send us your details.");
  });

  document.querySelector("#contact-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      pickup: formData.get("pickup"),
      items: basket.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    if (!payload.items.length) {
      showToast("Add items to your basket first.");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      form.reset();
      basket.length = 0;
      renderBasket();
      showToast(`Salamat, ${payload.name}! Order #${data.orderId} received.`);
    } catch (err) {
      showToast(err.message || "Could not send order.");
    }
  });

  renderBasket();
  showPage(window.location.hash.slice(1) || "home", false);
  loadProducts();
  refreshIcons();
});