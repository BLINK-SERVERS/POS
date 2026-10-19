function e(e){if(e==null)return``;let t=typeof e==`boolean`?e?`Sí`:`No`:String(e);return/[",;\n\r]/.test(t)?`"${t.replace(/"/g,`""`)}"`:t}function t(t,n){let r=[t.map(e).join(`,`)];for(let t of n)r.push(t.map(e).join(`,`));return`﻿`+r.join(`\r
`)+`\r
`}function n(e,t,n=`text/csv;charset=utf-8`){let r=new Blob([t],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(i),1e3)}function r(){let e=new Date,t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}_${t(e.getHours())}${t(e.getMinutes())}`}function i(e){return`${e}_${r()}`}function a({title:e,subtitle:t,business:n,bodyHtml:r}){let i=document.getElementById(`printable-report`);if(!i)return;let a=new Date().toLocaleString(`es`,{dateStyle:`long`,timeStyle:`short`});i.innerHTML=`
    <div class="pr-head">
      ${n?`<div class="pr-business">${c(n)}</div>`:``}
      <h1 class="pr-title">${c(e)}</h1>
      ${t?`<div class="pr-subtitle">${c(t)}</div>`:``}
      <div class="pr-meta">Generado el ${a}</div>
    </div>
    <div class="pr-body">${r}</div>
  `,requestAnimationFrame(()=>{window.print(),setTimeout(()=>{i.innerHTML=``},500)})}function o(e,t){return`<table class="pr-table"><thead><tr>${e.map(e=>`<th>${c(e)}</th>`).join(``)}</tr></thead><tbody>${t.map(e=>`<tr>${e.map(e=>`<td>${c(e)}</td>`).join(``)}</tr>`).join(``)}</tbody></table>`}function s(e){return`<table class="pr-table pr-table--pairs"><tbody>${e.map(([e,t])=>`<tr><td>${c(e)}</td><td class="pr-num">${c(t)}</td></tr>`).join(``)}</tbody></table>`}function c(e){return e==null?``:(typeof e==`boolean`?e?`Sí`:`No`:String(e)).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}export{i as a,o as i,a as n,t as o,s as r,n as t};