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

function surveillerGrandsTitres() {
  const racine = document.querySelector("#root");
  if (!racine) {
    return false;
  }

  const titres = new Set();
  const preferenceMouvement = window.matchMedia("(prefers-reduced-motion: reduce)");
  let miseAJourEnAttente = false;
  const mettreAJourProgression = () => {
    miseAJourEnAttente = false;
    const hauteurVue = window.innerHeight;
    const debut = hauteurVue * 0.65;
    const fin = hauteurVue * 0.35;

    for (const titre of titres) {
      const boiteTitre = titre.getBoundingClientRect();
      const centreTitre = boiteTitre.top + boiteTitre.height / 2;
      const progression = preferenceMouvement.matches
        ? 1
        : Math.max(
            0,
            Math.min(
              1,
              (debut - centreTitre) / (debut - fin),
            ),
          );
      titre.style.setProperty("--titre-progression", `${progression * 100}%`);
    }
  };
  const programmerMiseAJour = () => {
    if (miseAJourEnAttente) {
      return;
    }

    miseAJourEnAttente = true;
    window.requestAnimationFrame(mettreAJourProgression);
  };
  const observerLesTitres = () => {
    for (const titre of racine.querySelectorAll("section h2")) {
      if (titres.has(titre)) {
        continue;
      }

      titres.add(titre);
      titre.classList.add("titre-logo-anime");
    }
    programmerMiseAJour();
  };

  const mutations = new MutationObserver(observerLesTitres);
  mutations.observe(racine, { childList: true, subtree: true });
  window.addEventListener("scroll", programmerMiseAJour, { passive: true });
  window.addEventListener("resize", programmerMiseAJour);
  preferenceMouvement.addEventListener("change", programmerMiseAJour);
  observerLesTitres();
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

if (!surveillerGrandsTitres()) {
  const attenteRacine = new MutationObserver(() => {
    if (surveillerGrandsTitres()) {
      attenteRacine.disconnect();
    }
  });
  attenteRacine.observe(document.documentElement, { childList: true, subtree: true });
}

const outilsCreatifs = [
  { nom: "Photoshop", fichier: "photoshop.png" },
  { nom: "Illustrator", fichier: "illustrator.png" },
  { nom: "InDesign", fichier: "indesign.svg" },
  { nom: "Premiere Pro", fichier: "premiere-pro.png" },
  { nom: "After Effects", fichier: "adobe-after-effects-cc-icon-4632 - Copie.png" },
  { nom: "DaVinci Resolve", fichier: "davinci_resolve_macos_bigsur_icon_190261.png" },
];

function ajouterOutilsCreatifs() {
  const competences = document.querySelector("#competences");
  const listeOutils = competences?.querySelector(".grid > div.flex.flex-wrap.gap-3.justify-center");
  if (!listeOutils) {
    return false;
  }

  listeOutils.classList.add("outils-constellation");
  listeOutils.querySelector(":scope > .outils-constellation-liens")?.remove();

  const trouverElementOutil = (nom) =>
    [...listeOutils.children].find(
      (element) => element.dataset.outilCreatif === nom || element.textContent.trim() === nom,
    );
  if (!trouverElementOutil("InDesign")) {
    const photoshop = trouverElementOutil("Photoshop");
    const illustrator = trouverElementOutil("Illustrator");
    const badgeSource = photoshop?.querySelector(".outil-creatif") ?? photoshop;
    if (badgeSource && illustrator) {
      const etiquetteInDesign = badgeSource.cloneNode(false);
      etiquetteInDesign.textContent = "InDesign";
      etiquetteInDesign.removeAttribute("data-outil-creatif");
      etiquetteInDesign.classList.remove("outil-creatif", "outil-constellation-noeud");
      etiquetteInDesign.style.removeProperty("opacity");
      etiquetteInDesign.style.removeProperty("transform");
      illustrator.after(etiquetteInDesign);
    }
  }

  const positionsIcones = [
    "outil-icone-haut-gauche",
    "outil-icone-haut-gauche",
    "outil-icone-haut-droite",
    "outil-icone-bas-gauche",
    "outil-icone-bas-droite",
    "outil-icone-bas-droite",
  ];
  const conteneurs = new Set();
  const preparerBadges = () => {
    for (const [index, outil] of outilsCreatifs.entries()) {
      const element = trouverElementOutil(outil.nom);
      if (!element) {
        continue;
      }

      const conteneur = element.classList.contains("outil-creatif-conteneur")
        ? element
        : null;
      const badge = conteneur?.querySelector(".outil-creatif") ?? element;
      if (!badge.dataset.outilCreatif) {
        const libelle = document.createElement("span");
        libelle.className = "outil-creatif-libelle";
        libelle.textContent = outil.nom;
        badge.replaceChildren(libelle);
        badge.dataset.outilCreatif = outil.nom;
      }

      let icone = conteneur?.querySelector(".outil-creatif-icone") ??
        badge.querySelector(".outil-creatif-icone");
      if (!icone) {
        icone = document.createElement("img");
        icone.className = "outil-creatif-icone";
        icone.src = `/${encodeURIComponent(outil.fichier)}`;
        icone.alt = "";
        icone.setAttribute("aria-hidden", "true");
        icone.draggable = false;
        icone.addEventListener("error", () => {
          console.error(`Impossible de charger l’icône de ${outil.nom} : ${outil.fichier}`);
        });
      }

      badge.classList.add("outil-creatif", "outil-constellation-noeud");
      if (badge.parentElement !== conteneur) {
        const nouveauConteneur = document.createElement("span");
        nouveauConteneur.className = "outil-creatif-conteneur";
        nouveauConteneur.dataset.outilCreatif = outil.nom;
        nouveauConteneur.classList.add(positionsIcones[index]);
        nouveauConteneur.style.setProperty("--outil-progression", "0");
        badge.before(nouveauConteneur);
        nouveauConteneur.append(icone, badge);
        conteneurs.add(nouveauConteneur);
      } else {
        conteneur.classList.add(positionsIcones[index]);
        conteneur.style.setProperty("--outil-progression", "0");
        if (icone.parentElement !== conteneur) {
          conteneur.prepend(icone);
        }
        conteneurs.add(conteneur);
      }
    }

    for (const element of listeOutils.children) {
      if (!element.classList.contains("outil-creatif-conteneur")) {
        element.classList.add("outil-constellation-noeud");
      }
    }
  };
  preparerBadges();

  const preferenceMouvement = window.matchMedia("(prefers-reduced-motion: reduce)");
  let miseAJourEnAttente = false;
  const mettreAJourProgression = () => {
    miseAJourEnAttente = false;
    const hauteurVue = window.innerHeight;
    const debut = hauteurVue * 0.84;
    const fin = hauteurVue * 0.5;

    for (const conteneur of conteneurs) {
      if (!conteneur.isConnected) {
        conteneurs.delete(conteneur);
        continue;
      }

      const boite = conteneur.querySelector(".outil-creatif").getBoundingClientRect();
      const centre = boite.top + boite.height / 2;
      const progression = preferenceMouvement.matches
        ? 1
        : Math.max(0, Math.min(1, (debut - centre) / (debut - fin)));
      conteneur.style.setProperty("--outil-progression", progression);
    }
  };
  const programmerMiseAJour = () => {
    if (miseAJourEnAttente) {
      return;
    }

    miseAJourEnAttente = true;
    window.requestAnimationFrame(mettreAJourProgression);
  };

  const mutations = new MutationObserver(() => {
    preparerBadges();
    programmerMiseAJour();
  });
  mutations.observe(listeOutils, { childList: true });
  window.addEventListener("scroll", programmerMiseAJour, { passive: true });
  window.addEventListener("resize", programmerMiseAJour);
  preferenceMouvement.addEventListener("change", programmerMiseAJour);
  programmerMiseAJour();
  return true;
}

if (!ajouterOutilsCreatifs()) {
  const attenteOutils = new MutationObserver(() => {
    if (ajouterOutilsCreatifs()) {
      attenteOutils.disconnect();
    }
  });
  attenteOutils.observe(document.documentElement, { childList: true, subtree: true });
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
    "Marketing numérique — les badges défilent en boucle ; faites-les glisser pour les parcourir, ou cliquez pour les agrandir.";

  const piste = document.createElement("div");
  piste.className = "dclic-badges-track";
  piste.tabIndex = 0;
  piste.setAttribute("role", "region");
  piste.setAttribute("aria-label", "Badges D-Clic — défilement horizontal");

  const defilement = document.createElement("div");
  defilement.className = "dclic-badges-marquee";

  const groupe = document.createElement("div");
  groupe.className = "dclic-badges-group";

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
    groupe.append(lien);
  }

  const copie = groupe.cloneNode(true);
  copie.setAttribute("aria-hidden", "true");
  copie.inert = true;
  defilement.append(groupe, copie);
  piste.append(defilement);
  contenu.append(titre, description, piste);
  section.append(contenu);
  competences.insertAdjacentElement("afterend", section);

  const dureeDefilement = 60000;
  const lireTranslation = () => new DOMMatrixReadOnly(getComputedStyle(defilement).transform).m41;
  const normaliserTranslation = (translation) => {
    const largeur = groupe.getBoundingClientRect().width;
    if (!largeur) {
      return translation;
    }

    while (translation > 0) {
      translation -= largeur;
    }
    while (translation <= -largeur) {
      translation += largeur;
    }
    return translation;
  };
  const reprendreDefilement = (translation) => {
    const largeur = groupe.getBoundingClientRect().width;
    if (largeur) {
      const progression = ((normaliserTranslation(translation) + largeur) / largeur) % 1;
      defilement.style.animationDelay = `${-progression * dureeDefilement}ms`;
    }
    defilement.style.removeProperty("transform");
    defilement.style.removeProperty("animation");
    piste.classList.remove("is-dragging");
  };

  let debutX = 0;
  let debutTranslation = 0;
  let translationActuelle = 0;
  let pointeurActif = null;
  let aGlisse = false;
  let dernierGlissement = 0;

  piste.addEventListener("pointerdown", (event) => {
    if (
      event.button !== 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    pointeurActif = event.pointerId;
    debutX = event.clientX;
    debutTranslation = lireTranslation();
    translationActuelle = debutTranslation;
    aGlisse = false;
    defilement.style.animation = "none";
    defilement.style.transform = `translateX(${debutTranslation}px)`;
    piste.classList.add("is-dragging");
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
      translationActuelle = normaliserTranslation(debutTranslation + distance);
      defilement.style.transform = `translateX(${translationActuelle}px)`;
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
    reprendreDefilement(translationActuelle);
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
