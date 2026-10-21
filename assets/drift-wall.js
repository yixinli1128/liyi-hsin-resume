class DriftWall {
  constructor(root, options) {
    this.root = root;
    this.options = { columns: 5, tileWidth: 200, tileHeight: 140, gap: 16, tilt: 12, turn: -14, perspective: 1150, depth: 120, speed: 42, direction: 'up', variance: .45, parallax: .6, lift: 108, dim: 1, overlayColor: '#060010', ...options };
    this.tracks = [];
    this.offsets = [];
    this.velocities = [];
    this.pointer = { x: 0, y: 0 };
    this.dampedPointer = { x: 0, y: 0 };
    this.hoveredColumn = -1;
    this.lastTime = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.render();
    this.bind();
    this.frame = requestAnimationFrame((time) => this.animate(time));
  }

  columnFactor(index) {
    const pseudo = ((index * .6180339887 + .35) % 1) * 2 - 1;
    return 1 + this.options.variance * pseudo;
  }

  itemHeight(item) {
    return this.options.tileWidth / (item.aspect || (this.options.tileWidth / this.options.tileHeight));
  }

  render() {
    const o = this.options;
    Object.assign(this.root.style, {
      '--dw-tile-w': `${o.tileWidth}px`, '--dw-tile-h': `${o.tileHeight}px`, '--dw-gap': `${o.gap}px`,
      '--dw-perspective': `${o.perspective}px`, '--dw-lift': `${o.lift}px`, '--dw-dim': o.dim, '--dw-overlay': o.overlayColor
    });
    this.root.setAttribute('role', 'group');
    this.root.setAttribute('aria-label', '蠟燭作品漂浮照片牆');
    this.plane = document.createElement('div');
    this.plane.className = 'drift-wall__plane';
    const columns = Array.from({ length: o.columns }, () => []);
    o.items.forEach((item, index) => columns[index % o.columns].push(item));
    const height = this.root.clientHeight || 600;
    columns.forEach((items, columnIndex) => {
      const copyHeight = Math.max(o.tileHeight + o.gap, items.reduce((total, item) => total + this.itemHeight(item) + o.gap, 0));
      const copies = Math.max(2, Math.ceil((height * 1.6) / copyHeight) + 1);
      const column = document.createElement('div');
      column.className = 'drift-wall__col';
      const track = document.createElement('div');
      track.className = 'drift-wall__track';
      for (let copy = 0; copy < copies; copy += 1) {
        items.forEach((item, itemIndex) => track.append(this.tile(item, `${columnIndex}-${copy}-${itemIndex}`, columnIndex)));
      }
      column.append(track);
      this.plane.append(column);
      this.tracks.push({ element: track, copyHeight });
      this.offsets.push(copyHeight * ((columnIndex * .37) % 1));
      this.velocities.push(0);
    });
    this.root.replaceChildren(this.plane);
  }

  tile(item, id, column) {
    const tile = document.createElement('div');
    tile.className = 'drift-wall__tile';
    tile.tabIndex = 0;
    tile.dataset.column = column;
    tile.style.setProperty('--dw-current-h', `${this.itemHeight(item)}px`);
    tile.setAttribute('aria-label', item.title);
    const inner = document.createElement('span');
    inner.className = 'drift-wall__inner';
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.title;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    const overlay = document.createElement('span');
    overlay.className = 'drift-wall__overlay';
    inner.append(image, overlay);
    tile.append(inner);
    tile.addEventListener('pointerenter', () => this.activate(tile, column));
    tile.addEventListener('focus', () => this.activate(tile, column));
    tile.addEventListener('blur', () => this.release(tile));
    return tile;
  }

  bind() {
    this.root.addEventListener('pointermove', (event) => {
      const rect = this.root.getBoundingClientRect();
      this.pointer = { x: (event.clientX - rect.left) / rect.width - .5, y: (event.clientY - rect.top) / rect.height - .5 };
    });
    this.root.addEventListener('pointerleave', () => {
      this.pointer = { x: 0, y: 0 };
      this.release();
    });
  }

  activate(tile, column) {
    this.root.querySelectorAll('.drift-wall__tile.is-active').forEach((entry) => entry.classList.remove('is-active'));
    tile.classList.add('is-active');
    this.hoveredColumn = column;
  }

  release(tile) {
    if (tile) tile.classList.remove('is-active');
    this.hoveredColumn = -1;
  }

  animate(time) {
    if (this.lastTime === null) this.lastTime = time;
    const dt = Math.min(.05, Math.max(0, time - this.lastTime) / 1000);
    this.lastTime = time;
    const maxTilt = this.options.parallax * 8;
    const targetX = this.pointer.x * maxTilt;
    const targetY = -this.pointer.y * maxTilt;
    const damp = 1 - Math.exp(-dt / .12);
    this.dampedPointer.x += (targetX - this.dampedPointer.x) * damp;
    this.dampedPointer.y += (targetY - this.dampedPointer.y) * damp;
    this.plane.style.transform = `translate(-50%, -50%) scale(1.18) rotateX(${this.options.tilt + this.dampedPointer.y}deg) rotateY(${this.options.turn + this.dampedPointer.x}deg) translateZ(${-this.options.depth}px)`;
    this.tracks.forEach((track, index) => {
      const direction = this.options.direction === 'up' ? 1 : -1;
      const base = this.options.speed * this.columnFactor(index) * direction * (index % 2 === 0 ? 1 : -1);
      const target = this.reducedMotion || this.hoveredColumn === index ? 0 : base;
      this.velocities[index] += (target - this.velocities[index]) * (1 - Math.exp(-dt / (target === 0 ? .16 : .28)));
      this.offsets[index] = ((this.offsets[index] + this.velocities[index] * dt) % track.copyHeight + track.copyHeight) % track.copyHeight;
      track.element.style.transform = `translate3d(0, ${-this.offsets[index]}px, 0)`;
    });
    this.frame = requestAnimationFrame((nextTime) => this.animate(nextTime));
  }
}

window.DriftWall = DriftWall;
