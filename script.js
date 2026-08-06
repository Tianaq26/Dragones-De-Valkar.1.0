/* ============================================================
   ETERIA — script.js
   ============================================================ */

/* ---- NAVEGACIÓN ENTRE SECCIONES ---- */
function showSection(id) {
  // Ocultar todas las secciones
  document.querySelectorAll('.page-section').forEach(s => {
    s.classList.remove('active');
  });

  // Mostrar la sección seleccionada
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Actualizar nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  // Buscar el link correspondiente por su onclick
  document.querySelectorAll('.nav-link').forEach(link => {
    const onclick = link.getAttribute('onclick') || '';
    if (onclick.includes(`'${id}'`)) {
      link.classList.add('active');
    }
  });

  // Cerrar menú móvil si está abierto
  const navCollapse = document.getElementById('navbarNav');
  if (navCollapse && navCollapse.classList.contains('show')) {
    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
    if (bsCollapse) bsCollapse.hide();
    document.querySelector('.navbar-toggler')?.classList.add('collapsed');
  }

  // Reanimar barras de estadísticas si es dragones
  if (id === 'dragones') {
    setTimeout(animateStatBars, 400);
  }
}

/* ---- NAVBAR SCROLL ---- */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  // Botón volver arriba
  const btn = document.getElementById('backToTop');
  if (btn) btn.style.display = window.scrollY > 400 ? 'block' : 'none';
});

/* ---- CURSOR PERSONALIZADO ---- */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  }
});

// El ring sigue con suavidad (RAF)
function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Agrandar ring sobre elementos interactivos
document.querySelectorAll('a, button, .region-card, .character-card, .dragon-card-new, .gallery-item, .lugar-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursorRing) {
      cursorRing.style.width  = '50px';
      cursorRing.style.height = '50px';
      cursorRing.style.borderColor = 'rgba(232,188,106,0.8)';
    }
  });
  el.addEventListener('mouseleave', () => {
    if (cursorRing) {
      cursorRing.style.width  = '28px';
      cursorRing.style.height = '28px';
      cursorRing.style.borderColor = 'rgba(201,147,58,0.6)';
    }
  });
});

/* ---- PARTÍCULAS ---- */
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas ? canvas.getContext('2d') : null;
let particles = [];
let W, H;

function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;
  if (canvas) { canvas.width = W; canvas.height = H; }
}

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.size  = Math.random() * 2 + 0.5;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = (Math.random() - 0.5) * 0.3 - 0.1;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.7
      ? `rgba(90,180,120,${this.alpha})`   // esmeralda ocasional
      : `rgba(201,147,58,${this.alpha})`;  // dorado
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 80; i++) particles.push(new Particle());
}

function animateParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
resizeCanvas();
initParticles();
animateParticles();

/* ---- FILTROS DE DRAGONES ---- */
function filterDragons(type, btn) {
  // Actualizar botón activo
  document.querySelectorAll('.dragon-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Filtrar tarjetas
  document.querySelectorAll('.dragon-card-new').forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.style.display = '';
      card.style.animation = 'fadeInPage 0.4s ease';
    } else {
      card.style.display = 'none';
    }
  });
}

/* ---- FILTROS DE GALERÍA ---- */
function filterGallery(cat, btn) {
  document.querySelectorAll('.gallery-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.gallery-item').forEach(item => {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.classList.remove('hidden');
      item.style.animation = 'fadeInPage 0.4s ease';
    } else {
      item.classList.add('hidden');
    }
  });
}

/* ---- LIGHTBOX ---- */
let currentLightboxIndex = 0;
let visibleItems = [];

function openLightbox(el) {
  const img     = el.querySelector('img');
  const caption = el.querySelector('.gallery-overlay span');
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lightboxImg');
  const lbCap   = document.getElementById('lightboxCaption');

  if (!lb || !lbImg) return;

  // Construir lista de visibles
  visibleItems = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
  currentLightboxIndex = visibleItems.indexOf(el);

  lbImg.src       = img.src;
  lbCap.textContent = caption ? caption.textContent : '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNav(dir, e) {
  e.stopPropagation();
  currentLightboxIndex = (currentLightboxIndex + dir + visibleItems.length) % visibleItems.length;
  const item    = visibleItems[currentLightboxIndex];
  const img     = item.querySelector('img');
  const caption = item.querySelector('.gallery-overlay span');
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightboxCaption').textContent = caption ? caption.textContent : '';
}

