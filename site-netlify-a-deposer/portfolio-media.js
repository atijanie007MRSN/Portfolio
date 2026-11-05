function initialiserApercuSemainePro(conteneurPortfolio) {
  const cartes = conteneurPortfolio.querySelectorAll("article");
  const carte = [...cartes].find(
    (element) => element.querySelector("h3")?.textContent.trim() === "Semaine pro",
  );
  const couverture = carte?.querySelector(":scope > div:first-child");

  if (!couverture || couverture.querySelector("video")) {
    return;
  }

  const video = document.createElement("video");
  video.src = "/semaine-pro-apercu.mp4";
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", "Aperçu vidéo de cinq secondes du projet Semaine pro");
  video.dataset.apercu = "semaine-pro";
  video.className = "apercu-video-semaine-pro";

  video.addEventListener("error", () => {
    console.error("Impossible de charger la vidéo du projet Semaine pro.", video.error);
  });

  couverture.replaceChildren(video);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.autoplay = false;
    video.controls = true;
    return;
  }

  const observateur = new IntersectionObserver(
    (entrees) => {
      if (!entrees.some((entree) => entree.isIntersecting)) {
        return;
      }

      observateur.disconnect();
      video.play().catch((erreur) => {
        console.error("La lecture automatique de l’aperçu Semaine pro a échoué.", erreur);
        video.controls = true;
      });
    },
    { threshold: 0.25 },
  );

  observateur.observe(video);
}

function surveillerPortfolio() {
  const conteneurPortfolio = document.querySelector("#portfolio");
  if (!conteneurPortfolio) {
    return false;
  }

  const mutations = new MutationObserver(() =>
    initialiserApercuSemainePro(conteneurPortfolio),
  );
  mutations.observe(conteneurPortfolio, { childList: true, subtree: true });
  initialiserApercuSemainePro(conteneurPortfolio);
  return true;
}

if (!surveillerPortfolio()) {
  const attentePortfolio = new MutationObserver(() => {
    if (surveillerPortfolio()) {
      attentePortfolio.disconnect();
    }
  });
  attentePortfolio.observe(document.documentElement, { childList: true, subtree: true });
}

const badgesDclic = [
  "Compétence_1_Session_juillet_2026_30_juil._2026_ad0fcfda.png",
  "Compétence_2_Session_juillet_2026_31_juil._2026_1a120ede.png",
  "Compétence_3_Session_juillet_2026_16_août_2026_1f4249c0.png",
  "Compétence_4_Session_juillet_2026_16_août_2026_a85f88c4.png",
  "Compétence_5_Session_juillet_2026_2_sept._2026_7179cbc9.png",
  "Compétence_6_Session_juillet_2026_2_sept._2026_c6640acd.png",
  "Compétence_7_Session_juillet_2026_3_sept._2026_7bd945f5.png",
  "Compétence_8_Session_juillet_2026_6_sept._2026_ccc484f1.png",
  "Compétence_9_Session_juillet_2026_7_sept._2026_c4437589.png",
  "Compétence_10_Session_juillet_2026_14_sept._2026_735eb48d.png",
  "Compétence_juillet_2026_16_sept._2026_aa78f780.png",
  "Compétence_12_Session_juillet_2026_16_sept._2026_1d653684.png",
];

function ajouterBadgesDclic() {
  const competences = document.querySelector("#competences");
  if (!competences || document.querySelector("#badges-dclic")) {
    return false;
  }

  const section = document.createElement("section");
  section.id = "badges-dclic";
  section.className = "dclic-badges-section";

  const contenu = document.createElement("div");
  contenu.className = "dclic-badges-content";

  const titre = document.createElement("h2");
  titre.className = "dclic-badges-title";
  titre.textContent = "Badges D-Clic";

  const description = document.createElement("p");
  description.className = "dclic-badges-description";
  description.textContent =
    "Marketing numérique — faites glisser les badges pour les parcourir, ou cliquez pour les agrandir.";

  const piste = document.createElement("div");
  piste.className = "dclic-badges-track";
  piste.tabIndex = 0;
  piste.setAttribute("role", "region");
  piste.setAttribute("aria-label", "Badges D-Clic — défilement horizontal");

  for (const [index, fichier] of badgesDclic.entries()) {
    const url = `/${encodeURIComponent(fichier)}`;
    const lien = document.createElement("a");
    lien.className = "dclic-badge";
    lien.href = url;
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";
    lien.setAttribute("aria-label", `Ouvrir le badge D-Clic ${index + 1} en grand`);

    const image = document.createElement("img");
    image.src = url;
    image.alt = `Badge D-Clic ${index + 1}`;
    image.width = 120;
    image.height = 120;
    image.loading = "lazy";

    image.addEventListener("error", () => {
      console.error(`Impossible de charger le badge D-Clic ${index + 1} : ${fichier}`);
    });

    lien.append(image);
    piste.append(lien);
  }

  contenu.append(titre, description, piste);
  section.append(contenu);
  competences.insertAdjacentElement("afterend", section);

  let debutX = 0;
  let debutDefilement = 0;
  let pointeurActif = null;
  let aGlisse = false;
  let dernierGlissement = 0;

  piste.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    pointeurActif = event.pointerId;
    debutX = event.clientX;
    debutDefilement = piste.scrollLeft;
    aGlisse = false;
    piste.setPointerCapture(event.pointerId);
  });

  piste.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointeurActif) {
      return;
    }

    const distance = event.clientX - debutX;
    if (Math.abs(distance) > 5) {
      aGlisse = true;
    }
    if (aGlisse) {
      piste.scrollLeft = debutDefilement - distance;
    }
  });

  const terminerGlissement = (event) => {
    if (event.pointerId !== pointeurActif) {
      return;
    }

    if (aGlisse) {
      dernierGlissement = performance.now();
    }
    pointeurActif = null;
    aGlisse = false;
  };

  piste.addEventListener("pointerup", terminerGlissement);
  piste.addEventListener("pointercancel", terminerGlissement);
  piste.addEventListener(
    "click",
    (event) => {
      if (performance.now() - dernierGlissement < 400) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );
  piste.addEventListener("keydown", (event) => {
    const reductionMouvement = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (direction) {
      event.preventDefault();
      piste.scrollBy({ left: direction * 180, behavior: reductionMouvement ? "auto" : "smooth" });
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      piste.scrollTo({
        left: event.key === "Home" ? 0 : piste.scrollWidth,
        behavior: reductionMouvement ? "auto" : "smooth",
      });
    }
  });

  return true;
}

if (!ajouterBadgesDclic()) {
  const attenteCompetences = new MutationObserver(() => {
    if (ajouterBadgesDclic()) {
      attenteCompetences.disconnect();
    }
  });
  attenteCompetences.observe(document.documentElement, { childList: true, subtree: true });
}
