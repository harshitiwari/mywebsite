(function () {
  const mainSelector = 'body > .container[role="main"]';
  const skippedExtensions =
    /\.(?:avi|bib|csv|docx?|gif|jpe?g|json|mp3|mp4|pdf|png|pptx?|svg|tex|txt|webm|webp|xlsx?|xml|zip)$/i;
  let navigationController;

  function shouldNavigate(link, event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.hasAttribute("download") ||
      link.dataset.noSeamless !== undefined ||
      (link.target && link.target !== "_self")
    ) {
      return false;
    }

    const destination = new URL(link.href, window.location.href);
    if (
      destination.origin !== window.location.origin ||
      !["http:", "https:"].includes(destination.protocol) ||
      skippedExtensions.test(destination.pathname)
    ) {
      return false;
    }

    const current = new URL(window.location.href);
    if (
      destination.pathname === current.pathname &&
      destination.search === current.search
    ) {
      return false;
    }

    return true;
  }

  function syncHead(nextDocument) {
    document.title = nextDocument.title;

    ['meta[name="description"]', 'link[rel="canonical"]'].forEach(
      (selector) => {
        const currentElement = document.head.querySelector(selector);
        const nextElement = nextDocument.head.querySelector(selector);
        if (currentElement && nextElement) {
          currentElement.replaceWith(document.importNode(nextElement, true));
        }
      },
    );
  }

  function syncNavigation(nextDocument) {
    const currentNavbar = document.querySelector("#navbar > .container");
    const nextNavbar = nextDocument.querySelector("#navbar > .container");
    if (!currentNavbar || !nextNavbar) return;

    const currentBrand = currentNavbar.querySelector(".navbar-brand");
    const nextBrand = nextNavbar.querySelector(".navbar-brand");
    if (currentBrand && nextBrand) {
      currentBrand.replaceWith(document.importNode(nextBrand, true));
    } else if (currentBrand) {
      currentBrand.remove();
    } else if (nextBrand) {
      currentNavbar.prepend(document.importNode(nextBrand, true));
    }

    const activeUrls = new Set(
      Array.from(nextNavbar.querySelectorAll("li.nav-item.active > a.nav-link"))
        .map((link) => link.getAttribute("href"))
        .filter(Boolean),
    );

    currentNavbar.querySelectorAll("li.nav-item").forEach((item) => {
      const link = item.querySelector(":scope > a.nav-link");
      const isActive = link && activeUrls.has(link.getAttribute("href"));
      item.classList.toggle("active", Boolean(isActive));
      if (link) {
        link
          .querySelectorAll(":scope > .sr-only")
          .forEach((marker) => marker.remove());
        if (isActive) {
          link.setAttribute("aria-current", "page");
          const marker = document.createElement("span");
          marker.className = "sr-only";
          marker.textContent = "(current)";
          link.appendChild(marker);
        } else {
          link.removeAttribute("aria-current");
        }
      }
    });

    const toggle = currentNavbar.querySelector(".navbar-toggler-main");
    const panel = currentNavbar.querySelector(".navbar-collapse-main");
    toggle?.classList.add("collapsed");
    toggle?.setAttribute("aria-expanded", "false");
    panel?.classList.remove("show");
  }

  function buildTableOfContents(main) {
    const toc = main.querySelector("#toc-sidebar");
    if (!toc) return;

    const headings = Array.from(main.querySelectorAll("h2, h3")).filter(
      (heading) => !heading.hasAttribute("data-toc-skip"),
    );
    if (!headings.length) return;

    const list = document.createElement("ul");
    list.className = "toc-list";
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = heading.textContent
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      const item = document.createElement("li");
      item.className = "toc-list-item";
      if (heading.tagName === "H3") item.classList.add("is-collapsible");

      const link = document.createElement("a");
      link.className = "toc-link";
      link.href = `#${heading.id}`;
      link.textContent = heading.dataset.tocText || heading.textContent.trim();
      item.appendChild(link);
      list.appendChild(item);
    });
    toc.replaceChildren(list);
  }

  function hydrateContent(main) {
    main.dataset.seamlessContent = "true";

    main.querySelectorAll("a.waves-effect, a.waves-light").forEach((anchor) => {
      anchor.classList.remove("waves-effect", "waves-light");
    });

    const isDark =
      typeof window.determineComputedTheme === "function"
        ? window.determineComputedTheme() === "dark"
        : document.documentElement.dataset.theme === "dark";
    main.querySelectorAll("table").forEach((table) => {
      table.classList.toggle("table-dark", isDark);
      const excluded = table.closest(
        '[class*="news"], [class*="card"], [class*="archive"], pre, code',
      );
      if (!excluded) {
        table.classList.add("table", "table-hover");
        table.parentElement?.classList.add("table-responsive");
      }
    });

    buildTableOfContents(main);
    window.AlFolioUi?.initTooltips?.(main);
    window.AlFolioUi?.initPopovers?.(main);

    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([main]).catch(() => {});
    }

    const grid = main.querySelector(".grid");
    if (grid && typeof window.Masonry === "function") {
      const layout = () =>
        new window.Masonry(grid, {
          gutter: 10,
          horizontalOrder: true,
          itemSelector: ".grid-item",
        });
      if (typeof window.imagesLoaded === "function") {
        window.imagesLoaded(grid, layout);
      } else {
        layout();
      }
    }

    window.dispatchEvent(new Event("resize"));
  }

  function scrollToDestination(destination) {
    if (destination.hash) {
      const id = decodeURIComponent(destination.hash.slice(1));
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  async function navigate(destination, pushHistory) {
    navigationController?.abort();
    navigationController = new AbortController();
    document.documentElement.classList.add("seamless-loading");
    document.querySelector(mainSelector)?.setAttribute("aria-busy", "true");

    try {
      const response = await fetch(destination.href, {
        headers: { "X-Requested-With": "seamless-navigation" },
        signal: navigationController.signal,
      });
      if (!response.ok)
        throw new Error(`Navigation failed: ${response.status}`);

      const nextDocument = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      const nextMain = nextDocument.querySelector(mainSelector);
      const currentMain = document.querySelector(mainSelector);
      if (!nextMain || !currentMain) throw new Error("Page shell not found");

      const importedMain = document.importNode(nextMain, true);
      const swap = () => {
        currentMain.replaceWith(importedMain);
        syncHead(nextDocument);
        syncNavigation(nextDocument);
        hydrateContent(importedMain);
      };

      if (document.startViewTransition) {
        await document.startViewTransition(swap).finished;
      } else {
        swap();
      }

      if (pushHistory) history.pushState({}, "", destination.href);
      scrollToDestination(destination);
      document.dispatchEvent(
        new CustomEvent("seamless:load", {
          detail: { url: destination.href, main: importedMain },
        }),
      );
    } catch (error) {
      if (error.name === "AbortError") return;
      window.location.assign(destination.href);
    } finally {
      document.documentElement.classList.remove("seamless-loading");
      document.querySelector(mainSelector)?.removeAttribute("aria-busy");
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || !shouldNavigate(link, event)) return;

    event.preventDefault();
    navigate(new URL(link.href, window.location.href), true);
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(
      '[data-seamless-content="true"] a.abstract, [data-seamless-content="true"] a.award, [data-seamless-content="true"] a.bibtex',
    );
    if (!trigger) return;

    event.preventDefault();
    const links = trigger.closest(".links");
    const scope = links?.parentElement || trigger.closest("li, article, .post");
    if (!scope) return;

    const selector = trigger.classList.contains("abstract")
      ? ".abstract.hidden"
      : trigger.classList.contains("award")
        ? ".award.hidden"
        : ".bibtex.hidden";
    const panel = scope.querySelector(selector);
    scope
      .querySelectorAll(
        ".abstract.hidden.open, .award.hidden.open, .bibtex.hidden.open",
      )
      .forEach((openPanel) => {
        if (openPanel !== panel) openPanel.classList.remove("open");
      });
    panel?.classList.toggle("open");
  });

  window.addEventListener("popstate", () => {
    navigate(new URL(window.location.href), false);
  });
})();
