class FlexCarousel {
  constructor(root, options) {
    this.root = root;
    this.options = { preset:'ribbon', intro:'spin', cardHeight:.57, gap:12, squeeze:.2, focusOnClick:true, captions:true, lensWidth:.8, lensHeight:.8, tilt:0, reach:.34, curl:'rise', dispersion:.4, ...options };
    this.active = 0;
    this.drag = null;
    this.render();
    this.bind();
    requestAnimationFrame(() => setTimeout(() => this.root.classList.remove('is-intro'), 40));
  }

  render() {
    this.root.className = 'flex-carousel is-intro';
    this.root.tabIndex = 0;
    this.root.setAttribute('role','region');
    this.root.setAttribute('aria-roledescription','carousel');
    this.root.setAttribute('aria-label','Cebu Study Journey 照片輪播');
    this.track = document.createElement('div');
    this.track.className = 'flex-carousel__track';
    this.cards = this.options.items.map((item, index) => {
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'flex-carousel__card';
      card.style.setProperty('--fc-aspect', item.aspect || .75);
      card.setAttribute('aria-label', `查看 ${item.title}`);
      const image = document.createElement('img'); image.src = item.src; image.alt = item.alt; image.loading = index < 4 ? 'eager' : 'lazy'; image.decoding = 'async';
      card.append(image);
      card.addEventListener('click', () => this.go(index));
      this.track.append(card);
      return card;
    });
    this.caption = document.createElement('div'); this.caption.className = 'flex-carousel__caption';
    this.title = document.createElement('span'); this.title.className = 'flex-carousel__title';
    this.count = document.createElement('span'); this.count.className = 'flex-carousel__count';
    this.caption.append(this.title,this.count);
    this.prev = this.button('←','上一張',-1,'prev'); this.next = this.button('→','下一張',1,'next');
    this.root.replaceChildren(this.track,this.caption,this.prev,this.next);
    this.update(false);
  }

  button(label, aria, delta, kind) {
    const button = document.createElement('button'); button.type='button'; button.className=`flex-carousel__control flex-carousel__control--${kind}`; button.textContent=label; button.setAttribute('aria-label',aria); button.addEventListener('click',()=>this.go(this.active+delta)); return button;
  }

  go(index) { const n=this.options.items.length; this.active=(index%n+n)%n; this.update(true); }

  update(announce) {
    const activeCard = this.cards[this.active];
    this.cards.forEach((card,index) => {
      let distance = index - this.active;
      const half = this.cards.length / 2;
      if (distance > half) distance -= this.cards.length;
      if (distance < -half) distance += this.cards.length;
      card.style.setProperty('--fc-rise', `${Math.min(Math.abs(distance)*8,30)}px`);
      card.style.setProperty('--fc-tilt', `${Math.max(-14,Math.min(14,distance*-3.5))}deg`);
      card.classList.toggle('is-active',index===this.active);
      card.setAttribute('aria-current',index===this.active?'true':'false');
    });
    const rootRect=this.root.getBoundingClientRect(); const activeRect=activeCard.getBoundingClientRect();
    const shift=(rootRect.width/2)-(activeRect.left-rootRect.left+activeRect.width/2);
    this.track.style.transform=`translateX(${shift}px)`;
    const item=this.options.items[this.active]; this.title.textContent=item.title; this.count.textContent=`${String(this.active+1).padStart(2,'0')} / ${String(this.options.items.length).padStart(2,'0')}`;
    if (announce) this.root.setAttribute('aria-label',`Cebu Study Journey 照片輪播，第 ${this.active+1} 張：${item.title}`);
  }

  bind() {
    this.root.addEventListener('keydown',(event)=>{ if(event.key==='ArrowRight'||event.key==='ArrowDown'){event.preventDefault();this.go(this.active+1)} if(event.key==='ArrowLeft'||event.key==='ArrowUp'){event.preventDefault();this.go(this.active-1)} });
    this.root.addEventListener('wheel',(event)=>{ if(Math.abs(event.deltaX)+Math.abs(event.deltaY)<12)return; event.preventDefault(); this.go(this.active+(event.deltaX+event.deltaY>0?1:-1)); },{passive:false});
    this.root.addEventListener('pointerdown',(event)=>{ this.drag={x:event.clientX,active:this.active}; this.root.setAttribute('data-dragging',''); this.root.setPointerCapture?.(event.pointerId); });
    this.root.addEventListener('pointerup',(event)=>{ if(!this.drag)return; const distance=event.clientX-this.drag.x; this.root.removeAttribute('data-dragging'); this.drag=null; if(Math.abs(distance)>28)this.go(this.active+(distance<0?1:-1)); });
    this.root.addEventListener('pointercancel',()=>{this.drag=null;this.root.removeAttribute('data-dragging')});
    new ResizeObserver(()=>this.update(false)).observe(this.root);
  }
}
window.FlexCarousel=FlexCarousel;
