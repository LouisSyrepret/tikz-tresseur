let cv = document.getElementById('dessin');
cv.width = 200; cv.height = 500;
let ctx = cv.getContext('2d');

let cvc = document.getElementById('commande');
cvc.width = 60; cvc.height = 500;
let ctxc = cv.getContext('2d');

let N = 3;
let TRESSE = [];
let STYLE = {larg:1, haut:1, pause:0, arrondi:false, ep:[0,0,0], dec:0.4, coul:[[0,0,0],[0,0,0],[0,0,0]], pal:0, bord:0, tbord:5, soudure:5, colsoud:[51,51,51]};

// Interactivité.
function changer_nombre() {
    let change = true;
    if(TRESSE.length != 0) {
        change = confirm("Changer le nombre de tresses ?\nCela efface la tresse déjà construite.");
    }
    if(change) {
        N = document.getElementById('num_tresses').value;

        let table = '<table><tr>';
        for(let i = 0; i<N-1; i++) {
            table += '<td><button class="gen" onclick="mult('+String(i+1)+')">&sigma;<sub>'+String(i+1)+'</sub></button></td>';
        }
        table += '</tr><tr>';
        for(let i = 0; i<N-1; i++) {
            table += '<td><button class="gen" onclick="smult('+String(i+1)+')">&rho;<sub>'+String(i+1)+'</sub></button></td>';
        }
        table += '</tr><tr>';
        for(let i = 0; i<N-1; i++) {
            table += '<td><button class="gen" onclick="imult('+String(i+1)+')">&sigma;<sub>'+String(i+1)+'</sub><sup>-1</sup></button></td>';
        }
        table += '</tr></table>';
        TRESSE = [];

        document.getElementById('generateurs').innerHTML = table;
        maj_couleurs(N);
    } else {
        document.getElementById('num_tresses').value = N;
    }
    dessiner();
}

changer_nombre();

function maj_couleurs(n) {
    let cocol = '';
    for(let i = 0; i<n; i++) {
        let rr = Math.floor(256*Math.random()); let rg = Math.floor(256*Math.random()); let rb = Math.floor(256*Math.random());
        cocol += '<label for="brin_'+String(i)+'">Brin n°'+String(i+1)+': </label><input type="color" name="brin_'+String(i)+'" id="brin_'+String(i)+'" onchange="recoloriser('+String(i)+')" value="rgb('+String(rr)+','+String(rg)+','+String(rb)+')">';
        cocol += '<input type="number" id="ebrin_'+String(i)+'" value=5 min=0 onchange="epaissir('+String(i)+')">';
        if(i<n-1) { cocol += '<br>'; }
        STYLE.coul[i] = [rr,rg,rb];
        STYLE.ep[i] = 5;
    }
    
    document.getElementById('coloris').innerHTML = cocol;
}

// Fonctionnalités de style.

function n_dec() {
    STYLE.dec = Number(document.getElementById('decoupage').value);
    dessiner();
}

function n_soud() {
    STYLE.soudure = Number(document.getElementById('t_soudure').value);
    dessiner();
}

function n_larg() {
    STYLE.larg = 0.1*Number(document.getElementById('esp_brins').value);
    dessiner();
}

function n_haut() {
    STYLE.haut = 0.1*Number(document.getElementById('haut_crois').value);
    dessiner();
}

function n_pause() {
    STYLE.pause = 0.1*Number(document.getElementById('haut_pause').value);
    dessiner();
}

function n_ep() {
    let epa = Number(document.getElementById('ep_brins').value);
    for(let i = 0; i<N; i++) {
        STYLE.ep[i] = epa;
        document.getElementById('ebrin_'+String(i)).value = epa;
    }
    dessiner();
}

function n_bord() {
    STYLE.bord = document.getElementById('bords').selectedIndex;
    dessiner();
}

function n_tbord() {
    STYLE.tbord = Number(document.getElementById('tbord').value);
    dessiner();
}

function recoloriser(i) {
    STYLE.coul[i] = dehexer(document.getElementById('brin_'+String(i)).value);
    dessiner();
}

