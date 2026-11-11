document.addEventListener("DOMContentLoaded", () => {
    const products = {
        laptop: { name: "Ноутбук Air 14", model: 'Laptop Lenovo Lecoo 14 N155C 2025 i5 13420H RAM 16GB SSD 1TB 14" 2.2K 60Hz', image: "laptop.png", price: 40000, tag: "Хіт продажів", specs: [["Дисплей", '14″ IPS, Full HD (1920 × 1080)'], ["Процесор", "Intel Core i5, 12-го поколения"], ["Оперативная память", "16 ГБ DDR4"], ["Накопитель", "512 ГБ SSD"], ["Видеокарта", "Intel Iris Xe Graphics"], ["Батарея", "До 10 часов работы"], ["Подключение", "Wi-Fi 6, Bluetooth 5.2"], ["Операционная система", "Windows 11"], ["Вес", "1,4 кг"], ["Гарантия", "24 месяца"]] },
        watch: { name: "Smart Watch", model: "Smartwatch Dekkin Urban Sport C/gps", image: "smartwatch.png", price: 7500, tag: "Популярний товар", specs: [["Дисплей", '1,9″ AMOLED'], ["Разрешение", "AMOLED HD"], ["Защита", "IP68"], ["Мониторинг", "Пульс, сон, уровень кислорода в крови"], ["Спорт", "Более 100 спортивных режимов"], ["Навигация", "Встроенный GPS"], ["Подключение", "Bluetooth 5.3"], ["Батарея", "До 7 дней работы"], ["Совместимость", "Android и iOS"], ["Функции", "Уведомления, звонки, управление музыкой"], ["Гарантия", "24 месяца"]] },
        sound: { name: "Sound Pro", model: "Cambridge Audio Melomania P100 Wireless Headphones – Upscale Audio", image: "headphones.png", price: 5900, tag: "Чудовий звук", specs: [["Тип", "Беспроводные полноразмерные наушники"], ["Динамики", "40 мм"], ["Подключение", "Bluetooth 5.3"], ["Шумоподавление", "Active Noise Cancelling (ANC)"], ["Микрофон", "Встроенный с шумоподавлением"], ["Автономность", "До 40 часов"], ["Зарядка", "USB Type-C"], ["Частотный диапазон", "20 Гц – 20 кГц"], ["Управление", "Сенсорное и кнопочное"], ["Совместимость", "Android, iOS, Windows"], ["Гарантия", "24 месяца"]] },
        tablet: { name: "Tablet Ultra", model: "聚鲨环球精选", image: "tablet.png", price: 18900, tag: "Для роботи та розваг", specs: [["Дисплей", '11″ IPS'], ["Разрешение", "2K (2000 × 1200)"], ["Процессор", "8-ядерный"], ["Оперативная память", "8 ГБ RAM"], ["Встроенная память", "256 ГБ"], ["Основная камера", "13 Мп"], ["Фронтальная камера", "8 Мп"], ["Батарея", "8000 мА·ч"], ["Подключение", "Wi-Fi 6, Bluetooth 5.2"], ["Зарядка", "USB Type-C"], ["Операционная система", "Android"], ["Гарантия", "24 месяца"]] }
    };

    const modal = document.querySelector("#product-modal");
    const cartDrawer = document.querySelector(".cart-drawer");
    const cartBackdrop = document.querySelector(".cart-backdrop");
    const paymentModal = document.querySelector("#payment-modal");
    const accountModal = document.querySelector("#account-modal");
    let currentProduct = null;
    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
    const formatPrice = value => Number(value).toLocaleString("uk-UA") + " грн";

    function getActiveProfile() {
        const storedProfile = localStorage.getItem("techvision-active-profile");
        if (!storedProfile) return null;

        try {
            const profile = JSON.parse(storedProfile);
            if (!profile || typeof profile.email !== "string" || !profile.email.trim()) {
                return null;
            }

            return { ...profile, email: profile.email.trim().toLowerCase() };
        } catch (error) {
            console.error("Не вдалося завантажити активний профіль:", error);
            return null;
        }
    }

    function getCartStorageKey() {
        const profile = getActiveProfile();
        return profile ? `techvision-cart-${profile.email}` : "techvision-cart-guest";
    }

    function loadCartForActiveProfile() {
        try {
            const saved = JSON.parse(localStorage.getItem(getCartStorageKey()) || "[]");
            if (!Array.isArray(saved)) {
                throw new Error("Кошик має некоректний формат.");
            }

            return saved.map(item => ({
                ...item,
                quantity: Math.max(1, Number(item.quantity) || 1)
            }));
        } catch (error) {
            console.error("Не вдалося завантажити кошик:", error);
            return [];
        }
    }

    let cart = loadCartForActiveProfile();

    function switchCartForActiveProfile() {
        cart = loadCartForActiveProfile();
        renderCart();
    }

    function syncBodyLock() {
        document.body.classList.toggle("locked",
            modal.classList.contains("open") ||
            cartDrawer.classList.contains("open") ||
            Boolean(paymentModal?.classList.contains("open")) ||
            Boolean(accountModal?.classList.contains("open")));
    }

    document.querySelector(".cta-button")?.addEventListener("click", () => document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" }));

    document.querySelectorAll(".card-button").forEach((button, index) => {
        const keys = ["laptop", "watch", "sound", "tablet"];
        button.addEventListener("click", () => {
            currentProduct = products[keys[index]];
            modal.querySelector(".modal-image").src = currentProduct.image;
            modal.querySelector(".modal-image").alt = currentProduct.name;
            modal.querySelector("#modal-name").textContent = currentProduct.name;
            modal.querySelector(".modal-model").textContent = currentProduct.model;
            modal.querySelector(".modal-price").textContent = formatPrice(currentProduct.price);
            modal.querySelector(".modal-tag").textContent = currentProduct.tag;
            modal.querySelector(".modal-spec").innerHTML = currentProduct.specs.map(([title, value]) => `<p><strong>${title}:</strong> ${value}</p>`).join("");
            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
            syncBodyLock();
        });
    });

    function closeProductModal() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        syncBodyLock();
    }

    modal.querySelector(".modal-close").addEventListener("click", closeProductModal);
    modal.addEventListener("click", event => { if (event.target === modal) closeProductModal(); });

    function renderCart() {
        const profile = getActiveProfile();
        const accountName = document.querySelector(".cart-account-name");
        const accountEmail = document.querySelector(".cart-account-email");
        const accountStatus = document.querySelector(".cart-account-status");

        if (accountName && accountEmail) {
            accountName.textContent = profile
                ? `${profile.name || ""} ${profile.surname || ""}`.trim()
                : "Гість";
            accountEmail.textContent = profile
                ? profile.email
                : "Увійдіть в акаунт для покупки";
            if (accountStatus) {
                accountStatus.style.color = profile ? "#82ad35" : "#d99a38";
            }
        }

        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector(".cart-count").textContent = totalQuantity;
        const container = document.querySelector(".cart-items");
        const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        document.querySelector(".cart-total strong").textContent = formatPrice(totalPrice);
        container.innerHTML = cart.length ? cart.map((item, index) => `
            <div class="cart-item">
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">
                <div class="cart-item-info">
                    <h3>${escapeHTML(item.name)}</h3>
                    <p class="cart-product-model">${escapeHTML(item.model || "Модель не вказана")}</p>
                    <div class="cart-product-specs">
                        ${(Array.isArray(item.specs) ? item.specs : []).slice(0, 3).map(spec => `
                            <span>${escapeHTML(spec[0])}: ${escapeHTML(spec[1])}</span>
                        `).join("")}
                    </div>
                    <span class="cart-unit-price">${formatPrice(item.price)} / шт.</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn" type="button" data-action="decrease" data-index="${index}" aria-label="Зменшити кількість">−</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" type="button" data-action="increase" data-index="${index}" aria-label="Збільшити кількість">+</button>
                    </div>
                    <strong class="cart-item-total">${formatPrice(item.price * item.quantity)}</strong>
                </div>
                <button class="cart-remove" type="button" data-action="remove" data-index="${index}" aria-label="Видалити товар">×</button>
            </div>
        `).join("") : '<p class="empty-cart">Ваш кошик порожній</p>';
        localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
    }

    function toggleCart(open) {
        cartDrawer.classList.toggle("open", open);
        cartBackdrop.classList.toggle("open", open);
        cartDrawer.setAttribute("aria-hidden", String(!open));
        syncBodyLock();
    }

    document.querySelector(".add-to-cart").addEventListener("click", event => {
        if (!currentProduct) return;
        const existingProduct = cart.find(item => item.name === currentProduct.name && item.image === currentProduct.image);
        if (existingProduct) existingProduct.quantity += 1;
        else cart.push({
            name: currentProduct.name,
            model: currentProduct.model,
            image: currentProduct.image,
            price: currentProduct.price,
            specs: currentProduct.specs,
            quantity: 1
        });
        renderCart();
        event.currentTarget.innerHTML = "Додано в кошик ✓";
        setTimeout(() => {
            closeProductModal();
            event.currentTarget.innerHTML = 'Додати в кошик <span>→</span>';
        }, 700);
    });

    document.querySelector(".cart-button").addEventListener("click", () => toggleCart(true));
    document.querySelector(".cart-close").addEventListener("click", () => toggleCart(false));
    cartBackdrop.addEventListener("click", () => toggleCart(false));
    document.querySelector(".cart-items").addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const index = Number(button.dataset.index);
        if (!cart[index]) return;
        if (button.dataset.action === "increase") cart[index].quantity += 1;
        if (button.dataset.action === "decrease") {
            cart[index].quantity -= 1;
            if (cart[index].quantity <= 0) cart.splice(index, 1);
        }
        if (button.dataset.action === "remove") cart.splice(index, 1);
        renderCart();
    });
    if (paymentModal) {
        const paymentClose = paymentModal.querySelector(".payment-close");
        const paymentForm = paymentModal.querySelector(".payment-form");

        function openPayment() {
            if (!cart.length) return;

            if (!getActiveProfile()) {
                toggleCart(false);
                document.querySelector("#profile-open")?.click();
                alert("Для оформлення замовлення необхідно увійти в акаунт.");
                return;
            }

            toggleCart(false);
            paymentModal.classList.add("open");
            paymentModal.setAttribute("aria-hidden", "false");
            syncBodyLock();
        }

        function closePayment() {
            paymentModal.classList.remove("open");
            paymentModal.setAttribute("aria-hidden", "true");
            paymentForm?.querySelectorAll(".payment-demo-fields input").forEach(input => {
                input.value = "";
            });
            syncBodyLock();
        }

        document.querySelector(".checkout-button")?.addEventListener("click", openPayment);
        paymentClose?.addEventListener("click", closePayment);
        paymentModal.addEventListener("click", event => {
            if (event.target === paymentModal) closePayment();
        });

        if (paymentForm) {
            const firstName = paymentForm.querySelector(".payment-first-name");
            const lastName = paymentForm.querySelector(".payment-last-name");
            const cardOwner = paymentModal.querySelector(".bank-card-bottom strong");

            function updateCardOwner() {
                if (!cardOwner) return;

                const fullName = `${firstName?.value.trim() || ""} ${lastName?.value.trim() || ""}`
                    .trim()
                    .toUpperCase();
                cardOwner.textContent = fullName || "YOUR NAME";
            }

            firstName?.addEventListener("input", updateCardOwner);
            lastName?.addEventListener("input", updateCardOwner);
            paymentForm.addEventListener("submit", event => {
                event.preventDefault();

                if (!cart.length) return;
                const activeProfile = getActiveProfile();
                if (!activeProfile) {
                    closePayment();
                    document.querySelector("#profile-open")?.click();
                    alert("Для оформлення замовлення необхідно увійти в акаунт.");
                    return;
                }

                const createdAt = new Date();
                const order = {
                    id: Date.now(),
                    createdAt: createdAt.toISOString(),
                    date: createdAt.toLocaleString("uk-UA", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }),
                    customer: {
                        name: activeProfile.name || "",
                        surname: activeProfile.surname || "",
                        email: activeProfile.email
                    },
                    items: cart.map(item => ({
                        name: item.name,
                        model: item.model || "Модель не вказана",
                        image: item.image,
                        price: Number(item.price),
                        quantity: item.quantity,
                        specs: Array.isArray(item.specs) ? item.specs : []
                    })),
                    total: cart.reduce(
                        (sum, item) => sum + Number(item.price) * item.quantity,
                        0
                    ),
                    status: "Оформлено"
                };
                try {
                    const ordersKey = `techvision-orders-${activeProfile.email}`;
                    const orders = JSON.parse(localStorage.getItem(ordersKey) || "[]");

                    if (!Array.isArray(orders)) {
                        throw new Error("Історія замовлень має некоректний формат.");
                    }

                    orders.unshift(order);
                    localStorage.setItem(ordersKey, JSON.stringify(orders));
                    } catch (error) {
                        console.error("Не вдалося прочитати історію замовлень.", error);
                        alert("Не вдалося зберегти замовлення. Кошик не очищено.");
                        return;
                    }

                    cart = [];
                    renderCart();
                alert("Дякуємо! Демонстраційне оформлення замовлення успішне.");
                closePayment();
                paymentForm.reset();
                updateCardOwner();
                if (accountModal?.classList.contains("open")) {
                    renderProfileOverview();
                }
            });
        }
    }

    if (accountModal) {
        const profileOpen = document.querySelector("#profile-open");
        const profileClose = accountModal.querySelector(".account-close");
        const profileForm = accountModal.querySelector("#profile-form");
        const loginForm = accountModal.querySelector("#login-form");
        const registrationPanel = accountModal.querySelector("#registration-panel");
        const loginPanel = accountModal.querySelector("#login-panel");
        const profilePanel = accountModal.querySelector("#profile-panel");
        const ordersPanel = accountModal.querySelector("#orders-panel");
        const accountTabs = accountModal.querySelector("#account-tabs");
        const ordersList = accountModal.querySelector("#orders-list");
        const ordersCount = accountModal.querySelector("#orders-count");
        const profileHistoryButton = accountModal.querySelector(".profile-history-button");
        const switchAccountButton = accountModal.querySelector("#switch-account");
        const logoutButton = accountModal.querySelector("#logout-account");
        let savedProfile = null;

        function loadProfile() {
            try {
                const profile = JSON.parse(localStorage.getItem("techvision-active-profile") || "null");
                savedProfile = profile &&
                    typeof profile.name === "string" &&
                    typeof profile.surname === "string" &&
                    typeof profile.email === "string" &&
                    profile.email.trim()
                    ? { ...profile, email: profile.email.trim().toLowerCase() }
                    : null;
            } catch (error) {
                console.error("Не вдалося завантажити профіль:", error);
                savedProfile = null;
            }

            if (savedProfile) {
                profileOpen.textContent = "Профіль";
                accountModal.querySelector("#profile-full-name").textContent =
                    `${savedProfile.name} ${savedProfile.surname}`;
                accountModal.querySelector("#profile-email-display").textContent =
                    savedProfile.email;
            } else {
                profileOpen.textContent = "Увійти";
            }
        }

        function showAuthPanel(panel) {
            accountTabs.style.display = "none";
            registrationPanel.classList.toggle("active", panel === "register");
            loginPanel.classList.toggle("active", panel === "login");
            profilePanel.classList.remove("active");
            ordersPanel.classList.remove("active");
        }

        function showTab(tabName) {
            registrationPanel.classList.remove("active");
            loginPanel.classList.remove("active");
            accountTabs.querySelectorAll(".account-tab[data-tab]").forEach(button => {
                button.classList.toggle("active", button.dataset.tab === tabName);
            });

            profilePanel.classList.toggle("active", tabName === "profile");
            ordersPanel.classList.toggle("active", tabName === "orders");

            if (tabName === "orders") renderOrders();
            if (tabName === "profile") renderProfileOverview();
        }

        function renderProfileOverview() {
            const profile = getActiveProfile();
            if (!profile) return;

            let orders = [];
            try {
                orders = JSON.parse(
                    localStorage.getItem(`techvision-orders-${profile.email}`) || "[]"
                );
                if (!Array.isArray(orders)) {
                    throw new Error("Історія замовлень має некоректний формат.");
                }
            } catch (error) {
                console.error("Не вдалося завантажити статистику замовлень:", error);
            }

            const totalSpent = orders.reduce(
                (sum, order) => sum + (Number(order?.total) || 0),
                0
            );
            accountModal.querySelector("#profile-orders-total").textContent = orders.length;
            accountModal.querySelector("#profile-spent-total").textContent = formatPrice(totalSpent);
            accountModal.querySelector("#profile-last-order").textContent = orders.length
                ? (orders[0].date || "Дата невідома")
                : "—";

            const recentList = accountModal.querySelector("#profile-recent-list");
            if (!orders.length) {
                recentList.innerHTML = '<div class="empty-orders">У вас поки немає покупок.</div>';
                return;
            }

            recentList.innerHTML = orders.slice(0, 2).map(order => `
                <div class="recent-order">
                    <div class="recent-order-top">
                        <strong>Замовлення №${escapeHTML(String(order?.id || "").slice(-6))}</strong>
                        <span>${escapeHTML(order?.status || "Оформлено")}</span>
                    </div>
                    <p>${(Array.isArray(order?.items) ? order.items : []).map(item =>
                        `${escapeHTML(item?.name || "Товар")} × ${Number(item?.quantity) || 0}`
                    ).join(", ")}</p>
                    <p>${formatPrice(Number(order?.total) || 0)}</p>
                    <p>${escapeHTML(order?.date || "Дата невідома")}</p>
                </div>
            `).join("");
        }

        function renderOrders() {
            let orders = [];

            try {
                const activeProfile = getActiveProfile();
                if (activeProfile) {
                    orders = JSON.parse(
                        localStorage.getItem(`techvision-orders-${activeProfile.email}`) || "[]"
                    );
                }
            } catch (error) {
                console.error("Не вдалося завантажити замовлення:", error);
            }

            if (!Array.isArray(orders)) orders = [];

            const orderCountForm = new Intl.PluralRules("uk").select(orders.length);
            const orderCountLabel = {
                one: "замовлення",
                few: "замовлення",
                many: "замовлень",
                other: "замовлення"
            }[orderCountForm];
            ordersCount.textContent = `${orders.length} ${orderCountLabel}`;

            if (!orders.length) {
                ordersList.innerHTML = `
                    <div class="empty-orders">
                        <h3>Замовлень поки немає</h3>
                        <p>Тут відображатимуться ваші покупки.</p>
                    </div>
                `;
                return;
            }

            ordersList.innerHTML = orders.map((order, index) => {
                const orderNumber = order?.id
                    ? String(order.id).slice(-6)
                    : String(orders.length - index).padStart(3, "0");
                const items = Array.isArray(order?.items) ? order.items : [];
                const total = Number(order?.total) || 0;

                return `
                    <article class="order-card">
                        <div class="order-top">
                            <h4>Замовлення № ${orderNumber}</h4>
                            <span class="order-status">${escapeHTML(order?.status || "Оформлено")}</span>
                        </div>

                        <p class="order-date">
                            Оформлено: ${escapeHTML(order?.date || "Дата невідома")}
                        </p>

                        <div class="order-customer">
                            <span>ПОКУПЕЦЬ</span>
                            <strong>${escapeHTML(order?.customer?.name || savedProfile?.name || "")}
                                ${escapeHTML(order?.customer?.surname || savedProfile?.surname || "")}</strong>
                            <small>${escapeHTML(order?.customer?.email || savedProfile?.email || "")}</small>
                        </div>

                        ${items.map(item => `
                            <div class="order-product">
                                <img src="${escapeHTML(item?.image || "")}" alt="">
                                <div>
                                    <h5>${escapeHTML(item?.name || "Товар")}</h5>
                                    <span>${escapeHTML(item?.model || "Модель не вказана")}</span>
                                    <span>Кількість: ${Number(item?.quantity) || 0} шт.</span>
                                    ${Array.isArray(item?.specs) ? `
                                        <div class="order-specifications">
                                            ${item.specs.map(spec => `
                                                <p><strong>${escapeHTML(spec?.[0] || "")}:</strong>
                                                ${escapeHTML(spec?.[1] || "")}</p>
                                            `).join("")}
                                        </div>
                                    ` : ""}
                                </div>
                                <strong>${formatPrice((Number(item?.price) || 0) * (Number(item?.quantity) || 0))}</strong>
                            </div>
                        `).join("")}

                        <div class="order-total">
                            <span>Разом</span>
                            <strong>${formatPrice(total)}</strong>
                        </div>
                    </article>
                `;
            }).join("");
        }

        function openAccount() {
            loadProfile();
            accountModal.classList.add("open");
            accountModal.setAttribute("aria-hidden", "false");

            if (savedProfile) {
                accountTabs.style.display = "flex";
                showTab("profile");
            } else {
                showAuthPanel("register");
            }

            syncBodyLock();
        }

        function closeAccount() {
            accountModal.classList.remove("open");
            accountModal.setAttribute("aria-hidden", "true");
            syncBodyLock();
        }

        profileOpen.addEventListener("click", openAccount);
        profileClose.addEventListener("click", closeAccount);
        accountModal.addEventListener("click", event => {
            if (event.target === accountModal) closeAccount();
        });

        accountModal.querySelector("#show-login").addEventListener("click", () => {
            showAuthPanel("login");
        });
        accountModal.querySelector("#show-registration").addEventListener("click", () => {
            showAuthPanel("register");
        });

        profileForm.addEventListener("submit", event => {
            event.preventDefault();

            const profile = {
                name: accountModal.querySelector("#profile-name").value.trim(),
                surname: accountModal.querySelector("#profile-surname").value.trim(),
                email: accountModal.querySelector("#profile-email").value.trim().toLowerCase()
            };

            try {
                const accounts = JSON.parse(localStorage.getItem("techvision-accounts") || "{}");
                if (!accounts || typeof accounts !== "object" || Array.isArray(accounts)) {
                    throw new Error("Список облікових записів має некоректний формат.");
                }
                if (Object.prototype.hasOwnProperty.call(accounts, profile.email)) {
                    alert("Обліковий запис із такою електронною поштою вже існує.");
                    return;
                }

                accounts[profile.email] = profile;
                localStorage.setItem("techvision-accounts", JSON.stringify(accounts));
                localStorage.setItem("techvision-active-profile", JSON.stringify(profile));
                switchCartForActiveProfile();
                if (localStorage.getItem(`techvision-orders-${profile.email}`) === null) {
                    localStorage.setItem(`techvision-orders-${profile.email}`, JSON.stringify([]));
                }
                loadProfile();
                registrationPanel.classList.remove("active");
                loginPanel.classList.remove("active");
                accountTabs.style.display = "flex";
                showTab("profile");
            } catch (error) {
                console.error("Не вдалося зареєструвати профіль:", error);
                alert("Не вдалося зберегти профіль.");
            }
        });

        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            const email = accountModal.querySelector("#login-email").value.trim().toLowerCase();
            const message = accountModal.querySelector("#login-message");

            try {
                const accounts = JSON.parse(localStorage.getItem("techvision-accounts") || "{}");
                if (!accounts || typeof accounts !== "object" || Array.isArray(accounts)) {
                    throw new Error("Список облікових записів має некоректний формат.");
                }

                const account = accounts[email];
                if (!account ||
                    typeof account.name !== "string" ||
                    typeof account.surname !== "string" ||
                    typeof account.email !== "string" ||
                    account.email.trim().toLowerCase() !== email) {
                    message.textContent = "Акаунт із такою електронною поштою не знайдено.";
                    return;
                }

                localStorage.setItem("techvision-active-profile", JSON.stringify({
                    ...account,
                    email
                }));
                switchCartForActiveProfile();
                message.textContent = "";
                loadProfile();
                accountTabs.style.display = "flex";
                showTab("profile");
            } catch (error) {
                console.error("Не вдалося увійти в акаунт:", error);
                message.textContent = "Не вдалося завантажити акаунти. Спробуйте ще раз.";
            }
        });

        switchAccountButton.addEventListener("click", () => {
            localStorage.removeItem("techvision-active-profile");
            savedProfile = null;
            switchCartForActiveProfile();
            loadProfile();
            accountModal.querySelector("#login-email").value = "";
            accountModal.querySelector("#login-message").textContent = "";
            showAuthPanel("login");
        });

        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("techvision-active-profile");
            savedProfile = null;
            switchCartForActiveProfile();
            loadProfile();
            profileForm.reset();
            loginForm.reset();
            accountModal.querySelector("#profile-message").textContent = "Ви вийшли з акаунту.";
            accountModal.querySelector("#login-message").textContent = "";
            showAuthPanel("register");
        });

        accountTabs.querySelectorAll(".account-tab[data-tab]").forEach(button => {
            button.addEventListener("click", () => {
                showTab(button.dataset.tab);
            });
        });

        profileHistoryButton?.addEventListener("click", () => showTab("orders"));

        loadProfile();
    }

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        closeProductModal();
        toggleCart(false);
        if (paymentModal?.classList.contains("open")) {
            paymentModal.classList.remove("open");
            paymentModal.setAttribute("aria-hidden", "true");
        }
        if (accountModal?.classList.contains("open")) {
            accountModal.classList.remove("open");
            accountModal.setAttribute("aria-hidden", "true");
        }
        syncBodyLock();
    });

    const form = document.querySelector(".contact-form");
    const phone = document.querySelector(".input-phone");
    form?.addEventListener("submit", event => {
        event.preventDefault();
        if (!/^\+?[0-9\s()-]{10,20}$/.test(phone.value.trim())) { phone.focus(); phone.style.outline = "2px solid #ffb4b4"; return; }
        const button = form.querySelector("button");
        button.innerHTML = "Заявку прийнято ✓";
        button.disabled = true;
    });
    phone?.addEventListener("input", () => phone.style.outline = "0");
    renderCart();
});