// Cerrar lightbox con ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
  }
  if (e.key === 'ArrowRight') lightboxNav(1, e);
  if (e.key === 'ArrowLeft')  lightboxNav(-1, e);
});

/* ============================================================
   REGIONES DE ETERIA
   Datos basados en el documento de diseño del proyecto.
   ============================================================ */
const regionData = {

  valkar: {
    emoji: '🪓',
    nombre: 'Valkar',
    eyebrow: 'Región tutorial · Acto I',
    tagline: 'La aldea natal de Sebastián y capital de Eteria.',
    tema: 'valkar',
    ficha: {
      'Bioma': 'Bosque boreal cárpático, alta montaña, valles de glaciar y llanuras nevadas',
      'Clima': 'Frío, poco lluvioso y nevado',
      'Atmósfera': 'Hogareña y segura al inicio. Tras el ataque de Drakmor queda marcada por el luto y la urgencia',
      'Inspiración real': 'Bucarest y la Rumania medieval — Valaquia, Moldavia y Transilvania',
      'Dragones nativos': 'Skarn, Balaur, Amber y Alaska',
      'Gobierna': 'Rey Roan',
      'Estado': 'Jugable — el Acto I ocurre casi enteramente aquí'
    },
    descripcion: [
      'Valkar es la región principal de Eteria y el hogar de Sebastián, hijo del General Arturo. Sus tierras combinan castillos de piedra, bosques fríos y extensas llanuras como la Llanura de Skarn y la Llanura del Ámbar.',
      'Gobernada por el Rey Roan, Valkar mantuvo la paz con Shihima, Nyru y Cartago durante generaciones — hasta que Drakmor la rompe al final del Acto I atacando la ciudad e hiriendo de muerte al General Arturo. Ese ataque da inicio a todo el viaje.',
      'Narrativamente funciona como la región tutorial: enseña movimiento, vuelo, combate por turnos y captura de dragones de forma orgánica antes de que el mundo se abra en el Acto II.'
    ],
    nota: {
      titulo: 'Una región construida sobre cultura real',
      texto: 'Valkar no toma prestada la estética rumana solo por el aspecto visual: su cocina (mămăligă, sarmale, țuică de ciruela), sus nombres de NPC, su fauna cárpática y su folklore —incluido el ajo como protección contra criaturas oscuras— vienen de tradiciones auténticas de Rumania. El Pacto del Primer Invierno, mito fundacional de la región, nace de esa misma raíz.'
    },
    lugares: [
      {
        nombre: 'El Castillo de Valkar',
        img: 'imgs/jardin%20del%20castillo.png',
        desc: 'Sede del Rey Roan y hogar de la princesa Sabrina. Torres cuadradas, murallas dobles y patios interiores. Su jardín, entre secuoyas y antorchas encendidas, es el escenario de la conversación entre Sebastián y Sabrina la noche anterior a la ceremonia — el último momento de paz del juego.'
      },
      {
        nombre: 'La Catedral de Valkar',
        img: 'imgs/catedral%20de%20valkar.png',
        desc: 'El templo de la aldea, levantado contra la roca de la montaña. Sigue la tradición de las iglesias de madera tallada: torre altísima, campanario y tejados afilados que imitan escamas de dragón. De noche, sus faroles son lo primero que se ve al acercarse al pueblo.'
      },
      {
        nombre: 'El Santuario',
        img: 'imgs/santuario.png',
        desc: 'Un lugar sagrado que no aparece en ningún mapa. Aquí los jóvenes eruditos eligen y doman a su primer dragón compañero. Se dice que el Santuario elige quién puede encontrarlo. Su arquitectura es mucho más antigua que la del resto de Valkar.'
      },
      {
        nombre: 'El Monte Chirripó',
        img: 'imgs/chirripo.png',
        desc: 'En su cima vive el sabio que conoce la historia completa de Eteria. Es el destino de la última orden de Arturo, y desde sus laderas Sebastián presencia el nacimiento de la prisión de luz sobre Valkar.'
      },
      {
        nombre: 'La Llanura de Skarn',
        img: 'imgs/nat5.png',
        desc: 'Vasta llanura que lleva el nombre de los enormes dragones Skarn que la habitan — como Destructor, el compañero de Arturo. Es el camino natural hacia el Santuario.'
      },
      {
        nombre: 'La Llanura del Ámbar',
        img: 'imgs/nat10.png',
        desc: 'Contraparte de la Llanura de Skarn, territorio del dragón Amber. Tierra de girasoles y reservas de ámbar fósil, un mineral que en Eteria protege contra la magia oscura.'
      },
      {
        nombre: 'La Aldea de Valkar',
        img: 'imgs/anochercer%20entrada%20valkar.png',
        desc: 'El pueblo donde vive Sebastián, custodiado por dos estatuas de piedra a la entrada del valle. Aquí están la herrería de Sergio, la tienda de Helen y las fogatas donde se cocina. Es el primer lugar que el jugador aprende a recorrer… y el primero que ve arder.'
      }
    ]
  },

  shihima: {
    emoji: '🌸',
    nombre: 'Shihima',
    eyebrow: 'Región aliada · Acto II',
    tagline: 'Donde no se capturan dragones: se negocia con ellos.',
    tema: 'shihima',
    ficha: {
      'Bioma': 'Valle templado húmedo, bosque de bambú y colinas con cerezos',
      'Clima': 'Templado, monzones en verano, inviernos suaves con nieve ligera',
      'Atmósfera': 'Serena y espiritual, con momentos de tensión sigilosa',
      'Inspiración real': 'Japón feudal — Shirakawa-go, Takayama y mitología sintoísta',
      'Dragones nativos': 'Ryū, Hai-Riyo, Sui-Riu, Ancreus',
      'Representa la alianza': 'Princesa Saray',
      'Estado': 'Narrativa por escribir — la región existe en diseño, no en guion'
    },
    descripcion: [
      'Shihima es una región de valles verdes, ríos cristalinos y bambú que crece hasta ocultar el horizonte. Sus aldeas tienen siglos de historia y todo, desde los puentes de madera hasta los árboles del bosque sagrado, está impregnado de reverencia espiritual.',
      'Sus habitantes no capturan dragones: los invocan y negocian con ellos, porque creen que son manifestaciones divinas de los elementos naturales. El primer chamán de la aldea estableció un pacto que sigue vigente — los humanos protegen ríos y bosques sagrados, los dragones protegen a los humanos de tormentas y sequías. Romperlo desencadena calamidades.',
      'El síntoma visible de que algo va mal en Shihima es que el río sagrado se está secando: Sui-Riu, el rey de la lluvia, fue capturado por soldados de Drakmor.'
    ],
    nota: {
      titulo: 'Región en diseño',
      texto: 'Shihima tiene definidos su estética, sus dragones, sus personajes y sus localizaciones, pero su narrativa del Acto II todavía no está escrita. Es el hueco de guion más grande del proyecto ahora mismo, y por eso aún no se muestran sus lugares en detalle.'
    },
    lugares: []
  },

  nyru: {
    emoji: '🌊',
    nombre: 'Nyru',
    eyebrow: 'Región aliada · Acto II — primera parada',
    tagline: 'La isla de los dragones del mar.',
    tema: 'nyru',
    ficha: {
      'Bioma': 'Selva tropical húmeda, playas coralinas, manglares y cima volcánica',
      'Clima': 'Cálido y húmedo todo el año, con temporada de huracanes',
      'Atmósfera': 'Colorida y musical, con tensión entre la tradición y los forasteros que llegan en barco',
      'Inspiración real': 'Cultura taína y Caribe precolombino',
      'Dragón legendario': 'Azuarys, el dragón del agua',
      'Representa la alianza': 'Selena',
      'Estado': 'Narrativa completa — 10 fases escritas, lista para producción'
    },
    descripcion: [
      'Nyru es un archipiélago cálido rodeado de aguas turquesa, con playas de arena blanca, selvas densas que suben hasta volcanes durmientes y acantilados donde los dragones marinos descansan al atardecer.',
      'Sus habitantes descienden de los primeros navegantes que llegaron siguiendo a un dragón del mar. Según la tradición, si el último de esos dragones muere, el mar reclamará la isla — por eso capturar uno es la peor traición posible en Nyru.',
      'Es la primera región que Sebastián visita en el Acto II. Su aislamiento es también su problema: Nyru lleva años sin contacto real con el resto de Eteria, y por eso su reina no cree que exista una guerra hasta que la tiene encima.'
    ],
    nota: {
      titulo: 'La primera alianza',
      texto: 'El arco de Nyru es el que fija la estructura que repetirán las demás regiones del Acto II: llegada, problema social oculto, tres pruebas, ataque de Drakmor, dragón legendario corrupto, purificación y alianza. Puedes leerlo completo en la sección de Historia.'
    },
    lugares: []
  },

  cartago: {
    emoji: '🏰',
    nombre: 'Cartago',
    eyebrow: 'Región aliada · Acto II — segunda parada',
    tagline: 'La ciudad de las cadenas doradas.',
    tema: 'cartago',
    ficha: {
      'Bioma': 'Valle agrícola, bosque nuboso, ríos de montaña y tierras de café y caña',
      'Clima': 'Templado con lluvias vespertinas y niebla en las mañanas',
      'Atmósfera': 'Hermosa pero tensa. Arquitectura grandiosa que esconde pobreza',
      'Inspiración real': 'Cartago, Costa Rica — y la novela Mamita Yunai',
      'Dragón legendario': 'Talamanca, el dragón de tierra',
      'Representa la alianza': 'Carlos Sibaja y el Comandante Ash',
      'Estado': 'Narrativa completa — 7 fases escritas'
    },
    descripcion: [
      'Cartago es la región más antigua y civilizada de Eteria — y la más corrupta. Construida sobre piedra volcánica negra, con arcos coloniales, campanarios y plazas empedradas, parece próspera desde lejos.',
      'De cerca es otra cosa: es la región más rica de Eteria en recursos y su gente es la más pobre. La riqueza existe, solo que nunca se queda. Cinco clanes nobles controlan la concesión del comercio de dragones y cobran a cualquier aldeano que críe uno un "impuesto de protección" del setenta por ciento.',
      'Cartago no hereda su corona: la elige. Cuando Sebastián llega, el viejo rey acaba de morir y la elección del nuevo está por celebrarse. Los clanes ya tienen su candidato, y el pueblo ya sabe que su voto no vale nada. Nadie espera que esta vez sea diferente.'
    ],
    nota: {
      titulo: 'Inspirada en Mamita Yunai',
      texto: 'Cartago es la denuncia social del juego, y está construida sobre Mamita Yunai (1941), la novela de Carlos Luis Fallas que denunció la explotación de los trabajadores bananeros por la United Fruit Company en Costa Rica. El paralelo es directo: donde la novela tiene una compañía extranjera que se lleva la riqueza, el juego tiene a Drakmor; donde tiene plantaciones de banano como recurso, el juego tiene dragones vivos capturados; donde tiene capataces locales que oprimen a su propio pueblo, el juego tiene a los señores feudales de Cartago. Hasta el episodio más duro de la novela —la gira electoral por Talamanca, donde a un pueblo entero le ponen el voto en la mano y lo cuentan como ganado— se convierte en el corazón emocional de la región. Incluso el coprotagonista, Carlos Sibaja, toma su nombre del narrador de Fallas. El mensaje que hereda el juego es el mismo: el mal no es abstracto, tiene nombres y caras, y siempre hay alguien que sabe la verdad pero tiene miedo de decirla.'
    },
    lugares: []
  },

  drakmor: {
    emoji: '🌑',
    nombre: 'Drakmor',
    eyebrow: 'Región antagonista',
    tagline: 'La quinta región. Los cazadores de dragones.',
    tema: 'drakmor',
    ficha: {
      'Bioma': 'Estepas áridas, montañas rocosas y fortalezas en cimas volcánicas',
      'Clima': 'Seco y duro, con cielos cubiertos de ceniza y humo de forja',
      'Atmósfera': 'Militarizada y opresiva. No hay mercados: hay cuarteles, forjas y jaulas',
      'Inspiración real': 'El Imperio Otomano presionando sobre los principados rumanos',
      'Dragones': 'Dragones corruptos de aura oscura y el Heraldo de Humo',
      'Lidera': 'El Comandante de Drakmor',
      'Estado': 'Bloqueada tras un velo oscuro — se abre en el Acto III'
    },
    descripcion: [
      'Drakmor es la quinta región de Eteria y la única que no vive en paz con las demás. Mientras Valkar, Shihima, Nyru y Cartago ven a los dragones como seres vivos con quienes se convive, el pueblo de Drakmor está formado por cazadores que los consideran recursos: armas, mercancía, herramientas de guerra. Esa diferencia de fondo es la raíz de todo el conflicto.',
      'Sus dragones no son normales. Poseen un aura oscura y anormal, y al ser derrotados no caen como los demás: se disuelven en una nube negra y desaparecen sin dejar cuerpo. Nadie en el resto del mundo sabe qué son realmente.',
      'Al final del Acto I, Drakmor cruza la frontera en una ofensiva total contra Valkar. Es el punto de no retorno del juego.'
    ],
    nota: {
      titulo: 'Un antagonista con base histórica',
      texto: 'Drakmor adapta el conflicto real entre el Imperio Otomano y los principados rumanos, el mismo periodo histórico que inspira a Valkar. No es un villano de fantasía sin raíces: es la presión militar constante de una potencia sobre un pueblo vecino, trasladada a un mundo donde lo que está en disputa son los dragones. Su verdadero misterio —el origen de los dragones de aura oscura— sigue sin resolverse dentro del juego.'
    },
    lugares: []
  }
};