function n_csoud(i) {
    STYLE.colsoud = dehexer(document.getElementById('c_soudure').value);
    dessiner();
}

function epaissir(i) {
    STYLE.ep[i] = Number(document.getElementById('ebrin_'+String(i)).value);
    dessiner();
}

function n_palette() {
    STYLE.pal = document.getElementById('palette').selectedIndex;
    palettiser(STYLE.pal);
    dessiner();
}

function gradientize() {
    let st_col = dehexer(document.getElementById('brin_0').value);
    let fi_col = dehexer(document.getElementById('brin_'+String(N-1)).value);
    
    for(let i = 0; i<N; i++) {
        STYLE.coul[i][0] = (st_col[0]*(N-1-i) + fi_col[0]*i)/(N-1);
        STYLE.coul[i][1] = (st_col[1]*(N-1-i) + fi_col[1]*i)/(N-1);
        STYLE.coul[i][2] = (st_col[2]*(N-1-i) + fi_col[2]*i)/(N-1);
    }
    maj_inputcolors();
    dessiner();
}

// SOURCE : https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function hsl_vers_rgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = teinte_en_rgb(p, q, h + 1/3);
    g = teinte_en_rgb(p, q, h);
    b = teinte_en_rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function teinte_en_rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

// Palettes.
function gr(c1,c2,l) { return [c2[0]*l+c1[0]*(1-l), c2[1]*l+c1[1]*(1-l), c2[2]*l+c1[2]*(1-l)]; }

function palettiser(num) {
    STYLE.coul = [];
    switch(num) {
        case 1:
            for(let j = 0; j<N; j++) { STYLE.coul.push([255*j/N,255*j/N,255*j/N]); }
            break;

        case 2:
            STYLE.coul = [[230, 25, 2],[255, 123, 0],[240, 212, 29],[54, 207, 27],[28, 210, 255],[12, 77, 242],[63, 1, 138],[0,0,0],[84, 32, 32],[237, 115, 240]];
            break;

        case 3:
            for(let j = 0; j<N; j++) { STYLE.coul.push(hsl_vers_rgb(j/N,0.8,0.5)); }
            break;    

        case 4:
            for(let j = 0; j<N; j++) { STYLE.coul.push(gr([255,0,0],[0,180,0],j/(N-1))); }
            break;

        case 5:
            for(let j = 0; j<N; j++) { STYLE.coul.push(gr([255,120,0],[0,150,255],j/(N-1))); }
            break;

        case 6:
            for(let j = 0; j<N; j++) { STYLE.coul.push(gr([255,200,0],[150,0,255],j/(N-1))); }
            break;

        default:
            for(let j = 0; j<N; j++) { STYLE.coul.push([0,0,0]); }
    }
    maj_inputcolors();
}

function dehexer(hexcol) {
    let r_c = Number('0x'+hexcol.slice(1,3));
    let g_c = Number('0x'+hexcol.slice(3,5));
    let b_c = Number('0x'+hexcol.slice(5,7));
    return [r_c,g_c,b_c];
}

function maj_inputcolors() {
    for(let i = 0; i<N; i++) {
        let col = STYLE.coul[i];
        document.getElementById('brin_'+String(i)).value = 'rgb('+String(col[0])+','+String(col[1])+','+String(col[2])+')';
    }
}

function vider_tresse() {
    TRESSE = [];
    dessiner();
}

function raccourcir() {
    TRESSE.pop();
    dessiner();
}

// Fonctionnalité de dessin !