function openRegion(key) {
  const r = regionData[key];
  if (!r) return;

  document.getElementById('regionEyebrow').textContent = r.eyebrow;
  document.getElementById('regionTitle').textContent   = r.emoji + '  ' + r.nombre;
  document.getElementById('regionTagline').textContent = r.tagline;

  // Ficha rápida en forma de badges
  const badges = document.getElementById('regionBadges');
  badges.innerHTML = '';
  ['Bioma', 'Clima', 'Inspiración real'].forEach(k => {
    if (!r.ficha[k]) return;
    const b = document.createElement('span');
    b.className = 'region-badge';
    b.textContent = r.ficha[k];
    badges.appendChild(b);
  });

  // Contenido principal
  let main = '';

  main += '<div class="region-block">';
  r.descripcion.forEach(p => { main += '<p>' + p + '</p>'; });
  main += '</div>';

  if (r.nota) {
    main += '<div class="region-nota">'
          + '<h4><i class="fas fa-feather-pointed"></i> ' + r.nota.titulo + '</h4>'
          + '<p>' + r.nota.texto + '</p>'
          + '</div>';
  }

  if (r.lugares && r.lugares.length) {
    main += '<div class="region-block">'
          + '<h3 class="region-block-title"><i class="fas fa-map-location-dot"></i> Lugares importantes</h3>'
          + '<div class="lugares-grid">';
    r.lugares.forEach(l => {
      main += '<div class="lugar-card">'
            + '<div class="lugar-img"><img src="' + l.img + '" alt="' + l.nombre + '" loading="lazy" /></div>'
            + '<div class="lugar-body"><h4>' + l.nombre + '</h4><p>' + l.desc + '</p></div>'
            + '</div>';
    });
    main += '</div></div>';
  } else {
    main += '<div class="region-pendiente">'
          + '<i class="fas fa-compass-drafting"></i>'
          + '<p>Los lugares de esta región todavía se están definiendo. Cuando su diseño esté cerrado, aparecerán aquí igual que los de Valkar.</p>'
          + '</div>';
  }

  document.getElementById('regionMain').innerHTML = main;

  // Ficha lateral
  let side = '<div class="region-ficha"><h4><i class="fas fa-scroll"></i> Ficha de la región</h4><dl>';
  Object.keys(r.ficha).forEach(k => {
    side += '<dt>' + k + '</dt><dd>' + r.ficha[k] + '</dd>';
  });
  side += '</dl></div>';
  document.getElementById('regionSide').innerHTML = side;

  // Tema visual de la región
  const sec = document.getElementById('region');
  sec.className = 'page-section tema-' + r.tema;

  showSection('region');

  // Mantener "El Mundo" marcado como activo en el navbar
  document.querySelectorAll('.nav-link').forEach(link => {
    if ((link.getAttribute('onclick') || '').includes("'mundo'")) link.classList.add('active');
  });
}

/* ---- ANIMAR BARRAS DE STATS ---- */
function animateStatBars() {
  document.querySelectorAll('.stat-fill:not(.mystery-fill)').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 50);
  });
}

/* ---- HERO BG PARALLAX LEVE ---- */
window.addEventListener('mousemove', e => {
  const heroBg = document.getElementById('heroBg');
  if (!heroBg) return;
  const rx = (e.clientX / window.innerWidth  - 0.5) * 3;
  const ry = (e.clientY / window.innerHeight - 0.5) * 3;
  heroBg.style.transform = `scale(1.06) translate(${rx}px, ${ry}px)`;
});

/* ---- INICIALIZACIÓN ---- */
document.addEventListener('DOMContentLoaded', () => {
  showSection('inicio');
});