function briser(tr,n) {
    let L = STYLE.dec;

    let brisures = []; let indices = []; let soudures = [];
    for(let i = 0; i<n; i++) {
        let trace = [[i,0,0]]; let pos = i;
        for(let t = 0; t<tr.length; t++) {
            let brin = tr[t].brin; let ajt = tr[t].mouv; let sajt = Math.sign(ajt);
            let dessus = tr[t].dessus; let soude = tr[t].soude;
            
            let qqchose = false;
            
            if(ajt != 0) {
                // Notre brin voyage.
                if(pos == brin) {
                    if(dessus || soude) { // Par-dessus !
                        qqchose = true;
                        if(soude) { soudures.push([pos+ajt/2,t+1/2,t]); }
                        pos += ajt;
                        trace.push([pos,t+1,t+1]);
                    } else {
                        trace.push([pos+sajt*L,t+sajt*L/ajt,t]);
                        brisures.push(structuredClone(trace)); indices.push(i);
                        trace = [[pos+ajt-L*sajt,t+1-sajt*L/ajt,t],[pos+ajt,t+1,t+1]];
                        pos += ajt; qqchose = true;
                    }
                } else {
                    if(brin < pos && pos <= brin+ajt) { // ajt>0
                        if(!dessus || soude) { // Par-dessus !
                            qqchose = true;
                            if(soude) { soudures.push([pos-ajt/2,t+1/2,t]); }
                            pos -= 1;
                            trace.push([pos,t+1,t+1]);
                        } else {
                            coupure = (pos-brin)/(ajt+1); let eps = 0.5-L;
                            let plc = Math.max(coupure-eps,0);
                            let plf = Math.min(coupure+eps,1);
                            trace.push([pos-plc,t+plc,t]);
                            brisures.push(structuredClone(trace)); indices.push(i);
                            trace = [[pos-plf,t+plf,t],[pos-1,t+1,t+1]];
                            pos -= 1; qqchose = true;
                        }
                    }
                    if(brin > pos && pos >= brin+ajt) { // ajt<0
                        if(!dessus || soude) { // Par-dessus !
                            qqchose = true;
                            if(soude) { soudures.push([pos+ajt/2,t+1/2,t]); }
                            pos += 1;
                            trace.push([pos,t+1,t+1]);
                        } else {
                            coupure = (brin-pos)/(1-ajt); let eps = 0.5-L;
                            let plc = Math.max(coupure-eps,0);
                            let plf = Math.min(coupure+eps,1);
                            trace.push([pos+plc,t+plc,t]);
                            brisures.push(structuredClone(trace)); indices.push(i);
                            trace = [[pos+plf,t+plf,t],[pos+1,t+1,t+1]];
                            pos += 1; qqchose = true;
                        }
                    }
                }
            }
            if(!qqchose) { trace.push([pos,t+1,t+1]); }
        }
        brisures.push(structuredClone(trace)); indices.push(i);
    }
    return [brisures,indices,soudures];
}

function exporter_tikz() {
    let [brins,ind,soud] = briser(TRESSE,N);

    let tikz = ''; let HAUTEUR = TRESSE.length*(STYLE.haut+STYLE.pause)-STYLE.pause;
    for(let i = 0; i<brins.length; i++) {
        let b = brins[i]; let co = STYLE.coul[ind[i]]; let ep = STYLE.ep[ind[i]];
        tikz += '\\draw[line width='+String(ep/5)+'mm, line join=round, line cap=round, draw={rgb,255:red,'+String(co[0])+'; green,'+String(co[1])+'; blue,'+String(co[2])+'},] ';
        for(let k = 0; k<b.length; k++) {
            if(k>0 && b[k][2]>b[k-1][2]) {
                tikz += '('+String(b[k][0]*STYLE.larg)+','+String(HAUTEUR-(b[k][1]*(STYLE.haut+STYLE.pause)-STYLE.pause))+') --';
            }
            if(b[k][2]<TRESSE.length) {
                tikz += '('+String(b[k][0]*STYLE.larg)+','+String(HAUTEUR-(b[k][2]*(STYLE.haut+STYLE.pause)+STYLE.haut*(b[k][1]-b[k][2])))+') --';
            }
        }
        if(tikz[tikz.length-1] == '-') { tikz = tikz.slice(0,-3); }
        tikz += ';<br>';
    }
    
    for(let j = 0; j<soud.length; j++) {
        let s = soud[j];
        tikz += '\\fill[fill={rgb,255:red,'+String(STYLE.colsoud[0])+';green,'+String(STYLE.colsoud[1])+';blue,'+String(STYLE.colsoud[2])+'}] ('+String(s[0]*STYLE.larg)+','+String(HAUTEUR-(s[1]*(STYLE.haut+STYLE.pause)-STYLE.pause))+') circle ('+String(STYLE.soudure/5)+'mm);<br>';
    }
    
    switch(STYLE.bord) {
        case 1:
            for(let i = 0; i<N; i++) {
                tikz += '\\fill[black] ('+String(i*STYLE.larg)+',0) circle ('+String(1.3*STYLE.tbord/5)+'mm) ('+String(i*STYLE.larg)+','+String((STYLE.haut+STYLE.pause)*TRESSE.length-STYLE.pause)+') circle ('+String(1.3*STYLE.tbord/5)+'mm);<br>';
            }
            break;
        case 2:
            tikz += '\\draw[line width='+String(STYLE.tbord/5)+'mm, line cap=round] (-0.5,0) -- ('+String(0.5+(N-1)*STYLE.larg)+',0);<br>';
            tikz += '\\draw[line width='+String(STYLE.tbord/5)+'mm, line cap=round] (-0.5,'+String((STYLE.haut+STYLE.pause)*TRESSE.length-STYLE.pause)+') -- ('+String(0.5+(N-1)*STYLE.larg)+','+String((STYLE.haut+STYLE.pause)*TRESSE.length-STYLE.pause)+');<br>';
            break;
        case 3:
            let h = ((STYLE.haut+STYLE.pause)*TRESSE.length-STYLE.pause);
            for(let i = 0; i<N; i++) {
                tikz += '\\draw[line width='+String(STYLE.tbord/5)+'mm, line cap=round] ('+String(i*STYLE.larg-1.3*STYLE.tbord/50)+','+String(-1.3*STYLE.tbord/50)+') -- ('+String(i*STYLE.larg+1.3*STYLE.tbord/50)+','+String(1.3*STYLE.tbord/50)+') ('+String(i*STYLE.larg+1.3*STYLE.tbord/50)+','+String(-1.3*STYLE.tbord/50)+') -- ('+String(i*STYLE.larg-1.3*STYLE.tbord/50)+','+String(1.3*STYLE.tbord/50)+');<br>';
                tikz += '\\draw[line width='+String(STYLE.tbord/5)+'mm, line cap=round] ('+String(i*STYLE.larg-1.3*STYLE.tbord/50)+','+String(h-1.3*STYLE.tbord/50)+') -- ('+String(i*STYLE.larg+1.3*STYLE.tbord/50)+','+String(h+1.3*STYLE.tbord/50)+') ('+String(i*STYLE.larg+1.3*STYLE.tbord/50)+','+String(h-1.3*STYLE.tbord/50)+') -- ('+String(i*STYLE.larg-1.3*STYLE.tbord/50)+','+String(h+1.3*STYLE.tbord/50)+');<br>';
            }
            break;
    }

    document.getElementById('code').innerHTML = '\\begin{tikzpicture}<br>'+tikz+'\\end{tikzpicture}';
    document.getElementById('codetikz').style.visibility = 'visible';
}


function dessiner() {
    cv.width = 100+50*(N-1)*STYLE.larg; cv.height = 40+(TRESSE.length*(STYLE.haut+STYLE.pause)-STYLE.pause)*50;
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,cv.width,cv.height);
    ctx.lineJoin = "round"; ctx.lineCap = "round";

    let [brisures,ind,soud] = briser(TRESSE,N);
    for(let b = 0; b<brisures.length; b++) {
        let rvb = STYLE.coul[ind[b]];
        ctx.lineWidth = STYLE.ep[ind[b]];
        ctx.strokeStyle = 'rgb('+String(rvb[0])+','+String(rvb[1])+','+String(rvb[2])+')';
        let ligne = brisures[b];
        ctx.beginPath();
        ctx.moveTo(_x(ligne[0]),_y(ligne[0]));
        for(let t = 1; t<ligne.length; t++) {
            if(ligne[t][2]>ligne[t-1][2]) {
                ctx.lineTo(_x(ligne[t]),_ym(ligne[t]));
            }
            if(ligne[t][2]<TRESSE.length) {
                ctx.lineTo(_x(ligne[t]),_y(ligne[t]));
            }
        }
        ctx.stroke();
        ctx.closePath();
    }
    for(let s = 0; s<soud.length; s++) {
        let point = soud[s];
        ctx.fillStyle = 'rgb('+String(STYLE.colsoud[0])+','+String(STYLE.colsoud[1])+','+String(STYLE.colsoud[2])+')';
        ctx.beginPath();
        ctx.arc(_x(point), _y(point), STYLE.soudure, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
    
    ctx.lineWidth = STYLE.tbord;
    switch(STYLE.bord) {
        case 1:
            for(let i = 0; i<N; i++) {
                rond(50+50*STYLE.larg*i,20,1.3*STYLE.tbord);
                rond(50+50*STYLE.larg*i,20+50*((STYLE.haut+STYLE.pause)*TRESSE.length-STYLE.pause),1.3*STYLE.tbord);
            }
            break;
        case 2:
            barre(25,20,50+50*(N-1)*STYLE.larg);
            barre(25,20+50*((STYLE.haut+STYLE.pause)*TRESSE.length-STYLE.pause),50+50*(N-1)*STYLE.larg);
            break;
        case 3:
            for(let i = 0; i<N; i++) {
                croix(50+50*STYLE.larg*i,20,1.3*STYLE.tbord);
                croix(50+50*STYLE.larg*i,20+50*((STYLE.haut+STYLE.pause)*TRESSE.length-STYLE.pause),1.3*STYLE.tbord);
            }
            break;
    }
    
    let latexcode = '';
    for(let i = 0; i<TRESSE.length; i++) {
        let action = TRESSE[i];
        if(action.mouv == 1) {
            if(action.soude) { latexcode += '\\rho_{'+String(action.brin+1)+'}'; }
            else {
                if(!action.dessus) { latexcode += '\\sigma_{'+String(action.brin+1)+'}'; }
                else { latexcode += '\\sigma_{'+String(action.brin+1)+'}^{-1}'; }
            }
        }
    }
    document.getElementById('latexcode').innerHTML = latexcode;
}
dessiner();

function rond(x,y,r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
}

function croix(x,y,r) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x-r, y-r);
    ctx.lineTo(x+r, y+r);
    ctx.moveTo(x-r, y+r);
    ctx.lineTo(x+r, y-r);
    ctx.stroke();
    ctx.closePath();
}

function barre(x,y,l) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+l, y);
    ctx.stroke();
    ctx.closePath();
}

function _x(pt) { return 50+50*STYLE.larg*pt[0]; }
function _y(pt) { return 20+50*(STYLE.haut+STYLE.pause)*pt[2]+50*STYLE.haut*(pt[1]-pt[2]); }
function _ym(pt) { return 20+50*(STYLE.haut+STYLE.pause)*(pt[2]-1)+50*STYLE.haut*(pt[1]-pt[2]+1); }

function mult(n) { TRESSE.push({brin:n-1, mouv:+1, dessus:false, soude:false}); dessiner(); }
function smult(n) { TRESSE.push({brin:n-1, mouv:+1, dessus:true, soude:true}); dessiner(); }
function imult(n) { TRESSE.push({brin:n-1, mouv:+1, dessus:true, soude:false}); dessiner(); }
function vide() { TRESSE.push({brin:0, mouv:0, dessus:false, soude:false}); dessiner(); }

function croisement() {
    let b1 = Number(document.getElementById('premierbrin').value);
    let b2 = Number(document.getElementById('secondbrin').value);
    let dessus = (document.getElementById('passage').selectedIndex == 0);
    
    TRESSE.push({brin:b1-1, mouv:b2-b1, dessus:dessus, soude:false}); dessiner();
}

// Fenêtre du code tikz.
function fermer() { document.getElementById('codetikz').style.visibility = 'hidden'; }
fermer();