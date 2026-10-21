const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Inicio-6CgtA3Su.js","assets/rolldown-runtime-CbXtAM7H.js","assets/vendor-BiSKnltq.js","assets/Vender-DupykGwm.js","assets/Receipt-BFNzr71p.js","assets/Historial-D6-aLezR.js","assets/DataTable-BU_cKWV-.js","assets/Catalogo-BZG8IjGX.js","assets/Inventario-C9T9pkHJ.js","assets/Contactos-CG1mxkaJ.js","assets/Finanzas-CYqsCzPj.js","assets/Informes-jdjv0onJ.js","assets/export-C6jFIQ1o.js","assets/Ajustes-CTKwHlEA.js","assets/Escaner-Czcq0QNm.js"])))=>i.map(i=>d[i]);
import{n as e}from"./rolldown-runtime-CbXtAM7H.js";import{S as t,_ as n,a as r,b as i,d as a,f as o,g as s,h as c,i as l,l as u,m as d,n as f,o as p,p as m,r as h,s as g,t as _,u as v,v as y,x as b}from"./vendor-BiSKnltq.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var x=e(t(),1),S=b(),C=[`unidad`,`kg`,`g`,`mg`,`L`,`ml`,`pack`];function w(e){let t=Number(e.presentationQty)||0,n=e.unit||``;return t>0&&n?`${t} ${n}`:n||``}var T=new Intl.NumberFormat(`en-US`,{minimumFractionDigits:2,maximumFractionDigits:2}),E=new Intl.NumberFormat(`es-VE`,{minimumFractionDigits:2,maximumFractionDigits:2}),D=new Intl.NumberFormat(`es-VE`,{minimumFractionDigits:2,maximumFractionDigits:4});function O(e){return`$ ${T.format(e||0)}`}function ee(e,t){return(e||0)*(t||0)}function k(e,t){return`Bs ${E.format(ee(e,t))}`}function A(e){return`Bs ${E.format(e||0)}`}function te(e){return`Bs ${D.format(e||0)}`}function j(e){return Math.round((e+2**-52)*100)/100}var ne=`https://ve.dolarapi.com/v1`,re=`blink:rate-cache-v1`,ie=`blink:rate-cache-eur-v1`,ae=8e3;function M(e){return e===`EUR`?ie:re}function N(e=`USD`){try{let t=localStorage.getItem(M(e));if(!t)return null;let n=JSON.parse(t);return typeof n.rate!=`number`||n.rate<=0||!n.fetchedAt||!n.updatedAt?null:n}catch{return null}}function P(e,t=`USD`){try{localStorage.setItem(M(t),JSON.stringify(e))}catch{}}function F(e=`USD`){return N(e)}function oe(e=Date.now(),t=`USD`){let n=N(t);return!!n&&e-Date.parse(n.fetchedAt)<36e5}async function se(e=`USD`,t){let n=new AbortController,r=setTimeout(()=>n.abort(),ae),i=()=>n.abort();t?.addEventListener(`abort`,i);try{let t=await fetch(e===`EUR`?`${ne}/euros/oficial`:`${ne}/dolares/oficial`,{method:`GET`,signal:n.signal,headers:{Accept:`application/json`}});if(!t.ok)return null;let r=await t.json(),i=Number(r.promedio);if(!Number.isFinite(i)||i<=0)return null;let a={rate:i,updatedAt:r.fechaActualizacion||new Date().toISOString(),fetchedAt:new Date().toISOString()};return P(a,e),a}catch{return null}finally{clearTimeout(r),t?.removeEventListener(`abort`,i)}}function I(e){let t=e.lines.reduce((e,t)=>e+t.price*t.qty,0);return Math.max(0,t-e.discount)}function ce(e){return e.lines.reduce((e,t)=>e+t.cost*t.qty,0)}function le(e){return j(I(e)+e.tax+e.surcharge+e.igtf)}function L(e){return e.status!==`anulada`&&e.status!==`cotizacion`}function ue(e,t,n){let r=new Date(e).getTime();return r>=t.getTime()&&r<=n.getTime()}function de(e,t,n,r){let i=0,a=0,o=0;for(let t of e)L(t)&&ue(t.at,n,r)&&(i+=I(t),a+=ce(t),o+=1);let s=t.filter(e=>!e.anulado&&ue(e.at,n,r)).reduce((e,t)=>e+t.amountUsd,0),c=i-a;return{net:j(i),count:o,avgTicket:o?j(i/o):0,cogs:j(a),gross:j(c),expenses:j(s),profit:j(c-s)}}function fe(e=new Date){return[new Date(e.getFullYear(),e.getMonth(),e.getDate(),0,0,0),new Date(e.getFullYear(),e.getMonth(),e.getDate(),23,59,59,999)]}function pe(){let e=new Date;return[new Date(e.getFullYear(),e.getMonth(),1),new Date(e.getFullYear(),e.getMonth()+1,0,23,59,59,999)]}function me(){let e=new Date;return[new Date(e.getFullYear(),e.getMonth()-1,1),new Date(e.getFullYear(),e.getMonth(),0,23,59,59,999)]}function he(e,t=12){let n=new Date,r=[],i=new Map;for(let e=t-1;e>=0;e--){let t=new Date(n.getFullYear(),n.getMonth()-e,1),a=`${t.getFullYear()}-${t.getMonth()}`;i.set(a,r.length),r.push({key:a,label:t.toLocaleDateString(`es`,{month:`short`}),net:0})}for(let t of e){if(!L(t))continue;let e=new Date(t.at),n=i.get(`${e.getFullYear()}-${e.getMonth()}`);n!==void 0&&(r[n].net+=I(t))}for(let e of r)e.net=j(e.net);return r}function ge(e,t,n){return t===`USD`?e:j(e/(n||1))}function _e(e){return j(Math.max(0,e.amountUsd-e.paidUsd))}function ve(e){let t=e.rate||1,n=e.accounts.reduce((e,n)=>e+ge(n.balance,n.currency,t),0),r=e.products.reduce((e,t)=>e+t.cost*Math.max(0,t.stock),0),i=e.pendings.filter(e=>e.direction===`cobrar`&&e.status!==`anulado`).reduce((e,t)=>e+_e(t),0),a=e.pendings.filter(e=>e.direction===`pagar`&&e.status!==`anulado`).reduce((e,t)=>e+_e(t),0)+e.expenses.filter(e=>!e.anulado&&!e.paid).reduce((e,t)=>e+t.amountUsd,0);return{accounts:j(n),inventory:j(r),receivable:j(i),payable:j(a),net:j(n+r+i-a)}}function ye(e){return e.products.filter(e=>e.active&&!e.archived&&e.trackStock&&e.minStock>0&&e.stock<=e.minStock)}function be(e){let t=e.cashSession;if(!t)return{usd:0,bs:0};let n=e.rate||1,r=new Map(e.accounts.filter(e=>e.type===`efectivo`&&e.inCashClose!==!1).map(e=>[e.id,e])),i=new Date(t.openedAt).getTime(),a=t.openingUsd,o=t.openingBs;for(let t of e.movements){let e=r.get(t.accountId);if(!e||new Date(t.at).getTime()<i)continue;let s=t.amountInput??(e.currency===`USD`?t.amountUsd:j(t.amountUsd*n)),c=t.direction===`entrada`?1:-1;e.currency===`USD`?a+=c*s:o+=c*s}return{usd:j(a),bs:j(o)}}var xe=`https://zspgwnbkcvnhdwsidjnn.supabase.co`,Se=`sb_publishable_g4TnjGSXkqsuH7jQAS95dg_rlsVfxtB`,Ce=null;try{let e=(window.location.hash||window.location.search).replace(/^[#?]/,``),t=new URLSearchParams(e);Ce=t.get(`type`)||(t.has(`access_token`)||t.has(`code`)?`link`:null)}catch{Ce=null}function we(){let e=Ce;return Ce=null,e}var R=h(xe,Se);function z(e){let t=e.toLowerCase();return t.includes(`invalid login credentials`)?`Correo o contraseña incorrectos.`:t.includes(`email not confirmed`)?`Tu correo aún no está verificado. Revisa el código que te enviamos.`:t.includes(`user already registered`)?`Ese correo ya tiene una cuenta. Inicia sesión.`:t.includes(`password should be at least`)?`La contraseña es muy corta (mínimo 6 caracteres).`:t.includes(`unable to validate email`)?`El correo no es válido.`:t.includes(`token has expired`)||t.includes(`invalid token`)||t.includes(`otp expired`)?`El código no es válido o ya venció. Pide uno nuevo.`:t.includes(`signups not allowed`)||t.includes(`user not found`)?`Ese correo no tiene una cuenta. Regístrate primero.`:t.includes(`for security purposes`)||t.includes(`rate limit`)?`Demasiados intentos. Espera unos segundos y vuelve a intentar.`:t.includes(`failed to fetch`)||t.includes(`network`)?`Sin conexión con el servidor. Revisa tu internet.`:e}function Te(e=``){try{return`${window.location.origin}/${e}`}catch{return}}function Ee(e){if(!e)return null;let t=e.user_metadata??{};return{id:String(e.id??``),email:e.email??``,firstName:typeof t.first_name==`string`?t.first_name:``,lastName:typeof t.last_name==`string`?t.last_name:``,phone:typeof t.phone==`string`?t.phone:``}}function De(e){return Ee(e?.user??null)}async function Oe(e){let{error:t}=await R.auth.signInWithOtp({email:e.email,options:{shouldCreateUser:!0,emailRedirectTo:Te(),data:{first_name:e.firstName,last_name:e.lastName,phone:e.phone}}});return{error:t?z(t.message):null}}async function ke(e,t){return{error:`La verificación por enlace ya no usa código. Abre el enlace que recibiste en tu correo.`}}async function Ae(e){let{error:t}=await R.auth.signInWithOtp({email:e,options:{shouldCreateUser:!0,emailRedirectTo:Te()}});return{error:t?z(t.message):null}}async function je(e){let{error:t}=await R.auth.signInWithOtp({email:e,options:{shouldCreateUser:!1,emailRedirectTo:Te()}});return{error:t?z(t.message):null}}async function Me(e,t){return{error:`Abre el enlace que recibiste en tu correo para verificar este equipo.`}}async function Ne(e,t){let{data:n,error:r}=await R.auth.signInWithPassword({email:e,password:t});return{error:r?z(r.message):null,userId:n.user?.id}}async function Pe(){await R.auth.signOut()}async function Fe(e){let{error:t}=await R.auth.resetPasswordForEmail(e.trim(),{redirectTo:Te(`recuperar`)});return{error:t?z(t.message):null}}async function Ie(e){let{error:t}=await R.auth.updateUser({password:e});return{error:t?z(t.message):null}}async function Le(e){let{error:t}=await R.auth.updateUser({data:{first_name:e.firstName,last_name:e.lastName,phone:e.phone}});return{error:t?z(t.message):null}}async function Re(){let{data:{user:e}}=await R.auth.getUser();if(!e)return null;let{data:t,error:n}=await R.from(`businesses`).select(`name,data`).eq(`owner_id`,e.id).maybeSingle();if(n)throw Error(n.message);return t?{name:t.name??``,data:t.data??{}}:null}async function ze(e){let{data:{user:t}}=await R.auth.getUser();if(!t)return;let{error:n}=await R.from(`businesses`).upsert({owner_id:t.id,name:e.business.name??``,data:e,updated_at:new Date().toISOString()},{onConflict:`owner_id`});if(n)throw Error(n.message)}async function Be(e){let t=e.trim();if(!t)return null;try{let{data:e,error:n}=await R.from(`catalogo_global`).select(`barcode,name,presentation_qty,unit,category,brand`).eq(`barcode`,t).maybeSingle();return n||!e?null:{barcode:String(e.barcode??``),name:String(e.name??``),presentationQty:Number(e.presentation_qty??1),unit:String(e.unit??`unidad`),category:String(e.category??``),brand:String(e.brand??``)}}catch{return null}}async function Ve(e){let t=e.barcode.trim();if(!t)return!1;try{let{error:n}=await R.from(`catalogo_global`).insert({barcode:t,name:e.name.trim().toUpperCase(),presentation_qty:Math.max(0,Number(e.presentationQty)||0),unit:e.unit||`unidad`,category:e.category.trim(),brand:e.brand.trim()});return!(n&&n.code!==`23505`)}catch{return!1}}var He=`blink-temp-bypass`,B=null;function Ue(){if(B!==null)return B;try{B=window.localStorage.getItem(He)===`1`}catch{B=!1}return B}function We(){try{let e=new URLSearchParams(window.location.search),t=e.get(`bypass`);if(t!==`1`&&t!==`0`)return;t===`1`?window.localStorage.setItem(He,`1`):window.localStorage.removeItem(He),B=t===`1`,e.delete(`bypass`);let n=e.toString();window.history.replaceState(null,``,window.location.pathname+(n?`?${n}`:``)+window.location.hash)}catch{}}We();function Ge(){return Ue()}function Ke(){try{window.localStorage.removeItem(He)}catch{}B=!1}function qe(){return{id:`temp-bypass-user`,email:`temporal@blink.local`,firstName:`Tienda`,lastName:`Temporal`,phone:``}}var V=f(),Je=`blink-pos-state-v3`,Ye=[`blink-pos-state-v1`,`blink-pos-state-v2`,`blink-pos-auth-v1`],Xe=250,H=`Dueño`;function U(e=`id`){return`${e}_${Math.random().toString(36).slice(2,9)}${Date.now().toString(36).slice(-4)}`}var Ze={inventory:!0,providers:!0,credit:!0,expenses:!0,reports:!0};function W(){let e={id:`ch_principal`,name:`Principal`,description:``,active:!0,isDefault:!0},t={id:`loc_principal`,name:`Principal`,type:`tienda`,active:!0,defaultSales:!0,defaultPurchases:!0},n={id:`tax_iva`,name:`IVA 16%`,rate:.16,active:!0,isDefault:!0},r={id:`tax_0`,name:`Exento`,rate:0,active:!0},i=[`Alquiler`,`Compra de productos e insumos`,`Gastos administrativos`,`Mantenimiento y reparaciones`,`Mercadeo y publicidad`,`Muebles, equipos y maquinaria`,`Nómina`,`Otros`,`Servicios públicos`,`Transporte y logística`].map((e,t)=>({id:`ecat_${t}`,name:e,active:!0}));return i.push({id:`ecat_sys`,name:`Pago de impuestos (IVA/IGTF)`,active:!0,system:!0}),{business:{name:``,legalName:``,rif:``,phone:``,address:``,currency:`USD`,type:``,features:{...Ze},receiptTitle:``,receiptFooter:``,printFormat:`80mm`,receiptFields:{legalName:!1,rif:!1,address:!1,phone:!1,customer:!0,sku:!1,totalBs:!0,rate:!0,notes:!0}},rate:0,rateUpdatedAt:``,taxes:[n,r],categories:[],channels:[e],locations:[t],products:[],contacts:[],sales:[],accounts:[],movements:[],transfers:[],pendings:[],expenses:[],recurringExpenses:[],expenseCategories:i,discounts:[],surcharges:[],inventoryMoves:[],purchases:[],stockReturns:[],stockAdjustments:[],stockTransfers:[],cashSession:null,cashClosures:[],openTabs:[],onboarding:{completed:!1}}}function Qe(e,t){let n={...e,...t,business:{...e.business,...t.business}};return n.categories??=e.categories,n.channels??=e.channels,n.locations??=e.locations,n.inventoryMoves??=[],n.purchases??=[],n.stockReturns??=[],n.stockAdjustments??=[],n.stockTransfers??=[],n.sales??=[],n.movements??=[],n.transfers??=[],n.pendings??=[],n.expenses??=[],n.recurringExpenses??=[],n.expenseCategories??=e.expenseCategories,n.discounts??=e.discounts,n.surcharges??=e.surcharges,n.cashClosures??=[],n.business.receiptFields??=e.business.receiptFields,n.business.features={...Ze,...t.business?.features??{}},n.business.type??=``,n.onboarding??=e.onboarding,n.accounts=(n.accounts??[]).map(e=>({...e,inCashClose:e.inCashClose??!0})),n.products=(n.products??[]).map(e=>{let t=e,n=C.includes(t.unit)?t.unit:`unidad`;return{...e,brand:e.brand??``,archived:e.archived??!1,channelPrices:e.channelPrices??{ch_principal:e.price},presentationQty:e.presentationQty??1,unit:n,trackStock:t.type===`servicio`?!1:e.trackStock??!0}}),n.contacts=(n.contacts??[]).map(e=>{let t=e;return{...e,isClient:e.isClient??(!t.kind||t.kind!==`proveedor`),isProvider:e.isProvider??(t.kind?t.kind!==`cliente`:!1)}}),n.expenses=(n.expenses??[]).map(e=>({...e,name:e.name??e.category,anulado:e.anulado??!1})),n.sales=(n.sales??[]).map(e=>({...e,userId:e.userId??H,lines:Array.isArray(e.lines)?e.lines:[],payments:Array.isArray(e.payments)?e.payments:[],status:e.status??`cobrada`,discount:e.discount??0,surcharge:e.surcharge??0,tax:e.tax??0,igtf:e.igtf??0})),n.pendings=(n.pendings??[]).map(e=>({...e,contactName:e.contactName??n.contacts.find(t=>t.id===e.contactId)?.name})),n.taxes=(n.taxes??[]).map((e,t)=>({...e,isDefault:e.isDefault??t===0})),!n.taxes.some(e=>e.isDefault)&&n.taxes.length&&(n.taxes[0]={...n.taxes[0],isDefault:!0}),n}function $e(){let e=W();try{for(let e of Ye)localStorage.removeItem(e);let t=localStorage.getItem(Je);if(t)return Qe(e,JSON.parse(t))}catch{}return e}function et(){try{let e=new Blob([JSON.stringify(G,null,2)],{type:`application/json`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`blink-pos-respaldo-${new Date().toISOString().slice(0,10)}.json`,n.click(),URL.revokeObjectURL(t)}catch{}}var G=$e(),tt=!1,nt=null,rt=!0,it=!1,at=!1,ot=`blink-pos-trusted-devices`,st=`blink-pos-device-verified`;function ct(e){try{return e===`local`?window.localStorage:window.sessionStorage}catch{return null}}var lt=ct(`local`),ut=ct(`session`);function dt(e,t){try{let n=e?.getItem(t);if(!n)return new Set;let r=JSON.parse(n);return new Set(Array.isArray(r)?r.filter(e=>typeof e==`string`):[])}catch{return new Set}}function K(e,t,n){try{e?.setItem(t,JSON.stringify([...n]))}catch{}}var ft=dt(lt,ot),pt=dt(ut,st);function mt(e){ft.add(e),K(lt,ot,ft)}function ht(e){pt.has(e)||(pt.add(e),K(ut,st,pt)),Tt(!0)}function gt(){pt.size&&(pt.clear(),K(ut,st,pt)),Tt(!1)}function _t(e){return!e||!we()?!1:(ht(e),!0)}var vt=new Set;function q(e){return vt.add(e),()=>vt.delete(e)}function yt(){for(let e of vt)e()}function bt(){return G}function xt(){return tt}function St(){return nt}function Ct(){return rt}function wt(){return at}function Tt(e){e!==at&&(at=e,yt())}function J(e){let t=typeof e==`function`?e(G):e;Object.is(t,G)||(G=t,yt())}function Et(e){e!==tt&&(tt=e,yt())}function Dt(e){nt=e,H=e?[e.firstName,e.lastName].filter(Boolean).join(` `).trim()||e.email:``,yt()}function Y(e){e!==rt&&(rt=e,yt())}function Ot(e,t=Object.is){let n=(0,x.useRef)(e);n.current=e;let r=(0,x.useRef)(t);r.current=t;let i=(0,x.useRef)(null),a=(0,x.useCallback)(()=>{let e=G,t=i.current;if(t&&t.state===e)return t.value;let a=n.current(e);return t&&r.current(t.value,a)?(i.current={state:e,value:t.value},t.value):(i.current={state:e,value:a},a)},[]);return(0,x.useSyncExternalStore)(q,a,a)}function kt(e,t,n,r,i,a,o,s){return{id:U(`imv`),at:o,productId:e.id,productName:e.name,kind:t,qty:j(n),costUnit:j(r),origin:i,locationId:a,ref:s,userId:H}}function At(e,t){return j(e*(t||0)/100)}function X(e,t,n){return j(t===`USD`?e:e*(n||1))}function jt(e,t,n){return j(t===`USD`?e:e/(n||1))}var Mt=(0,x.createContext)(null),Nt=(0,x.createContext)(!1);function Pt({children:e}){let t=(0,x.useSyncExternalStore)(q,bt,bt),[n,r]=(0,x.useState)(!1),[i,a]=(0,x.useState)(!1),o=(0,x.useCallback)(()=>{if(tt)try{localStorage.setItem(Je,JSON.stringify(G)),r(!1)}catch{r(!0)}},[]),s=(0,x.useCallback)(()=>{tt&&it&&(Ge()||ze(G).then(()=>a(!1)).catch(()=>{a(!0)}))},[]);(0,x.useEffect)(()=>{let e=window.setTimeout(()=>{o(),s()},Xe);return()=>window.clearTimeout(e)},[t,o,s]),(0,x.useEffect)(()=>{let e=()=>{o(),s()},t=()=>{document.visibilityState===`hidden`&&e()};return window.addEventListener(`beforeunload`,e),window.addEventListener(`pagehide`,e),document.addEventListener(`visibilitychange`,t),()=>{window.removeEventListener(`beforeunload`,e),window.removeEventListener(`pagehide`,e),document.removeEventListener(`visibilitychange`,t)}},[o,s]),(0,x.useEffect)(()=>{let e=e=>{if(e.key===Je&&e.newValue&&e.newValue!==JSON.stringify(G))try{J(Qe(W(),JSON.parse(e.newValue)))}catch{}};return window.addEventListener(`storage`,e),()=>window.removeEventListener(`storage`,e)},[]);let c=(0,x.useCallback)(async e=>{if(it=!1,!e)J(W()),it=!0;else try{let e=await Re();J(e?Qe(W(),e.data):W()),a(!1)}catch{a(!0)}finally{it=!0}},[]);(0,x.useEffect)(()=>{let e=!1;if(Ge()){let e=qe();Dt(e),Et(!0),ht(e.id),mt(e.id),Tt(!0),it=!0,Y(!1);return}R.auth.getSession().then(({data:t})=>{if(e)return;let n=De(t.session);Dt(n),Et(!!n),n?(_t(n.id),mt(n.id),ht(n.id),Tt(!0)):Tt(!1),n?(Y(!0),c(n).finally(()=>{e||Y(!1)})):(Y(!1),it=!0,J(W()))});let{data:t}=R.auth.onAuthStateChange((e,t)=>{if(Ge()||e===`INITIAL_SESSION`)return;let n=De(t);Dt(n),Et(!!n),n?(_t(n.id),mt(n.id),ht(n.id),Tt(!0)):Tt(!1),n?(Y(!0),c(n).finally(()=>Y(!1))):(Y(!1),it=!0,J(W()))});return()=>{e=!0,t.subscription.unsubscribe()}},[c]);let l=(0,x.useCallback)(async(e,t)=>{let{error:n,userId:r}=await Ne(e.trim(),t);return n||(r&&(mt(r),ht(r)),Tt(!0),null)},[]),u=(0,x.useCallback)(async()=>{Ge()&&Ke(),await Pe(),Dt(null),Et(!1),gt(),it=!0,J(W())},[]),d=(0,x.useCallback)(async e=>{let{error:t}=await Oe(e);return t},[]),f=(0,x.useCallback)(async(e,t,n=!1)=>{let{error:r,userId:i}=await ke(e.trim(),t.trim());return r||(i&&(ht(i),n&&mt(i)),null)},[]),p=(0,x.useCallback)(async e=>{let{error:t}=await Ae(e.trim());return t},[]),m=(0,x.useCallback)(async e=>{let{error:t}=await je(e.trim());return t},[]),h=(0,x.useCallback)(async(e,t,n=!1)=>{let{error:r,userId:i}=await Me(e.trim(),t.trim());return r||(i&&(ht(i),n&&mt(i)),null)},[]),g=(0,x.useCallback)(async e=>{let{error:t}=await Le(e);return t||Dt(nt&&{...nt,...e}),t},[]),_=(0,x.useCallback)(async e=>{let{error:t}=await Fe(e.trim());return t},[]),v=(0,x.useCallback)(async e=>{let{error:t}=await Ie(e);return t},[]),y=(0,x.useCallback)(()=>{J(e=>({...e,onboarding:{completed:!0}}))},[]),b=(0,x.useCallback)(()=>{J(W())},[]),S=(0,x.useCallback)(async()=>{Y(!0);try{await c(nt)}finally{Y(!1)}},[c]),C=(0,x.useCallback)(e=>{J(t=>({...t,products:[...t.products,{...e,id:U(`prod`)}]}))},[]),w=(0,x.useCallback)((e,t)=>{J(n=>({...n,products:n.products.map(n=>n.id===e?{...n,...t}:n)}))},[]),T=(0,x.useCallback)(e=>{J(t=>({...t,products:t.products.filter(t=>t.id!==e)}))},[]),E=(0,x.useCallback)((e,t)=>{J(n=>({...n,products:n.products.map(n=>n.id===e?{...n,stock:j(t)}:n)}))},[]),D=(0,x.useCallback)(e=>{J(t=>({...t,categories:[...t.categories,{...e,id:U(`cat`)}]}))},[]),O=(0,x.useCallback)((e,t)=>{J(n=>({...n,categories:n.categories.map(n=>n.id===e?{...n,...t}:n)}))},[]),ee=(0,x.useCallback)(e=>{J(t=>({...t,categories:t.categories.filter(t=>t.id!==e)}))},[]),k=(0,x.useCallback)(e=>{J(t=>({...t,channels:[...t.channels,{...e,id:U(`ch`)}]}))},[]),A=(0,x.useCallback)((e,t)=>{J(n=>({...n,channels:n.channels.map(n=>n.id===e?{...n,...t}:n)}))},[]),te=(0,x.useCallback)(e=>{J(t=>t.channels.find(t=>t.id===e)?.isDefault?t:{...t,channels:t.channels.filter(t=>t.id!==e)})},[]),ne=(0,x.useCallback)(e=>{J(t=>({...t,locations:[...t.locations,{...e,id:U(`loc`)}]}))},[]),re=(0,x.useCallback)((e,t)=>{J(n=>{let r=n.locations.map(n=>n.id===e?{...n,...t}:n);return t.defaultSales&&(r=r.map(t=>({...t,defaultSales:t.id===e}))),t.defaultPurchases&&(r=r.map(t=>({...t,defaultPurchases:t.id===e}))),{...n,locations:r}})},[]),ie=(0,x.useCallback)(e=>{J(t=>t.locations.length<=1?t:{...t,locations:t.locations.filter(t=>t.id!==e)})},[]),ae=(0,x.useCallback)((e,t,n)=>{J(r=>({...r,products:r.products.map(i=>i.id===e?{...i,channelPrices:{...i.channelPrices,[t]:j(n)},price:r.channels.find(e=>e.id===t)?.isDefault?j(n):i.price}:i)}))},[]),M=(0,x.useCallback)((e,t)=>{J(n=>({...n,products:n.products.map(r=>{let i=j((r.channelPrices[t]??r.price)*(1+e/100));return{...r,channelPrices:{...r.channelPrices,[t]:i},price:n.channels.find(e=>e.id===t)?.isDefault?i:r.price}})}))},[]),N=(0,x.useCallback)(e=>{J(t=>({...t,contacts:[...t.contacts,{...e,id:U(`cont`)}]}))},[]),P=(0,x.useCallback)((e,t)=>{J(n=>({...n,contacts:n.contacts.map(n=>n.id===e?{...n,...t}:n)}))},[]),I=(0,x.useCallback)(e=>{J(t=>({...t,contacts:t.contacts.filter(t=>t.id!==e)}))},[]),ce=(0,x.useCallback)(e=>{let t=null;return J(n=>{let r=e.lines.reduce((e,t)=>e+t.price*t.qty,0),i=Math.max(0,r-e.discount),a=e.payments.reduce((e,t)=>e+(t.igtf??0),0),o=j(i+e.tax+e.surcharge+a),s=j(e.payments.reduce((e,t)=>e+t.amountUsd,0)),c=j(Math.max(0,o-s)),l=n.sales.filter(e=>e.status!==`cotizacion`).length+1,u=String(l).padStart(6,`0`),d=e.quote?`cotizacion`:c>0?`credito`:`cobrada`,f=e.quote?`C-${u}`:u,p=new Date().toISOString(),m=e.payments.length===0?`—`:c>0?`${e.payments.map(e=>e.method).join(` + `)} + crédito`:e.payments.map(e=>e.method).join(` + `),h=n.contacts.find(t=>t.id===e.customerId),g=e.locationId??n.locations.find(e=>e.defaultSales)?.id??n.locations[0]?.id??``,_=n.accounts,v=[],y=e.payments.map(e=>{let t=e.accountId?n.accounts.find(t=>t.id===e.accountId):void 0;if(!t)return e;let r=At(e.amountUsd,t.commissionIn),i=e.amountInput??X(e.amountUsd,t.currency,n.rate),a=j(X(e.amountUsd,t.currency,n.rate)-X(r,t.currency,n.rate));return _=_.map(e=>e.id===t.id?{...e,balance:j(e.balance+a)}:e),v.push({id:U(`mov`),at:p,accountId:t.id,direction:`entrada`,amountUsd:j(e.amountUsd-r),currency:t.currency,amountInput:a,origin:`Venta`,note:`Cobro de venta ${f}${r?` · comisión ${t.commissionIn}% (${r.toFixed(2)})`:``}`,userId:H}),{...e,amountInput:i,commission:r,creditedNative:a}}),b={id:U(`sale`),code:f,at:p,lines:e.lines,status:d,discount:j(e.discount),discountId:e.discountId,discountCode:n.discounts.find(t=>t.id===e.discountId)?.code,surcharge:j(e.surcharge),surchargeIds:e.surchargeIds,tax:j(e.tax),igtf:j(a),notes:e.notes,payments:y,customerId:e.customerId,customerName:h?.name,paymentMethod:m,channelId:e.channelId??n.channels.find(e=>e.isDefault)?.id,locationId:g,userId:H,rate:n.rate,amountReceived:e.amountReceived?j(e.amountReceived):void 0,changeUsd:e.changeUsd?j(e.changeUsd):void 0,changeBs:e.changeBs?j(e.changeBs):void 0};if(t=b,e.quote)return{...n,sales:[b,...n.sales]};let x=[],S=n.products.map(t=>{let n=e.lines.find(e=>e.productId===t.id);return!n||!t.trackStock?t:(x.push(kt(t,`salida`,n.qty,t.cost,`Venta #${f}`,g,p)),{...t,stock:Math.max(0,j(t.stock-n.qty))})}),C=c>0?[{id:U(`pend`),at:p,direction:`cobrar`,contactId:e.customerId,contactName:h?.name,subject:`Venta ${f}`,amountUsd:c,paidUsd:0,note:`Generado por venta a crédito`,status:`abierto`},...n.pendings]:n.pendings,w=e.discountId?n.discounts.map(t=>t.id===e.discountId?{...t,used:t.used+1}:t):n.discounts;return{...n,products:S,accounts:_,movements:[...v,...n.movements],inventoryMoves:[...x,...n.inventoryMoves],pendings:C,discounts:w,sales:[b,...n.sales]}}),t},[]),le=(0,x.useCallback)((e,t)=>{J(n=>{let r=n.sales.find(t=>t.id===e);if(!r||r.status===`anulada`||r.status===`cotizacion`)return n;let i=new Date().toISOString(),a=[],o=n.products.map(e=>{let t=r.lines.find(t=>t.productId===e.id);return!t||!e.trackStock?e:(a.push(kt(e,`entrada`,t.qty,e.cost,`Anulación venta #${r.code}`,r.locationId??``,i)),{...e,stock:j(e.stock+t.qty)})}),s=[],c=n.accounts.map(e=>{let a=r.payments.filter(t=>t.accountId===e.id);if(!a.length)return e;let o=0;for(let c of a){let a=j(c.amountUsd-(c.commission??0)),l=c.creditedNative??X(a,e.currency,n.rate);o+=l,s.push({id:U(`mov`),at:i,accountId:e.id,direction:`salida`,amountUsd:a,currency:e.currency,amountInput:j(l),origin:`Anulación venta`,note:`Anulación venta ${r.code}${t?` · ${t}`:``}`,userId:H})}return{...e,balance:j(e.balance-o)}}),l=n.pendings.map(e=>e.subject===`Venta ${r.code}`&&e.status!==`saldado`?{...e,status:`anulado`}:e),u=r.discountId?n.discounts.map(e=>e.id===r.discountId?{...e,used:Math.max(0,e.used-1)}:e):n.discounts;return{...n,products:o,accounts:c,pendings:l,discounts:u,movements:[...s,...n.movements],inventoryMoves:[...a,...n.inventoryMoves],sales:n.sales.map(n=>n.id===e?{...n,status:`anulada`,voidedAt:i,voidReason:t}:n)}})},[]),L=(0,x.useCallback)((e,t)=>{let n={openedAt:new Date().toISOString(),openingUsd:e,openingBs:t,userId:H,locationId:G.locations.find(e=>e.defaultSales)?.id??``};J(e=>({...e,cashSession:n}))},[]),ue=(0,x.useCallback)((e,t,n)=>{J(r=>{if(!r.cashSession)return r;let i=r.cashSession,a=new Date().toISOString(),{usd:o,bs:s}=be(r),c={id:U(`cierre`),openedAt:i.openedAt,closedAt:a,userId:i.userId,locationId:i.locationId,openingUsd:i.openingUsd,openingBs:i.openingBs,countedUsd:j(e),countedBs:j(t),expectedUsd:o,expectedBs:s,differenceUsd:j(e-o),differenceBs:j(t-s),note:n};return{...r,cashSession:null,cashClosures:[c,...r.cashClosures]}})},[]),de=(0,x.useCallback)(e=>{J(t=>{let n={...e,id:U(`acc`)},r=n.balance>0?[{id:U(`mov`),at:new Date().toISOString(),accountId:n.id,direction:`entrada`,amountUsd:jt(n.balance,n.currency,t.rate),currency:n.currency,amountInput:j(n.balance),origin:`Apertura`,note:`Saldo inicial · ${n.name}`,userId:H},...t.movements]:t.movements;return{...t,accounts:[...t.accounts,n],movements:r}})},[]),fe=(0,x.useCallback)((e,t)=>{J(n=>({...n,accounts:n.accounts.map(n=>n.id===e?{...n,...t}:n)}))},[]),pe=(0,x.useCallback)(e=>{J(t=>({...t,accounts:t.accounts.filter(t=>t.id!==e)}))},[]),me=(0,x.useCallback)((e,t,n)=>{J(r=>{let i=r.accounts.find(t=>t.id===e);if(!i||!t)return r;let a=jt(t,i.currency,r.rate);return{...r,accounts:r.accounts.map(n=>n.id===e?{...n,balance:j(n.balance+t)}:n),movements:[{id:U(`mov`),at:new Date().toISOString(),accountId:e,direction:t>0?`entrada`:`salida`,amountUsd:j(Math.abs(a)),currency:i.currency,amountInput:j(Math.abs(t)),origin:t>0?`Ingreso`:`Retiro`,note:n||(t>0?`Ingreso de dinero`:`Retiro de dinero`),userId:H},...r.movements]}})},[]),he=(0,x.useCallback)((e,t,n,r)=>{J(i=>{let a=i.accounts.find(t=>t.id===e);if(!a)return i;let o=j(t-a.balance),s=new Date().toISOString();return{...i,accounts:i.accounts.map(n=>n.id===e?{...n,balance:j(t)}:n),movements:[{id:U(`mov`),at:s,accountId:e,direction:o>=0?`entrada`:`salida`,amountUsd:Math.abs(jt(o,a.currency,i.rate)),currency:a.currency,amountInput:Math.abs(o),origin:`Ajuste de saldo`,note:`${n}${r?` · ${r}`:``}`,userId:H},...i.movements]}})},[]),ge=(0,x.useCallback)((e,t,n,r,i)=>{J(a=>{if(e===t)return a;let o=a.accounts.find(t=>t.id===e),s=a.accounts.find(e=>e.id===t);if(!o||!s)return a;let c=j(n),l=j(r),u=j(c+l),d={id:U(`trf`),at:new Date().toISOString(),fromId:e,toId:t,amountUsd:c,commission:l,note:i,userId:H},f=d.at,p=X(u,o.currency,a.rate),m=X(c,s.currency,a.rate);return{...a,transfers:[d,...a.transfers],accounts:a.accounts.map(n=>n.id===e?{...n,balance:j(n.balance-p)}:n.id===t?{...n,balance:j(n.balance+m)}:n),movements:[{id:U(`mov`),at:f,accountId:t,direction:`entrada`,amountUsd:c,currency:s.currency,amountInput:m,origin:`Transferencia`,note:i||`Desde ${o.name}`,userId:H},{id:U(`mov`),at:f,accountId:e,direction:`salida`,amountUsd:u,currency:o.currency,amountInput:p,origin:`Transferencia`,note:`${i||`Hacia ${s.name}`}${l?` · comisión ${l.toFixed(2)}`:``}`,userId:H},...a.movements]}})},[]),_e=(0,x.useCallback)((e,t,n,r)=>ge(e,t,n,r,``),[ge]),ve=(0,x.useCallback)(e=>{J(t=>{let n=e.at??new Date().toISOString(),r={...e,at:n,id:U(`exp`)},i=e.accountId;if(!r.paid||!i)return{...t,expenses:[r,...t.expenses]};let a=t.accounts.find(e=>e.id===i),o=a?j(r.amountUsd*(1+(a.commissionOut||0)/100)):r.amountUsd;return{...t,expenses:[{...r,paidAt:n},...t.expenses],accounts:t.accounts.map(e=>e.id===i?{...e,balance:j(e.balance-X(o,e.currency,t.rate))}:e),movements:[{id:U(`mov`),at:n,accountId:i,direction:`salida`,amountUsd:o,currency:a?.currency,amountInput:a?X(o,a.currency,t.rate):o,origin:`Gasto`,note:`${r.name} · ${r.category}`,userId:H},...t.movements]}})},[]),ye=(0,x.useCallback)((e,t)=>{J(n=>({...n,expenses:n.expenses.map(n=>n.id===e?{...n,...t}:n)}))},[]),xe=(0,x.useCallback)((e,t,n)=>{J(r=>{let i=r.expenses.find(t=>t.id===e),a=r.accounts.find(e=>e.id===t);if(!i||i.paid||i.anulado||!a)return r;let o=new Date().toISOString(),s=j(i.amountUsd*(1+(a.commissionOut||0)/100));return{...r,expenses:r.expenses.map(n=>n.id===e?{...n,paid:!0,paidAt:o,accountId:t}:n),accounts:r.accounts.map(e=>e.id===t?{...e,balance:j(e.balance-X(s,e.currency,r.rate))}:e),movements:[{id:U(`mov`),at:o,accountId:t,direction:`salida`,amountUsd:s,currency:a.currency,amountInput:X(s,a.currency,r.rate),origin:`Gasto`,note:n||`${i.name} · ${i.category}`,userId:H},...r.movements]}})},[]),Se=(0,x.useCallback)(e=>{J(t=>{let n=t.expenses.find(t=>t.id===e);if(!n||n.anulado)return t;let r=n.paid&&n.accountId?t.accounts.find(e=>e.id===n.accountId):void 0;if(r){let i=j(n.amountUsd*(1+(r.commissionOut||0)/100)),a=X(i,r.currency,t.rate);return{...t,expenses:t.expenses.map(t=>t.id===e?{...t,anulado:!0}:t),accounts:t.accounts.map(e=>e.id===r.id?{...e,balance:j(e.balance+a)}:e),movements:[{id:U(`mov`),at:new Date().toISOString(),accountId:r.id,direction:`entrada`,amountUsd:i,currency:r.currency,amountInput:a,origin:`Gasto`,note:`Anulación de gasto · ${n.name}`,userId:H},...t.movements]}}return{...t,expenses:t.expenses.map(t=>t.id===e?{...t,anulado:!0}:t)}})},[]),Ce=(0,x.useCallback)(e=>{J(t=>({...t,recurringExpenses:[...t.recurringExpenses,{...e,id:U(`recur`)}]}))},[]),we=(0,x.useCallback)(e=>{J(t=>({...t,recurringExpenses:t.recurringExpenses.filter(t=>t.id!==e)}))},[]),z=(0,x.useCallback)(()=>{J(e=>{let t=new Date,n=!1,r=e.expenses,i=e.recurringExpenses.map(i=>{if(!i.active)return i;let a=new Date(i.firstDue),o=a.getDate(),s=new Date(t.getFullYear(),t.getMonth(),o);if(s.getTime()>t.getTime()&&s.setMonth(s.getMonth()-1),s.getTime()<a.getTime())return i;let c=s.toISOString();if(i.lastGenerated&&i.lastGenerated>=c.slice(0,10))return i;n=!0;let l=e.expenseCategories.find(e=>e.id===i.categoryId);return r.some(e=>e.category===(l?.name??``)&&e.name===i.name&&e.at.slice(0,10)===c.slice(0,10))||(r=[{id:U(`exp`),at:c,name:i.name,category:l?.name??`Otros`,note:`Generado por gasto recurrente`,amountUsd:i.amountUsd,recurring:!0,paid:!1,anulado:!1},...r]),{...i,lastGenerated:c.slice(0,10)}});return n?{...e,expenses:r,recurringExpenses:i}:e})},[]),Te=(0,x.useCallback)(e=>{J(t=>({...t,expenseCategories:[...t.expenseCategories,{id:U(`ecat`),name:e,active:!0}]}))},[]),Ee=(0,x.useCallback)((e,t)=>{J(n=>({...n,expenseCategories:n.expenseCategories.map(n=>n.id===e?{...n,...t,system:n.system}:n)}))},[]),Be=(0,x.useCallback)(e=>{J(t=>({...t,pendings:[{...e,id:U(`pend`),at:new Date().toISOString(),paidUsd:0,status:`abierto`},...t.pendings]}))},[]),Ve=(0,x.useCallback)((e,t,n,r)=>{J(i=>{let a=i.pendings.find(t=>t.id===e),o=i.accounts.find(e=>e.id===t);if(!a||!o||n<=0||a.status===`saldado`||a.status===`anulado`)return i;let s=j(Math.max(0,a.amountUsd-a.paidUsd)),c=j(Math.min(n,s));if(c<=0)return i;let l=j(a.paidUsd+c),u=l>=a.amountUsd?`saldado`:`parcial`,d=new Date().toISOString(),f=a.direction===`cobrar`,p=j(f?c-At(c,o.commissionIn):c+At(c,o.commissionOut)),m=X(p,o.currency,i.rate);return{...i,pendings:i.pendings.map(t=>t.id===e?{...t,paidUsd:l,status:u}:t),accounts:i.accounts.map(e=>e.id===t?{...e,balance:j(e.balance+(f?m:-m))}:e),movements:[{id:U(`mov`),at:d,accountId:t,direction:f?`entrada`:`salida`,amountUsd:p,currency:o.currency,amountInput:m,origin:`Abono`,note:r||a.subject,userId:H},...i.movements]}})},[]),He=(0,x.useCallback)(e=>{J(t=>({...t,pendings:t.pendings.map(t=>t.id===e?{...t,status:`anulado`}:t)}))},[]),B=(0,x.useCallback)(e=>{J(t=>({...t,taxes:[...t.taxes,{...e,id:U(`tax`)}]}))},[]),Ue=(0,x.useCallback)((e,t)=>{J(n=>({...n,taxes:n.taxes.map(n=>n.id===e?{...n,...t}:n)}))},[]),We=(0,x.useCallback)(e=>{J(t=>({...t,taxes:t.taxes.map(t=>({...t,isDefault:t.id===e}))}))},[]),Ye=(0,x.useCallback)(e=>{J(t=>({...t,discounts:[...t.discounts,{...e,id:U(`disc`),used:0}]}))},[]),Ze=(0,x.useCallback)((e,t)=>{J(n=>({...n,discounts:n.discounts.map(n=>n.id===e?{...n,...t}:n)}))},[]),$e=(0,x.useCallback)(e=>{J(t=>({...t,discounts:t.discounts.filter(t=>t.id!==e)}))},[]),rt=(0,x.useCallback)(e=>{J(t=>({...t,surcharges:[...t.surcharges,{...e,id:U(`sur`)}]}))},[]),at=(0,x.useCallback)((e,t)=>{J(n=>({...n,surcharges:n.surcharges.map(n=>n.id===e?{...n,...t}:n)}))},[]),ot=(0,x.useCallback)(e=>{J(t=>({...t,surcharges:t.surcharges.filter(t=>t.id!==e)}))},[]),st=(0,x.useCallback)(e=>{J(t=>{let n=e.at?new Date(e.at).toISOString():new Date().toISOString(),r=e.lines.filter(e=>e.qty>0);if(!r.length)return t;let i=t.contacts.find(t=>t.id===e.supplierId),a=r.map(e=>{let n=t.products.find(t=>t.id===e.productId);return{productId:e.productId,name:n?.name??``,qty:j(e.qty),costUnit:j(e.costUnit||n?.cost||0)}}),o=j(a.reduce((e,t)=>e+t.qty*t.costUnit,0)),s={id:U(`compra`),at:n,supplierId:e.supplierId,supplierName:i?.name??e.supplierName,locationId:e.locationId,paymentMethod:e.paymentMethod,accountId:e.accountId,invoiceNo:e.invoiceNo,lines:a,totalUsd:o,userId:H},c=[],l=t.products.map(t=>{let r=s.lines.find(e=>e.productId===t.id);if(!r||(c.push(kt(t,`entrada`,r.qty,r.costUnit,`Compra ${s.id.slice(-4).toUpperCase()}`,e.locationId,n,e.invoiceNo)),!t.trackStock))return t;let i=j(t.stock+r.qty),a=i>0?j((t.stock*t.cost+r.qty*r.costUnit)/i):t.cost;return{...t,stock:i,cost:a}}),u=t.accounts,d=[],f=[];if((e.paymentMethod===`cuenta`||e.paymentMethod===`efectivo`)&&e.accountId){let r=t.accounts.find(t=>t.id===e.accountId),i=r?j(o*(1+(r.commissionOut||0)/100)):o;u=u.map(n=>n.id===e.accountId?{...n,balance:j(n.balance-X(i,n.currency,t.rate))}:n),d.push({id:U(`mov`),at:n,accountId:e.accountId,direction:`salida`,amountUsd:i,currency:r?.currency,amountInput:r?X(i,r.currency,t.rate):i,origin:`Compra`,note:`Compra a ${s.supplierName}`,userId:H})}else e.paymentMethod===`credito`&&f.push({id:U(`pend`),at:n,direction:`pagar`,contactId:e.supplierId,contactName:i?.name,subject:`Compra ${s.id.slice(-4).toUpperCase()}`,amountUsd:o,paidUsd:0,note:`Generado por compra a crédito`,status:`abierto`});return{...t,products:l,accounts:u,movements:[...d,...t.movements],inventoryMoves:[...c,...t.inventoryMoves],purchases:[s,...t.purchases],pendings:[...f,...t.pendings]}})},[]),ct=(0,x.useCallback)(e=>{J(t=>{let n=new Date().toISOString(),r=e.lines.filter(e=>e.qty>0).map(e=>({productId:e.productId,name:t.products.find(t=>t.id===e.productId)?.name??``,qty:j(e.qty),costUnit:j(e.costUnit)}));if(!r.length)return t;let i=t.contacts.find(t=>t.id===e.supplierId),a={id:U(`dev`),at:n,supplierId:e.supplierId,supplierName:i?.name??e.supplierName,locationId:e.locationId,lines:r,totalUsd:j(r.reduce((e,t)=>e+t.qty*t.costUnit,0)),reason:e.reason,userId:H},o=[],s=t.products.map(t=>{let i=r.find(e=>e.productId===t.id);return i?(o.push(kt(t,`salida`,i.qty,i.costUnit,`Devolución`,e.locationId,n)),t.trackStock?{...t,stock:Math.max(0,j(t.stock-i.qty))}:t):t});return{...t,products:s,inventoryMoves:[...o,...t.inventoryMoves],stockReturns:[a,...t.stockReturns]}})},[]),lt=(0,x.useCallback)(e=>{J(t=>{let n=new Date().toISOString(),r=e.lines.filter(e=>e.qty!==0).map(e=>({productId:e.productId,name:t.products.find(t=>t.id===e.productId)?.name??``,qty:j(e.qty),costUnit:j(t.products.find(t=>t.id===e.productId)?.cost??0)}));if(!r.length)return t;let i={id:U(`ajuste`),at:n,locationId:e.locationId,reason:e.reason,note:e.note,lines:r,userId:H},a=[],o=t.products.map(t=>{let i=r.find(e=>e.productId===t.id);return i?(a.push(kt(t,i.qty>0?`entrada`:`salida`,Math.abs(i.qty),t.cost,`Ajuste · ${e.reason}`,e.locationId,n)),{...t,stock:j(Math.max(0,t.stock+i.qty))}):t});return{...t,products:o,inventoryMoves:[...a,...t.inventoryMoves],stockAdjustments:[i,...t.stockAdjustments]}})},[]),ut=(0,x.useCallback)(e=>{J(t=>{if(e.fromId===e.toId)return t;let n=new Date().toISOString(),r=e.lines.filter(e=>e.qty>0).map(e=>({productId:e.productId,name:t.products.find(t=>t.id===e.productId)?.name??``,qty:j(e.qty)}));if(!r.length)return t;let i={id:U(`traslado`),at:n,fromId:e.fromId,toId:e.toId,lines:r,note:e.note,userId:H},a=[];for(let i of r){let r=t.products.find(e=>e.id===i.productId);r&&(a.push(kt(r,`salida`,i.qty,r.cost,`Traslado`,e.fromId,n)),a.push(kt(r,`entrada`,i.qty,r.cost,`Traslado`,e.toId,n)))}return{...t,inventoryMoves:[...a,...t.inventoryMoves],stockTransfers:[i,...t.stockTransfers]}})},[]),dt=(0,x.useCallback)(e=>{J(t=>({...t,business:{...t.business,...e}}))},[]),K=(0,x.useCallback)(e=>{!Number.isFinite(e)||e<=0||J(t=>({...t,rate:e,rateUpdatedAt:new Date().toISOString()}))},[]),ft=(0,x.useCallback)(e=>{J(t=>t.business.baseCurrencyLocked&&t.business.baseCurrency?t:{...t,business:{...t.business,baseCurrency:e,baseCurrencyLocked:!0,currency:e===`EUR`?`USD`:t.business.currency}})},[]),pt=(0,x.useCallback)(async()=>{let e=G.business.baseCurrency??`USD`;if(oe(Date.now(),e)){let t=F(e);if(t)return K(t.rate),`cached`}let t=await se(e);if(t)return K(t.rate),`ok`;let n=F(e);return n?(K(n.rate),`cached`):`error`},[K]),vt=(0,x.useMemo)(()=>({login:l,logout:u,addProduct:C,updateProduct:w,removeProduct:T,setStock:E,addCategory:D,updateCategory:O,removeCategory:ee,addChannel:k,updateChannel:A,removeChannel:te,addLocation:ne,updateLocation:re,removeLocation:ie,setChannelPrice:ae,bulkPrice:M,addContact:N,updateContact:P,removeContact:I,checkout:ce,voidSale:le,openCash:L,closeCash:ue,addAccount:de,updateAccount:fe,removeAccount:pe,moveAccount:me,adjustAccount:he,transfer:ge,transferBetween:_e,addExpense:ve,updateExpense:ye,payExpense:xe,voidExpense:Se,addRecurringExpense:Ce,removeRecurringExpense:we,runRecurring:z,addExpenseCategory:Te,updateExpenseCategory:Ee,addPending:Be,abonoPending:Ve,voidPending:He,addTax:B,updateTax:Ue,setDefaultTax:We,addDiscount:Ye,updateDiscount:Ze,removeDiscount:$e,addSurcharge:rt,updateSurcharge:at,removeSurcharge:ot,addPurchase:st,addStockReturn:ct,addStockAdjustment:lt,addStockTransfer:ut,updateBusiness:dt,setRate:K,syncRate:pt,setBaseCurrency:ft,signUp:d,verifyEmail:f,resendCode:p,sendDeviceCode:m,verifyDevice:h,updateProfile:g,resetPassword:_,updatePassword:v,completeOnboarding:y,clearAll:b,reloadCloud:S}),[l,u,C,w,T,E,D,O,ee,k,A,te,ne,re,ie,ae,M,N,P,I,ce,le,L,ue,de,fe,pe,me,he,ge,_e,ve,ye,xe,Se,Ce,we,z,Te,Ee,Be,Ve,He,B,Ue,We,Ye,Ze,$e,rt,at,ot,st,ct,lt,ut,dt,K,pt,d,f,p,m,h,g,_,v,y,b,S]);return(0,V.jsx)(Nt.Provider,{value:!0,children:(0,V.jsxs)(Mt.Provider,{value:vt,children:[e,n&&(0,V.jsxs)(`div`,{className:`storage-alert`,role:`alert`,children:[(0,V.jsx)(`span`,{children:`No se pudo guardar en este dispositivo (almacenamiento lleno o no disponible). Tus últimos cambios pueden perderse si cierras.`}),(0,V.jsx)(`button`,{className:`btn btn--soft btn--sm`,type:`button`,onClick:et,children:`Descargar respaldo`})]}),i&&(0,V.jsx)(`div`,{className:`storage-alert`,role:`alert`,children:(0,V.jsx)(`span`,{children:`No se pudo sincronizar con el servidor. Revisa tu conexión; seguiremos intentando.`})})]})})}function Ft(){if(!(0,x.useContext)(Nt))throw Error(`El store debe usarse dentro de <StoreProvider>`)}function It(){return Ft(),(0,x.useSyncExternalStore)(q,xt,xt)}function Lt(){return Ft(),(0,x.useSyncExternalStore)(q,Ct,Ct)}function Rt(){return Ft(),(0,x.useSyncExternalStore)(q,wt,wt)}function zt(){Ft();let e=(0,x.useSyncExternalStore)(q,bt,bt),t=(0,x.useSyncExternalStore)(q,xt,xt),n=(0,x.useSyncExternalStore)(q,St,St),r=(0,x.useSyncExternalStore)(q,Ct,Ct),i=(0,x.useSyncExternalStore)(q,wt,wt);return(0,x.useMemo)(()=>({state:e,authed:t,user:n,booting:r,deviceVerified:i}),[e,t,n,r,i])}function Bt(){let e=(0,x.useContext)(Mt);if(!e)throw Error(`useStoreActions debe usarse dentro de <StoreProvider>`);return e}function Vt(){let{state:e,authed:t,user:n,booting:r,deviceVerified:i}=zt(),a=Bt();return(0,x.useMemo)(()=>({state:e,authed:t,user:n,booting:r,deviceVerified:i,...a}),[e,t,n,r,i,a])}var Ht={home:{viewBox:`0 0 78.955 84.24`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.240234375)'>
<path fill='currentColor' d='
    M 31.947265625,17.1015625
    L 47.0078125,17.1015625
    L 47.0078125,33.708984375
    Q 47.0078125,34.611328125 46.470703125,35.1484375
    Q 45.93359375,35.685546875 45.03125,35.685546875
    L 33.9453125,35.685546875
    Q 33.04296875,35.685546875 32.4951171875,35.1484375
    Q 31.947265625,34.611328125 31.947265625,33.708984375
    Z
    M 15.275390625,19.099609375
    L 15.275390625,42.259765625
    L 37.76953125,61.1015625
    Q 38.564453125,61.7890625 39.4453125,61.7998046875
    Q 40.326171875,61.810546875 41.1640625,61.1015625
    L 63.6796875,42.216796875
    L 63.6796875,19.099609375
    Q 63.6796875,16.349609375 62.1220703125,14.82421875
    Q 60.564453125,13.298828125 57.79296875,13.298828125
    L 21.162109375,13.298828125
    Q 18.390625,13.298828125 16.8330078125,14.82421875
    Q 15.275390625,16.349609375 15.275390625,19.099609375
    Z
    M 9.109375,42.302734375
    Q 8.142578125,42.302734375 7.60546875,42.8828125
    Q 7.068359375,43.462890625 7.068359375,44.171875
    Q 7.068359375,44.6015625 7.2509765625,45.009765625
    Q 7.43359375,45.41796875 7.841796875,45.76171875
    L 36.373046875,69.6953125
    Q 37.833984375,70.94140625 39.466796875,70.94140625
    Q 41.12109375,70.94140625 42.58203125,69.6953125
    L 71.11328125,45.76171875
    Q 71.521484375,45.41796875 71.7041015625,45.009765625
    Q 71.88671875,44.6015625 71.88671875,44.171875
    Q 71.88671875,43.462890625 71.349609375,42.8828125
    Q 70.8125,42.302734375 69.845703125,42.302734375
    Q 69.3515625,42.302734375 68.9541015625,42.5283203125
    Q 68.556640625,42.75390625 68.19140625,43.0546875
    L 40.51953125,66.279296875
    Q 40.025390625,66.6875 39.466796875,66.6875
    Q 38.9296875,66.6875 38.435546875,66.279296875
    L 10.763671875,43.0546875
    Q 10.3984375,42.75390625 10.0009765625,42.5283203125
    Q 9.603515625,42.302734375 9.109375,42.302734375
    Z
    M 57.79296875,55.751953125
    L 57.79296875,62.6484375
    Q 57.79296875,63.443359375 58.2978515625,63.9267578125
    Q 58.802734375,64.41015625 59.59765625,64.41015625
    L 62.326171875,64.41015625
    Q 63.142578125,64.41015625 63.6259765625,63.9267578125
    Q 64.109375,63.443359375 64.109375,62.6484375
    L 64.109375,50.423828125
    Z
' />
</g>`},cart:{viewBox:`0 0 74.809 81.082`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.08203125)'>
<path fill='currentColor' d='
    M 5.671875,65.806640625
    Q 5.671875,66.537109375 6.1767578125,67.0634765625
    Q 6.681640625,67.58984375 7.412109375,67.58984375
    L 17.380859375,67.58984375
    Q 19.20703125,67.58984375 19.873046875,66.8916015625
    Q 20.5390625,66.193359375 20.732421875,64.83984375
    L 21.333984375,60.779296875
    L 66.81640625,60.779296875
    Q 67.890625,60.779296875 68.513671875,60.2099609375
    Q 69.13671875,59.640625 69.13671875,58.716796875
    Q 69.13671875,58.544921875 69.1044921875,58.2548828125
    Q 69.072265625,57.96484375 69.029296875,57.728515625
    L 66.751953125,42.796875
    Q 66.34375,39.9609375 64.83984375,38.328125
    Q 63.3359375,36.6953125 60.435546875,36.6953125
    L 24.87890625,36.6953125
    L 25.39453125,33.34375
    Q 25.587890625,32.01171875 26.3505859375,31.2275390625
    Q 27.11328125,30.443359375 28.380859375,30.443359375
    L 60.564453125,30.443359375
    Q 61.251953125,30.443359375 61.767578125,29.9384765625
    Q 62.283203125,29.43359375 62.283203125,28.66015625
    Q 62.283203125,27.88671875 61.767578125,27.3818359375
    Q 61.251953125,26.876953125 60.564453125,26.876953125
    L 27.908203125,26.876953125
    Q 25.09375,26.876953125 23.58984375,28.4775390625
    Q 22.0859375,30.078125 21.677734375,32.828125
    L 17.123046875,64.0234375
    L 7.412109375,64.0234375
    Q 6.681640625,64.0234375 6.1767578125,64.560546875
    Q 5.671875,65.09765625 5.671875,65.806640625
    Z
    M 26.125,17.875
    Q 26.125,19.099609375 26.7158203125,20.0986328125
    Q 27.306640625,21.09765625 28.3056640625,21.677734375
    Q 29.3046875,22.2578125 30.529296875,22.2578125
    Q 31.75390625,22.2578125 32.7421875,21.677734375
    Q 33.73046875,21.09765625 34.3212890625,20.0986328125
    Q 34.912109375,19.099609375 34.912109375,17.875
    Q 34.912109375,16.650390625 34.3212890625,15.6513671875
    Q 33.73046875,14.65234375 32.7421875,14.072265625
    Q 31.75390625,13.4921875 30.529296875,13.4921875
    Q 29.3046875,13.4921875 28.3056640625,14.072265625
    Q 27.306640625,14.65234375 26.7158203125,15.6513671875
    Q 26.125,16.650390625 26.125,17.875
    Z
    M 51.734375,17.875
    Q 51.734375,19.099609375 52.3359375,20.0986328125
    Q 52.9375,21.09765625 53.9365234375,21.677734375
    Q 54.935546875,22.2578125 56.16015625,22.2578125
    Q 57.384765625,22.2578125 58.3837890625,21.677734375
    Q 59.3828125,21.09765625 59.9736328125,20.0986328125
    Q 60.564453125,19.099609375 60.564453125,17.875
    Q 60.564453125,16.650390625 59.9736328125,15.6513671875
    Q 59.3828125,14.65234375 58.3837890625,14.072265625
    Q 57.384765625,13.4921875 56.16015625,13.4921875
    Q 54.935546875,13.4921875 53.9365234375,14.072265625
    Q 52.9375,14.65234375 52.3359375,15.6513671875
    Q 51.734375,16.650390625 51.734375,17.875
    Z
' />
</g>`},tag:{viewBox:`0 0 74.186 94.896`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-94.896484375)'>
<path fill='currentColor' d='
    M 38.5859375,19.63671875
    Q 35.70703125,16.7578125 32.763671875,16.7470703125
    Q 29.8203125,16.736328125 26.8984375,19.658203125
    L 9.28125,37.232421875
    Q 6.359375,40.1328125 6.380859375,43.0869140625
    Q 6.40234375,46.041015625 9.259765625,48.919921875
    L 36.501953125,76.0546875
    Q 37.490234375,77.04296875 38.2744140625,77.4833984375
    Q 39.05859375,77.923828125 40.0146484375,78.0419921875
    Q 40.970703125,78.16015625 42.431640625,78.16015625
    L 52.98046875,78.16015625
    Q 54.376953125,78.16015625 55.2578125,77.923828125
    Q 56.138671875,77.6875 56.9013671875,77.107421875
    Q 57.6640625,76.52734375 58.716796875,75.474609375
    L 65.140625,69.029296875
    Q 66.193359375,67.998046875 66.7734375,67.224609375
    Q 67.353515625,66.451171875 67.58984375,65.5810546875
    Q 67.826171875,64.7109375 67.826171875,63.314453125
    L 67.826171875,52.765625
    Q 67.826171875,51.3046875 67.7080078125,50.3486328125
    Q 67.58984375,49.392578125 67.1494140625,48.59765625
    Q 66.708984375,47.802734375 65.720703125,46.8359375
    Z
    M 48.3828125,56.611328125
    Q 49.908203125,56.611328125 50.91796875,57.6318359375
    Q 51.927734375,58.65234375 51.927734375,60.134765625
    Q 51.927734375,61.6171875 50.91796875,62.6376953125
    Q 49.908203125,63.658203125 48.3828125,63.658203125
    Q 46.87890625,63.658203125 45.869140625,62.6376953125
    Q 44.859375,61.6171875 44.859375,60.134765625
    Q 44.859375,58.65234375 45.869140625,57.6318359375
    Q 46.87890625,56.611328125 48.3828125,56.611328125
    Z
' />
</g>`},box:{viewBox:`0 0 69.953 88.688`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-88.6875)'>
<path fill='currentColor' d='
    M 36.6953125,14.501953125
    L 36.6953125,42.646484375
    L 62.669921875,57.341796875
    Q 62.884765625,56.58984375 62.884765625,55.4296875
    L 62.884765625,33.515625
    Q 62.884765625,30.830078125 61.9716796875,29.498046875
    Q 61.05859375,28.166015625 59.232421875,27.134765625
    L 37.275390625,14.759765625
    Q 37.146484375,14.6953125 36.99609375,14.6201171875
    Q 36.845703125,14.544921875 36.6953125,14.501953125
    Z
    M 33.2578125,14.501953125
    Q 33.107421875,14.544921875 32.95703125,14.6201171875
    Q 32.806640625,14.6953125 32.677734375,14.759765625
    L 10.720703125,27.134765625
    Q 8.89453125,28.166015625 7.9814453125,29.498046875
    Q 7.068359375,30.830078125 7.068359375,33.515625
    L 7.068359375,55.4296875
    Q 7.068359375,56.58984375 7.283203125,57.341796875
    L 33.2578125,42.646484375
    Z
    M 34.9765625,45.654296875
    L 8.8515625,60.392578125
    Q 9.3671875,60.908203125 10.26953125,61.40234375
    L 20.625,67.267578125
    L 46.96484375,52.400390625
    Z
    M 50.466796875,54.376953125
    L 24.083984375,69.244140625
    L 30.443359375,72.853515625
    Q 32.806640625,74.185546875 34.9765625,74.185546875
    Q 37.146484375,74.185546875 39.509765625,72.853515625
    L 59.68359375,61.40234375
    Q 60.15625,61.166015625 60.4892578125,60.9189453125
    Q 60.822265625,60.671875 61.1015625,60.392578125
    Z
' />
</g>`},users:{viewBox:`0 0 89.547 68.063`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-68.0625)'>
<path fill='currentColor' d='
    M 41.5078125,9.259765625
    Q 38.521484375,9.259765625 37.25390625,10.1298828125
    Q 35.986328125,11 35.986328125,12.8046875
    Q 35.986328125,14.953125 37.017578125,17.294921875
    Q 38.048828125,19.63671875 40.0361328125,21.8603515625
    Q 42.0234375,24.083984375 44.859375,25.8671875
    Q 47.6953125,27.650390625 51.3154296875,28.7138671875
    Q 54.935546875,29.77734375 59.232421875,29.77734375
    Q 63.529296875,29.77734375 67.138671875,28.7138671875
    Q 70.748046875,27.650390625 73.5947265625,25.8671875
    Q 76.44140625,24.083984375 78.41796875,21.8603515625
    Q 80.39453125,19.63671875 81.4365234375,17.294921875
    Q 82.478515625,14.953125 82.478515625,12.8046875
    Q 82.478515625,11 81.2001953125,10.1298828125
    Q 79.921875,9.259765625 76.935546875,9.259765625
    Z
    M 59.25390625,34.740234375
    Q 57.01953125,34.740234375 55.021484375,35.6748046875
    Q 53.0234375,36.609375 51.5087890625,38.263671875
    Q 49.994140625,39.91796875 49.1240234375,42.130859375
    Q 48.25390625,44.34375 48.25390625,46.900390625
    Q 48.25390625,49.4140625 49.1240234375,51.5732421875
    Q 49.994140625,53.732421875 51.51953125,55.365234375
    Q 53.044921875,56.998046875 55.0322265625,57.900390625
    Q 57.01953125,58.802734375 59.25390625,58.802734375
    Q 61.48828125,58.802734375 63.46484375,57.9111328125
    Q 65.44140625,57.01953125 66.9775390625,55.408203125
    Q 68.513671875,53.796875 69.3837890625,51.6376953125
    Q 70.25390625,49.478515625 70.25390625,46.943359375
    Q 70.25390625,43.505859375 68.75,40.7451171875
    Q 67.24609375,37.984375 64.7431640625,36.3623046875
    Q 62.240234375,34.740234375 59.25390625,34.740234375
    Z
    M 11.6875,9.259765625
    Q 9.23828125,9.259765625 8.1533203125,10.2158203125
    Q 7.068359375,11.171875 7.068359375,13.01953125
    Q 7.068359375,15.919921875 8.46484375,18.884765625
    Q 9.861328125,21.849609375 12.50390625,24.341796875
    Q 15.146484375,26.833984375 18.884765625,28.359375
    Q 22.623046875,29.884765625 27.306640625,29.884765625
    Q 31.302734375,29.884765625 34.3857421875,28.7998046875
    Q 37.46875,27.71484375 39.7890625,26.060546875
    Q 37.51171875,24.27734375 35.8466796875,21.95703125
    Q 34.181640625,19.63671875 33.279296875,17.23046875
    Q 32.376953125,14.82421875 32.3876953125,12.71875
    Q 32.3984375,10.61328125 33.494140625,9.259765625
    Z
    M 27.328125,34.1171875
    Q 24.728515625,34.1171875 22.5478515625,35.5244140625
    Q 20.3671875,36.931640625 19.056640625,39.3271484375
    Q 17.74609375,41.72265625 17.74609375,44.708984375
    Q 17.74609375,47.609375 19.0673828125,49.9619140625
    Q 20.388671875,52.314453125 22.5693359375,53.689453125
    Q 24.75,55.064453125 27.328125,55.064453125
    Q 29.90625,55.064453125 32.0869140625,53.7109375
    Q 34.267578125,52.357421875 35.5888671875,50.015625
    Q 36.91015625,47.673828125 36.91015625,44.751953125
    Q 36.91015625,41.744140625 35.599609375,39.337890625
    Q 34.2890625,36.931640625 32.1083984375,35.5244140625
    Q 29.927734375,34.1171875 27.328125,34.1171875
    Z
' />
</g>`},wallet:{viewBox:`0 0 78.869 81.383`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.3828125)'>
<path fill='currentColor' d='
    M 15.017578125,12.826171875
    Q 11.064453125,12.826171875 9.06640625,14.802734375
    Q 7.068359375,16.779296875 7.068359375,20.689453125
    L 7.068359375,49.45703125
    Q 7.068359375,53.3671875 9.06640625,55.34375
    Q 11.064453125,57.3203125 15.017578125,57.3203125
    L 60.220703125,57.3203125
    Q 64.1953125,57.3203125 66.1826171875,55.3330078125
    Q 68.169921875,53.345703125 68.169921875,49.45703125
    L 68.169921875,45.138671875
    L 58.201171875,45.138671875
    Q 54.828125,45.138671875 52.4111328125,43.8603515625
    Q 49.994140625,42.58203125 48.68359375,40.3046875
    Q 47.373046875,38.02734375 47.373046875,35.0625
    Q 47.373046875,32.09765625 48.68359375,29.8310546875
    Q 49.994140625,27.564453125 52.4111328125,26.2861328125
    Q 54.828125,25.0078125 58.201171875,25.0078125
    L 68.169921875,25.0078125
    L 68.169921875,20.689453125
    Q 68.169921875,16.80078125 66.1826171875,14.8134765625
    Q 64.1953125,12.826171875 60.220703125,12.826171875
    Z
    M 57.4921875,32.162109375
    Q 58.6953125,32.162109375 59.5439453125,33.0107421875
    Q 60.392578125,33.859375 60.392578125,35.0625
    Q 60.392578125,36.265625 59.5439453125,37.1142578125
    Q 58.6953125,37.962890625 57.4921875,37.962890625
    Q 56.267578125,37.962890625 55.4189453125,37.1142578125
    Q 54.5703125,36.265625 54.5703125,35.0625
    Q 54.5703125,33.859375 55.4189453125,33.0107421875
    Q 56.267578125,32.162109375 57.4921875,32.162109375
    Z
    M 58.201171875,28.2734375
    Q 55.880859375,28.2734375 54.18359375,29.0576171875
    Q 52.486328125,29.841796875 51.5625,31.3564453125
    Q 50.638671875,32.87109375 50.638671875,35.0625
    Q 50.638671875,37.25390625 51.5625,38.779296875
    Q 52.486328125,40.3046875 54.18359375,41.0888671875
    Q 55.880859375,41.873046875 58.201171875,41.873046875
    L 67.93359375,41.873046875
    Q 69.759765625,41.873046875 70.7802734375,40.77734375
    Q 71.80078125,39.681640625 71.80078125,38.048828125
    L 71.80078125,32.09765625
    Q 71.80078125,30.46484375 70.7802734375,29.369140625
    Q 69.759765625,28.2734375 67.93359375,28.2734375
    Z
    M 24.255859375,60.736328125
    L 49.177734375,67.76171875
    Q 51.9921875,68.556640625 54.1513671875,68.1806640625
    Q 56.310546875,67.8046875 57.5888671875,66.236328125
    Q 58.8671875,64.66796875 58.974609375,61.896484375
    Q 58.974609375,61.595703125 58.974609375,61.31640625
    Q 58.974609375,61.037109375 58.974609375,60.736328125
    Z
' />
</g>`},chart:{viewBox:`0 0 75.518 70.619`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.619140625)'>
<path fill='currentColor' d='
    M 9.41015625,20.32421875
    L 9.41015625,45.525390625
    Q 9.41015625,46.599609375 10.076171875,47.244140625
    Q 10.7421875,47.888671875 11.880859375,47.888671875
    L 18.583984375,47.888671875
    Q 19.72265625,47.888671875 20.3994140625,47.244140625
    Q 21.076171875,46.599609375 21.076171875,45.525390625
    L 21.076171875,20.32421875
    Q 21.076171875,19.20703125 20.3994140625,18.583984375
    Q 19.72265625,17.9609375 18.583984375,17.9609375
    L 11.880859375,17.9609375
    Q 10.7421875,17.9609375 10.076171875,18.583984375
    Q 9.41015625,19.20703125 9.41015625,20.32421875
    Z
    M 24.40625,20.32421875
    L 24.40625,58.3515625
    Q 24.40625,59.447265625 25.0830078125,60.0810546875
    Q 25.759765625,60.71484375 26.876953125,60.71484375
    L 33.580078125,60.71484375
    Q 34.740234375,60.71484375 35.40625,60.0810546875
    Q 36.072265625,59.447265625 36.072265625,58.3515625
    L 36.072265625,20.32421875
    Q 36.072265625,19.20703125 35.40625,18.583984375
    Q 34.740234375,17.9609375 33.580078125,17.9609375
    L 26.876953125,17.9609375
    Q 25.759765625,17.9609375 25.0830078125,18.583984375
    Q 24.40625,19.20703125 24.40625,20.32421875
    Z
    M 39.423828125,20.32421875
    L 39.423828125,51.94921875
    Q 39.423828125,53.06640625 40.1005859375,53.7001953125
    Q 40.77734375,54.333984375 41.916015625,54.333984375
    L 48.59765625,54.333984375
    Q 49.736328125,54.333984375 50.4130859375,53.7001953125
    Q 51.08984375,53.06640625 51.08984375,51.94921875
    L 51.08984375,20.32421875
    Q 51.08984375,19.20703125 50.4130859375,18.583984375
    Q 49.736328125,17.9609375 48.59765625,17.9609375
    L 41.916015625,17.9609375
    Q 40.77734375,17.9609375 40.1005859375,18.583984375
    Q 39.423828125,19.20703125 39.423828125,20.32421875
    Z
    M 54.44140625,20.32421875
    L 54.44140625,39.294921875
    Q 54.44140625,40.390625 55.107421875,41.0244140625
    Q 55.7734375,41.658203125 56.93359375,41.658203125
    L 63.63671875,41.658203125
    Q 64.75390625,41.658203125 65.4306640625,41.0244140625
    Q 66.107421875,40.390625 66.107421875,39.294921875
    L 66.107421875,20.32421875
    Q 66.107421875,19.20703125 65.4306640625,18.583984375
    Q 64.75390625,17.9609375 63.63671875,17.9609375
    L 56.93359375,17.9609375
    Q 55.7734375,17.9609375 55.107421875,18.583984375
    Q 54.44140625,19.20703125 54.44140625,20.32421875
    Z
    M 7.068359375,11.794921875
    Q 7.068359375,12.58984375 7.6376953125,13.1376953125
    Q 8.20703125,13.685546875 8.98046875,13.685546875
    L 66.537109375,13.685546875
    Q 67.310546875,13.685546875 67.8798828125,13.1376953125
    Q 68.44921875,12.58984375 68.44921875,11.794921875
    Q 68.44921875,11 67.8798828125,10.4521484375
    Q 67.310546875,9.904296875 66.537109375,9.904296875
    L 8.98046875,9.904296875
    Q 8.20703125,9.904296875 7.6376953125,10.4521484375
    Q 7.068359375,11 7.068359375,11.794921875
    Z
' />
</g>`},settings:{viewBox:`0 0 67.547 84.283`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.283203125)'>
<path fill='currentColor' d='
    M 31.173828125,13.3203125
    Q 30.056640625,13.3203125 29.3154296875,13.9326171875
    Q 28.57421875,14.544921875 28.31640625,15.662109375
    L 26.8984375,21.65625
    Q 26.146484375,21.9140625 25.4267578125,22.2041015625
    Q 24.70703125,22.494140625 24.041015625,22.794921875
    L 18.798828125,19.55078125
    Q 17.853515625,18.94921875 16.88671875,19.0458984375
    Q 15.919921875,19.142578125 15.16796875,19.916015625
    L 11.515625,23.546875
    Q 10.7421875,24.3203125 10.6455078125,25.30859375
    Q 10.548828125,26.296875 11.171875,27.2421875
    L 14.39453125,32.44140625
    Q 14.09375,33.12890625 13.814453125,33.837890625
    Q 13.53515625,34.546875 13.298828125,35.255859375
    L 7.26171875,36.673828125
    Q 6.166015625,36.931640625 5.564453125,37.6728515625
    Q 4.962890625,38.4140625 4.962890625,39.53125
    L 4.962890625,44.666015625
    Q 4.962890625,45.76171875 5.564453125,46.4921875
    Q 6.166015625,47.22265625 7.26171875,47.501953125
    L 13.255859375,48.94140625
    Q 13.513671875,49.71484375 13.8037109375,50.423828125
    Q 14.09375,51.1328125 14.3515625,51.755859375
    L 11.12890625,57.041015625
    Q 10.52734375,57.986328125 10.6025390625,58.931640625
    Q 10.677734375,59.876953125 11.47265625,60.671875
    L 15.16796875,64.32421875
    Q 15.919921875,65.09765625 16.8544921875,65.205078125
    Q 17.7890625,65.3125 18.734375,64.7109375
    L 24.01953125,61.4453125
    Q 24.685546875,61.7890625 25.416015625,62.068359375
    Q 26.146484375,62.34765625 26.8984375,62.60546875
    L 28.31640625,68.62109375
    Q 28.57421875,69.73828125 29.3154296875,70.3505859375
    Q 30.056640625,70.962890625 31.173828125,70.962890625
    L 36.373046875,70.962890625
    Q 37.490234375,70.962890625 38.2314453125,70.3505859375
    Q 38.97265625,69.73828125 39.23046875,68.62109375
    L 40.6484375,62.5625
    Q 41.421875,62.3046875 42.1416015625,62.025390625
    Q 42.861328125,61.74609375 43.505859375,61.423828125
    L 48.8125,64.7109375
    Q 49.736328125,65.3125 50.6708984375,65.18359375
    Q 51.60546875,65.0546875 52.37890625,64.32421875
    L 56.07421875,60.671875
    Q 56.869140625,59.876953125 56.93359375,58.931640625
    Q 56.998046875,57.986328125 56.41796875,57.041015625
    L 53.1953125,51.755859375
    Q 53.453125,51.1328125 53.7431640625,50.423828125
    Q 54.033203125,49.71484375 54.291015625,48.94140625
    L 60.28515625,47.501953125
    Q 61.40234375,47.22265625 61.9931640625,46.4921875
    Q 62.583984375,45.76171875 62.583984375,44.666015625
    L 62.583984375,39.53125
    Q 62.583984375,38.4140625 61.9931640625,37.6728515625
    Q 61.40234375,36.931640625 60.28515625,36.673828125
    L 54.248046875,35.255859375
    Q 54.01171875,34.546875 53.732421875,33.837890625
    Q 53.453125,33.12890625 53.15234375,32.44140625
    L 56.375,27.2421875
    Q 56.998046875,26.296875 56.9013671875,25.30859375
    Q 56.8046875,24.3203125 56.03125,23.546875
    L 52.37890625,19.916015625
    Q 51.60546875,19.142578125 50.638671875,19.0458984375
    Q 49.671875,18.94921875 48.748046875,19.55078125
    L 43.505859375,22.794921875
    Q 42.83984375,22.494140625 42.1201171875,22.2041015625
    Q 41.400390625,21.9140625 40.6484375,21.65625
    L 39.23046875,15.662109375
    Q 38.97265625,14.544921875 38.2314453125,13.9326171875
    Q 37.490234375,13.3203125 36.373046875,13.3203125
    Z
    M 33.7734375,32.291015625
    Q 36.501953125,32.291015625 38.736328125,33.623046875
    Q 40.970703125,34.955078125 42.302734375,37.2001953125
    Q 43.634765625,39.4453125 43.634765625,42.15234375
    Q 43.634765625,44.880859375 42.302734375,47.115234375
    Q 40.970703125,49.349609375 38.736328125,50.681640625
    Q 36.501953125,52.013671875 33.7734375,52.013671875
    Q 31.06640625,52.013671875 28.8212890625,50.681640625
    Q 26.576171875,49.349609375 25.244140625,47.115234375
    Q 23.912109375,44.880859375 23.912109375,42.15234375
    Q 23.912109375,39.4453125 25.244140625,37.2001953125
    Q 26.576171875,34.955078125 28.8212890625,33.623046875
    Q 31.06640625,32.291015625 33.7734375,32.291015625
    Z
' />
</g>`},logout:{viewBox:`0 0 77.623 87.441`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.44140625)'>
<path fill='currentColor' d='
    M 15.33984375,14.115234375
    Q 11.21484375,14.115234375 9.1416015625,16.2099609375
    Q 7.068359375,18.3046875 7.068359375,22.47265625
    L 7.068359375,64.96875
    Q 7.068359375,69.115234375 9.1416015625,71.220703125
    Q 11.21484375,73.326171875 15.33984375,73.326171875
    L 44.923828125,73.326171875
    Q 49.048828125,73.326171875 51.1220703125,71.220703125
    Q 53.1953125,69.115234375 53.1953125,64.96875
    L 53.1953125,50.466796875
    L 49.392578125,50.466796875
    L 49.392578125,64.8828125
    Q 49.392578125,67.138671875 48.2109375,68.3310546875
    Q 47.029296875,69.5234375 44.708984375,69.5234375
    L 15.5546875,69.5234375
    Q 13.234375,69.5234375 12.052734375,68.3310546875
    Q 10.87109375,67.138671875 10.87109375,64.8828125
    L 10.87109375,22.55859375
    Q 10.87109375,20.302734375 12.052734375,19.1103515625
    Q 13.234375,17.91796875 15.5546875,17.91796875
    L 44.708984375,17.91796875
    Q 47.029296875,17.91796875 48.2109375,19.1103515625
    Q 49.392578125,20.302734375 49.392578125,22.55859375
    L 49.392578125,37.017578125
    L 53.1953125,37.017578125
    L 53.1953125,22.47265625
    Q 53.1953125,18.3046875 51.1220703125,16.2099609375
    Q 49.048828125,14.115234375 44.923828125,14.115234375
    Z
    M 30.572265625,43.7421875
    Q 30.572265625,44.515625 31.109375,45.07421875
    Q 31.646484375,45.6328125 32.3984375,45.6328125
    L 61.23046875,45.6328125
    L 65.3125,45.482421875
    L 63.55078125,47.201171875
    L 58.630859375,51.86328125
    Q 58.072265625,52.37890625 58.072265625,53.173828125
    Q 58.072265625,53.92578125 58.544921875,54.4091796875
    Q 59.017578125,54.892578125 59.748046875,54.892578125
    Q 60.11328125,54.892578125 60.4140625,54.7421875
    Q 60.71484375,54.591796875 60.97265625,54.3125
    L 69.931640625,45.1171875
    Q 70.275390625,44.7734375 70.4150390625,44.4404296875
    Q 70.5546875,44.107421875 70.5546875,43.7421875
    Q 70.5546875,43.3984375 70.4150390625,43.0654296875
    Q 70.275390625,42.732421875 69.931640625,42.388671875
    L 60.97265625,33.193359375
    Q 60.71484375,32.9140625 60.4140625,32.7744140625
    Q 60.11328125,32.634765625 59.748046875,32.634765625
    Q 59.017578125,32.634765625 58.544921875,33.12890625
    Q 58.072265625,33.623046875 58.072265625,34.353515625
    Q 58.072265625,35.126953125 58.630859375,35.642578125
    L 63.55078125,40.326171875
    L 65.3125,42.001953125
    L 61.23046875,41.873046875
    L 32.3984375,41.873046875
    Q 31.646484375,41.873046875 31.109375,42.431640625
    Q 30.572265625,42.990234375 30.572265625,43.7421875
    Z
' />
</g>`},plus:{viewBox:`0 0 59.361 59.404`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-59.404296875)'>
<path fill='currentColor' d='
    M 7.068359375,29.69140625
    Q 7.068359375,30.271484375 7.3583984375,30.744140625
    Q 7.6484375,31.216796875 8.12109375,31.5068359375
    Q 8.59375,31.796875 9.173828125,31.796875
    L 27.5859375,31.796875
    L 27.5859375,50.208984375
    Q 27.5859375,50.767578125 27.865234375,51.2509765625
    Q 28.14453125,51.734375 28.6279296875,52.0244140625
    Q 29.111328125,52.314453125 29.669921875,52.314453125
    Q 30.25,52.314453125 30.7333984375,52.0244140625
    Q 31.216796875,51.734375 31.49609375,51.2509765625
    Q 31.775390625,50.767578125 31.775390625,50.208984375
    L 31.775390625,31.796875
    L 50.1875,31.796875
    Q 50.767578125,31.796875 51.240234375,31.5068359375
    Q 51.712890625,31.216796875 52.0029296875,30.744140625
    Q 52.29296875,30.271484375 52.29296875,29.69140625
    Q 52.29296875,29.1328125 52.0029296875,28.6494140625
    Q 51.712890625,28.166015625 51.240234375,27.88671875
    Q 50.767578125,27.607421875 50.1875,27.607421875
    L 31.775390625,27.607421875
    L 31.775390625,9.1953125
    Q 31.775390625,8.615234375 31.49609375,8.142578125
    Q 31.216796875,7.669921875 30.7333984375,7.3798828125
    Q 30.25,7.08984375 29.669921875,7.08984375
    Q 29.111328125,7.08984375 28.6279296875,7.3798828125
    Q 28.14453125,7.669921875 27.865234375,8.142578125
    Q 27.5859375,8.615234375 27.5859375,9.1953125
    L 27.5859375,27.607421875
    L 9.173828125,27.607421875
    Q 8.59375,27.607421875 8.12109375,27.88671875
    Q 7.6484375,28.166015625 7.3583984375,28.6494140625
    Q 7.068359375,29.1328125 7.068359375,29.69140625
    Z
' />
</g>`},minus:{viewBox:`0 0 59.361 30.938`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-30.9375)'>
<path fill='currentColor' d='
    M 9.173828125,13.36328125
    Q 8.59375,13.36328125 8.12109375,13.6533203125
    Q 7.6484375,13.943359375 7.3583984375,14.416015625
    Q 7.068359375,14.888671875 7.068359375,15.46875
    Q 7.068359375,16.048828125 7.3583984375,16.521484375
    Q 7.6484375,16.994140625 8.12109375,17.2841796875
    Q 8.59375,17.57421875 9.173828125,17.57421875
    L 50.1875,17.57421875
    Q 50.767578125,17.57421875 51.240234375,17.2841796875
    Q 51.712890625,16.994140625 52.0029296875,16.521484375
    Q 52.29296875,16.048828125 52.29296875,15.46875
    Q 52.29296875,14.888671875 52.0029296875,14.416015625
    Q 51.712890625,13.943359375 51.240234375,13.6533203125
    Q 50.767578125,13.36328125 50.1875,13.36328125
    Z
' />
</g>`},check:{viewBox:`0 0 61.037 63.852`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-63.8515625)'>
<path fill='currentColor' d='
    M 24.44921875,8.5078125
    Q 23.07421875,8.5078125 22.04296875,9.818359375
    L 7.755859375,27.650390625
    Q 7.412109375,28.080078125 7.240234375,28.5205078125
    Q 7.068359375,28.9609375 7.068359375,29.369140625
    Q 7.068359375,30.3359375 7.69140625,30.9482421875
    Q 8.314453125,31.560546875 9.302734375,31.560546875
    Q 10.484375,31.560546875 11.322265625,30.421875
    L 24.341796875,13.87890625
    L 49.822265625,54.140625
    Q 50.23046875,54.806640625 50.681640625,55.0751953125
    Q 51.1328125,55.34375 51.798828125,55.34375
    Q 52.787109375,55.34375 53.3779296875,54.7529296875
    Q 53.96875,54.162109375 53.96875,53.173828125
    Q 53.96875,52.787109375 53.8291015625,52.37890625
    Q 53.689453125,51.970703125 53.3671875,51.4765625
    L 26.76953125,9.775390625
    Q 26.361328125,9.15234375 25.78125,8.830078125
    Q 25.201171875,8.5078125 24.44921875,8.5078125
    Z
' />
</g>`},close:{viewBox:`0 0 57.6 56.225`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-56.224609375)'>
<path fill='currentColor' d='
    M 7.669921875,6.982421875
    Q 7.26171875,7.390625 7.1328125,7.927734375
    Q 7.00390625,8.46484375 7.1435546875,9.0126953125
    Q 7.283203125,9.560546875 7.669921875,9.947265625
    L 25.82421875,28.1015625
    L 7.669921875,46.255859375
    Q 7.283203125,46.642578125 7.1435546875,47.1796875
    Q 7.00390625,47.716796875 7.1435546875,48.2646484375
    Q 7.283203125,48.8125 7.669921875,49.220703125
    Q 8.078125,49.62890625 8.6259765625,49.7685546875
    Q 9.173828125,49.908203125 9.7109375,49.7685546875
    Q 10.248046875,49.62890625 10.65625,49.220703125
    L 28.7890625,31.06640625
    L 46.943359375,49.220703125
    Q 47.3515625,49.62890625 47.888671875,49.7578125
    Q 48.42578125,49.88671875 48.962890625,49.7578125
    Q 49.5,49.62890625 49.908203125,49.220703125
    Q 50.31640625,48.8125 50.4560546875,48.275390625
    Q 50.595703125,47.73828125 50.4560546875,47.1904296875
    Q 50.31640625,46.642578125 49.908203125,46.255859375
    L 31.775390625,28.1015625
    L 49.908203125,9.947265625
    Q 50.31640625,9.560546875 50.4453125,9.0234375
    Q 50.57421875,8.486328125 50.4453125,7.9384765625
    Q 50.31640625,7.390625 49.908203125,6.982421875
    Q 49.5,6.57421875 48.962890625,6.4453125
    Q 48.42578125,6.31640625 47.888671875,6.4453125
    Q 47.3515625,6.57421875 46.943359375,6.982421875
    L 28.7890625,25.13671875
    L 10.65625,6.982421875
    Q 10.248046875,6.57421875 9.7109375,6.4453125
    Q 9.173828125,6.31640625 8.63671875,6.4453125
    Q 8.099609375,6.57421875 7.669921875,6.982421875
    Z
' />
</g>`},search:{viewBox:`0 0 66.451 77.408`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-77.408203125)'>
<path fill='currentColor' d='
    M 6.380859375,44.064453125
    Q 6.380859375,48.576171875 8.0673828125,52.5078125
    Q 9.75390625,56.439453125 12.7509765625,59.4365234375
    Q 15.748046875,62.43359375 19.6904296875,64.1201171875
    Q 23.6328125,65.806640625 28.123046875,65.806640625
    Q 32.61328125,65.806640625 36.5556640625,64.1201171875
    Q 40.498046875,62.43359375 43.484375,59.4365234375
    Q 46.470703125,56.439453125 48.16796875,52.5078125
    Q 49.865234375,48.576171875 49.865234375,44.064453125
    Q 49.865234375,40.283203125 48.619140625,36.8564453125
    Q 47.373046875,33.4296875 45.181640625,30.6796875
    L 59.275390625,16.521484375
    Q 59.662109375,16.11328125 59.8662109375,15.59765625
    Q 60.0703125,15.08203125 60.0703125,14.501953125
    Q 60.0703125,13.70703125 59.7158203125,13.041015625
    Q 59.361328125,12.375 58.716796875,11.98828125
    Q 58.072265625,11.6015625 57.234375,11.6015625
    Q 56.654296875,11.6015625 56.1171875,11.81640625
    Q 55.580078125,12.03125 55.171875,12.439453125
    L 41.013671875,26.619140625
    Q 38.306640625,24.599609375 35.0302734375,23.4716796875
    Q 31.75390625,22.34375 28.123046875,22.34375
    Q 23.6328125,22.34375 19.6904296875,24.0302734375
    Q 15.748046875,25.716796875 12.7509765625,28.7138671875
    Q 9.75390625,31.7109375 8.0673828125,35.642578125
    Q 6.380859375,39.57421875 6.380859375,44.064453125
    Z
    M 10.3984375,44.064453125
    Q 10.3984375,40.412109375 11.7841796875,37.2001953125
    Q 13.169921875,33.98828125 15.59765625,31.5498046875
    Q 18.025390625,29.111328125 21.2373046875,27.736328125
    Q 24.44921875,26.361328125 28.123046875,26.361328125
    Q 31.775390625,26.361328125 34.9873046875,27.736328125
    Q 38.19921875,29.111328125 40.6376953125,31.5498046875
    Q 43.076171875,33.98828125 44.451171875,37.2001953125
    Q 45.826171875,40.412109375 45.826171875,44.064453125
    Q 45.826171875,47.73828125 44.451171875,50.9501953125
    Q 43.076171875,54.162109375 40.6376953125,56.6005859375
    Q 38.19921875,59.0390625 34.9873046875,60.4140625
    Q 31.775390625,61.7890625 28.123046875,61.7890625
    Q 24.44921875,61.7890625 21.2373046875,60.4140625
    Q 18.025390625,59.0390625 15.59765625,56.6005859375
    Q 13.169921875,54.162109375 11.7841796875,50.9501953125
    Q 10.3984375,47.73828125 10.3984375,44.064453125
    Z
' />
</g>`},store:{viewBox:`0 0 74.314 87.27`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.26953125)'>
<path fill='currentColor' d='
    M 16.80078125,14.05078125
    Q 13.96484375,14.05078125 12.41796875,15.5654296875
    Q 10.87109375,17.080078125 10.87109375,19.873046875
    L 10.87109375,41.658203125
    Q 12.03125,41.12109375 13.3525390625,40.8203125
    Q 14.673828125,40.51953125 16.091796875,40.51953125
    Q 18.154296875,40.51953125 19.958984375,41.185546875
    Q 21.763671875,41.8515625 23.203125,43.01171875
    Q 24.62109375,41.8515625 26.4365234375,41.185546875
    Q 28.251953125,40.51953125 30.314453125,40.51953125
    Q 32.376953125,40.51953125 34.1923828125,41.185546875
    Q 36.0078125,41.8515625 37.404296875,43.01171875
    Q 38.822265625,41.8515625 40.6376953125,41.185546875
    Q 42.453125,40.51953125 44.515625,40.51953125
    Q 46.578125,40.51953125 48.3935546875,41.185546875
    Q 50.208984375,41.8515625 51.6484375,43.01171875
    Q 53.06640625,41.8515625 54.87109375,41.185546875
    Q 56.67578125,40.51953125 58.73828125,40.51953125
    Q 60.177734375,40.51953125 61.4990234375,40.86328125
    Q 62.8203125,41.20703125 63.958984375,41.787109375
    L 63.958984375,19.873046875
    Q 63.958984375,17.1015625 62.412109375,15.576171875
    Q 60.865234375,14.05078125 58.029296875,14.05078125
    Z
    M 19.98046875,17.853515625
    L 34.783203125,17.853515625
    L 34.783203125,33.171875
    Q 34.783203125,34.07421875 34.24609375,34.611328125
    Q 33.708984375,35.1484375 32.806640625,35.1484375
    L 21.978515625,35.1484375
    Q 21.076171875,35.1484375 20.5283203125,34.611328125
    Q 19.98046875,34.07421875 19.98046875,33.171875
    Z
    M 42.83984375,24.8359375
    L 54.248046875,24.8359375
    Q 55.150390625,24.8359375 55.6875,25.373046875
    Q 56.224609375,25.91015625 56.224609375,26.8125
    L 56.224609375,34.310546875
    Q 56.224609375,35.212890625 55.6875,35.7607421875
    Q 55.150390625,36.30859375 54.248046875,36.30859375
    L 42.83984375,36.30859375
    Q 41.9375,36.30859375 41.3896484375,35.7607421875
    Q 40.841796875,35.212890625 40.841796875,34.310546875
    L 40.841796875,26.8125
    Q 40.841796875,25.91015625 41.3896484375,25.373046875
    Q 41.9375,24.8359375 42.83984375,24.8359375
    Z
    M 14.0078125,67.375
    L 14.0078125,67.9765625
    Q 14.0078125,70.46875 15.4150390625,71.84375
    Q 16.822265625,73.21875 19.3359375,73.21875
    L 54.95703125,73.21875
    Q 57.470703125,73.21875 58.8779296875,71.84375
    Q 60.28515625,70.46875 60.28515625,67.9765625
    L 60.28515625,67.375
    Z
    M 7.541015625,53.517578125
    Q 7.626953125,53.646484375 7.7021484375,53.8076171875
    Q 7.77734375,53.96875 7.86328125,54.119140625
    L 13.427734375,64.818359375
    L 60.865234375,64.818359375
    L 66.408203125,54.119140625
    Q 66.515625,53.96875 66.5908203125,53.8076171875
    Q 66.666015625,53.646484375 66.73046875,53.517578125
    Z
    M 15.833984375,43.119140625
    Q 13.40625,43.119140625 11.4189453125,44.0966796875
    Q 9.431640625,45.07421875 8.25,46.6640625
    Q 7.068359375,48.25390625 7.068359375,50.1015625
    L 7.068359375,50.9609375
    L 67.24609375,50.9609375
    L 67.24609375,50.53125
    Q 67.24609375,48.68359375 66.064453125,46.986328125
    Q 64.8828125,45.2890625 62.8955078125,44.2041015625
    Q 60.908203125,43.119140625 58.48046875,43.119140625
    Q 56.181640625,43.119140625 54.333984375,44.12890625
    Q 52.486328125,45.138671875 51.390625,46.857421875
    Q 50.2734375,45.138671875 48.404296875,44.12890625
    Q 46.53515625,43.119140625 44.2578125,43.119140625
    Q 41.958984375,43.119140625 40.111328125,44.1396484375
    Q 38.263671875,45.16015625 37.146484375,46.857421875
    Q 36.05078125,45.16015625 34.203125,44.1396484375
    Q 32.35546875,43.119140625 30.056640625,43.119140625
    Q 27.7578125,43.119140625 25.8994140625,44.12890625
    Q 24.041015625,45.138671875 22.9453125,46.857421875
    Q 21.828125,45.138671875 19.9697265625,44.12890625
    Q 18.111328125,43.119140625 15.833984375,43.119140625
    Z
' />
</g>`},cash:{viewBox:`0 0 85.98 58.609`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-58.609375)'>
<path fill='currentColor' d='
    M 7.068359375,8.89453125
    L 7.068359375,49.71484375
    Q 7.068359375,50.6171875 7.6162109375,51.1650390625
    Q 8.1640625,51.712890625 9.06640625,51.712890625
    L 76.892578125,51.712890625
    Q 77.81640625,51.712890625 78.3642578125,51.1650390625
    Q 78.912109375,50.6171875 78.912109375,49.71484375
    L 78.912109375,8.89453125
    Q 78.912109375,7.970703125 78.3642578125,7.43359375
    Q 77.81640625,6.896484375 76.892578125,6.896484375
    L 9.06640625,6.896484375
    Q 8.1640625,6.896484375 7.6162109375,7.43359375
    Q 7.068359375,7.970703125 7.068359375,8.89453125
    Z
    M 11.966796875,13.298828125
    Q 11.966796875,11.794921875 13.44921875,11.794921875
    L 72.509765625,11.794921875
    Q 74.013671875,11.794921875 74.013671875,13.298828125
    L 74.013671875,45.2890625
    Q 74.013671875,46.814453125 72.509765625,46.814453125
    L 13.44921875,46.814453125
    Q 11.966796875,46.814453125 11.966796875,45.2890625
    Z
    M 14.5234375,14.953125
    L 14.5234375,43.634765625
    Q 14.5234375,44.236328125 15.125,44.236328125
    L 37.017578125,44.236328125
    Q 34.71875,42.109375 33.4189453125,38.2529296875
    Q 32.119140625,34.396484375 32.119140625,29.326171875
    Q 32.119140625,24.234375 33.4296875,20.3671875
    Q 34.740234375,16.5 37.060546875,14.3515625
    L 15.125,14.3515625
    Q 14.5234375,14.3515625 14.5234375,14.953125
    Z
    M 35.01953125,29.326171875
    Q 35.01953125,33.666015625 36.0078125,36.931640625
    Q 36.99609375,40.197265625 38.7685546875,42.0126953125
    Q 40.541015625,43.828125 42.904296875,43.828125
    Q 45.33203125,43.828125 47.1474609375,42.0126953125
    Q 48.962890625,40.197265625 49.97265625,36.931640625
    Q 50.982421875,33.666015625 50.982421875,29.326171875
    Q 50.982421875,24.986328125 49.97265625,21.7099609375
    Q 48.962890625,18.43359375 47.1474609375,16.6181640625
    Q 45.33203125,14.802734375 42.904296875,14.802734375
    Q 40.541015625,14.802734375 38.7685546875,16.6181640625
    Q 36.99609375,18.43359375 36.0078125,21.7099609375
    Q 35.01953125,24.986328125 35.01953125,29.326171875
    Z
    M 48.876953125,14.3515625
    Q 51.21875,16.5 52.5400390625,20.3671875
    Q 53.861328125,24.234375 53.861328125,29.326171875
    Q 53.861328125,34.396484375 52.55078125,38.2529296875
    Q 51.240234375,42.109375 48.8984375,44.236328125
    L 70.833984375,44.236328125
    Q 71.435546875,44.236328125 71.435546875,43.634765625
    L 71.435546875,14.953125
    Q 71.435546875,14.3515625 70.833984375,14.3515625
    Z
' />
</g>`},alert:{viewBox:`0 0 69.18 73.563`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-73.5625)'>
<path fill='currentColor' d='
    M 12.84765625,10.52734375
    Q 10.61328125,10.52734375 9.001953125,11.47265625
    Q 7.390625,12.41796875 6.53125,14.0400390625
    Q 5.671875,15.662109375 5.671875,17.638671875
    Q 5.671875,18.60546875 5.9296875,19.5830078125
    Q 6.1875,20.560546875 6.74609375,21.484375
    L 28.466796875,59.46875
    Q 29.4765625,61.251953125 31.130859375,62.1435546875
    Q 32.78515625,63.03515625 34.58984375,63.03515625
    Q 36.373046875,63.03515625 38.02734375,62.1435546875
    Q 39.681640625,61.251953125 40.712890625,59.46875
    L 62.43359375,21.484375
    Q 62.970703125,20.560546875 63.2392578125,19.5830078125
    Q 63.5078125,18.60546875 63.5078125,17.638671875
    Q 63.5078125,15.662109375 62.6376953125,14.0400390625
    Q 61.767578125,12.41796875 60.1669921875,11.47265625
    Q 58.56640625,10.52734375 56.310546875,10.52734375
    Z
    M 34.58984375,28.91796875
    Q 36.458984375,28.91796875 36.501953125,30.9375
    L 36.845703125,46.041015625
    Q 36.8671875,47.0078125 36.2119140625,47.6416015625
    Q 35.556640625,48.275390625 34.568359375,48.275390625
    Q 33.55859375,48.275390625 32.9248046875,47.65234375
    Q 32.291015625,47.029296875 32.291015625,46.0625
    L 32.634765625,30.9375
    Q 32.65625,28.91796875 34.58984375,28.91796875
    Z
    M 34.58984375,19.958984375
    Q 35.728515625,19.958984375 36.56640625,20.75390625
    Q 37.404296875,21.548828125 37.404296875,22.666015625
    Q 37.404296875,23.8046875 36.56640625,24.599609375
    Q 35.728515625,25.39453125 34.58984375,25.39453125
    Q 33.4296875,25.39453125 32.6025390625,24.5888671875
    Q 31.775390625,23.783203125 31.775390625,22.666015625
    Q 31.775390625,21.548828125 32.61328125,20.75390625
    Q 33.451171875,19.958984375 34.58984375,19.958984375
    Z
' />
</g>`},trash:{viewBox:`0 0 61.768 87.012`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.01171875)'>
<path fill='currentColor' d='
    M 22.4296875,21.140625
    Q 23.138671875,21.140625 23.568359375,21.548828125
    Q 23.998046875,21.95703125 23.9765625,22.623046875
    L 23.052734375,53.625
    Q 23.052734375,54.291015625 22.6123046875,54.677734375
    Q 22.171875,55.064453125 21.52734375,55.064453125
    Q 20.796875,55.064453125 20.3779296875,54.6669921875
    Q 19.958984375,54.26953125 19.98046875,53.603515625
    L 20.861328125,22.6015625
    Q 20.904296875,21.935546875 21.3232421875,21.5380859375
    Q 21.7421875,21.140625 22.4296875,21.140625
    Z
    M 30.89453125,21.140625
    Q 31.603515625,21.140625 32.0439453125,21.548828125
    Q 32.484375,21.95703125 32.484375,22.623046875
    L 32.484375,53.603515625
    Q 32.484375,54.26953125 32.0439453125,54.6669921875
    Q 31.603515625,55.064453125 30.89453125,55.064453125
    Q 30.185546875,55.064453125 29.7451171875,54.6669921875
    Q 29.3046875,54.26953125 29.3046875,53.603515625
    L 29.3046875,22.623046875
    Q 29.3046875,21.95703125 29.7451171875,21.548828125
    Q 30.185546875,21.140625 30.89453125,21.140625
    Z
    M 39.337890625,21.140625
    Q 40.046875,21.140625 40.4658203125,21.52734375
    Q 40.884765625,21.9140625 40.90625,22.6015625
    L 41.787109375,53.58203125
    Q 41.80859375,54.248046875 41.3896484375,54.65625
    Q 40.970703125,55.064453125 40.26171875,55.064453125
    Q 39.595703125,55.064453125 39.166015625,54.677734375
    Q 38.736328125,54.291015625 38.71484375,53.603515625
    L 37.8125,22.6015625
    Q 37.791015625,21.95703125 38.2099609375,21.548828125
    Q 38.62890625,21.140625 39.337890625,21.140625
    Z
    M 18.927734375,61.896484375
    L 18.927734375,68.01953125
    Q 18.927734375,70.8984375 20.6787109375,72.5419921875
    Q 22.4296875,74.185546875 25.501953125,74.185546875
    L 36.22265625,74.185546875
    Q 39.294921875,74.185546875 41.0458984375,72.5419921875
    Q 42.796875,70.8984375 42.796875,68.01953125
    L 42.796875,61.896484375
    L 39.037109375,61.896484375
    L 39.037109375,67.8046875
    Q 39.037109375,69.09375 38.220703125,69.8671875
    Q 37.404296875,70.640625 36.0078125,70.640625
    L 25.716796875,70.640625
    Q 24.3203125,70.640625 23.50390625,69.8671875
    Q 22.6875,69.09375 22.6875,67.8046875
    L 22.6875,61.896484375
    Z
    M 6.037109375,60.02734375
    Q 5.328125,60.02734375 4.791015625,60.5537109375
    Q 4.25390625,61.080078125 4.25390625,61.810546875
    Q 4.25390625,62.541015625 4.791015625,63.078125
    Q 5.328125,63.615234375 6.037109375,63.615234375
    L 55.73046875,63.615234375
    Q 56.4609375,63.615234375 56.9873046875,63.0888671875
    Q 57.513671875,62.5625 57.513671875,61.810546875
    Q 57.513671875,61.080078125 56.998046875,60.5537109375
    Q 56.482421875,60.02734375 55.73046875,60.02734375
    Z
    M 18.283203125,12.826171875
    Q 16.392578125,12.826171875 14.9638671875,13.599609375
    Q 13.53515625,14.373046875 12.697265625,15.76953125
    Q 11.859375,17.166015625 11.7734375,19.013671875
    L 9.732421875,60.5859375
    L 52.056640625,60.5859375
    L 50.015625,19.03515625
    Q 49.9296875,17.1875 49.0810546875,15.791015625
    Q 48.232421875,14.39453125 46.8037109375,13.6103515625
    Q 45.375,12.826171875 43.52734375,12.826171875
    Z
' />
</g>`},arrowRight:{viewBox:`0 0 65.613 52.164`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-52.1640625)'>
<path fill='currentColor' d='
    M 58.544921875,26.08203125
    Q 58.544921875,25.201171875 57.8359375,24.53515625
    L 39.2734375,5.9296875
    Q 38.5859375,5.28515625 37.748046875,5.28515625
    Q 36.8671875,5.28515625 36.2763671875,5.865234375
    Q 35.685546875,6.4453125 35.685546875,7.3046875
    Q 35.685546875,7.734375 35.8359375,8.1318359375
    Q 35.986328125,8.529296875 36.265625,8.80859375
    L 43.78515625,16.4140625
    L 53.818359375,25.673828125
    L 54.3125,24.470703125
    L 45.869140625,23.998046875
    L 9.130859375,23.998046875
    Q 8.228515625,23.998046875 7.6484375,24.5888671875
    Q 7.068359375,25.1796875 7.068359375,26.08203125
    Q 7.068359375,27.005859375 7.6484375,27.5859375
    Q 8.228515625,28.166015625 9.130859375,28.166015625
    L 45.869140625,28.166015625
    L 54.3125,27.71484375
    L 53.818359375,26.490234375
    L 43.78515625,35.75
    L 36.265625,43.376953125
    Q 35.96484375,43.65625 35.8251953125,44.0537109375
    Q 35.685546875,44.451171875 35.685546875,44.859375
    Q 35.685546875,45.740234375 36.2763671875,46.3095703125
    Q 36.8671875,46.87890625 37.748046875,46.87890625
    Q 38.15625,46.87890625 38.564453125,46.70703125
    Q 38.97265625,46.53515625 39.380859375,46.126953125
    L 57.8359375,27.650390625
    Q 58.544921875,26.962890625 58.544921875,26.08203125
    Z
' />
</g>`},receipt:{viewBox:`0 0 60.264 87.441`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.44140625)'>
<path fill='currentColor' d='
    M 19.142578125,36.201171875
    L 41.228515625,36.201171875
    Q 41.9375,36.201171875 42.3994140625,36.6630859375
    Q 42.861328125,37.125 42.861328125,37.791015625
    Q 42.861328125,38.45703125 42.3994140625,38.908203125
    Q 41.9375,39.359375 41.228515625,39.359375
    L 19.142578125,39.359375
    Q 18.412109375,39.359375 17.9501953125,38.908203125
    Q 17.48828125,38.45703125 17.48828125,37.791015625
    Q 17.48828125,37.125 17.9501953125,36.6630859375
    Q 18.412109375,36.201171875 19.142578125,36.201171875
    Z
    M 19.142578125,25.845703125
    L 41.228515625,25.845703125
    Q 41.9375,25.845703125 42.3994140625,26.296875
    Q 42.861328125,26.748046875 42.861328125,27.435546875
    Q 42.861328125,28.1015625 42.3994140625,28.552734375
    Q 41.9375,29.00390625 41.228515625,29.00390625
    L 19.142578125,29.00390625
    Q 18.412109375,29.00390625 17.9501953125,28.552734375
    Q 17.48828125,28.1015625 17.48828125,27.435546875
    Q 17.48828125,26.748046875 17.9501953125,26.296875
    Q 18.412109375,25.845703125 19.142578125,25.845703125
    Z
    M 15.33984375,14.115234375
    Q 11.21484375,14.115234375 9.1416015625,16.2099609375
    Q 7.068359375,18.3046875 7.068359375,22.47265625
    L 7.068359375,64.96875
    Q 7.068359375,69.115234375 9.15234375,71.220703125
    Q 11.236328125,73.326171875 15.33984375,73.326171875
    L 28.337890625,73.326171875
    L 28.337890625,53.216796875
    Q 28.337890625,48.25390625 33.279296875,48.25390625
    L 53.1953125,48.25390625
    L 53.1953125,22.47265625
    Q 53.1953125,18.326171875 51.1220703125,16.220703125
    Q 49.048828125,14.115234375 44.923828125,14.115234375
    Z
    M 33.408203125,51.69140625
    Q 31.775390625,51.69140625 31.775390625,53.32421875
    L 31.775390625,73.00390625
    Q 32.52734375,72.875 33.30078125,72.337890625
    Q 34.07421875,71.80078125 34.890625,70.94140625
    L 50.810546875,54.806640625
    Q 51.669921875,53.947265625 52.1962890625,53.1953125
    Q 52.72265625,52.443359375 52.8515625,51.69140625
    Z
' />
</g>`},printer:{viewBox:`0 0 75.668 87.613`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.61328125)'>
<path fill='currentColor' d='
    M 58.56640625,50.595703125
    Q 59.94140625,50.595703125 60.9296875,51.583984375
    Q 61.91796875,52.572265625 61.91796875,53.96875
    Q 61.91796875,55.34375 60.9296875,56.33203125
    Q 59.94140625,57.3203125 58.56640625,57.3203125
    Q 57.169921875,57.3203125 56.181640625,56.33203125
    Q 55.193359375,55.34375 55.193359375,53.96875
    Q 55.193359375,52.572265625 56.181640625,51.583984375
    Q 57.169921875,50.595703125 58.56640625,50.595703125
    Z
    M 14.953125,24.556640625
    Q 11.0859375,24.556640625 9.0771484375,26.5009765625
    Q 7.068359375,28.4453125 7.068359375,32.333984375
    L 7.068359375,55.515625
    Q 7.068359375,59.404296875 9.15234375,61.359375
    Q 11.236328125,63.314453125 14.953125,63.314453125
    L 60.693359375,63.314453125
    Q 64.58203125,63.314453125 66.5908203125,61.359375
    Q 68.599609375,59.404296875 68.599609375,55.515625
    L 68.599609375,32.333984375
    Q 68.599609375,28.4453125 66.5908203125,26.5009765625
    Q 64.58203125,24.556640625 60.693359375,24.556640625
    L 59.8125,24.556640625
    L 59.8125,40.60546875
    Q 59.8125,43.505859375 58.1259765625,45.1923828125
    Q 56.439453125,46.87890625 53.517578125,46.87890625
    L 22.171875,46.87890625
    Q 19.25,46.87890625 17.552734375,45.1923828125
    Q 15.85546875,43.505859375 15.85546875,40.60546875
    L 15.85546875,24.556640625
    Z
    M 17.9609375,66.6015625
    L 17.9609375,67.310546875
    Q 17.9609375,69.3515625 18.90625,70.662109375
    Q 19.8515625,71.97265625 21.4951171875,72.595703125
    Q 23.138671875,73.21875 25.244140625,73.21875
    L 50.40234375,73.21875
    Q 52.615234375,73.21875 54.248046875,72.595703125
    Q 55.880859375,71.97265625 56.783203125,70.662109375
    Q 57.685546875,69.3515625 57.685546875,67.310546875
    L 57.685546875,66.6015625
    Z
    M 19.29296875,18.1328125
    L 19.29296875,40.60546875
    Q 19.29296875,41.89453125 20.087890625,42.6787109375
    Q 20.8828125,43.462890625 22.171875,43.462890625
    L 53.517578125,43.462890625
    Q 54.806640625,43.462890625 55.6015625,42.6787109375
    Q 56.396484375,41.89453125 56.396484375,40.60546875
    L 56.396484375,18.1328125
    Q 56.396484375,16.435546875 55.365234375,15.4150390625
    Q 54.333984375,14.39453125 52.658203125,14.39453125
    L 23.03125,14.39453125
    Q 21.35546875,14.39453125 20.32421875,15.4150390625
    Q 19.29296875,16.435546875 19.29296875,18.1328125
    Z
    M 28.251953125,32.333984375
    L 47.48046875,32.333984375
    Q 48.125,32.333984375 48.576171875,32.78515625
    Q 49.02734375,33.236328125 49.02734375,33.90234375
    Q 49.02734375,34.546875 48.576171875,34.9873046875
    Q 48.125,35.427734375 47.48046875,35.427734375
    L 28.251953125,35.427734375
    Q 27.5859375,35.427734375 27.134765625,34.9873046875
    Q 26.68359375,34.546875 26.68359375,33.90234375
    Q 26.68359375,33.236328125 27.134765625,32.78515625
    Q 27.5859375,32.333984375 28.251953125,32.333984375
    Z
    M 28.251953125,22.4296875
    L 47.48046875,22.4296875
    Q 48.125,22.4296875 48.576171875,22.8701171875
    Q 49.02734375,23.310546875 49.02734375,23.93359375
    Q 49.02734375,24.599609375 48.576171875,25.0615234375
    Q 48.125,25.5234375 47.48046875,25.5234375
    L 28.251953125,25.5234375
    Q 27.5859375,25.5234375 27.134765625,25.0615234375
    Q 26.68359375,24.599609375 26.68359375,23.93359375
    Q 26.68359375,23.310546875 27.134765625,22.8701171875
    Q 27.5859375,22.4296875 28.251953125,22.4296875
    Z
' />
</g>`},menu:{viewBox:`0 0 69.824 30.895`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-30.89453125)'>
<path fill='currentColor' d='
    M 8.873046875,1.267578125
    Q 8.12109375,1.267578125 7.5947265625,1.7939453125
    Q 7.068359375,2.3203125 7.068359375,3.09375
    Q 7.068359375,3.82421875 7.5947265625,4.3505859375
    Q 8.12109375,4.876953125 8.873046875,4.876953125
    L 60.9296875,4.876953125
    Q 61.681640625,4.876953125 62.21875,4.3505859375
    Q 62.755859375,3.82421875 62.755859375,3.09375
    Q 62.755859375,2.3203125 62.21875,1.7939453125
    Q 61.681640625,1.267578125 60.9296875,1.267578125
    Z
    M 8.873046875,13.642578125
    Q 8.12109375,13.642578125 7.5947265625,14.1689453125
    Q 7.068359375,14.6953125 7.068359375,15.447265625
    Q 7.068359375,16.19921875 7.5947265625,16.7255859375
    Q 8.12109375,17.251953125 8.873046875,17.251953125
    L 60.9296875,17.251953125
    Q 61.681640625,17.251953125 62.21875,16.7255859375
    Q 62.755859375,16.19921875 62.755859375,15.447265625
    Q 62.755859375,14.6953125 62.21875,14.1689453125
    Q 61.681640625,13.642578125 60.9296875,13.642578125
    Z
    M 8.873046875,26.0390625
    Q 8.12109375,26.0390625 7.5947265625,26.5546875
    Q 7.068359375,27.0703125 7.068359375,27.822265625
    Q 7.068359375,28.57421875 7.5947265625,29.1005859375
    Q 8.12109375,29.626953125 8.873046875,29.626953125
    L 60.9296875,29.626953125
    Q 61.681640625,29.626953125 62.21875,29.1005859375
    Q 62.755859375,28.57421875 62.755859375,27.822265625
    Q 62.755859375,27.0703125 62.21875,26.5546875
    Q 61.681640625,26.0390625 60.9296875,26.0390625
    Z
' />
</g>`},mail:{viewBox:`0 0 80.438 63.379`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-63.37890625)'>
<path fill='currentColor' d='
    M 40.21875,28.31640625
    Q 38.822265625,28.31640625 37.46875,29.51953125
    L 9.96875,53.83984375
    Q 12.07421875,55.279296875 15.42578125,55.279296875
    L 64.990234375,55.279296875
    Q 68.341796875,55.279296875 70.447265625,53.83984375
    L 42.96875,29.51953125
    Q 41.615234375,28.31640625 40.21875,28.31640625
    Z
    M 7.927734375,12.16015625
    Q 7.51953125,12.955078125 7.2939453125,13.986328125
    Q 7.068359375,15.017578125 7.068359375,16.392578125
    L 7.068359375,47.0078125
    Q 7.068359375,48.447265625 7.3046875,49.5
    Q 7.541015625,50.552734375 7.841796875,51.046875
    L 28.53125,32.7421875
    Z
    M 14.78125,8.099609375
    Q 13.19140625,8.099609375 12.03125,8.443359375
    Q 10.87109375,8.787109375 10.09765625,9.345703125
    L 31.1953125,30.421875
    L 35.341796875,26.748046875
    Q 36.501953125,25.716796875 37.7265625,25.201171875
    Q 38.951171875,24.685546875 40.21875,24.685546875
    Q 41.46484375,24.685546875 42.689453125,25.201171875
    Q 43.9140625,25.716796875 45.095703125,26.748046875
    L 49.2421875,30.421875
    L 70.318359375,9.345703125
    Q 69.544921875,8.787109375 68.384765625,8.443359375
    Q 67.224609375,8.099609375 65.65625,8.099609375
    Z
    M 72.509765625,12.16015625
    L 51.884765625,32.7421875
    L 72.57421875,51.046875
    Q 72.875,50.552734375 73.1220703125,49.5
    Q 73.369140625,48.447265625 73.369140625,47.0078125
    L 73.369140625,16.392578125
    Q 73.369140625,15.017578125 73.1435546875,13.986328125
    Q 72.91796875,12.955078125 72.509765625,12.16015625
    Z
' />
</g>`},lock:{viewBox:`0 0 53.26 75.539`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-75.5390625)'>
<path fill='currentColor' d='
    M 13.79296875,10.763671875
    Q 10.892578125,10.763671875 9.3349609375,12.396484375
    Q 7.77734375,14.029296875 7.77734375,17.123046875
    L 7.77734375,36.673828125
    Q 7.77734375,39.74609375 9.3349609375,41.37890625
    Q 10.892578125,43.01171875 13.79296875,43.01171875
    L 39.466796875,43.01171875
    Q 42.3671875,43.01171875 43.9248046875,41.37890625
    Q 45.482421875,39.74609375 45.482421875,36.673828125
    L 45.482421875,17.123046875
    Q 45.482421875,14.029296875 43.9248046875,12.396484375
    Q 42.3671875,10.763671875 39.466796875,10.763671875
    Z
    M 12.697265625,41.185546875
    L 12.697265625,49.521484375
    Q 12.697265625,54.52734375 14.630859375,57.921875
    Q 16.564453125,61.31640625 19.744140625,63.0458984375
    Q 22.923828125,64.775390625 26.619140625,64.775390625
    Q 29.412109375,64.775390625 31.92578125,63.7978515625
    Q 34.439453125,62.8203125 36.3837890625,60.8974609375
    Q 38.328125,58.974609375 39.4560546875,56.1279296875
    Q 40.583984375,53.28125 40.583984375,49.521484375
    L 40.583984375,41.185546875
    L 36.802734375,41.185546875
    L 36.802734375,49.97265625
    Q 36.802734375,53.5390625 35.427734375,56.0419921875
    Q 34.052734375,58.544921875 31.7431640625,59.8662109375
    Q 29.43359375,61.1875 26.619140625,61.1875
    Q 23.826171875,61.1875 21.5166015625,59.8662109375
    Q 19.20703125,58.544921875 17.8427734375,56.0419921875
    Q 16.478515625,53.5390625 16.478515625,49.97265625
    L 16.478515625,41.185546875
    Z
' />
</g>`},scan:{viewBox:`0 0 67.633 76.055`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-76.0546875)'>
<path fill='currentColor' d='
    M 8.98046875,47.56640625
    Q 8.056640625,47.56640625 7.5625,48.0712890625
    Q 7.068359375,48.576171875 7.068359375,49.5
    L 7.068359375,56.50390625
    Q 7.068359375,60.62890625 9.173828125,62.7021484375
    Q 11.279296875,64.775390625 15.42578125,64.775390625
    L 22.4296875,64.775390625
    Q 23.353515625,64.775390625 23.8583984375,64.28125
    Q 24.36328125,63.787109375 24.36328125,62.86328125
    Q 24.36328125,61.9609375 23.8583984375,61.466796875
    Q 23.353515625,60.97265625 22.4296875,60.97265625
    L 15.51171875,60.97265625
    Q 13.255859375,60.97265625 12.0634765625,59.791015625
    Q 10.87109375,58.609375 10.87109375,56.2890625
    L 10.87109375,49.5
    Q 10.87109375,48.576171875 10.3876953125,48.0712890625
    Q 9.904296875,47.56640625 8.98046875,47.56640625
    Z
    M 58.65234375,47.56640625
    Q 57.75,47.56640625 57.255859375,48.0712890625
    Q 56.76171875,48.576171875 56.76171875,49.5
    L 56.76171875,56.2890625
    Q 56.76171875,58.609375 55.5478515625,59.791015625
    Q 54.333984375,60.97265625 52.12109375,60.97265625
    L 45.203125,60.97265625
    Q 44.279296875,60.97265625 43.7744140625,61.466796875
    Q 43.26953125,61.9609375 43.26953125,62.86328125
    Q 43.26953125,63.787109375 43.7744140625,64.28125
    Q 44.279296875,64.775390625 45.203125,64.775390625
    L 52.20703125,64.775390625
    Q 56.375,64.775390625 58.4697265625,62.69140625
    Q 60.564453125,60.607421875 60.564453125,56.50390625
    L 60.564453125,49.5
    Q 60.564453125,47.56640625 58.65234375,47.56640625
    Z
    M 15.42578125,11.279296875
    Q 11.279296875,11.279296875 9.173828125,13.3525390625
    Q 7.068359375,15.42578125 7.068359375,19.55078125
    L 7.068359375,26.5546875
    Q 7.068359375,28.48828125 8.98046875,28.48828125
    Q 9.8828125,28.48828125 10.376953125,27.9833984375
    Q 10.87109375,27.478515625 10.87109375,26.5546875
    L 10.87109375,19.765625
    Q 10.87109375,17.4453125 12.0634765625,16.263671875
    Q 13.255859375,15.08203125 15.51171875,15.08203125
    L 22.4296875,15.08203125
    Q 23.353515625,15.08203125 23.8583984375,14.587890625
    Q 24.36328125,14.09375 24.36328125,13.19140625
    Q 24.36328125,12.267578125 23.8583984375,11.7734375
    Q 23.353515625,11.279296875 22.4296875,11.279296875
    Z
    M 45.203125,11.279296875
    Q 44.279296875,11.279296875 43.7744140625,11.7734375
    Q 43.26953125,12.267578125 43.26953125,13.19140625
    Q 43.26953125,14.09375 43.7744140625,14.587890625
    Q 44.279296875,15.08203125 45.203125,15.08203125
    L 52.12109375,15.08203125
    Q 54.333984375,15.08203125 55.5478515625,16.263671875
    Q 56.76171875,17.4453125 56.76171875,19.765625
    L 56.76171875,26.5546875
    Q 56.76171875,27.478515625 57.2451171875,27.9833984375
    Q 57.728515625,28.48828125 58.65234375,28.48828125
    Q 59.576171875,28.48828125 60.0703125,27.9833984375
    Q 60.564453125,27.478515625 60.564453125,26.5546875
    L 60.564453125,19.55078125
    Q 60.564453125,15.447265625 58.4697265625,13.36328125
    Q 56.375,11.279296875 52.20703125,11.279296875
    Z
    M 21.033203125,26.876953125
    L 21.033203125,49.177734375
    L 22.98828125,49.177734375
    L 22.98828125,26.876953125
    Z
    M 25.501953125,26.876953125
    L 25.501953125,49.177734375
    L 29.3046875,49.177734375
    L 29.3046875,26.876953125
    Z
    M 30.98046875,26.876953125
    L 30.98046875,49.177734375
    L 33.34375,49.177734375
    L 33.34375,26.876953125
    Z
    M 35.470703125,26.876953125
    L 35.470703125,49.177734375
    L 39.14453125,49.177734375
    L 39.14453125,26.876953125
    Z
    M 40.6484375,26.876953125
    L 40.6484375,49.177734375
    L 43.5703125,49.177734375
    L 43.5703125,26.876953125
    Z
    M 44.666015625,26.876953125
    L 44.666015625,49.177734375
    L 46.513671875,49.177734375
    L 46.513671875,26.876953125
    Z
' />
</g>`},phone:{viewBox:`0 0 55.688 84.326`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.326171875)'>
<path fill='currentColor' d='
    M 17.939453125,13.3203125
    Q 15.705078125,13.3203125 14.0615234375,14.1904296875
    Q 12.41796875,15.060546875 11.515625,16.650390625
    Q 10.61328125,18.240234375 10.61328125,20.41015625
    L 10.61328125,63.916015625
    Q 10.61328125,66.0859375 11.515625,67.67578125
    Q 12.41796875,69.265625 14.0615234375,70.1357421875
    Q 15.705078125,71.005859375 17.939453125,71.005859375
    L 37.7265625,71.005859375
    Q 39.982421875,71.005859375 41.6259765625,70.1357421875
    Q 43.26953125,69.265625 44.171875,67.67578125
    Q 45.07421875,66.0859375 45.07421875,63.916015625
    L 45.07421875,20.41015625
    Q 45.07421875,18.240234375 44.171875,16.650390625
    Q 43.26953125,15.060546875 41.6259765625,14.1904296875
    Q 39.982421875,13.3203125 37.7265625,13.3203125
    Z
    M 18.412109375,17.123046875
    L 37.275390625,17.123046875
    Q 39.23046875,17.123046875 40.240234375,18.1005859375
    Q 41.25,19.078125 41.25,20.96875
    L 41.25,63.357421875
    Q 41.25,65.248046875 40.240234375,66.2255859375
    Q 39.23046875,67.203125 37.275390625,67.203125
    L 18.412109375,67.203125
    Q 16.45703125,67.203125 15.4365234375,66.2255859375
    Q 14.416015625,65.248046875 14.416015625,63.357421875
    L 14.416015625,20.96875
    Q 14.416015625,19.078125 15.4365234375,18.1005859375
    Q 16.45703125,17.123046875 18.412109375,17.123046875
    Z
    M 22.04296875,19.12109375
    Q 21.548828125,19.12109375 21.2158203125,19.443359375
    Q 20.8828125,19.765625 20.8828125,20.28125
    Q 20.8828125,20.796875 21.2158203125,21.119140625
    Q 21.548828125,21.44140625 22.04296875,21.44140625
    L 33.64453125,21.44140625
    Q 34.16015625,21.44140625 34.482421875,21.119140625
    Q 34.8046875,20.796875 34.8046875,20.28125
    Q 34.8046875,19.765625 34.482421875,19.443359375
    Q 34.16015625,19.12109375 33.64453125,19.12109375
    Z
    M 24.578125,61.810546875
    Q 23.826171875,61.810546875 23.310546875,62.326171875
    Q 22.794921875,62.841796875 22.794921875,63.59375
    Q 22.794921875,64.32421875 23.310546875,64.8291015625
    Q 23.826171875,65.333984375 24.578125,65.333984375
    L 31.130859375,65.333984375
    Q 31.861328125,65.333984375 32.376953125,64.8291015625
    Q 32.892578125,64.32421875 32.892578125,63.59375
    Q 32.892578125,62.841796875 32.376953125,62.326171875
    Q 31.861328125,61.810546875 31.130859375,61.810546875
    Z
' />
</g>`},download:{viewBox:`0 0 55.73 81.705`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.705078125)'>
<path fill='currentColor' d='
    M 48.662109375,37.68359375
    Q 48.662109375,36.845703125 48.017578125,36.158203125
    L 29.43359375,17.57421875
    Q 29.08984375,17.23046875 28.6923828125,17.0478515625
    Q 28.294921875,16.865234375 27.865234375,16.865234375
    Q 27.435546875,16.865234375 27.0380859375,17.0478515625
    Q 26.640625,17.23046875 26.296875,17.57421875
    L 7.712890625,36.158203125
    Q 7.068359375,36.845703125 7.068359375,37.68359375
    Q 7.068359375,38.54296875 7.6484375,39.1337890625
    Q 8.228515625,39.724609375 9.087890625,39.724609375
    Q 9.517578125,39.724609375 9.904296875,39.5849609375
    Q 10.291015625,39.4453125 10.5703125,39.166015625
    L 18.197265625,31.625
    L 27.28515625,21.763671875
    L 26.017578125,21.3125
    L 25.78125,29.1328125
    L 25.78125,66.9453125
    Q 25.78125,67.84765625 26.3720703125,68.427734375
    Q 26.962890625,69.0078125 27.865234375,69.0078125
    Q 28.767578125,69.0078125 29.3583984375,68.427734375
    Q 29.94921875,67.84765625 29.94921875,66.9453125
    L 29.94921875,29.1328125
    L 29.712890625,21.3125
    L 28.466796875,21.763671875
    L 37.533203125,31.625
    L 45.16015625,39.166015625
    Q 45.439453125,39.4453125 45.826171875,39.5849609375
    Q 46.212890625,39.724609375 46.642578125,39.724609375
    Q 47.501953125,39.724609375 48.08203125,39.1337890625
    Q 48.662109375,38.54296875 48.662109375,37.68359375
    Z
    M 48.662109375,14.802734375
    Q 48.662109375,13.87890625 48.0927734375,13.2880859375
    Q 47.5234375,12.697265625 46.62109375,12.697265625
    L 9.15234375,12.697265625
    Q 8.228515625,12.697265625 7.6484375,13.2880859375
    Q 7.068359375,13.87890625 7.068359375,14.802734375
    Q 7.068359375,15.705078125 7.6484375,16.306640625
    Q 8.228515625,16.908203125 9.15234375,16.908203125
    L 46.62109375,16.908203125
    Q 47.5234375,16.908203125 48.0927734375,16.306640625
    Q 48.662109375,15.705078125 48.662109375,14.802734375
    Z
' />
</g>`},fileText:{viewBox:`0 0 60.264 87.441`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.44140625)'>
<path fill='currentColor' d='
    M 15.33984375,14.115234375
    Q 11.21484375,14.115234375 9.1416015625,16.2099609375
    Q 7.068359375,18.3046875 7.068359375,22.47265625
    L 7.068359375,64.96875
    Q 7.068359375,69.115234375 9.15234375,71.220703125
    Q 11.236328125,73.326171875 15.33984375,73.326171875
    L 28.337890625,73.326171875
    L 28.337890625,53.216796875
    Q 28.337890625,48.25390625 33.279296875,48.25390625
    L 53.1953125,48.25390625
    L 53.1953125,22.47265625
    Q 53.1953125,18.326171875 51.1220703125,16.220703125
    Q 49.048828125,14.115234375 44.923828125,14.115234375
    Z
    M 33.408203125,51.69140625
    Q 31.775390625,51.69140625 31.775390625,53.32421875
    L 31.775390625,73.00390625
    Q 32.52734375,72.875 33.30078125,72.337890625
    Q 34.07421875,71.80078125 34.890625,70.94140625
    L 50.810546875,54.806640625
    Q 51.669921875,53.947265625 52.1962890625,53.1953125
    Q 52.72265625,52.443359375 52.8515625,51.69140625
    Z
' />
</g>`},table:{viewBox:`0 0 79.234 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 8.20703125,40.884765625
    L 8.20703125,44.6875
    L 71.2421875,44.6875
    L 71.2421875,40.884765625
    Z
    M 8.20703125,25.30859375
    L 8.20703125,29.111328125
    L 71.2421875,29.111328125
    L 71.2421875,25.30859375
    Z
    M 37.705078125,10.892578125
    L 37.705078125,59.125
    L 41.5078125,59.125
    L 41.5078125,10.892578125
    Z
    M 15.42578125,9.75390625
    Q 11.279296875,9.75390625 9.173828125,11.8271484375
    Q 7.068359375,13.900390625 7.068359375,18.025390625
    L 7.068359375,51.970703125
    Q 7.068359375,56.095703125 9.173828125,58.1796875
    Q 11.279296875,60.263671875 15.42578125,60.263671875
    L 63.787109375,60.263671875
    Q 67.955078125,60.263671875 70.060546875,58.1689453125
    Q 72.166015625,56.07421875 72.166015625,51.970703125
    L 72.166015625,18.025390625
    Q 72.166015625,13.921875 70.060546875,11.837890625
    Q 67.955078125,9.75390625 63.787109375,9.75390625
    Z
    M 15.51171875,13.556640625
    L 63.72265625,13.556640625
    Q 65.935546875,13.556640625 67.138671875,14.73828125
    Q 68.341796875,15.919921875 68.341796875,18.240234375
    L 68.341796875,51.77734375
    Q 68.341796875,54.09765625 67.138671875,55.279296875
    Q 65.935546875,56.4609375 63.72265625,56.4609375
    L 15.51171875,56.4609375
    Q 13.255859375,56.4609375 12.0634765625,55.279296875
    Q 10.87109375,54.09765625 10.87109375,51.77734375
    L 10.87109375,18.240234375
    Q 10.87109375,15.919921875 12.0634765625,14.73828125
    Q 13.255859375,13.556640625 15.51171875,13.556640625
    Z
' />
</g>`},calendar:{viewBox:`0 0 69.18 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.42578125,9.775390625
    Q 11.279296875,9.775390625 9.173828125,11.8486328125
    Q 7.068359375,13.921875 7.068359375,18.046875
    L 7.068359375,51.9921875
    Q 7.068359375,56.1171875 9.173828125,58.1904296875
    Q 11.279296875,60.263671875 15.42578125,60.263671875
    L 53.732421875,60.263671875
    Q 57.900390625,60.263671875 60.005859375,58.1796875
    Q 62.111328125,56.095703125 62.111328125,51.9921875
    L 62.111328125,18.046875
    Q 62.111328125,13.943359375 60.005859375,11.859375
    Q 57.900390625,9.775390625 53.732421875,9.775390625
    Z
    M 15.125,13.578125
    L 54.01171875,13.578125
    Q 56.052734375,13.578125 57.169921875,14.6630859375
    Q 58.287109375,15.748046875 58.287109375,17.875
    L 58.287109375,43.505859375
    Q 58.287109375,45.6328125 57.169921875,46.7177734375
    Q 56.052734375,47.802734375 54.01171875,47.802734375
    L 15.125,47.802734375
    Q 13.0625,47.802734375 11.966796875,46.7177734375
    Q 10.87109375,45.6328125 10.87109375,43.505859375
    L 10.87109375,17.875
    Q 10.87109375,15.748046875 11.966796875,14.6630859375
    Q 13.0625,13.578125 15.125,13.578125
    Z
    M 29.111328125,37.919921875
    Q 28.423828125,37.919921875 28.1767578125,38.15625
    Q 27.9296875,38.392578125 27.9296875,39.05859375
    L 27.9296875,40.69140625
    Q 27.9296875,41.357421875 28.1767578125,41.59375
    Q 28.423828125,41.830078125 29.111328125,41.830078125
    L 30.744140625,41.830078125
    Q 31.431640625,41.830078125 31.6787109375,41.59375
    Q 31.92578125,41.357421875 31.92578125,40.69140625
    L 31.92578125,39.05859375
    Q 31.92578125,38.392578125 31.6787109375,38.15625
    Q 31.431640625,37.919921875 30.744140625,37.919921875
    Z
    M 38.435546875,37.919921875
    Q 37.76953125,37.919921875 37.5224609375,38.15625
    Q 37.275390625,38.392578125 37.275390625,39.05859375
    L 37.275390625,40.69140625
    Q 37.275390625,41.357421875 37.5224609375,41.59375
    Q 37.76953125,41.830078125 38.435546875,41.830078125
    L 40.068359375,41.830078125
    Q 40.755859375,41.830078125 41.0029296875,41.59375
    Q 41.25,41.357421875 41.25,40.69140625
    L 41.25,39.05859375
    Q 41.25,38.392578125 41.0029296875,38.15625
    Q 40.755859375,37.919921875 40.068359375,37.919921875
    Z
    M 47.78125,37.919921875
    Q 47.09375,37.919921875 46.8466796875,38.15625
    Q 46.599609375,38.392578125 46.599609375,39.05859375
    L 46.599609375,40.69140625
    Q 46.599609375,41.357421875 46.8466796875,41.59375
    Q 47.09375,41.830078125 47.78125,41.830078125
    L 49.4140625,41.830078125
    Q 50.080078125,41.830078125 50.3271484375,41.59375
    Q 50.57421875,41.357421875 50.57421875,40.69140625
    L 50.57421875,39.05859375
    Q 50.57421875,38.392578125 50.3271484375,38.15625
    Q 50.080078125,37.919921875 49.4140625,37.919921875
    Z
    M 19.787109375,28.724609375
    Q 19.099609375,28.724609375 18.8525390625,28.9609375
    Q 18.60546875,29.197265625 18.60546875,29.86328125
    L 18.60546875,31.49609375
    Q 18.60546875,32.18359375 18.8525390625,32.4091796875
    Q 19.099609375,32.634765625 19.787109375,32.634765625
    L 21.419921875,32.634765625
    Q 22.0859375,32.634765625 22.3330078125,32.4091796875
    Q 22.580078125,32.18359375 22.580078125,31.49609375
    L 22.580078125,29.86328125
    Q 22.580078125,29.197265625 22.3330078125,28.9609375
    Q 22.0859375,28.724609375 21.419921875,28.724609375
    Z
    M 29.111328125,28.724609375
    Q 28.423828125,28.724609375 28.1767578125,28.9609375
    Q 27.9296875,29.197265625 27.9296875,29.86328125
    L 27.9296875,31.49609375
    Q 27.9296875,32.18359375 28.1767578125,32.4091796875
    Q 28.423828125,32.634765625 29.111328125,32.634765625
    L 30.744140625,32.634765625
    Q 31.431640625,32.634765625 31.6787109375,32.4091796875
    Q 31.92578125,32.18359375 31.92578125,31.49609375
    L 31.92578125,29.86328125
    Q 31.92578125,29.197265625 31.6787109375,28.9609375
    Q 31.431640625,28.724609375 30.744140625,28.724609375
    Z
    M 38.435546875,28.724609375
    Q 37.76953125,28.724609375 37.5224609375,28.9609375
    Q 37.275390625,29.197265625 37.275390625,29.86328125
    L 37.275390625,31.49609375
    Q 37.275390625,32.18359375 37.5224609375,32.4091796875
    Q 37.76953125,32.634765625 38.435546875,32.634765625
    L 40.068359375,32.634765625
    Q 40.755859375,32.634765625 41.0029296875,32.4091796875
    Q 41.25,32.18359375 41.25,31.49609375
    L 41.25,29.86328125
    Q 41.25,29.197265625 41.0029296875,28.9609375
    Q 40.755859375,28.724609375 40.068359375,28.724609375
    Z
    M 47.78125,28.724609375
    Q 47.09375,28.724609375 46.8466796875,28.9609375
    Q 46.599609375,29.197265625 46.599609375,29.86328125
    L 46.599609375,31.49609375
    Q 46.599609375,32.18359375 46.8466796875,32.4091796875
    Q 47.09375,32.634765625 47.78125,32.634765625
    L 49.4140625,32.634765625
    Q 50.080078125,32.634765625 50.3271484375,32.4091796875
    Q 50.57421875,32.18359375 50.57421875,31.49609375
    L 50.57421875,29.86328125
    Q 50.57421875,29.197265625 50.3271484375,28.9609375
    Q 50.080078125,28.724609375 49.4140625,28.724609375
    Z
    M 19.787109375,19.55078125
    Q 19.099609375,19.55078125 18.8525390625,19.7763671875
    Q 18.60546875,20.001953125 18.60546875,20.689453125
    L 18.60546875,22.30078125
    Q 18.60546875,22.98828125 18.8525390625,23.224609375
    Q 19.099609375,23.4609375 19.787109375,23.4609375
    L 21.419921875,23.4609375
    Q 22.0859375,23.4609375 22.3330078125,23.224609375
    Q 22.580078125,22.98828125 22.580078125,22.30078125
    L 22.580078125,20.689453125
    Q 22.580078125,20.001953125 22.3330078125,19.7763671875
    Q 22.0859375,19.55078125 21.419921875,19.55078125
    Z
    M 29.111328125,19.55078125
    Q 28.423828125,19.55078125 28.1767578125,19.7763671875
    Q 27.9296875,20.001953125 27.9296875,20.689453125
    L 27.9296875,22.30078125
    Q 27.9296875,22.98828125 28.1767578125,23.224609375
    Q 28.423828125,23.4609375 29.111328125,23.4609375
    L 30.744140625,23.4609375
    Q 31.431640625,23.4609375 31.6787109375,23.224609375
    Q 31.92578125,22.98828125 31.92578125,22.30078125
    L 31.92578125,20.689453125
    Q 31.92578125,20.001953125 31.6787109375,19.7763671875
    Q 31.431640625,19.55078125 30.744140625,19.55078125
    Z
    M 38.435546875,19.55078125
    Q 37.76953125,19.55078125 37.5224609375,19.7763671875
    Q 37.275390625,20.001953125 37.275390625,20.689453125
    L 37.275390625,22.30078125
    Q 37.275390625,22.98828125 37.5224609375,23.224609375
    Q 37.76953125,23.4609375 38.435546875,23.4609375
    L 40.068359375,23.4609375
    Q 40.755859375,23.4609375 41.0029296875,23.224609375
    Q 41.25,22.98828125 41.25,22.30078125
    L 41.25,20.689453125
    Q 41.25,20.001953125 41.0029296875,19.7763671875
    Q 40.755859375,19.55078125 40.068359375,19.55078125
    Z
' />
</g>`},filter:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.935546875,12.4609375
    Q 28.31640625,12.4609375 24.1162109375,13.8681640625
    Q 19.916015625,15.275390625 16.4248046875,17.853515625
    Q 12.93359375,20.431640625 10.35546875,23.9228515625
    Q 7.77734375,27.4140625 6.3701171875,31.6142578125
    Q 4.962890625,35.814453125 4.962890625,40.43359375
    Q 4.962890625,45.07421875 6.3701171875,49.263671875
    Q 7.77734375,53.453125 10.35546875,56.955078125
    Q 12.93359375,60.45703125 16.4248046875,63.0244140625
    Q 19.916015625,65.591796875 24.1162109375,67.009765625
    Q 28.31640625,68.427734375 32.935546875,68.427734375
    Q 37.576171875,68.427734375 41.765625,67.009765625
    Q 45.955078125,65.591796875 49.45703125,63.0244140625
    Q 52.958984375,60.45703125 55.5263671875,56.955078125
    Q 58.09375,53.453125 59.51171875,49.263671875
    Q 60.9296875,45.07421875 60.9296875,40.43359375
    Q 60.9296875,35.814453125 59.51171875,31.6142578125
    Q 58.09375,27.4140625 55.5263671875,23.9228515625
    Q 52.958984375,20.431640625 49.45703125,17.853515625
    Q 45.955078125,15.275390625 41.765625,13.8681640625
    Q 37.576171875,12.4609375 32.935546875,12.4609375
    Z
    M 32.935546875,16.45703125
    Q 36.91015625,16.45703125 40.5087890625,17.6708984375
    Q 44.107421875,18.884765625 47.1044921875,21.0869140625
    Q 50.1015625,23.2890625 52.3037109375,26.2861328125
    Q 54.505859375,29.283203125 55.708984375,32.87109375
    Q 56.912109375,36.458984375 56.912109375,40.43359375
    Q 56.912109375,44.408203125 55.708984375,48.0068359375
    Q 54.505859375,51.60546875 52.3037109375,54.6025390625
    Q 50.1015625,57.599609375 47.1044921875,59.8017578125
    Q 44.107421875,62.00390625 40.5087890625,63.20703125
    Q 36.91015625,64.41015625 32.935546875,64.41015625
    Q 28.9609375,64.41015625 25.373046875,63.20703125
    Q 21.78515625,62.00390625 18.7880859375,59.8017578125
    Q 15.791015625,57.599609375 13.5888671875,54.6025390625
    Q 11.38671875,51.60546875 10.1728515625,48.0068359375
    Q 8.958984375,44.408203125 8.958984375,40.43359375
    Q 8.958984375,36.458984375 10.1728515625,32.87109375
    Q 11.38671875,29.283203125 13.5888671875,26.2861328125
    Q 15.791015625,23.2890625 18.7880859375,21.0869140625
    Q 21.78515625,18.884765625 25.373046875,17.6708984375
    Q 28.9609375,16.45703125 32.935546875,16.45703125
    Z
    M 17.681640625,46.27734375
    Q 16.88671875,46.27734375 16.3818359375,46.7392578125
    Q 15.876953125,47.201171875 15.876953125,47.953125
    Q 15.876953125,48.705078125 16.3818359375,49.177734375
    Q 16.88671875,49.650390625 17.681640625,49.650390625
    L 48.232421875,49.650390625
    Q 49.02734375,49.650390625 49.5322265625,49.177734375
    Q 50.037109375,48.705078125 50.037109375,47.953125
    Q 50.037109375,47.201171875 49.5322265625,46.7392578125
    Q 49.02734375,46.27734375 48.232421875,46.27734375
    Z
    M 21.763671875,37.103515625
    Q 20.96875,37.103515625 20.4638671875,37.576171875
    Q 19.958984375,38.048828125 19.958984375,38.80078125
    Q 19.958984375,39.552734375 20.4638671875,40.0146484375
    Q 20.96875,40.4765625 21.763671875,40.4765625
    L 44.150390625,40.4765625
    Q 44.923828125,40.4765625 45.439453125,40.0146484375
    Q 45.955078125,39.552734375 45.955078125,38.80078125
    Q 45.955078125,38.048828125 45.439453125,37.576171875
    Q 44.923828125,37.103515625 44.150390625,37.103515625
    Z
    M 26.0390625,27.908203125
    Q 25.244140625,27.908203125 24.7392578125,28.3701171875
    Q 24.234375,28.83203125 24.234375,29.60546875
    Q 24.234375,30.357421875 24.7392578125,30.8193359375
    Q 25.244140625,31.28125 26.0390625,31.28125
    L 39.896484375,31.28125
    Q 40.669921875,31.28125 41.1748046875,30.8193359375
    Q 41.6796875,30.357421875 41.6796875,29.60546875
    Q 41.6796875,28.83203125 41.1748046875,28.3701171875
    Q 40.669921875,27.908203125 39.896484375,27.908203125
    Z
' />
</g>`},share:{viewBox:`0 0 62.734 89.096`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-89.095703125)'>
<path fill='currentColor' d='
    M 15.42578125,13.814453125
    Q 11.279296875,13.814453125 9.173828125,15.8876953125
    Q 7.068359375,17.9609375 7.068359375,22.0859375
    L 7.068359375,49.650390625
    Q 7.068359375,53.775390625 9.173828125,55.859375
    Q 11.279296875,57.943359375 15.42578125,57.943359375
    L 24.642578125,57.943359375
    L 24.642578125,54.119140625
    L 15.51171875,54.119140625
    Q 13.255859375,54.119140625 12.0634765625,52.9375
    Q 10.87109375,51.755859375 10.87109375,49.45703125
    L 10.87109375,22.30078125
    Q 10.87109375,19.98046875 12.0634765625,18.798828125
    Q 13.255859375,17.6171875 15.51171875,17.6171875
    L 47.22265625,17.6171875
    Q 49.435546875,17.6171875 50.6494140625,18.798828125
    Q 51.86328125,19.98046875 51.86328125,22.30078125
    L 51.86328125,49.45703125
    Q 51.86328125,51.755859375 50.6494140625,52.9375
    Q 49.435546875,54.119140625 47.22265625,54.119140625
    L 38.091796875,54.119140625
    L 38.091796875,57.943359375
    L 47.30859375,57.943359375
    Q 51.4765625,57.943359375 53.5712890625,55.8486328125
    Q 55.666015625,53.75390625 55.666015625,49.650390625
    L 55.666015625,22.0859375
    Q 55.666015625,17.982421875 53.5712890625,15.8984375
    Q 51.4765625,13.814453125 47.30859375,13.814453125
    Z
    M 31.3671875,35.298828125
    Q 30.59375,35.298828125 30.03515625,35.8466796875
    Q 29.4765625,36.39453125 29.4765625,37.146484375
    L 29.4765625,65.978515625
    L 29.626953125,70.060546875
    L 27.9296875,68.27734375
    L 23.24609375,63.37890625
    Q 22.73046875,62.798828125 21.935546875,62.798828125
    Q 21.205078125,62.798828125 20.7216796875,63.271484375
    Q 20.23828125,63.744140625 20.23828125,64.474609375
    Q 20.23828125,64.861328125 20.3779296875,65.1513671875
    Q 20.517578125,65.44140625 20.796875,65.720703125
    L 29.9921875,74.658203125
    Q 30.357421875,75.0234375 30.6796875,75.15234375
    Q 31.001953125,75.28125 31.3671875,75.28125
    Q 31.732421875,75.28125 32.0546875,75.15234375
    Q 32.376953125,75.0234375 32.7421875,74.658203125
    L 41.9375,65.720703125
    Q 42.1953125,65.44140625 42.345703125,65.1513671875
    Q 42.49609375,64.861328125 42.49609375,64.474609375
    Q 42.49609375,63.744140625 41.9912109375,63.271484375
    Q 41.486328125,62.798828125 40.755859375,62.798828125
    Q 39.982421875,62.798828125 39.466796875,63.37890625
    L 34.8046875,68.27734375
    L 33.107421875,70.0390625
    L 33.2578125,65.978515625
    L 33.2578125,37.146484375
    Q 33.2578125,36.39453125 32.69921875,35.8466796875
    Q 32.140625,35.298828125 31.3671875,35.298828125
    Z
' />
</g>`},tabHome:{viewBox:`0 0 78.955 84.24`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.240234375)'>
<path fill='currentColor' d='
    M 31.517578125,15.705078125
    L 31.517578125,33.708984375
    Q 31.517578125,34.611328125 32.0654296875,35.1484375
    Q 32.61328125,35.685546875 33.515625,35.685546875
    L 45.4609375,35.685546875
    Q 46.36328125,35.685546875 46.900390625,35.1484375
    Q 47.4375,34.611328125 47.4375,33.708984375
    L 47.4375,15.705078125
    Z
    M 9.109375,42.302734375
    Q 8.142578125,42.302734375 7.60546875,42.8828125
    Q 7.068359375,43.462890625 7.068359375,44.171875
    Q 7.068359375,44.6015625 7.2509765625,45.009765625
    Q 7.43359375,45.41796875 7.841796875,45.76171875
    L 36.373046875,69.6953125
    Q 37.833984375,70.94140625 39.466796875,70.94140625
    Q 41.12109375,70.94140625 42.58203125,69.6953125
    L 71.11328125,45.76171875
    Q 71.521484375,45.41796875 71.7041015625,45.009765625
    Q 71.88671875,44.6015625 71.88671875,44.171875
    Q 71.88671875,43.462890625 71.349609375,42.8828125
    Q 70.8125,42.302734375 69.845703125,42.302734375
    Q 69.3515625,42.302734375 68.9541015625,42.5283203125
    Q 68.556640625,42.75390625 68.19140625,43.0546875
    L 40.51953125,66.279296875
    Q 40.025390625,66.6875 39.466796875,66.6875
    Q 38.9296875,66.6875 38.435546875,66.279296875
    L 10.763671875,43.0546875
    Q 10.3984375,42.75390625 10.0009765625,42.5283203125
    Q 9.603515625,42.302734375 9.109375,42.302734375
    Z
    M 57.79296875,55.751953125
    L 57.79296875,62.6484375
    Q 57.79296875,63.443359375 58.2978515625,63.9267578125
    Q 58.802734375,64.41015625 59.59765625,64.41015625
    L 62.326171875,64.41015625
    Q 63.142578125,64.41015625 63.6259765625,63.9267578125
    Q 64.109375,63.443359375 64.109375,62.6484375
    L 64.109375,50.423828125
    Z
    M 20.775390625,13.298828125
    Q 17.939453125,13.298828125 16.392578125,14.8134765625
    Q 14.845703125,16.328125 14.845703125,19.142578125
    L 14.845703125,49.779296875
    L 18.6484375,52.37890625
    L 18.6484375,20.06640625
    Q 18.6484375,18.60546875 19.3896484375,17.853515625
    Q 20.130859375,17.1015625 21.5703125,17.1015625
    L 57.36328125,17.1015625
    Q 58.82421875,17.1015625 59.5654296875,17.853515625
    Q 60.306640625,18.60546875 60.306640625,20.06640625
    L 60.306640625,52.421875
    L 64.109375,49.779296875
    L 64.109375,19.142578125
    Q 64.109375,16.349609375 62.5625,14.82421875
    Q 61.015625,13.298828125 58.1796875,13.298828125
    Z
' />
</g>`},tabVentas:{viewBox:`0 0 74.809 81.082`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.08203125)'>
<path fill='currentColor' d='
    M 27.908203125,26.876953125
    Q 25.09375,26.876953125 23.58984375,28.4775390625
    Q 22.0859375,30.078125 21.677734375,32.828125
    L 17.123046875,64.0234375
    L 7.412109375,64.0234375
    Q 6.681640625,64.0234375 6.1767578125,64.560546875
    Q 5.671875,65.09765625 5.671875,65.806640625
    Q 5.671875,66.537109375 6.1767578125,67.0634765625
    Q 6.681640625,67.58984375 7.412109375,67.58984375
    L 17.380859375,67.58984375
    Q 19.20703125,67.58984375 19.873046875,66.8916015625
    Q 20.5390625,66.193359375 20.732421875,64.83984375
    L 25.39453125,33.34375
    Q 25.587890625,32.01171875 26.3505859375,31.2275390625
    Q 27.11328125,30.443359375 28.380859375,30.443359375
    L 60.564453125,30.443359375
    Q 61.251953125,30.443359375 61.767578125,29.9384765625
    Q 62.283203125,29.43359375 62.283203125,28.66015625
    Q 62.283203125,27.88671875 61.767578125,27.3818359375
    Q 61.251953125,26.876953125 60.564453125,26.876953125
    Z
    M 22.923828125,36.6953125
    L 22.837890625,40.26171875
    L 60.15625,40.26171875
    Q 61.423828125,40.26171875 62.1328125,41.0458984375
    Q 62.841796875,41.830078125 63.03515625,43.18359375
    L 65.119140625,57.212890625
    L 20.345703125,57.212890625
    L 20.28125,60.779296875
    L 66.81640625,60.779296875
    Q 67.890625,60.779296875 68.513671875,60.2099609375
    Q 69.13671875,59.640625 69.13671875,58.716796875
    Q 69.13671875,58.544921875 69.1044921875,58.2548828125
    Q 69.072265625,57.96484375 69.029296875,57.728515625
    L 66.751953125,42.796875
    Q 66.34375,39.9609375 64.83984375,38.328125
    Q 63.3359375,36.6953125 60.435546875,36.6953125
    Z
    M 30.529296875,13.4921875
    Q 29.3046875,13.4921875 28.3056640625,14.072265625
    Q 27.306640625,14.65234375 26.7158203125,15.6513671875
    Q 26.125,16.650390625 26.125,17.875
    Q 26.125,19.099609375 26.7158203125,20.0986328125
    Q 27.306640625,21.09765625 28.3056640625,21.677734375
    Q 29.3046875,22.2578125 30.529296875,22.2578125
    Q 31.75390625,22.2578125 32.7421875,21.677734375
    Q 33.73046875,21.09765625 34.3212890625,20.0986328125
    Q 34.912109375,19.099609375 34.912109375,17.875
    Q 34.912109375,16.650390625 34.3212890625,15.6513671875
    Q 33.73046875,14.65234375 32.7421875,14.072265625
    Q 31.75390625,13.4921875 30.529296875,13.4921875
    Z
    M 56.16015625,13.4921875
    Q 54.935546875,13.4921875 53.9365234375,14.072265625
    Q 52.9375,14.65234375 52.3359375,15.6513671875
    Q 51.734375,16.650390625 51.734375,17.875
    Q 51.734375,19.099609375 52.3359375,20.0986328125
    Q 52.9375,21.09765625 53.9365234375,21.677734375
    Q 54.935546875,22.2578125 56.16015625,22.2578125
    Q 57.384765625,22.2578125 58.3837890625,21.677734375
    Q 59.3828125,21.09765625 59.9736328125,20.0986328125
    Q 60.564453125,19.099609375 60.564453125,17.875
    Q 60.564453125,16.650390625 59.9736328125,15.6513671875
    Q 59.3828125,14.65234375 58.3837890625,14.072265625
    Q 57.384765625,13.4921875 56.16015625,13.4921875
    Z
' />
</g>`},tabCatalogo:{viewBox:`0 0 74.207 94.896`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-94.896484375)'>
<path fill='currentColor' d='
    M 38.5859375,19.63671875
    Q 35.70703125,16.7578125 32.7744140625,16.7470703125
    Q 29.841796875,16.736328125 26.8984375,19.658203125
    L 9.302734375,37.232421875
    Q 6.359375,40.1328125 6.380859375,43.0869140625
    Q 6.40234375,46.041015625 9.28125,48.919921875
    L 36.501953125,76.0546875
    Q 37.490234375,77.04296875 38.28515625,77.4833984375
    Q 39.080078125,77.923828125 40.025390625,78.0419921875
    Q 40.970703125,78.16015625 42.453125,78.16015625
    L 52.98046875,78.16015625
    Q 54.376953125,78.16015625 55.2578125,77.923828125
    Q 56.138671875,77.6875 56.9013671875,77.107421875
    Q 57.6640625,76.52734375 58.716796875,75.474609375
    L 65.140625,69.029296875
    Q 66.193359375,67.998046875 66.7841796875,67.224609375
    Q 67.375,66.451171875 67.611328125,65.5810546875
    Q 67.84765625,64.7109375 67.84765625,63.314453125
    L 67.84765625,52.765625
    Q 67.84765625,51.3046875 67.71875,50.3486328125
    Q 67.58984375,49.392578125 67.1494140625,48.59765625
    Q 66.708984375,47.802734375 65.720703125,46.8359375
    Z
    M 36.029296875,22.47265625
    L 63.03515625,49.521484375
    Q 63.5078125,49.994140625 63.765625,50.53125
    Q 64.0234375,51.068359375 64.0234375,51.8203125
    L 64.0234375,63.486328125
    Q 64.0234375,64.75390625 63.03515625,65.763671875
    L 55.4296875,73.369140625
    Q 54.44140625,74.357421875 53.173828125,74.357421875
    L 41.486328125,74.357421875
    Q 40.734375,74.357421875 40.197265625,74.099609375
    Q 39.66015625,73.841796875 39.1875,73.369140625
    L 12.1171875,46.36328125
    Q 10.52734375,44.7734375 10.5166015625,43.09765625
    Q 10.505859375,41.421875 12.138671875,39.7890625
    L 29.43359375,22.494140625
    Q 32.7421875,19.185546875 36.029296875,22.47265625
    Z
    M 49.822265625,56.611328125
    Q 48.296875,56.611328125 47.287109375,57.6318359375
    Q 46.27734375,58.65234375 46.27734375,60.134765625
    Q 46.27734375,61.6171875 47.287109375,62.6376953125
    Q 48.296875,63.658203125 49.822265625,63.658203125
    Q 51.326171875,63.658203125 52.3359375,62.6376953125
    Q 53.345703125,61.6171875 53.345703125,60.134765625
    Q 53.345703125,58.65234375 52.3359375,57.6318359375
    Q 51.326171875,56.611328125 49.822265625,56.611328125
    Z
' />
</g>`},tabInventario:{viewBox:`0 0 69.738 88.945`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-88.9453125)'>
<path fill='currentColor' d='
    M 10.65625,27.564453125
    Q 8.8515625,28.595703125 7.9599609375,29.90625
    Q 7.068359375,31.216796875 7.068359375,33.859375
    L 7.068359375,56.41796875
    Q 7.068359375,58.287109375 7.8095703125,59.533203125
    Q 8.55078125,60.779296875 10.09765625,61.638671875
    L 30.37890625,73.111328125
    Q 32.634765625,74.37890625 34.869140625,74.37890625
    Q 37.103515625,74.37890625 39.337890625,73.111328125
    L 59.640625,61.638671875
    Q 61.1875,60.779296875 61.9287109375,59.533203125
    Q 62.669921875,58.287109375 62.669921875,56.41796875
    L 62.669921875,33.859375
    Q 62.669921875,31.216796875 61.7783203125,29.90625
    Q 60.88671875,28.595703125 59.08203125,27.564453125
    L 37.060546875,15.189453125
    Q 35.921875,14.56640625 34.8583984375,14.56640625
    Q 33.794921875,14.56640625 32.677734375,15.189453125
    Z
    M 12.869140625,30.63671875
    L 33,19.3359375
    L 33,43.033203125
    L 10.720703125,55.6015625
    L 10.720703125,34.009765625
    Q 10.720703125,32.849609375 11.171875,32.0869140625
    Q 11.623046875,31.32421875 12.869140625,30.63671875
    Z
    M 56.869140625,30.63671875
    Q 58.115234375,31.32421875 58.56640625,32.0869140625
    Q 59.017578125,32.849609375 59.017578125,34.009765625
    L 59.017578125,55.6015625
    L 36.73828125,43.033203125
    L 36.73828125,19.3359375
    Z
    M 34.869140625,46.36328125
    L 44.236328125,51.583984375
    L 21.978515625,64.087890625
    L 12.654296875,58.802734375
    Z
    M 48.0390625,53.732421875
    L 57.083984375,58.802734375
    L 37.662109375,69.78125
    Q 34.890625,71.392578125 32.076171875,69.78125
    L 25.716796875,66.21484375
    Z
' />
</g>`},tabContactos:{viewBox:`0 0 90.965 70.727`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.7265625)'>
<path fill='currentColor' d='
    M 42.15234375,9.92578125
    Q 35.87890625,9.92578125 35.87890625,14.13671875
    Q 35.87890625,16.306640625 36.9423828125,18.734375
    Q 38.005859375,21.162109375 40.0361328125,23.4716796875
    Q 42.06640625,25.78125 44.9990234375,27.650390625
    Q 47.931640625,29.51953125 51.669921875,30.6474609375
    Q 55.408203125,31.775390625 59.876953125,31.775390625
    Q 64.345703125,31.775390625 68.083984375,30.6474609375
    Q 71.822265625,29.51953125 74.7548828125,27.650390625
    Q 77.6875,25.78125 79.728515625,23.4716796875
    Q 81.76953125,21.162109375 82.8330078125,18.734375
    Q 83.896484375,16.306640625 83.896484375,14.13671875
    Q 83.896484375,9.92578125 77.6015625,9.92578125
    Z
    M 41.12109375,13.513671875
    L 78.6328125,13.513671875
    Q 79.427734375,13.513671875 79.75,13.75
    Q 80.072265625,13.986328125 80.072265625,14.56640625
    Q 80.072265625,16.0703125 79.212890625,17.8857421875
    Q 78.353515625,19.701171875 76.6884765625,21.505859375
    Q 75.0234375,23.310546875 72.57421875,24.8251953125
    Q 70.125,26.33984375 66.9345703125,27.2529296875
    Q 63.744140625,28.166015625 59.876953125,28.166015625
    Q 56.009765625,28.166015625 52.8193359375,27.2529296875
    Q 49.62890625,26.33984375 47.1796875,24.8251953125
    Q 44.73046875,23.310546875 43.0654296875,21.505859375
    Q 41.400390625,19.701171875 40.541015625,17.8857421875
    Q 39.681640625,16.0703125 39.681640625,14.56640625
    Q 39.681640625,13.986328125 40.00390625,13.75
    Q 40.326171875,13.513671875 41.12109375,13.513671875
    Z
    M 59.8984375,35.427734375
    Q 57.470703125,35.427734375 55.3330078125,36.416015625
    Q 53.1953125,37.404296875 51.583984375,39.166015625
    Q 49.97265625,40.927734375 49.0595703125,43.248046875
    Q 48.146484375,45.568359375 48.146484375,48.232421875
    Q 48.146484375,50.83203125 49.0595703125,53.109375
    Q 49.97265625,55.38671875 51.5947265625,57.1162109375
    Q 53.216796875,58.845703125 55.34375,59.8232421875
    Q 57.470703125,60.80078125 59.8984375,60.80078125
    Q 62.34765625,60.80078125 64.474609375,59.833984375
    Q 66.6015625,58.8671875 68.2236328125,57.1484375
    Q 69.845703125,55.4296875 70.7587890625,53.1630859375
    Q 71.671875,50.896484375 71.671875,48.275390625
    Q 71.671875,45.611328125 70.7587890625,43.2802734375
    Q 69.845703125,40.94921875 68.234375,39.1875
    Q 66.623046875,37.42578125 64.4853515625,36.4267578125
    Q 62.34765625,35.427734375 59.8984375,35.427734375
    Z
    M 59.8984375,39.015625
    Q 62.08984375,39.015625 63.89453125,40.2509765625
    Q 65.69921875,41.486328125 66.7841796875,43.591796875
    Q 67.869140625,45.697265625 67.869140625,48.275390625
    Q 67.869140625,50.810546875 66.7841796875,52.830078125
    Q 65.69921875,54.849609375 63.89453125,56.03125
    Q 62.08984375,57.212890625 59.8984375,57.212890625
    Q 57.728515625,57.212890625 55.9130859375,56.009765625
    Q 54.09765625,54.806640625 53.0234375,52.7763671875
    Q 51.94921875,50.74609375 51.94921875,48.232421875
    Q 51.94921875,45.654296875 53.0341796875,43.5595703125
    Q 54.119140625,41.46484375 55.923828125,40.240234375
    Q 57.728515625,39.015625 59.8984375,39.015625
    Z
    M 12.33203125,9.92578125
    Q 9.689453125,9.92578125 8.37890625,11.021484375
    Q 7.068359375,12.1171875 7.068359375,14.330078125
    Q 7.068359375,17.681640625 8.658203125,20.818359375
    Q 10.248046875,23.955078125 13.083984375,26.4365234375
    Q 15.919921875,28.91796875 19.7119140625,30.3681640625
    Q 23.50390625,31.818359375 27.9296875,31.818359375
    Q 30.314453125,31.818359375 32.5703125,31.388671875
    Q 34.826171875,30.958984375 36.888671875,30.099609375
    Q 38.951171875,29.240234375 40.77734375,27.951171875
    Q 39.982421875,27.392578125 39.3271484375,26.76953125
    Q 38.671875,26.146484375 38.091796875,25.458984375
    Q 36.673828125,26.3828125 35.0517578125,27.02734375
    Q 33.4296875,27.671875 31.646484375,27.994140625
    Q 29.86328125,28.31640625 27.9296875,28.31640625
    Q 24.44921875,28.31640625 21.3232421875,27.1884765625
    Q 18.197265625,26.060546875 15.7802734375,24.126953125
    Q 13.36328125,22.193359375 11.98828125,19.7119140625
    Q 10.61328125,17.23046875 10.61328125,14.5234375
    Q 10.61328125,13.943359375 10.892578125,13.6962890625
    Q 11.171875,13.44921875 11.794921875,13.44921875
    L 32.78515625,13.44921875
    Q 32.7421875,12.71875 33.0107421875,12.03125
    Q 33.279296875,11.34375 33.7412109375,10.7958984375
    Q 34.203125,10.248046875 34.783203125,9.92578125
    Z
    M 27.97265625,35.10546875
    Q 25.13671875,35.10546875 22.81640625,36.6201171875
    Q 20.49609375,38.134765625 19.12109375,40.6806640625
    Q 17.74609375,43.2265625 17.74609375,46.341796875
    Q 17.74609375,48.59765625 18.541015625,50.595703125
    Q 19.3359375,52.59375 20.7431640625,54.1083984375
    Q 22.150390625,55.623046875 24.0087890625,56.4931640625
    Q 25.8671875,57.36328125 27.97265625,57.36328125
    Q 30.099609375,57.36328125 31.947265625,56.50390625
    Q 33.794921875,55.64453125 35.2021484375,54.140625
    Q 36.609375,52.63671875 37.404296875,50.6494140625
    Q 38.19921875,48.662109375 38.19921875,46.384765625
    Q 38.19921875,43.248046875 36.82421875,40.69140625
    Q 35.44921875,38.134765625 33.12890625,36.6201171875
    Q 30.80859375,35.10546875 27.97265625,35.10546875
    Z
    M 27.97265625,38.650390625
    Q 29.798828125,38.650390625 31.32421875,39.681640625
    Q 32.849609375,40.712890625 33.7626953125,42.4638671875
    Q 34.67578125,44.21484375 34.67578125,46.384765625
    Q 34.67578125,48.447265625 33.7734375,50.1337890625
    Q 32.87109375,51.8203125 31.345703125,52.8193359375
    Q 29.8203125,53.818359375 27.97265625,53.818359375
    Q 26.146484375,53.818359375 24.62109375,52.80859375
    Q 23.095703125,51.798828125 22.193359375,50.1015625
    Q 21.291015625,48.404296875 21.291015625,46.341796875
    Q 21.291015625,44.193359375 22.193359375,42.453125
    Q 23.095703125,40.712890625 24.62109375,39.681640625
    Q 26.146484375,38.650390625 27.97265625,38.650390625
    Z
' />
</g>`},tabFinanzas:{viewBox:`0 0 79.943 81.232`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.232421875)'>
<path fill='currentColor' d='
    M 15.125,12.76171875
    Q 11.150390625,12.76171875 9.109375,14.7705078125
    Q 7.068359375,16.779296875 7.068359375,20.732421875
    L 7.068359375,49.37109375
    Q 7.068359375,52.59375 8.4755859375,54.5166015625
    Q 9.8828125,56.439453125 12.826171875,57.298828125
    L 49.134765625,67.654296875
    Q 52.056640625,68.470703125 54.3017578125,68.041015625
    Q 56.546875,67.611328125 57.8251953125,65.8818359375
    Q 59.103515625,64.15234375 59.103515625,61.14453125
    L 59.103515625,56.009765625
    L 55.236328125,55.708984375
    L 55.236328125,61.4453125
    Q 55.236328125,63.37890625 54.09765625,64.1953125
    Q 52.958984375,65.01171875 50.810546875,64.388671875
    L 27.0703125,57.900390625
    Q 26.705078125,57.814453125 26.7373046875,57.578125
    Q 26.76953125,57.341796875 27.11328125,57.341796875
    L 60.0703125,57.341796875
    Q 64.087890625,57.341796875 66.107421875,55.322265625
    Q 68.126953125,53.302734375 68.126953125,49.37109375
    L 68.126953125,42.5390625
    L 64.28125,42.5390625
    L 64.28125,49.177734375
    Q 64.28125,51.326171875 63.1640625,52.421875
    Q 62.046875,53.517578125 60.005859375,53.517578125
    L 15.189453125,53.517578125
    Q 13.10546875,53.517578125 12.009765625,52.421875
    Q 10.9140625,51.326171875 10.9140625,49.177734375
    L 10.9140625,20.92578125
    Q 10.9140625,18.77734375 12.009765625,17.6923828125
    Q 13.10546875,16.607421875 15.189453125,16.607421875
    L 60.005859375,16.607421875
    Q 62.046875,16.607421875 63.1640625,17.6923828125
    Q 64.28125,18.77734375 64.28125,20.92578125
    L 64.28125,28.359375
    L 68.126953125,28.359375
    L 68.126953125,20.732421875
    Q 68.126953125,16.80078125 66.107421875,14.78125
    Q 64.087890625,12.76171875 60.0703125,12.76171875
    Z
    M 57.341796875,32.2265625
    Q 56.138671875,32.2265625 55.2900390625,33.064453125
    Q 54.44140625,33.90234375 54.44140625,35.10546875
    Q 54.44140625,36.30859375 55.2900390625,37.146484375
    Q 56.138671875,37.984375 57.341796875,37.984375
    Q 58.5234375,37.984375 59.3720703125,37.146484375
    Q 60.220703125,36.30859375 60.220703125,35.10546875
    Q 60.220703125,33.90234375 59.3720703125,33.064453125
    Q 58.5234375,32.2265625 57.341796875,32.2265625
    Z
    M 57.44921875,26.404296875
    Q 54.5703125,26.404296875 52.4326171875,27.3818359375
    Q 50.294921875,28.359375 49.1240234375,30.2822265625
    Q 47.953125,32.205078125 47.953125,35.083984375
    Q 47.953125,37.962890625 49.1240234375,39.896484375
    Q 50.294921875,41.830078125 52.4326171875,42.796875
    Q 54.5703125,43.763671875 57.44921875,43.763671875
    L 67.439453125,43.763671875
    Q 69.953125,43.763671875 71.4140625,42.23828125
    Q 72.875,40.712890625 72.875,38.328125
    L 72.875,31.83984375
    Q 72.875,29.455078125 71.4140625,27.9296875
    Q 69.953125,26.404296875 67.439453125,26.404296875
    Z
    M 57.6640625,29.626953125
    L 66.751953125,29.626953125
    Q 68.19140625,29.626953125 68.921875,30.400390625
    Q 69.65234375,31.173828125 69.65234375,32.52734375
    L 69.65234375,37.640625
    Q 69.65234375,39.015625 68.921875,39.7783203125
    Q 68.19140625,40.541015625 66.751953125,40.541015625
    L 57.6640625,40.541015625
    Q 54.505859375,40.541015625 52.9267578125,39.1015625
    Q 51.34765625,37.662109375 51.34765625,35.083984375
    Q 51.34765625,32.52734375 52.9267578125,31.0771484375
    Q 54.505859375,29.626953125 57.6640625,29.626953125
    Z
' />
</g>`},sidebar:{viewBox:`0 0 79.234 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.42578125,9.775390625
    Q 11.279296875,9.775390625 9.173828125,11.8486328125
    Q 7.068359375,13.921875 7.068359375,18.046875
    L 7.068359375,51.9921875
    Q 7.068359375,56.1171875 9.173828125,58.1904296875
    Q 11.279296875,60.263671875 15.42578125,60.263671875
    L 63.787109375,60.263671875
    Q 67.955078125,60.263671875 70.060546875,58.1796875
    Q 72.166015625,56.095703125 72.166015625,51.9921875
    L 72.166015625,18.046875
    Q 72.166015625,13.943359375 70.060546875,11.859375
    Q 67.955078125,9.775390625 63.787109375,9.775390625
    Z
    M 15.51171875,13.578125
    L 63.72265625,13.578125
    Q 65.935546875,13.578125 67.138671875,14.759765625
    Q 68.341796875,15.94140625 68.341796875,18.240234375
    L 68.341796875,51.798828125
    Q 68.341796875,54.09765625 67.138671875,55.279296875
    Q 65.935546875,56.4609375 63.72265625,56.4609375
    L 15.51171875,56.4609375
    Q 13.255859375,56.4609375 12.0634765625,55.279296875
    Q 10.87109375,54.09765625 10.87109375,51.798828125
    L 10.87109375,18.240234375
    Q 10.87109375,15.94140625 12.0634765625,14.759765625
    Q 13.255859375,13.578125 15.51171875,13.578125
    Z
    M 27.865234375,12.826171875
    L 27.865234375,57.27734375
    L 31.58203125,57.27734375
    L 31.58203125,12.826171875
    Z
    M 22.55859375,46.1484375
    L 16.2421875,46.1484375
    Q 15.662109375,46.1484375 15.25390625,46.5673828125
    Q 14.845703125,46.986328125 14.845703125,47.5234375
    Q 14.845703125,48.08203125 15.25390625,48.490234375
    Q 15.662109375,48.8984375 16.2421875,48.8984375
    L 22.55859375,48.8984375
    Q 23.1171875,48.8984375 23.5361328125,48.490234375
    Q 23.955078125,48.08203125 23.955078125,47.5234375
    Q 23.955078125,46.986328125 23.5361328125,46.5673828125
    Q 23.1171875,46.1484375 22.55859375,46.1484375
    Z
    M 22.55859375,38.88671875
    L 16.2421875,38.88671875
    Q 15.662109375,38.88671875 15.25390625,39.294921875
    Q 14.845703125,39.703125 14.845703125,40.26171875
    Q 14.845703125,40.8203125 15.25390625,41.2177734375
    Q 15.662109375,41.615234375 16.2421875,41.615234375
    L 22.55859375,41.615234375
    Q 23.1171875,41.615234375 23.5361328125,41.2177734375
    Q 23.955078125,40.8203125 23.955078125,40.26171875
    Q 23.955078125,39.703125 23.5361328125,39.294921875
    Q 23.1171875,38.88671875 22.55859375,38.88671875
    Z
    M 22.55859375,31.625
    L 16.2421875,31.625
    Q 15.662109375,31.625 15.25390625,32.0224609375
    Q 14.845703125,32.419921875 14.845703125,32.978515625
    Q 14.845703125,33.537109375 15.25390625,33.9345703125
    Q 15.662109375,34.33203125 16.2421875,34.33203125
    L 22.55859375,34.33203125
    Q 23.1171875,34.33203125 23.5361328125,33.9345703125
    Q 23.955078125,33.537109375 23.955078125,32.978515625
    Q 23.955078125,32.419921875 23.5361328125,32.0224609375
    Q 23.1171875,31.625 22.55859375,31.625
    Z
' />
</g>`},inspector:{viewBox:`0 0 79.234 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.42578125,9.775390625
    Q 11.279296875,9.775390625 9.173828125,11.8486328125
    Q 7.068359375,13.921875 7.068359375,18.046875
    L 7.068359375,51.9921875
    Q 7.068359375,56.1171875 9.173828125,58.1904296875
    Q 11.279296875,60.263671875 15.42578125,60.263671875
    L 63.787109375,60.263671875
    Q 67.955078125,60.263671875 70.060546875,58.1796875
    Q 72.166015625,56.095703125 72.166015625,51.9921875
    L 72.166015625,18.046875
    Q 72.166015625,13.943359375 70.060546875,11.859375
    Q 67.955078125,9.775390625 63.787109375,9.775390625
    Z
    M 15.51171875,13.578125
    L 63.72265625,13.578125
    Q 65.935546875,13.578125 67.138671875,14.759765625
    Q 68.341796875,15.94140625 68.341796875,18.240234375
    L 68.341796875,51.798828125
    Q 68.341796875,54.09765625 67.138671875,55.279296875
    Q 65.935546875,56.4609375 63.72265625,56.4609375
    L 15.51171875,56.4609375
    Q 13.255859375,56.4609375 12.0634765625,55.279296875
    Q 10.87109375,54.09765625 10.87109375,51.798828125
    L 10.87109375,18.240234375
    Q 10.87109375,15.94140625 12.0634765625,14.759765625
    Q 13.255859375,13.578125 15.51171875,13.578125
    Z
    M 47.673828125,12.826171875
    L 47.673828125,57.27734375
    L 51.390625,57.27734375
    L 51.390625,12.826171875
    Z
    M 56.71875,46.1484375
    Q 56.16015625,46.1484375 55.7412109375,46.5673828125
    Q 55.322265625,46.986328125 55.322265625,47.5234375
    Q 55.322265625,48.08203125 55.7412109375,48.490234375
    Q 56.16015625,48.8984375 56.71875,48.8984375
    L 63.03515625,48.8984375
    Q 63.615234375,48.8984375 64.0234375,48.490234375
    Q 64.431640625,48.08203125 64.431640625,47.5234375
    Q 64.431640625,46.986328125 64.0234375,46.5673828125
    Q 63.615234375,46.1484375 63.03515625,46.1484375
    Z
    M 56.71875,38.88671875
    Q 56.16015625,38.88671875 55.7412109375,39.294921875
    Q 55.322265625,39.703125 55.322265625,40.26171875
    Q 55.322265625,40.8203125 55.7412109375,41.2177734375
    Q 56.16015625,41.615234375 56.71875,41.615234375
    L 63.03515625,41.615234375
    Q 63.615234375,41.615234375 64.0234375,41.2177734375
    Q 64.431640625,40.8203125 64.431640625,40.26171875
    Q 64.431640625,39.703125 64.0234375,39.294921875
    Q 63.615234375,38.88671875 63.03515625,38.88671875
    Z
    M 56.71875,31.625
    Q 56.16015625,31.625 55.7412109375,32.0224609375
    Q 55.322265625,32.419921875 55.322265625,32.978515625
    Q 55.322265625,33.537109375 55.7412109375,33.9345703125
    Q 56.16015625,34.33203125 56.71875,34.33203125
    L 63.03515625,34.33203125
    Q 63.615234375,34.33203125 64.0234375,33.9345703125
    Q 64.431640625,33.537109375 64.431640625,32.978515625
    Q 64.431640625,32.419921875 64.0234375,32.0224609375
    Q 63.615234375,31.625 63.03515625,31.625
    Z
' />
</g>`},splitView:{viewBox:`0 0 79.234 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 27.478515625,12.203125
    L 27.478515625,57.814453125
    L 31.302734375,57.814453125
    L 31.302734375,12.203125
    Z
    M 47.931640625,12.203125
    L 47.931640625,57.814453125
    L 51.734375,57.814453125
    L 51.734375,12.203125
    Z
    M 15.42578125,9.75390625
    Q 11.279296875,9.75390625 9.173828125,11.8271484375
    Q 7.068359375,13.900390625 7.068359375,18.025390625
    L 7.068359375,51.970703125
    Q 7.068359375,56.095703125 9.173828125,58.1796875
    Q 11.279296875,60.263671875 15.42578125,60.263671875
    L 63.787109375,60.263671875
    Q 67.955078125,60.263671875 70.060546875,58.1689453125
    Q 72.166015625,56.07421875 72.166015625,51.970703125
    L 72.166015625,18.025390625
    Q 72.166015625,13.921875 70.060546875,11.837890625
    Q 67.955078125,9.75390625 63.787109375,9.75390625
    Z
    M 15.51171875,13.556640625
    L 63.72265625,13.556640625
    Q 65.935546875,13.556640625 67.138671875,14.73828125
    Q 68.341796875,15.919921875 68.341796875,18.240234375
    L 68.341796875,51.77734375
    Q 68.341796875,54.09765625 67.138671875,55.279296875
    Q 65.935546875,56.4609375 63.72265625,56.4609375
    L 15.51171875,56.4609375
    Q 13.255859375,56.4609375 12.0634765625,55.279296875
    Q 10.87109375,54.09765625 10.87109375,51.77734375
    L 10.87109375,18.240234375
    Q 10.87109375,15.919921875 12.0634765625,14.73828125
    Q 13.255859375,13.556640625 15.51171875,13.556640625
    Z
' />
</g>`},camera:{viewBox:`0 0 67.633 76.055`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-76.0546875)'>
<path fill='currentColor' d='
    M 8.98046875,47.56640625
    Q 8.056640625,47.56640625 7.5625,48.0712890625
    Q 7.068359375,48.576171875 7.068359375,49.5
    L 7.068359375,56.50390625
    Q 7.068359375,60.62890625 9.173828125,62.7021484375
    Q 11.279296875,64.775390625 15.42578125,64.775390625
    L 22.4296875,64.775390625
    Q 23.353515625,64.775390625 23.8583984375,64.28125
    Q 24.36328125,63.787109375 24.36328125,62.86328125
    Q 24.36328125,61.9609375 23.8583984375,61.466796875
    Q 23.353515625,60.97265625 22.4296875,60.97265625
    L 15.51171875,60.97265625
    Q 13.255859375,60.97265625 12.0634765625,59.791015625
    Q 10.87109375,58.609375 10.87109375,56.2890625
    L 10.87109375,49.5
    Q 10.87109375,48.576171875 10.3876953125,48.0712890625
    Q 9.904296875,47.56640625 8.98046875,47.56640625
    Z
    M 58.65234375,47.56640625
    Q 57.75,47.56640625 57.255859375,48.0712890625
    Q 56.76171875,48.576171875 56.76171875,49.5
    L 56.76171875,56.2890625
    Q 56.76171875,58.609375 55.5478515625,59.791015625
    Q 54.333984375,60.97265625 52.12109375,60.97265625
    L 45.203125,60.97265625
    Q 44.279296875,60.97265625 43.7744140625,61.466796875
    Q 43.26953125,61.9609375 43.26953125,62.86328125
    Q 43.26953125,63.787109375 43.7744140625,64.28125
    Q 44.279296875,64.775390625 45.203125,64.775390625
    L 52.20703125,64.775390625
    Q 56.375,64.775390625 58.4697265625,62.69140625
    Q 60.564453125,60.607421875 60.564453125,56.50390625
    L 60.564453125,49.5
    Q 60.564453125,47.56640625 58.65234375,47.56640625
    Z
    M 15.42578125,11.279296875
    Q 11.279296875,11.279296875 9.173828125,13.3525390625
    Q 7.068359375,15.42578125 7.068359375,19.55078125
    L 7.068359375,26.5546875
    Q 7.068359375,28.48828125 8.98046875,28.48828125
    Q 9.8828125,28.48828125 10.376953125,27.9833984375
    Q 10.87109375,27.478515625 10.87109375,26.5546875
    L 10.87109375,19.765625
    Q 10.87109375,17.4453125 12.0634765625,16.263671875
    Q 13.255859375,15.08203125 15.51171875,15.08203125
    L 22.4296875,15.08203125
    Q 23.353515625,15.08203125 23.8583984375,14.587890625
    Q 24.36328125,14.09375 24.36328125,13.19140625
    Q 24.36328125,12.267578125 23.8583984375,11.7734375
    Q 23.353515625,11.279296875 22.4296875,11.279296875
    Z
    M 45.203125,11.279296875
    Q 44.279296875,11.279296875 43.7744140625,11.7734375
    Q 43.26953125,12.267578125 43.26953125,13.19140625
    Q 43.26953125,14.09375 43.7744140625,14.587890625
    Q 44.279296875,15.08203125 45.203125,15.08203125
    L 52.12109375,15.08203125
    Q 54.333984375,15.08203125 55.5478515625,16.263671875
    Q 56.76171875,17.4453125 56.76171875,19.765625
    L 56.76171875,26.5546875
    Q 56.76171875,27.478515625 57.2451171875,27.9833984375
    Q 57.728515625,28.48828125 58.65234375,28.48828125
    Q 59.576171875,28.48828125 60.0703125,27.9833984375
    Q 60.564453125,27.478515625 60.564453125,26.5546875
    L 60.564453125,19.55078125
    Q 60.564453125,15.447265625 58.4697265625,13.36328125
    Q 56.375,11.279296875 52.20703125,11.279296875
    Z
    M 21.291015625,25.5234375
    Q 19.185546875,25.5234375 18.111328125,26.5869140625
    Q 17.037109375,27.650390625 17.037109375,29.734375
    L 17.037109375,44.494140625
    Q 17.037109375,46.599609375 18.111328125,47.6630859375
    Q 19.185546875,48.7265625 21.291015625,48.7265625
    L 24.87890625,48.7265625
    Q 25.716796875,48.7265625 26.103515625,48.919921875
    Q 26.490234375,49.11328125 26.984375,49.650390625
    L 28.166015625,50.939453125
    Q 28.703125,51.541015625 29.3154296875,51.8095703125
    Q 29.927734375,52.078125 30.958984375,52.078125
    L 36.5234375,52.078125
    Q 37.576171875,52.078125 38.177734375,51.798828125
    Q 38.779296875,51.51953125 39.31640625,50.939453125
    L 40.4765625,49.650390625
    Q 40.9921875,49.091796875 41.37890625,48.9091796875
    Q 41.765625,48.7265625 42.603515625,48.7265625
    L 46.36328125,48.7265625
    Q 48.46875,48.7265625 49.54296875,47.6630859375
    Q 50.6171875,46.599609375 50.6171875,44.494140625
    L 50.6171875,29.734375
    Q 50.6171875,27.650390625 49.54296875,26.5869140625
    Q 48.46875,25.5234375 46.36328125,25.5234375
    Z
    M 33.859375,28.9609375
    Q 36.158203125,28.9609375 38.0380859375,30.056640625
    Q 39.91796875,31.15234375 41.03515625,33.04296875
    Q 42.15234375,34.93359375 42.15234375,37.275390625
    Q 42.15234375,39.595703125 41.03515625,41.4755859375
    Q 39.91796875,43.35546875 38.0380859375,44.47265625
    Q 36.158203125,45.58984375 33.859375,45.58984375
    Q 31.560546875,45.58984375 29.669921875,44.47265625
    Q 27.779296875,43.35546875 26.6513671875,41.4755859375
    Q 25.5234375,39.595703125 25.5234375,37.275390625
    Q 25.5234375,34.955078125 26.6513671875,33.064453125
    Q 27.779296875,31.173828125 29.669921875,30.0673828125
    Q 31.560546875,28.9609375 33.859375,28.9609375
    Z
    M 33.837890625,31.06640625
    Q 32.119140625,31.06640625 30.72265625,31.904296875
    Q 29.326171875,32.7421875 28.48828125,34.1494140625
    Q 27.650390625,35.556640625 27.650390625,37.275390625
    Q 27.650390625,38.994140625 28.48828125,40.390625
    Q 29.326171875,41.787109375 30.72265625,42.625
    Q 32.119140625,43.462890625 33.837890625,43.462890625
    Q 35.53515625,43.462890625 36.9423828125,42.625
    Q 38.349609375,41.787109375 39.1767578125,40.390625
    Q 40.00390625,38.994140625 40.00390625,37.275390625
    Q 40.00390625,35.556640625 39.1767578125,34.1494140625
    Q 38.349609375,32.7421875 36.9423828125,31.904296875
    Q 35.53515625,31.06640625 33.837890625,31.06640625
    Z
    M 45.4609375,41.765625
    Q 46.19140625,41.765625 46.70703125,42.2919921875
    Q 47.22265625,42.818359375 47.22265625,43.548828125
    Q 47.22265625,44.279296875 46.70703125,44.794921875
    Q 46.19140625,45.310546875 45.4609375,45.310546875
    Q 44.73046875,45.310546875 44.2041015625,44.794921875
    Q 43.677734375,44.279296875 43.677734375,43.548828125
    Q 43.677734375,42.818359375 44.2041015625,42.2919921875
    Q 44.73046875,41.765625 45.4609375,41.765625
    Z
' />
</g>`},pencil:{viewBox:`0 0 56.848 57.084`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-57.083984375)'>
<path fill='currentColor' d='
    M 13.53515625,9.216796875
    L 7.43359375,6.681640625
    Q 7.1328125,6.552734375 6.853515625,6.6923828125
    Q 6.57421875,6.83203125 6.4453125,7.1220703125
    Q 6.31640625,7.412109375 6.4453125,7.712890625
    L 9.130859375,13.642578125
    L 40.111328125,44.580078125
    L 44.515625,40.154296875
    Z
    M 46.814453125,42.388671875
    L 42.345703125,46.8359375
    L 44.966796875,49.4140625
    Q 45.93359375,50.380859375 46.9541015625,50.4560546875
    Q 47.974609375,50.53125 48.85546875,49.650390625
    L 49.62890625,48.876953125
    Q 50.53125,47.99609375 50.4775390625,46.9755859375
    Q 50.423828125,45.955078125 49.4140625,44.966796875
    Z
' />
</g>`},archive:{viewBox:`0 0 69.072 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 19.20703125,9.775390625
    Q 15.25390625,9.775390625 13.1806640625,11.8056640625
    Q 11.107421875,13.8359375 11.107421875,17.7890625
    L 11.107421875,44.623046875
    L 57.96484375,44.623046875
    L 57.96484375,17.7890625
    Q 57.96484375,13.8359375 55.8916015625,11.8056640625
    Q 53.818359375,9.775390625 49.84375,9.775390625
    Z
    M 25.265625,34.912109375
    L 43.806640625,34.912109375
    Q 44.64453125,34.912109375 45.1494140625,35.427734375
    Q 45.654296875,35.943359375 45.654296875,36.802734375
    L 45.654296875,37.640625
    Q 45.654296875,38.5 45.1494140625,39.0048828125
    Q 44.64453125,39.509765625 43.806640625,39.509765625
    L 25.265625,39.509765625
    Q 24.44921875,39.509765625 23.9443359375,39.0048828125
    Q 23.439453125,38.5 23.439453125,37.640625
    L 23.439453125,36.802734375
    Q 23.439453125,35.943359375 23.9443359375,35.427734375
    Q 24.44921875,34.912109375 25.265625,34.912109375
    Z
    M 11.55859375,48.060546875
    Q 9.345703125,48.060546875 8.20703125,49.328125
    Q 7.068359375,50.595703125 7.068359375,52.787109375
    L 7.068359375,55.537109375
    Q 7.068359375,57.75 8.2607421875,59.0068359375
    Q 9.453125,60.263671875 11.55859375,60.263671875
    L 57.4921875,60.263671875
    Q 59.705078125,60.263671875 60.8544921875,59.0068359375
    Q 62.00390625,57.75 62.00390625,55.537109375
    L 62.00390625,52.787109375
    Q 62.00390625,50.595703125 60.8544921875,49.328125
    Q 59.705078125,48.060546875 57.4921875,48.060546875
    Z
' />
</g>`},clock:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 18.068359375,37.619140625
    Q 17.359375,37.619140625 16.88671875,38.1025390625
    Q 16.4140625,38.5859375 16.4140625,39.294921875
    Q 16.4140625,39.982421875 16.88671875,40.4658203125
    Q 17.359375,40.94921875 18.068359375,40.94921875
    L 31.259765625,40.94921875
    L 31.259765625,58.458984375
    Q 31.259765625,59.146484375 31.7431640625,59.6298828125
    Q 32.2265625,60.11328125 32.9140625,60.11328125
    Q 33.623046875,60.11328125 34.1064453125,59.6298828125
    Q 34.58984375,59.146484375 34.58984375,58.458984375
    L 34.58984375,39.294921875
    Q 34.58984375,38.5859375 34.1064453125,38.1025390625
    Q 33.623046875,37.619140625 32.9140625,37.619140625
    Z
    M 32.935546875,12.4609375
    Q 28.31640625,12.4609375 24.1162109375,13.8681640625
    Q 19.916015625,15.275390625 16.4248046875,17.853515625
    Q 12.93359375,20.431640625 10.35546875,23.9228515625
    Q 7.77734375,27.4140625 6.3701171875,31.6142578125
    Q 4.962890625,35.814453125 4.962890625,40.43359375
    Q 4.962890625,45.07421875 6.3701171875,49.263671875
    Q 7.77734375,53.453125 10.35546875,56.955078125
    Q 12.93359375,60.45703125 16.4248046875,63.0244140625
    Q 19.916015625,65.591796875 24.1162109375,67.009765625
    Q 28.31640625,68.427734375 32.935546875,68.427734375
    Q 37.576171875,68.427734375 41.765625,67.009765625
    Q 45.955078125,65.591796875 49.45703125,63.0244140625
    Q 52.958984375,60.45703125 55.5263671875,56.955078125
    Q 58.09375,53.453125 59.51171875,49.263671875
    Q 60.9296875,45.07421875 60.9296875,40.43359375
    Q 60.9296875,35.814453125 59.51171875,31.6142578125
    Q 58.09375,27.4140625 55.5263671875,23.9228515625
    Q 52.958984375,20.431640625 49.45703125,17.853515625
    Q 45.955078125,15.275390625 41.765625,13.8681640625
    Q 37.576171875,12.4609375 32.935546875,12.4609375
    Z
    M 32.935546875,16.45703125
    Q 36.91015625,16.45703125 40.5087890625,17.6708984375
    Q 44.107421875,18.884765625 47.1044921875,21.0869140625
    Q 50.1015625,23.2890625 52.3037109375,26.2861328125
    Q 54.505859375,29.283203125 55.708984375,32.87109375
    Q 56.912109375,36.458984375 56.912109375,40.43359375
    Q 56.912109375,44.408203125 55.708984375,48.0068359375
    Q 54.505859375,51.60546875 52.3037109375,54.6025390625
    Q 50.1015625,57.599609375 47.1044921875,59.8017578125
    Q 44.107421875,62.00390625 40.5087890625,63.20703125
    Q 36.91015625,64.41015625 32.935546875,64.41015625
    Q 28.9609375,64.41015625 25.373046875,63.20703125
    Q 21.78515625,62.00390625 18.7880859375,59.8017578125
    Q 15.791015625,57.599609375 13.5888671875,54.6025390625
    Q 11.38671875,51.60546875 10.1728515625,48.0068359375
    Q 8.958984375,44.408203125 8.958984375,40.43359375
    Q 8.958984375,36.458984375 10.1728515625,32.87109375
    Q 11.38671875,29.283203125 13.5888671875,26.2861328125
    Q 15.791015625,23.2890625 18.7880859375,21.0869140625
    Q 21.78515625,18.884765625 25.373046875,17.6708984375
    Q 28.9609375,16.45703125 32.935546875,16.45703125
    Z
' />
</g>`},location:{viewBox:`0 0 61.811 73.348`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-73.34765625)'>
<path fill='currentColor' d='
    M 7.970703125,35.3203125
    Q 6.853515625,35.3203125 6.123046875,35.7822265625
    Q 5.392578125,36.244140625 5.048828125,36.9638671875
    Q 4.705078125,37.68359375 4.76953125,38.478515625
    Q 4.833984375,39.2734375 5.3173828125,39.9931640625
    Q 5.80078125,40.712890625 6.74609375,41.142578125
    L 51.884765625,62.1328125
    Q 53.15234375,62.734375 54.2587890625,62.6376953125
    Q 55.365234375,62.541015625 56.0849609375,61.896484375
    Q 56.8046875,61.251953125 56.955078125,60.1884765625
    Q 57.10546875,59.125 56.482421875,57.771484375
    L 35.53515625,12.869140625
    Q 35.041015625,11.837890625 34.2998046875,11.30078125
    Q 33.55859375,10.763671875 32.7314453125,10.6884765625
    Q 31.904296875,10.61328125 31.1845703125,10.95703125
    Q 30.46484375,11.30078125 30.0029296875,12.03125
    Q 29.541015625,12.76171875 29.541015625,13.857421875
    L 29.4765625,34.71875
    Q 29.4765625,35.234375 28.982421875,35.234375
    Z
' />
</g>`},note:{viewBox:`0 0 69.18 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.42578125,9.775390625
    Q 11.279296875,9.775390625 9.173828125,11.8486328125
    Q 7.068359375,13.921875 7.068359375,18.046875
    L 7.068359375,51.9921875
    Q 7.068359375,56.1171875 9.173828125,58.1904296875
    Q 11.279296875,60.263671875 15.42578125,60.263671875
    L 53.732421875,60.263671875
    Q 57.900390625,60.263671875 60.005859375,58.1796875
    Q 62.111328125,56.095703125 62.111328125,51.9921875
    L 62.111328125,18.046875
    Q 62.111328125,13.943359375 60.005859375,11.859375
    Q 57.900390625,9.775390625 53.732421875,9.775390625
    Z
    M 15.125,13.578125
    L 54.01171875,13.578125
    Q 56.052734375,13.578125 57.169921875,14.6630859375
    Q 58.287109375,15.748046875 58.287109375,17.875
    L 58.287109375,43.505859375
    Q 58.287109375,45.6328125 57.169921875,46.7177734375
    Q 56.052734375,47.802734375 54.01171875,47.802734375
    L 15.125,47.802734375
    Q 13.0625,47.802734375 11.966796875,46.7177734375
    Q 10.87109375,45.6328125 10.87109375,43.505859375
    L 10.87109375,17.875
    Q 10.87109375,15.748046875 11.966796875,14.6630859375
    Q 13.0625,13.578125 15.125,13.578125
    Z
    M 19.701171875,37.662109375
    Q 19.03515625,37.662109375 18.60546875,38.1025390625
    Q 18.17578125,38.54296875 18.17578125,39.1875
    Q 18.17578125,39.7890625 18.60546875,40.21875
    Q 19.03515625,40.6484375 19.701171875,40.6484375
    L 49.521484375,40.6484375
    Q 50.166015625,40.6484375 50.595703125,40.21875
    Q 51.025390625,39.7890625 51.025390625,39.1875
    Q 51.025390625,38.54296875 50.595703125,38.1025390625
    Q 50.166015625,37.662109375 49.521484375,37.662109375
    Z
    M 19.701171875,29.197265625
    Q 19.03515625,29.197265625 18.60546875,29.626953125
    Q 18.17578125,30.056640625 18.17578125,30.658203125
    Q 18.17578125,31.302734375 18.60546875,31.7431640625
    Q 19.03515625,32.18359375 19.701171875,32.18359375
    L 49.521484375,32.18359375
    Q 50.166015625,32.18359375 50.595703125,31.7431640625
    Q 51.025390625,31.302734375 51.025390625,30.658203125
    Q 51.025390625,30.056640625 50.595703125,29.626953125
    Q 50.166015625,29.197265625 49.521484375,29.197265625
    Z
    M 19.701171875,20.732421875
    Q 19.03515625,20.732421875 18.60546875,21.1513671875
    Q 18.17578125,21.5703125 18.17578125,22.193359375
    Q 18.17578125,22.837890625 18.60546875,23.2783203125
    Q 19.03515625,23.71875 19.701171875,23.71875
    L 38.908203125,23.71875
    Q 39.552734375,23.71875 39.982421875,23.2783203125
    Q 40.412109375,22.837890625 40.412109375,22.193359375
    Q 40.412109375,21.5703125 39.982421875,21.1513671875
    Q 39.552734375,20.732421875 38.908203125,20.732421875
    Z
' />
</g>`},chevronRight:{viewBox:`0 0 47.674 62.734`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.734375)'>
<path fill='currentColor' d='
    M 37.060546875,31.3671875
    Q 37.060546875,30.916015625 36.888671875,30.5185546875
    Q 36.716796875,30.12109375 36.373046875,29.798828125
    L 14.287109375,8.55078125
    Q 13.6640625,7.927734375 12.76171875,7.927734375
    Q 12.16015625,7.927734375 11.6767578125,8.20703125
    Q 11.193359375,8.486328125 10.9033203125,8.9697265625
    Q 10.61328125,9.453125 10.61328125,10.076171875
    Q 10.61328125,10.935546875 11.236328125,11.580078125
    L 31.818359375,31.3671875
    L 11.236328125,51.17578125
    Q 10.61328125,51.8203125 10.61328125,52.6796875
    Q 10.61328125,53.28125 10.9033203125,53.7646484375
    Q 11.193359375,54.248046875 11.6767578125,54.52734375
    Q 12.16015625,54.806640625 12.76171875,54.806640625
    Q 13.6640625,54.806640625 14.287109375,54.18359375
    L 36.373046875,32.935546875
    Q 36.716796875,32.61328125 36.888671875,32.2265625
    Q 37.060546875,31.83984375 37.060546875,31.3671875
    Z
' />
</g>`},chevronLeft:{viewBox:`0 0 33.537 62.734`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.734375)'>
<path fill='currentColor' d='
    M 3.544921875,31.3671875
    Q 3.544921875,31.83984375 3.716796875,32.2265625
    Q 3.888671875,32.61328125 4.232421875,32.935546875
    L 26.318359375,54.18359375
    Q 26.94140625,54.806640625 27.84375,54.806640625
    Q 28.4453125,54.806640625 28.9287109375,54.52734375
    Q 29.412109375,54.248046875 29.7021484375,53.7646484375
    Q 29.9921875,53.28125 29.9921875,52.6796875
    Q 29.9921875,51.8203125 29.369140625,51.17578125
    L 8.787109375,31.3671875
    L 29.369140625,11.580078125
    Q 29.9921875,10.935546875 29.9921875,10.076171875
    Q 29.9921875,9.453125 29.7021484375,8.9697265625
    Q 29.412109375,8.486328125 28.9287109375,8.20703125
    Q 28.4453125,7.927734375 27.84375,7.927734375
    Q 26.94140625,7.927734375 26.318359375,8.55078125
    L 4.232421875,29.798828125
    Q 3.888671875,30.12109375 3.716796875,30.5185546875
    Q 3.544921875,30.916015625 3.544921875,31.3671875
    Z
' />
</g>`},creditcard:{viewBox:`0 0 78.826 62.477`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.4765625)'>
<path fill='currentColor' d='
    M 18.240234375,16.328125
    L 25.029296875,16.328125
    Q 26.25390625,16.328125 27.005859375,17.0693359375
    Q 27.7578125,17.810546875 27.7578125,18.9921875
    L 27.7578125,24.126953125
    Q 27.7578125,25.287109375 27.005859375,26.0390625
    Q 26.25390625,26.791015625 25.029296875,26.791015625
    L 18.240234375,26.791015625
    Q 17.015625,26.791015625 16.263671875,26.0390625
    Q 15.51171875,25.287109375 15.51171875,24.126953125
    L 15.51171875,18.9921875
    Q 15.51171875,17.810546875 16.263671875,17.0693359375
    Q 17.015625,16.328125 18.240234375,16.328125
    Z
    M 7.068359375,37.619140625
    L 71.7578125,37.619140625
    L 71.7578125,43.849609375
    L 7.068359375,43.849609375
    Z
    M 15.42578125,7.884765625
    Q 11.279296875,7.884765625 9.173828125,9.96875
    Q 7.068359375,12.052734375 7.068359375,16.177734375
    L 7.068359375,46.298828125
    Q 7.068359375,50.423828125 9.173828125,52.5078125
    Q 11.279296875,54.591796875 15.42578125,54.591796875
    L 63.37890625,54.591796875
    Q 67.546875,54.591796875 69.65234375,52.4970703125
    Q 71.7578125,50.40234375 71.7578125,46.298828125
    L 71.7578125,16.177734375
    Q 71.7578125,12.07421875 69.65234375,9.9794921875
    Q 67.546875,7.884765625 63.37890625,7.884765625
    Z
' />
</g>`},qr:{viewBox:`0 0 67.633 76.055`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-76.0546875)'>
<path fill='currentColor' d='
    M 8.98046875,47.56640625
    Q 8.056640625,47.56640625 7.5625,48.0712890625
    Q 7.068359375,48.576171875 7.068359375,49.5
    L 7.068359375,56.50390625
    Q 7.068359375,60.62890625 9.173828125,62.7021484375
    Q 11.279296875,64.775390625 15.42578125,64.775390625
    L 22.4296875,64.775390625
    Q 23.353515625,64.775390625 23.8583984375,64.28125
    Q 24.36328125,63.787109375 24.36328125,62.86328125
    Q 24.36328125,61.9609375 23.8583984375,61.466796875
    Q 23.353515625,60.97265625 22.4296875,60.97265625
    L 15.51171875,60.97265625
    Q 13.255859375,60.97265625 12.0634765625,59.791015625
    Q 10.87109375,58.609375 10.87109375,56.2890625
    L 10.87109375,49.5
    Q 10.87109375,48.576171875 10.3876953125,48.0712890625
    Q 9.904296875,47.56640625 8.98046875,47.56640625
    Z
    M 58.65234375,47.56640625
    Q 57.75,47.56640625 57.255859375,48.0712890625
    Q 56.76171875,48.576171875 56.76171875,49.5
    L 56.76171875,56.2890625
    Q 56.76171875,58.609375 55.5478515625,59.791015625
    Q 54.333984375,60.97265625 52.12109375,60.97265625
    L 45.203125,60.97265625
    Q 44.279296875,60.97265625 43.7744140625,61.466796875
    Q 43.26953125,61.9609375 43.26953125,62.86328125
    Q 43.26953125,63.787109375 43.7744140625,64.28125
    Q 44.279296875,64.775390625 45.203125,64.775390625
    L 52.20703125,64.775390625
    Q 56.375,64.775390625 58.4697265625,62.69140625
    Q 60.564453125,60.607421875 60.564453125,56.50390625
    L 60.564453125,49.5
    Q 60.564453125,47.56640625 58.65234375,47.56640625
    Z
    M 15.42578125,11.279296875
    Q 11.279296875,11.279296875 9.173828125,13.3525390625
    Q 7.068359375,15.42578125 7.068359375,19.55078125
    L 7.068359375,26.5546875
    Q 7.068359375,28.48828125 8.98046875,28.48828125
    Q 9.8828125,28.48828125 10.376953125,27.9833984375
    Q 10.87109375,27.478515625 10.87109375,26.5546875
    L 10.87109375,19.765625
    Q 10.87109375,17.4453125 12.0634765625,16.263671875
    Q 13.255859375,15.08203125 15.51171875,15.08203125
    L 22.4296875,15.08203125
    Q 23.353515625,15.08203125 23.8583984375,14.587890625
    Q 24.36328125,14.09375 24.36328125,13.19140625
    Q 24.36328125,12.267578125 23.8583984375,11.7734375
    Q 23.353515625,11.279296875 22.4296875,11.279296875
    Z
    M 45.203125,11.279296875
    Q 44.279296875,11.279296875 43.7744140625,11.7734375
    Q 43.26953125,12.267578125 43.26953125,13.19140625
    Q 43.26953125,14.09375 43.7744140625,14.587890625
    Q 44.279296875,15.08203125 45.203125,15.08203125
    L 52.12109375,15.08203125
    Q 54.333984375,15.08203125 55.5478515625,16.263671875
    Q 56.76171875,17.4453125 56.76171875,19.765625
    L 56.76171875,26.5546875
    Q 56.76171875,27.478515625 57.2451171875,27.9833984375
    Q 57.728515625,28.48828125 58.65234375,28.48828125
    Q 59.576171875,28.48828125 60.0703125,27.9833984375
    Q 60.564453125,27.478515625 60.564453125,26.5546875
    L 60.564453125,19.55078125
    Q 60.564453125,15.447265625 58.4697265625,13.36328125
    Q 56.375,11.279296875 52.20703125,11.279296875
    Z
    M 21.52734375,24.556640625
    Q 21.01171875,24.556640625 20.6572265625,24.900390625
    Q 20.302734375,25.244140625 20.302734375,25.78125
    L 20.302734375,35.578125
    Q 20.302734375,36.09375 20.6572265625,36.4482421875
    Q 21.01171875,36.802734375 21.52734375,36.802734375
    L 31.32421875,36.802734375
    Q 31.861328125,36.802734375 32.205078125,36.4482421875
    Q 32.548828125,36.09375 32.548828125,35.578125
    L 32.548828125,25.78125
    Q 32.548828125,25.244140625 32.205078125,24.900390625
    Q 31.861328125,24.556640625 31.32421875,24.556640625
    Z
    M 22.751953125,27.005859375
    L 30.099609375,27.005859375
    L 30.099609375,34.375
    L 22.751953125,34.375
    Z
    M 24.900390625,29.154296875
    L 24.900390625,32.2265625
    L 27.97265625,32.2265625
    L 27.97265625,29.154296875
    Z
    M 21.52734375,39.251953125
    Q 21.01171875,39.251953125 20.6572265625,39.595703125
    Q 20.302734375,39.939453125 20.302734375,40.4765625
    L 20.302734375,50.2734375
    Q 20.302734375,50.7890625 20.6572265625,51.1435546875
    Q 21.01171875,51.498046875 21.52734375,51.498046875
    L 31.32421875,51.498046875
    Q 31.861328125,51.498046875 32.205078125,51.1435546875
    Q 32.548828125,50.7890625 32.548828125,50.2734375
    L 32.548828125,40.4765625
    Q 32.548828125,39.939453125 32.205078125,39.595703125
    Q 31.861328125,39.251953125 31.32421875,39.251953125
    Z
    M 22.751953125,41.6796875
    L 30.099609375,41.6796875
    L 30.099609375,49.048828125
    L 22.751953125,49.048828125
    Z
    M 24.900390625,43.849609375
    L 24.900390625,46.921875
    L 27.97265625,46.921875
    L 27.97265625,43.849609375
    Z
    M 36.201171875,39.251953125
    Q 35.685546875,39.251953125 35.3310546875,39.595703125
    Q 34.9765625,39.939453125 34.9765625,40.4765625
    L 34.9765625,50.2734375
    Q 34.9765625,50.7890625 35.3310546875,51.1435546875
    Q 35.685546875,51.498046875 36.201171875,51.498046875
    L 45.998046875,51.498046875
    Q 46.53515625,51.498046875 46.87890625,51.1435546875
    Q 47.22265625,50.7890625 47.22265625,50.2734375
    L 47.22265625,40.4765625
    Q 47.22265625,39.939453125 46.87890625,39.595703125
    Q 46.53515625,39.251953125 45.998046875,39.251953125
    Z
    M 37.42578125,41.6796875
    L 44.7734375,41.6796875
    L 44.7734375,49.048828125
    L 37.42578125,49.048828125
    Z
    M 39.57421875,43.849609375
    L 39.57421875,46.921875
    L 42.646484375,46.921875
    L 42.646484375,43.849609375
    Z
    M 35.341796875,24.921875
    L 35.341796875,27.994140625
    L 38.392578125,27.994140625
    L 38.392578125,24.921875
    Z
    M 43.806640625,24.921875
    L 43.806640625,27.994140625
    L 46.857421875,27.994140625
    L 46.857421875,24.921875
    Z
    M 39.552734375,29.154296875
    L 39.552734375,32.2265625
    L 42.625,32.2265625
    L 42.625,29.154296875
    Z
    M 35.341796875,33.408203125
    L 35.341796875,36.458984375
    L 38.392578125,36.458984375
    L 38.392578125,33.408203125
    Z
    M 43.806640625,33.408203125
    L 43.806640625,36.458984375
    L 46.857421875,36.458984375
    L 46.857421875,33.408203125
    Z
' />
</g>`},checkmarkCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.935546875,12.4609375
    Q 28.31640625,12.4609375 24.126953125,13.87890625
    Q 19.9375,15.296875 16.435546875,17.8642578125
    Q 12.93359375,20.431640625 10.3662109375,23.93359375
    Q 7.798828125,27.435546875 6.380859375,31.625
    Q 4.962890625,35.814453125 4.962890625,40.43359375
    Q 4.962890625,45.07421875 6.380859375,49.263671875
    Q 7.798828125,53.453125 10.3662109375,56.9443359375
    Q 12.93359375,60.435546875 16.435546875,63.013671875
    Q 19.9375,65.591796875 24.126953125,67.009765625
    Q 28.31640625,68.427734375 32.935546875,68.427734375
    Q 37.576171875,68.427734375 41.765625,67.009765625
    Q 45.955078125,65.591796875 49.4462890625,63.013671875
    Q 52.9375,60.435546875 55.515625,56.9443359375
    Q 58.09375,53.453125 59.51171875,49.263671875
    Q 60.9296875,45.07421875 60.9296875,40.43359375
    Q 60.9296875,35.814453125 59.51171875,31.625
    Q 58.09375,27.435546875 55.515625,23.93359375
    Q 52.9375,20.431640625 49.4462890625,17.8642578125
    Q 45.955078125,15.296875 41.765625,13.87890625
    Q 37.576171875,12.4609375 32.935546875,12.4609375
    Z
    M 29.86328125,26.984375
    Q 30.46484375,26.984375 30.9697265625,27.263671875
    Q 31.474609375,27.54296875 31.83984375,28.123046875
    L 45.2890625,49.220703125
    Q 45.50390625,49.564453125 45.6865234375,49.97265625
    Q 45.869140625,50.380859375 45.869140625,50.767578125
    Q 45.869140625,51.583984375 45.2568359375,52.078125
    Q 44.64453125,52.572265625 43.87109375,52.572265625
    Q 43.3984375,52.572265625 42.9580078125,52.3037109375
    Q 42.517578125,52.03515625 42.1953125,51.498046875
    L 29.755859375,31.732421875
    L 23.568359375,39.466796875
    Q 23.16015625,40.046875 22.73046875,40.2509765625
    Q 22.30078125,40.455078125 21.806640625,40.455078125
    Q 20.990234375,40.455078125 20.4423828125,39.8857421875
    Q 19.89453125,39.31640625 19.89453125,38.521484375
    Q 19.89453125,38.11328125 20.044921875,37.7158203125
    Q 20.1953125,37.318359375 20.474609375,36.974609375
    L 27.779296875,28.123046875
    Q 28.251953125,27.5 28.7568359375,27.2421875
    Q 29.26171875,26.984375 29.86328125,26.984375
    Z
' />
</g>`},xmarkCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.935546875,12.4609375
    Q 28.31640625,12.4609375 24.126953125,13.87890625
    Q 19.9375,15.296875 16.435546875,17.8642578125
    Q 12.93359375,20.431640625 10.3662109375,23.93359375
    Q 7.798828125,27.435546875 6.380859375,31.625
    Q 4.962890625,35.814453125 4.962890625,40.43359375
    Q 4.962890625,45.07421875 6.380859375,49.263671875
    Q 7.798828125,53.453125 10.3662109375,56.9443359375
    Q 12.93359375,60.435546875 16.435546875,63.013671875
    Q 19.9375,65.591796875 24.126953125,67.009765625
    Q 28.31640625,68.427734375 32.935546875,68.427734375
    Q 37.576171875,68.427734375 41.765625,67.009765625
    Q 45.955078125,65.591796875 49.4462890625,63.013671875
    Q 52.9375,60.435546875 55.515625,56.9443359375
    Q 58.09375,53.453125 59.51171875,49.263671875
    Q 60.9296875,45.07421875 60.9296875,40.43359375
    Q 60.9296875,35.814453125 59.51171875,31.625
    Q 58.09375,27.435546875 55.515625,23.93359375
    Q 52.9375,20.431640625 49.4462890625,17.8642578125
    Q 45.955078125,15.296875 41.765625,13.87890625
    Q 37.576171875,12.4609375 32.935546875,12.4609375
    Z
    M 23.611328125,29.08984375
    Q 24.44921875,29.08984375 25.05078125,29.69140625
    L 32.935546875,37.619140625
    L 40.841796875,29.69140625
    Q 41.400390625,29.08984375 42.259765625,29.08984375
    Q 43.09765625,29.08984375 43.677734375,29.669921875
    Q 44.2578125,30.25 44.2578125,31.087890625
    Q 44.2578125,31.947265625 43.677734375,32.505859375
    L 35.75,40.412109375
    L 43.69921875,48.361328125
    Q 44.279296875,48.94140625 44.279296875,49.779296875
    Q 44.279296875,50.57421875 43.69921875,51.1435546875
    Q 43.119140625,51.712890625 42.302734375,51.712890625
    Q 41.529296875,51.712890625 40.927734375,51.111328125
    L 32.935546875,43.162109375
    L 24.986328125,51.08984375
    Q 24.384765625,51.669921875 23.611328125,51.669921875
    Q 22.7734375,51.669921875 22.2041015625,51.111328125
    Q 21.634765625,50.552734375 21.634765625,49.736328125
    Q 21.634765625,48.919921875 22.21484375,48.33984375
    L 30.142578125,40.412109375
    L 22.21484375,32.484375
    Q 21.634765625,31.8828125 21.634765625,31.087890625
    Q 21.634765625,30.25 22.2041015625,29.669921875
    Q 22.7734375,29.08984375 23.611328125,29.08984375
    Z
' />
</g>`},info:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.935546875,12.4609375
    Q 28.31640625,12.4609375 24.126953125,13.87890625
    Q 19.9375,15.296875 16.435546875,17.8642578125
    Q 12.93359375,20.431640625 10.3662109375,23.93359375
    Q 7.798828125,27.435546875 6.380859375,31.625
    Q 4.962890625,35.814453125 4.962890625,40.43359375
    Q 4.962890625,45.07421875 6.380859375,49.263671875
    Q 7.798828125,53.453125 10.3662109375,56.9443359375
    Q 12.93359375,60.435546875 16.435546875,63.013671875
    Q 19.9375,65.591796875 24.126953125,67.009765625
    Q 28.31640625,68.427734375 32.935546875,68.427734375
    Q 37.576171875,68.427734375 41.765625,67.009765625
    Q 45.955078125,65.591796875 49.4462890625,63.013671875
    Q 52.9375,60.435546875 55.515625,56.9443359375
    Q 58.09375,53.453125 59.51171875,49.263671875
    Q 60.9296875,45.07421875 60.9296875,40.43359375
    Q 60.9296875,35.814453125 59.51171875,31.625
    Q 58.09375,27.435546875 55.515625,23.93359375
    Q 52.9375,20.431640625 49.4462890625,17.8642578125
    Q 45.955078125,15.296875 41.765625,13.87890625
    Q 37.576171875,12.4609375 32.935546875,12.4609375
    Z
    M 27.908203125,24.642578125
    L 39.509765625,24.642578125
    Q 40.283203125,24.642578125 40.798828125,25.13671875
    Q 41.314453125,25.630859375 41.314453125,26.404296875
    Q 41.314453125,27.11328125 40.798828125,27.62890625
    Q 40.283203125,28.14453125 39.509765625,28.14453125
    L 35.6640625,28.14453125
    L 35.6640625,43.484375
    Q 35.6640625,44.451171875 35.169921875,45.0634765625
    Q 34.67578125,45.67578125 33.73046875,45.67578125
    L 28.31640625,45.67578125
    Q 27.564453125,45.67578125 27.048828125,45.16015625
    Q 26.533203125,44.64453125 26.533203125,43.935546875
    Q 26.533203125,43.162109375 27.048828125,42.66796875
    Q 27.564453125,42.173828125 28.31640625,42.173828125
    L 31.75390625,42.173828125
    L 31.75390625,28.14453125
    L 27.908203125,28.14453125
    Q 27.134765625,28.14453125 26.619140625,27.62890625
    Q 26.103515625,27.11328125 26.103515625,26.404296875
    Q 26.103515625,25.630859375 26.619140625,25.13671875
    Q 27.134765625,24.642578125 27.908203125,24.642578125
    Z
    M 32.7421875,50.66015625
    Q 33.6875,50.66015625 34.439453125,51.111328125
    Q 35.19140625,51.5625 35.642578125,52.3251953125
    Q 36.09375,53.087890625 36.09375,54.01171875
    Q 36.09375,55.4296875 35.126953125,56.41796875
    Q 34.16015625,57.40625 32.7421875,57.40625
    Q 31.345703125,57.40625 30.3681640625,56.41796875
    Q 29.390625,55.4296875 29.390625,54.01171875
    Q 29.390625,53.087890625 29.841796875,52.3251953125
    Q 30.29296875,51.5625 31.0556640625,51.111328125
    Q 31.818359375,50.66015625 32.7421875,50.66015625
    Z
' />
</g>`},bolt:{viewBox:`0 0 54.141 90.836`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-90.8359375)'>
<path fill='currentColor' d='
    M 8.03515625,41.916015625
    Q 8.03515625,42.345703125 8.2177734375,42.7216796875
    Q 8.400390625,43.09765625 8.701171875,43.505859375
    L 33.7734375,74.873046875
    Q 34.375,75.646484375 35.083984375,75.818359375
    Q 35.79296875,75.990234375 36.3623046875,75.7001953125
    Q 36.931640625,75.41015625 37.146484375,74.7333984375
    Q 37.361328125,74.056640625 37.017578125,73.111328125
    L 28.66015625,50.509765625
    L 44.4296875,50.509765625
    Q 45.181640625,50.509765625 45.6435546875,50.0478515625
    Q 46.10546875,49.5859375 46.10546875,48.919921875
    Q 46.10546875,48.51171875 45.93359375,48.125
    Q 45.76171875,47.73828125 45.4609375,47.330078125
    L 20.388671875,15.962890625
    Q 19.787109375,15.2109375 19.078125,15.0283203125
    Q 18.369140625,14.845703125 17.7998046875,15.146484375
    Q 17.23046875,15.447265625 17.0048828125,16.11328125
    Q 16.779296875,16.779296875 17.14453125,17.724609375
    L 25.48046875,40.34765625
    L 9.732421875,40.34765625
    Q 8.958984375,40.34765625 8.4970703125,40.798828125
    Q 8.03515625,41.25 8.03515625,41.916015625
    Z
' />
</g>`},wifi:{viewBox:`0 0 73.82 60.543`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-60.54296875)'>
<path fill='currentColor' d='
    M 36.91015625,7.390625
    Q 36.48046875,7.390625 36.029296875,7.6591796875
    Q 35.578125,7.927734375 34.8046875,8.6796875
    L 28.123046875,15.103515625
    Q 27.822265625,15.404296875 27.7470703125,15.7373046875
    Q 27.671875,16.0703125 27.88671875,16.4140625
    Q 28.74609375,17.57421875 30.12109375,18.5625
    Q 31.49609375,19.55078125 33.236328125,20.1630859375
    Q 34.9765625,20.775390625 36.91015625,20.775390625
    Q 38.80078125,20.775390625 40.51953125,20.1845703125
    Q 42.23828125,19.59375 43.61328125,18.626953125
    Q 44.98828125,17.66015625 45.84765625,16.54296875
    Q 46.126953125,16.177734375 46.0732421875,15.791015625
    Q 46.01953125,15.404296875 45.71875,15.103515625
    L 39.015625,8.6796875
    Q 38.2421875,7.90625 37.791015625,7.6484375
    Q 37.33984375,7.390625 36.91015625,7.390625
    Z
    M 20.75390625,22.494140625
    L 16.5859375,26.662109375
    Q 16.2421875,27.005859375 16.220703125,27.392578125
    Q 16.19921875,27.779296875 16.5,28.14453125
    Q 18.583984375,30.6796875 21.7421875,32.677734375
    Q 24.900390625,34.67578125 28.7783203125,35.8251953125
    Q 32.65625,36.974609375 36.91015625,36.974609375
    Q 41.1640625,36.974609375 45.052734375,35.8251953125
    Q 48.94140625,34.67578125 52.099609375,32.6884765625
    Q 55.2578125,30.701171875 57.3203125,28.14453125
    Q 57.62109375,27.779296875 57.599609375,27.37109375
    Q 57.578125,26.962890625 57.234375,26.662109375
    L 53.06640625,22.515625
    Q 52.658203125,22.12890625 52.1962890625,22.12890625
    Q 51.734375,22.12890625 51.369140625,22.537109375
    Q 49.650390625,24.384765625 47.3408203125,25.845703125
    Q 45.03125,27.306640625 42.3671875,28.1337890625
    Q 39.703125,28.9609375 36.91015625,28.939453125
    Q 34.16015625,28.9609375 31.49609375,28.14453125
    Q 28.83203125,27.328125 26.533203125,25.888671875
    Q 24.234375,24.44921875 22.55859375,22.6015625
    Q 22.150390625,22.171875 21.6669921875,22.12890625
    Q 21.18359375,22.0859375 20.75390625,22.494140625
    Z
    M 9.23828125,34.07421875
    L 5.54296875,37.833984375
    Q 5.220703125,38.177734375 5.19921875,38.5859375
    Q 5.177734375,38.994140625 5.45703125,39.359375
    Q 7.884765625,42.345703125 11.30078125,44.8701171875
    Q 14.716796875,47.39453125 18.8525390625,49.2529296875
    Q 22.98828125,51.111328125 27.5751953125,52.1318359375
    Q 32.162109375,53.15234375 36.91015625,53.15234375
    Q 41.6796875,53.15234375 46.255859375,52.12109375
    Q 50.83203125,51.08984375 54.95703125,49.2421875
    Q 59.08203125,47.39453125 62.498046875,44.8701171875
    Q 65.9140625,42.345703125 68.36328125,39.359375
    Q 68.642578125,38.994140625 68.642578125,38.5859375
    Q 68.642578125,38.177734375 68.27734375,37.833984375
    L 64.58203125,34.138671875
    Q 64.1953125,33.751953125 63.72265625,33.7412109375
    Q 63.25,33.73046875 62.86328125,34.095703125
    Q 57.814453125,39.509765625 51.1650390625,42.32421875
    Q 44.515625,45.138671875 36.91015625,45.138671875
    Q 29.34765625,45.138671875 22.7197265625,42.32421875
    Q 16.091796875,39.509765625 11,34.1171875
    Q 10.61328125,33.708984375 10.119140625,33.708984375
    Q 9.625,33.708984375 9.23828125,34.07421875
    Z
' />
</g>`},person:{viewBox:`0 0 60.629 68.063`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-68.0625)'>
<path fill='currentColor' d='
    M 11.6015625,9.259765625
    Q 9.49609375,9.259765625 8.2822265625,10.2158203125
    Q 7.068359375,11.171875 7.068359375,12.8046875
    Q 7.068359375,14.953125 8.1103515625,17.294921875
    Q 9.15234375,19.63671875 11.12890625,21.8603515625
    Q 13.10546875,24.083984375 15.94140625,25.8671875
    Q 18.77734375,27.650390625 22.3974609375,28.7138671875
    Q 26.017578125,29.77734375 30.314453125,29.77734375
    Q 34.611328125,29.77734375 38.2314453125,28.7138671875
    Q 41.8515625,27.650390625 44.6875,25.8671875
    Q 47.5234375,24.083984375 49.5107421875,21.8603515625
    Q 51.498046875,19.63671875 52.529296875,17.294921875
    Q 53.560546875,14.953125 53.560546875,12.8046875
    Q 53.560546875,11.171875 52.357421875,10.2158203125
    Q 51.154296875,9.259765625 49.02734375,9.259765625
    Z
    M 30.3359375,34.740234375
    Q 28.1015625,34.740234375 26.1142578125,35.6748046875
    Q 24.126953125,36.609375 22.6015625,38.263671875
    Q 21.076171875,39.91796875 20.2060546875,42.130859375
    Q 19.3359375,44.34375 19.3359375,46.900390625
    Q 19.3359375,49.4140625 20.2060546875,51.5732421875
    Q 21.076171875,53.732421875 22.6123046875,55.365234375
    Q 24.1484375,56.998046875 26.1357421875,57.900390625
    Q 28.123046875,58.802734375 30.3359375,58.802734375
    Q 32.5703125,58.802734375 34.5576171875,57.9111328125
    Q 36.544921875,57.01953125 38.0703125,55.408203125
    Q 39.595703125,53.796875 40.4765625,51.6376953125
    Q 41.357421875,49.478515625 41.357421875,46.943359375
    Q 41.357421875,43.505859375 39.8427734375,40.7451171875
    Q 38.328125,37.984375 35.8251953125,36.3623046875
    Q 33.322265625,34.740234375 30.3359375,34.740234375
    Z
' />
</g>`},bell:{viewBox:`0 0 64.109 84.025`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.025390625)'>
<path fill='currentColor' d='
    M 9.7109375,23.76171875
    Q 8.056640625,23.76171875 7.1005859375,24.5673828125
    Q 6.14453125,25.373046875 6.14453125,26.705078125
    Q 6.14453125,28.1015625 6.9287109375,29.390625
    Q 7.712890625,30.6796875 8.8837890625,31.92578125
    Q 10.0546875,33.171875 11.236328125,34.396484375
    Q 12.03125,35.255859375 12.5146484375,36.48046875
    Q 12.998046875,37.705078125 13.27734375,39.166015625
    Q 13.556640625,40.626953125 13.728515625,42.1630859375
    Q 13.900390625,43.69921875 14.029296875,45.181640625
    Q 14.22265625,50.080078125 15.296875,53.947265625
    Q 16.37109375,57.814453125 18.5732421875,60.45703125
    Q 20.775390625,63.099609375 24.36328125,64.32421875
    Q 25.072265625,67.07421875 27.0810546875,68.921875
    Q 29.08984375,70.76953125 32.0546875,70.76953125
    Q 34.998046875,70.76953125 37.017578125,68.921875
    Q 39.037109375,67.07421875 39.74609375,64.32421875
    Q 43.3125,63.099609375 45.525390625,60.45703125
    Q 47.73828125,57.814453125 48.8125,53.947265625
    Q 49.88671875,50.080078125 50.080078125,45.181640625
    Q 50.208984375,43.69921875 50.3701171875,42.1630859375
    Q 50.53125,40.626953125 50.8212890625,39.166015625
    Q 51.111328125,37.705078125 51.5947265625,36.48046875
    Q 52.078125,35.255859375 52.873046875,34.396484375
    Q 54.0546875,33.171875 55.2255859375,31.92578125
    Q 56.396484375,30.6796875 57.1806640625,29.390625
    Q 57.96484375,28.1015625 57.96484375,26.705078125
    Q 57.96484375,25.373046875 57.0087890625,24.5673828125
    Q 56.052734375,23.76171875 54.376953125,23.76171875
    Z
    M 32.0546875,13.255859375
    Q 29.77734375,13.255859375 27.9833984375,14.244140625
    Q 26.189453125,15.232421875 25.0830078125,16.84375
    Q 23.9765625,18.455078125 23.76171875,20.345703125
    L 40.34765625,20.345703125
    Q 40.1328125,18.455078125 39.0263671875,16.84375
    Q 37.919921875,15.232421875 36.1259765625,14.244140625
    Q 34.33203125,13.255859375 32.0546875,13.255859375
    Z
' />
</g>`},ellipsis:{viewBox:`0 0 60.092 31.045`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-31.044921875)'>
<path fill='currentColor' d='
    M 9.990234375,10.505859375
    Q 8.59375,10.505859375 7.455078125,11.1826171875
    Q 6.31640625,11.859375 5.6396484375,12.998046875
    Q 4.962890625,14.13671875 4.962890625,15.51171875
    Q 4.962890625,16.908203125 5.6396484375,18.046875
    Q 6.31640625,19.185546875 7.455078125,19.8623046875
    Q 8.59375,20.5390625 9.990234375,20.5390625
    Q 11.365234375,20.5390625 12.5146484375,19.8623046875
    Q 13.6640625,19.185546875 14.3408203125,18.046875
    Q 15.017578125,16.908203125 15.017578125,15.51171875
    Q 15.017578125,14.13671875 14.3408203125,12.998046875
    Q 13.6640625,11.859375 12.5146484375,11.1826171875
    Q 11.365234375,10.505859375 9.990234375,10.505859375
    Z
    M 30.03515625,10.505859375
    Q 28.66015625,10.505859375 27.521484375,11.1826171875
    Q 26.3828125,11.859375 25.7060546875,12.998046875
    Q 25.029296875,14.13671875 25.029296875,15.51171875
    Q 25.029296875,16.908203125 25.7060546875,18.046875
    Q 26.3828125,19.185546875 27.521484375,19.8623046875
    Q 28.66015625,20.5390625 30.03515625,20.5390625
    Q 31.431640625,20.5390625 32.5703125,19.8623046875
    Q 33.708984375,19.185546875 34.3857421875,18.046875
    Q 35.0625,16.908203125 35.0625,15.51171875
    Q 35.0625,14.13671875 34.3857421875,12.998046875
    Q 33.708984375,11.859375 32.5703125,11.1826171875
    Q 31.431640625,10.505859375 30.03515625,10.505859375
    Z
    M 50.1015625,10.505859375
    Q 48.7265625,10.505859375 47.5771484375,11.1826171875
    Q 46.427734375,11.859375 45.7509765625,12.998046875
    Q 45.07421875,14.13671875 45.07421875,15.51171875
    Q 45.07421875,16.908203125 45.7509765625,18.046875
    Q 46.427734375,19.185546875 47.5771484375,19.8623046875
    Q 48.7265625,20.5390625 50.1015625,20.5390625
    Q 51.498046875,20.5390625 52.63671875,19.8623046875
    Q 53.775390625,19.185546875 54.4521484375,18.046875
    Q 55.12890625,16.908203125 55.12890625,15.51171875
    Q 55.12890625,14.13671875 54.4521484375,12.998046875
    Q 53.775390625,11.859375 52.63671875,11.1826171875
    Q 51.498046875,10.505859375 50.1015625,10.505859375
    Z
' />
</g>`},plusCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.935546875,12.4609375
    Q 28.31640625,12.4609375 24.126953125,13.87890625
    Q 19.9375,15.296875 16.435546875,17.8642578125
    Q 12.93359375,20.431640625 10.3662109375,23.93359375
    Q 7.798828125,27.435546875 6.380859375,31.625
    Q 4.962890625,35.814453125 4.962890625,40.43359375
    Q 4.962890625,45.07421875 6.380859375,49.263671875
    Q 7.798828125,53.453125 10.3662109375,56.9443359375
    Q 12.93359375,60.435546875 16.435546875,63.013671875
    Q 19.9375,65.591796875 24.126953125,67.009765625
    Q 28.31640625,68.427734375 32.935546875,68.427734375
    Q 37.576171875,68.427734375 41.765625,67.009765625
    Q 45.955078125,65.591796875 49.4462890625,63.013671875
    Q 52.9375,60.435546875 55.515625,56.9443359375
    Q 58.09375,53.453125 59.51171875,49.263671875
    Q 60.9296875,45.07421875 60.9296875,40.43359375
    Q 60.9296875,35.814453125 59.51171875,31.625
    Q 58.09375,27.435546875 55.515625,23.93359375
    Q 52.9375,20.431640625 49.4462890625,17.8642578125
    Q 45.955078125,15.296875 41.765625,13.87890625
    Q 37.576171875,12.4609375 32.935546875,12.4609375
    Z
    M 19.701171875,40.412109375
    Q 19.701171875,39.53125 20.2919921875,38.97265625
    Q 20.8828125,38.4140625 21.78515625,38.4140625
    L 30.89453125,38.4140625
    L 30.89453125,29.283203125
    Q 30.89453125,28.40234375 31.453125,27.8115234375
    Q 32.01171875,27.220703125 32.892578125,27.220703125
    Q 33.81640625,27.220703125 34.396484375,27.80078125
    Q 34.9765625,28.380859375 34.9765625,29.283203125
    L 34.9765625,38.4140625
    L 44.0859375,38.4140625
    Q 44.98828125,38.4140625 45.5791015625,38.97265625
    Q 46.169921875,39.53125 46.169921875,40.412109375
    Q 46.169921875,41.3359375 45.58984375,41.916015625
    Q 45.009765625,42.49609375 44.0859375,42.49609375
    L 34.9765625,42.49609375
    L 34.9765625,51.60546875
    Q 34.9765625,52.5078125 34.396484375,53.0986328125
    Q 33.81640625,53.689453125 32.892578125,53.689453125
    Q 32.01171875,53.689453125 31.453125,53.0986328125
    Q 30.89453125,52.5078125 30.89453125,51.60546875
    L 30.89453125,42.49609375
    L 21.78515625,42.49609375
    Q 20.861328125,42.49609375 20.28125,41.916015625
    Q 19.701171875,41.3359375 19.701171875,40.412109375
    Z
' />
</g>`},minusCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.935546875,12.4609375
    Q 28.31640625,12.4609375 24.126953125,13.87890625
    Q 19.9375,15.296875 16.435546875,17.8642578125
    Q 12.93359375,20.431640625 10.3662109375,23.93359375
    Q 7.798828125,27.435546875 6.380859375,31.625
    Q 4.962890625,35.814453125 4.962890625,40.43359375
    Q 4.962890625,45.07421875 6.380859375,49.263671875
    Q 7.798828125,53.453125 10.3662109375,56.9443359375
    Q 12.93359375,60.435546875 16.435546875,63.013671875
    Q 19.9375,65.591796875 24.126953125,67.009765625
    Q 28.31640625,68.427734375 32.935546875,68.427734375
    Q 37.576171875,68.427734375 41.765625,67.009765625
    Q 45.955078125,65.591796875 49.4462890625,63.013671875
    Q 52.9375,60.435546875 55.515625,56.9443359375
    Q 58.09375,53.453125 59.51171875,49.263671875
    Q 60.9296875,45.07421875 60.9296875,40.43359375
    Q 60.9296875,35.814453125 59.51171875,31.625
    Q 58.09375,27.435546875 55.515625,23.93359375
    Q 52.9375,20.431640625 49.4462890625,17.8642578125
    Q 45.955078125,15.296875 41.765625,13.87890625
    Q 37.576171875,12.4609375 32.935546875,12.4609375
    Z
    M 21.333984375,38.349609375
    L 44.580078125,38.349609375
    Q 45.58984375,38.349609375 46.2236328125,38.88671875
    Q 46.857421875,39.423828125 46.857421875,40.369140625
    Q 46.857421875,41.357421875 46.2451171875,41.9052734375
    Q 45.6328125,42.453125 44.580078125,42.453125
    L 21.333984375,42.453125
    Q 20.28125,42.453125 19.658203125,41.9052734375
    Q 19.03515625,41.357421875 19.03515625,40.369140625
    Q 19.03515625,39.423828125 19.6796875,38.88671875
    Q 20.32421875,38.349609375 21.333984375,38.349609375
    Z
' />
</g>`},arrowsUpDown:{viewBox:`0 0 77.645 71.65`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-71.650390625)'>
<path fill='currentColor' d='
    M 21.78515625,60.779296875
    Q 22.47265625,61.48828125 23.375,61.4775390625
    Q 24.27734375,61.466796875 24.943359375,60.779296875
    L 38.97265625,46.53515625
    Q 39.294921875,46.212890625 39.4775390625,45.783203125
    Q 39.66015625,45.353515625 39.66015625,44.9453125
    Q 39.66015625,44.021484375 39.0693359375,43.44140625
    Q 38.478515625,42.861328125 37.576171875,42.861328125
    Q 36.6953125,42.861328125 36.072265625,43.484375
    L 29.970703125,49.7578125
    L 25.244140625,55.04296875
    L 25.458984375,48.791015625
    L 25.458984375,12.310546875
    Q 25.458984375,11.38671875 24.8681640625,10.78515625
    Q 24.27734375,10.18359375 23.353515625,10.18359375
    Q 22.4296875,10.18359375 21.849609375,10.78515625
    Q 21.26953125,11.38671875 21.26953125,12.310546875
    L 21.26953125,48.791015625
    L 21.484375,55.04296875
    L 16.7578125,49.7578125
    L 10.634765625,43.484375
    Q 10.01171875,42.861328125 9.15234375,42.861328125
    Q 8.228515625,42.861328125 7.6484375,43.44140625
    Q 7.068359375,44.021484375 7.068359375,44.9453125
    Q 7.068359375,45.353515625 7.2509765625,45.783203125
    Q 7.43359375,46.212890625 7.755859375,46.53515625
    Z
    M 55.859375,10.87109375
    Q 55.171875,10.162109375 54.2587890625,10.1728515625
    Q 53.345703125,10.18359375 52.701171875,10.87109375
    L 38.671875,25.158203125
    Q 38.349609375,25.48046875 38.1669921875,25.8994140625
    Q 37.984375,26.318359375 37.984375,26.7265625
    Q 37.984375,27.671875 38.564453125,28.2412109375
    Q 39.14453125,28.810546875 40.068359375,28.810546875
    Q 40.927734375,28.810546875 41.55078125,28.1875
    L 47.673828125,21.935546875
    L 52.400390625,16.62890625
    L 52.185546875,22.90234375
    L 52.185546875,59.361328125
    Q 52.185546875,60.263671875 52.765625,60.865234375
    Q 53.345703125,61.466796875 54.26953125,61.466796875
    Q 55.193359375,61.466796875 55.7841796875,60.865234375
    Q 56.375,60.263671875 56.375,59.361328125
    L 56.375,22.90234375
    L 56.16015625,16.62890625
    L 60.88671875,21.935546875
    L 66.98828125,28.1875
    Q 67.611328125,28.810546875 68.4921875,28.810546875
    Q 69.39453125,28.810546875 69.9853515625,28.2412109375
    Q 70.576171875,27.671875 70.576171875,26.7265625
    Q 70.576171875,26.318359375 70.3935546875,25.8994140625
    Q 70.2109375,25.48046875 69.888671875,25.158203125
    Z
' />
</g>`},cartBadge:{viewBox:`0 0 85.551 85.336`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-85.3359375)'>
<path fill='currentColor' d='
    M 27.908203125,26.876953125
    Q 25.09375,26.876953125 23.58984375,28.4775390625
    Q 22.0859375,30.078125 21.677734375,32.828125
    L 17.123046875,64.0234375
    L 7.412109375,64.0234375
    Q 6.681640625,64.0234375 6.1767578125,64.560546875
    Q 5.671875,65.09765625 5.671875,65.806640625
    Q 5.671875,66.537109375 6.1767578125,67.0634765625
    Q 6.681640625,67.58984375 7.412109375,67.58984375
    L 17.380859375,67.58984375
    Q 19.20703125,67.58984375 19.873046875,66.8916015625
    Q 20.5390625,66.193359375 20.732421875,64.83984375
    L 25.39453125,33.34375
    Q 25.587890625,32.01171875 26.3505859375,31.2275390625
    Q 27.11328125,30.443359375 28.380859375,30.443359375
    L 60.564453125,30.443359375
    Q 61.251953125,30.443359375 61.767578125,29.9384765625
    Q 62.283203125,29.43359375 62.283203125,28.66015625
    Q 62.283203125,27.88671875 61.767578125,27.3818359375
    Q 61.251953125,26.876953125 60.564453125,26.876953125
    Z
    M 20.345703125,57.212890625
    L 20.345703125,60.779296875
    L 48.876953125,60.779296875
    Q 48.748046875,59.984375 48.705078125,59.0068359375
    Q 48.662109375,58.029296875 48.7265625,57.212890625
    Z
    M 22.923828125,36.6953125
    L 22.923828125,40.26171875
    L 58.39453125,40.283203125
    Q 59.189453125,40.283203125 59.6728515625,40.6376953125
    Q 60.15625,40.9921875 60.478515625,41.701171875
    Q 61.767578125,41.1640625 63.1640625,40.884765625
    Q 64.560546875,40.60546875 66.04296875,40.60546875
    Q 65.333984375,38.62890625 63.98046875,37.662109375
    Q 62.626953125,36.6953125 60.435546875,36.6953125
    Z
    M 30.529296875,13.4921875
    Q 29.3046875,13.4921875 28.3056640625,14.072265625
    Q 27.306640625,14.65234375 26.7158203125,15.6513671875
    Q 26.125,16.650390625 26.125,17.875
    Q 26.125,19.099609375 26.7158203125,20.0986328125
    Q 27.306640625,21.09765625 28.3056640625,21.677734375
    Q 29.3046875,22.2578125 30.529296875,22.2578125
    Q 31.75390625,22.2578125 32.7421875,21.677734375
    Q 33.73046875,21.09765625 34.3212890625,20.0986328125
    Q 34.912109375,19.099609375 34.912109375,17.875
    Q 34.912109375,16.650390625 34.3212890625,15.6513671875
    Q 33.73046875,14.65234375 32.7421875,14.072265625
    Q 31.75390625,13.4921875 30.529296875,13.4921875
    Z
    M 56.16015625,13.4921875
    Q 54.935546875,13.4921875 53.9365234375,14.072265625
    Q 52.9375,14.65234375 52.3359375,15.6513671875
    Q 51.734375,16.650390625 51.734375,17.875
    Q 51.734375,19.099609375 52.3359375,20.0986328125
    Q 52.9375,21.09765625 53.9365234375,21.677734375
    Q 54.935546875,22.2578125 56.16015625,22.2578125
    Q 57.384765625,22.2578125 58.3837890625,21.677734375
    Q 59.3828125,21.09765625 59.9736328125,20.0986328125
    Q 60.564453125,19.099609375 60.564453125,17.875
    Q 60.564453125,16.650390625 59.9736328125,15.6513671875
    Q 59.3828125,14.65234375 58.3837890625,14.072265625
    Q 57.384765625,13.4921875 56.16015625,13.4921875
    Z
    M 66,44.064453125
    Q 63.142578125,44.064453125 60.62890625,45.138671875
    Q 58.115234375,46.212890625 56.1923828125,48.1357421875
    Q 54.26953125,50.05859375 53.1845703125,52.572265625
    Q 52.099609375,55.0859375 52.099609375,57.943359375
    Q 52.099609375,60.80078125 53.1845703125,63.314453125
    Q 54.26953125,65.828125 56.1923828125,67.7509765625
    Q 58.115234375,69.673828125 60.62890625,70.7587890625
    Q 63.142578125,71.84375 66,71.84375
    Q 68.857421875,71.84375 71.37109375,70.7587890625
    Q 73.884765625,69.673828125 75.796875,67.76171875
    Q 77.708984375,65.849609375 78.7939453125,63.3251953125
    Q 79.87890625,60.80078125 79.87890625,57.943359375
    Q 79.87890625,55.107421875 78.783203125,52.59375
    Q 77.6875,50.080078125 75.7646484375,48.1572265625
    Q 73.841796875,46.234375 71.328125,45.1494140625
    Q 68.814453125,44.064453125 66,44.064453125
    Z
    M 66,49.177734375
    Q 66.73046875,49.177734375 67.1494140625,49.607421875
    Q 67.568359375,50.037109375 67.568359375,50.74609375
    L 67.568359375,56.396484375
    L 73.197265625,56.396484375
    Q 73.90625,56.396484375 74.3359375,56.8154296875
    Q 74.765625,57.234375 74.765625,57.943359375
    Q 74.765625,58.673828125 74.3359375,59.0927734375
    Q 73.90625,59.51171875 73.197265625,59.51171875
    L 67.568359375,59.51171875
    L 67.568359375,65.140625
    Q 67.568359375,65.828125 67.1494140625,66.2685546875
    Q 66.73046875,66.708984375 66,66.708984375
    Q 65.291015625,66.708984375 64.8720703125,66.2685546875
    Q 64.453125,65.828125 64.453125,65.140625
    L 64.453125,59.51171875
    L 58.802734375,59.51171875
    Q 58.115234375,59.51171875 57.6748046875,59.0927734375
    Q 57.234375,58.673828125 57.234375,57.943359375
    Q 57.234375,57.234375 57.6748046875,56.8154296875
    Q 58.115234375,56.396484375 58.802734375,56.396484375
    L 64.453125,56.396484375
    L 64.453125,50.74609375
    Q 64.453125,50.037109375 64.8720703125,49.607421875
    Q 65.291015625,49.177734375 66,49.177734375
    Z
' />
</g>`},boxBadge:{viewBox:`0 0 89.955 88.688`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-88.6875)'>
<path fill='currentColor' d='
    M 39.896484375,41.37890625
    Q 39.896484375,42.15234375 39.359375,42.7109375
    Q 38.822265625,43.26953125 38.0703125,43.26953125
    L 14.974609375,43.26953125
    L 10.892578125,43.119140625
    L 12.67578125,44.837890625
    L 17.57421875,49.5
    Q 18.154296875,50.015625 18.154296875,50.810546875
    Q 18.154296875,51.5625 17.681640625,52.0458984375
    Q 17.208984375,52.529296875 16.478515625,52.529296875
    Q 16.091796875,52.529296875 15.8017578125,52.37890625
    Q 15.51171875,52.228515625 15.232421875,51.970703125
    L 6.294921875,42.75390625
    Q 5.9296875,42.41015625 5.80078125,42.0771484375
    Q 5.671875,41.744140625 5.671875,41.37890625
    Q 5.671875,41.03515625 5.80078125,40.7021484375
    Q 5.9296875,40.369140625 6.294921875,40.025390625
    L 15.232421875,30.830078125
    Q 15.51171875,30.55078125 15.8017578125,30.4111328125
    Q 16.091796875,30.271484375 16.478515625,30.271484375
    Q 17.208984375,30.271484375 17.681640625,30.765625
    Q 18.154296875,31.259765625 18.154296875,31.990234375
    Q 18.154296875,32.78515625 17.57421875,33.279296875
    L 12.67578125,37.962890625
    L 10.9140625,39.66015625
    L 14.974609375,39.509765625
    L 38.0703125,39.509765625
    Q 38.822265625,39.509765625 39.359375,40.068359375
    Q 39.896484375,40.626953125 39.896484375,41.37890625
    Z
    M 58.09375,14.501953125
    L 58.09375,42.646484375
    L 84.08984375,57.341796875
    Q 84.283203125,56.58984375 84.283203125,55.4296875
    L 84.283203125,33.515625
    Q 84.283203125,30.830078125 83.3701171875,29.498046875
    Q 82.45703125,28.166015625 80.630859375,27.134765625
    L 58.673828125,14.759765625
    Q 58.544921875,14.6953125 58.39453125,14.6201171875
    Q 58.244140625,14.544921875 58.09375,14.501953125
    Z
    M 54.65625,14.501953125
    Q 54.505859375,14.544921875 54.35546875,14.6201171875
    Q 54.205078125,14.6953125 54.076171875,14.759765625
    L 32.119140625,27.134765625
    Q 30.314453125,28.166015625 29.390625,29.498046875
    Q 28.466796875,30.830078125 28.466796875,33.515625
    L 28.466796875,55.4296875
    Q 28.466796875,56.58984375 28.681640625,57.341796875
    L 54.65625,42.646484375
    Z
    M 56.375,45.654296875
    L 30.25,60.392578125
    Q 30.765625,60.908203125 31.66796875,61.40234375
    L 42.0234375,67.267578125
    L 68.36328125,52.400390625
    Z
    M 71.865234375,54.376953125
    L 45.482421875,69.244140625
    L 51.86328125,72.853515625
    Q 54.205078125,74.185546875 56.375,74.185546875
    Q 58.56640625,74.185546875 60.908203125,72.853515625
    L 81.103515625,61.40234375
    Q 81.5546875,61.166015625 81.8876953125,60.9189453125
    Q 82.220703125,60.671875 82.5,60.392578125
    Z
' />
</g>`},percent:{viewBox:`0 0 63.68 74.873`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-74.873046875)'>
<path fill='currentColor' d='
    M 16.349609375,38.392578125
    Q 13.470703125,38.392578125 11.38671875,39.91796875
    Q 9.302734375,41.443359375 8.185546875,44.2578125
    Q 7.068359375,47.072265625 7.068359375,50.91796875
    Q 7.068359375,54.763671875 8.185546875,57.5673828125
    Q 9.302734375,60.37109375 11.38671875,61.8857421875
    Q 13.470703125,63.400390625 16.349609375,63.400390625
    Q 19.228515625,63.400390625 21.3017578125,61.8857421875
    Q 23.375,60.37109375 24.4921875,57.578125
    Q 25.609375,54.78515625 25.609375,50.91796875
    Q 25.609375,47.072265625 24.5029296875,44.2685546875
    Q 23.396484375,41.46484375 21.3232421875,39.9287109375
    Q 19.25,38.392578125 16.349609375,38.392578125
    Z
    M 16.349609375,41.701171875
    Q 18.927734375,41.701171875 20.3779296875,44.1396484375
    Q 21.828125,46.578125 21.828125,50.91796875
    Q 21.828125,55.2578125 20.3671875,57.685546875
    Q 18.90625,60.11328125 16.349609375,60.11328125
    Q 13.79296875,60.11328125 12.33203125,57.6748046875
    Q 10.87109375,55.236328125 10.87109375,50.91796875
    Q 10.87109375,46.578125 12.3212890625,44.1396484375
    Q 13.771484375,41.701171875 16.349609375,41.701171875
    Z
    M 47.3515625,11.4296875
    Q 44.451171875,11.4296875 42.3779296875,12.955078125
    Q 40.3046875,14.48046875 39.1875,17.2841796875
    Q 38.0703125,20.087890625 38.0703125,23.955078125
    Q 38.0703125,27.80078125 39.1875,30.59375
    Q 40.3046875,33.38671875 42.388671875,34.912109375
    Q 44.47265625,36.4375 47.3515625,36.4375
    Q 50.23046875,36.4375 52.3037109375,34.9228515625
    Q 54.376953125,33.408203125 55.494140625,30.6044921875
    Q 56.611328125,27.80078125 56.611328125,23.955078125
    Q 56.611328125,20.109375 55.5048828125,17.294921875
    Q 54.3984375,14.48046875 52.314453125,12.955078125
    Q 50.23046875,11.4296875 47.3515625,11.4296875
    Z
    M 47.3515625,14.716796875
    Q 49.908203125,14.716796875 51.3583984375,17.166015625
    Q 52.80859375,19.615234375 52.80859375,23.955078125
    Q 52.80859375,28.2734375 51.3583984375,30.701171875
    Q 49.908203125,33.12890625 47.3515625,33.12890625
    Q 44.7734375,33.12890625 43.3232421875,30.6904296875
    Q 41.873046875,28.251953125 41.873046875,23.955078125
    Q 41.873046875,19.615234375 43.3232421875,17.166015625
    Q 44.7734375,14.716796875 47.3515625,14.716796875
    Z
    M 14.48046875,11.322265625
    Q 13.814453125,11.708984375 13.6103515625,12.50390625
    Q 13.40625,13.298828125 14.0078125,14.1796875
    L 46.3203125,62.755859375
    Q 46.921875,63.615234375 47.7060546875,63.765625
    Q 48.490234375,63.916015625 49.11328125,63.572265625
    Q 49.779296875,63.185546875 50.015625,62.3583984375
    Q 50.251953125,61.53125 49.650390625,60.671875
    L 17.359375,11.966796875
    Q 16.80078125,11.193359375 15.962890625,11.0751953125
    Q 15.125,10.95703125 14.48046875,11.322265625
    Z
' />
</g>`},chartLine:{viewBox:`0 0 73.455 71.736`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-71.736328125)'>
<path fill='currentColor' d='
    M 7.068359375,12.24609375
    L 7.068359375,59.576171875
    Q 7.068359375,60.328125 7.6162109375,60.908203125
    Q 8.1640625,61.48828125 8.98046875,61.48828125
    Q 9.796875,61.48828125 10.333984375,60.908203125
    Q 10.87109375,60.328125 10.87109375,59.576171875
    L 10.87109375,14.73828125
    Q 10.87109375,14.029296875 11.580078125,14.029296875
    L 64.474609375,14.029296875
    Q 65.248046875,14.029296875 65.8173828125,13.4814453125
    Q 66.38671875,12.93359375 66.38671875,12.138671875
    Q 66.38671875,11.34375 65.8173828125,10.7958984375
    Q 65.248046875,10.248046875 64.474609375,10.248046875
    L 9.06640625,10.248046875
    Q 8.1640625,10.248046875 7.6162109375,10.7958984375
    Q 7.068359375,11.34375 7.068359375,12.24609375
    Z
    M 9.474609375,29.626953125
    L 9.474609375,32.978515625
    L 27.7578125,43.548828125
    L 40.626953125,32.333984375
    L 61.509765625,45.095703125
    L 63.078125,42.625
    L 40.43359375,28.810546875
    L 27.5,40.08984375
    Z
    M 27.220703125,36.48046875
    Q 25.931640625,36.48046875 24.8896484375,37.103515625
    Q 23.84765625,37.7265625 23.2138671875,38.779296875
    Q 22.580078125,39.83203125 22.580078125,41.099609375
    Q 22.580078125,42.3671875 23.2138671875,43.419921875
    Q 23.84765625,44.47265625 24.8896484375,45.095703125
    Q 25.931640625,45.71875 27.220703125,45.71875
    Q 28.48828125,45.71875 29.541015625,45.095703125
    Q 30.59375,44.47265625 31.216796875,43.419921875
    Q 31.83984375,42.3671875 31.83984375,41.099609375
    Q 31.83984375,39.83203125 31.216796875,38.779296875
    Q 30.59375,37.7265625 29.541015625,37.103515625
    Q 28.48828125,36.48046875 27.220703125,36.48046875
    Z
    M 40.34765625,26.0390625
    Q 39.05859375,26.0390625 38.0166015625,26.662109375
    Q 36.974609375,27.28515625 36.3515625,28.337890625
    Q 35.728515625,29.390625 35.728515625,30.658203125
    Q 35.728515625,31.947265625 36.3515625,32.9892578125
    Q 36.974609375,34.03125 38.0166015625,34.654296875
    Q 39.05859375,35.27734375 40.34765625,35.27734375
    Q 41.615234375,35.27734375 42.66796875,34.654296875
    Q 43.720703125,34.03125 44.34375,32.9892578125
    Q 44.966796875,31.947265625 44.966796875,30.658203125
    Q 44.966796875,29.390625 44.34375,28.337890625
    Q 43.720703125,27.28515625 42.66796875,26.662109375
    Q 41.615234375,26.0390625 40.34765625,26.0390625
    Z
    M 61.1875,38.88671875
    Q 59.919921875,38.88671875 58.8671875,39.5205078125
    Q 57.814453125,40.154296875 57.19140625,41.1962890625
    Q 56.568359375,42.23828125 56.568359375,43.52734375
    Q 56.568359375,44.794921875 57.19140625,45.84765625
    Q 57.814453125,46.900390625 58.8671875,47.5234375
    Q 59.919921875,48.146484375 61.1875,48.146484375
    Q 62.4765625,48.146484375 63.5185546875,47.5234375
    Q 64.560546875,46.900390625 65.18359375,45.84765625
    Q 65.806640625,44.794921875 65.806640625,43.52734375
    Q 65.806640625,42.23828125 65.18359375,41.1962890625
    Q 64.560546875,40.154296875 63.5185546875,39.5205078125
    Q 62.4765625,38.88671875 61.1875,38.88671875
    Z
' />
</g>`},listBullets:{viewBox:`0 0 69.395 49.049`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-49.048828125)'>
<path fill='currentColor' d='
    M 10.44140625,37.791015625
    Q 9.49609375,37.791015625 8.7333984375,38.2421875
    Q 7.970703125,38.693359375 7.51953125,39.4560546875
    Q 7.068359375,40.21875 7.068359375,41.1640625
    Q 7.068359375,42.087890625 7.51953125,42.861328125
    Q 7.970703125,43.634765625 8.7333984375,44.0859375
    Q 9.49609375,44.537109375 10.44140625,44.537109375
    Q 11.365234375,44.537109375 12.138671875,44.0859375
    Q 12.912109375,43.634765625 13.36328125,42.861328125
    Q 13.814453125,42.087890625 13.814453125,41.1640625
    Q 13.814453125,40.21875 13.36328125,39.4560546875
    Q 12.912109375,38.693359375 12.138671875,38.2421875
    Q 11.365234375,37.791015625 10.44140625,37.791015625
    Z
    M 22.38671875,39.251953125
    Q 21.591796875,39.251953125 21.0439453125,39.7998046875
    Q 20.49609375,40.34765625 20.49609375,41.1640625
    Q 20.49609375,41.958984375 21.0439453125,42.5068359375
    Q 21.591796875,43.0546875 22.38671875,43.0546875
    L 60.392578125,43.0546875
    Q 61.208984375,43.0546875 61.767578125,42.5068359375
    Q 62.326171875,41.958984375 62.326171875,41.1640625
    Q 62.326171875,40.34765625 61.767578125,39.7998046875
    Q 61.208984375,39.251953125 60.392578125,39.251953125
    Z
    M 10.44140625,21.140625
    Q 9.49609375,21.140625 8.7333984375,21.6025390625
    Q 7.970703125,22.064453125 7.51953125,22.8271484375
    Q 7.068359375,23.58984375 7.068359375,24.513671875
    Q 7.068359375,25.458984375 7.51953125,26.2216796875
    Q 7.970703125,26.984375 8.7333984375,27.435546875
    Q 9.49609375,27.88671875 10.44140625,27.88671875
    Q 11.365234375,27.88671875 12.138671875,27.435546875
    Q 12.912109375,26.984375 13.36328125,26.2216796875
    Q 13.814453125,25.458984375 13.814453125,24.513671875
    Q 13.814453125,23.58984375 13.36328125,22.8271484375
    Q 12.912109375,22.064453125 12.138671875,21.6025390625
    Q 11.365234375,21.140625 10.44140625,21.140625
    Z
    M 22.38671875,22.623046875
    Q 21.591796875,22.623046875 21.0439453125,23.1708984375
    Q 20.49609375,23.71875 20.49609375,24.513671875
    Q 20.49609375,25.330078125 21.0439453125,25.8779296875
    Q 21.591796875,26.42578125 22.38671875,26.42578125
    L 60.392578125,26.42578125
    Q 61.208984375,26.42578125 61.767578125,25.8779296875
    Q 62.326171875,25.330078125 62.326171875,24.513671875
    Q 62.326171875,23.71875 61.767578125,23.1708984375
    Q 61.208984375,22.623046875 60.392578125,22.623046875
    Z
    M 10.44140625,4.51171875
    Q 9.49609375,4.51171875 8.7333984375,4.962890625
    Q 7.970703125,5.4140625 7.51953125,6.1767578125
    Q 7.068359375,6.939453125 7.068359375,7.884765625
    Q 7.068359375,8.80859375 7.51953125,9.5712890625
    Q 7.970703125,10.333984375 8.7333984375,10.7958984375
    Q 9.49609375,11.2578125 10.44140625,11.2578125
    Q 11.365234375,11.2578125 12.138671875,10.7958984375
    Q 12.912109375,10.333984375 13.36328125,9.5712890625
    Q 13.814453125,8.80859375 13.814453125,7.884765625
    Q 13.814453125,6.939453125 13.36328125,6.1767578125
    Q 12.912109375,5.4140625 12.138671875,4.962890625
    Q 11.365234375,4.51171875 10.44140625,4.51171875
    Z
    M 22.38671875,5.97265625
    Q 21.591796875,5.97265625 21.0439453125,6.5205078125
    Q 20.49609375,7.068359375 20.49609375,7.884765625
    Q 20.49609375,8.6796875 21.0439453125,9.2275390625
    Q 21.591796875,9.775390625 22.38671875,9.775390625
    L 60.392578125,9.775390625
    Q 61.208984375,9.775390625 61.767578125,9.2275390625
    Q 62.326171875,8.6796875 62.326171875,7.884765625
    Q 62.326171875,7.068359375 61.767578125,6.5205078125
    Q 61.208984375,5.97265625 60.392578125,5.97265625
    Z
' />
</g>`},checkmarkSquare:{viewBox:`0 0 64.646 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 15.42578125,9.75390625
    Q 11.279296875,9.75390625 9.173828125,11.8271484375
    Q 7.068359375,13.900390625 7.068359375,18.025390625
    L 7.068359375,51.970703125
    Q 7.068359375,56.095703125 9.173828125,58.1796875
    Q 11.279296875,60.263671875 15.42578125,60.263671875
    L 49.19921875,60.263671875
    Q 53.388671875,60.263671875 55.4833984375,58.1689453125
    Q 57.578125,56.07421875 57.578125,51.970703125
    L 57.578125,18.025390625
    Q 57.578125,13.921875 55.4833984375,11.837890625
    Q 53.388671875,9.75390625 49.19921875,9.75390625
    Z
    M 29.26171875,21.5703125
    Q 29.86328125,21.5703125 30.3681640625,21.849609375
    Q 30.873046875,22.12890625 31.23828125,22.708984375
    L 44.6875,43.806640625
    Q 44.90234375,44.150390625 45.0849609375,44.55859375
    Q 45.267578125,44.966796875 45.267578125,45.353515625
    Q 45.267578125,46.169921875 44.6552734375,46.6640625
    Q 44.04296875,47.158203125 43.26953125,47.158203125
    Q 42.796875,47.158203125 42.3564453125,46.8896484375
    Q 41.916015625,46.62109375 41.59375,46.083984375
    L 29.154296875,26.318359375
    L 22.966796875,34.052734375
    Q 22.55859375,34.6328125 22.12890625,34.8369140625
    Q 21.69921875,35.041015625 21.205078125,35.041015625
    Q 20.388671875,35.041015625 19.8408203125,34.4716796875
    Q 19.29296875,33.90234375 19.29296875,33.107421875
    Q 19.29296875,32.69921875 19.443359375,32.3017578125
    Q 19.59375,31.904296875 19.873046875,31.560546875
    L 27.177734375,22.708984375
    Q 27.650390625,22.0859375 28.1552734375,21.828125
    Q 28.66015625,21.5703125 29.26171875,21.5703125
    Z
' />
</g>`},squareGrid:{viewBox:`0 0 64.646 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 12.009765625,37.3828125
    Q 9.560546875,37.3828125 8.314453125,38.607421875
    Q 7.068359375,39.83203125 7.068359375,42.388671875
    L 7.068359375,55.2578125
    Q 7.068359375,57.814453125 8.314453125,59.0390625
    Q 9.560546875,60.263671875 12.009765625,60.263671875
    L 25.029296875,60.263671875
    Q 27.478515625,60.263671875 28.724609375,59.0390625
    Q 29.970703125,57.814453125 29.970703125,55.2578125
    L 29.970703125,42.388671875
    Q 29.970703125,39.83203125 28.724609375,38.607421875
    Q 27.478515625,37.3828125 25.029296875,37.3828125
    Z
    M 39.6171875,37.3828125
    Q 37.146484375,37.3828125 35.9111328125,38.607421875
    Q 34.67578125,39.83203125 34.67578125,42.388671875
    L 34.67578125,55.2578125
    Q 34.67578125,57.814453125 35.9111328125,59.0390625
    Q 37.146484375,60.263671875 39.6171875,60.263671875
    L 52.63671875,60.263671875
    Q 55.0859375,60.263671875 56.33203125,59.0390625
    Q 57.578125,57.814453125 57.578125,55.2578125
    L 57.578125,42.388671875
    Q 57.578125,39.83203125 56.33203125,38.607421875
    Q 55.0859375,37.3828125 52.63671875,37.3828125
    Z
    M 12.009765625,9.775390625
    Q 9.560546875,9.775390625 8.314453125,11
    Q 7.068359375,12.224609375 7.068359375,14.78125
    L 7.068359375,27.650390625
    Q 7.068359375,30.20703125 8.314453125,31.4423828125
    Q 9.560546875,32.677734375 12.009765625,32.677734375
    L 25.029296875,32.677734375
    Q 27.478515625,32.677734375 28.724609375,31.4423828125
    Q 29.970703125,30.20703125 29.970703125,27.650390625
    L 29.970703125,14.78125
    Q 29.970703125,12.224609375 28.724609375,11
    Q 27.478515625,9.775390625 25.029296875,9.775390625
    Z
    M 39.6171875,9.775390625
    Q 37.146484375,9.775390625 35.9111328125,11
    Q 34.67578125,12.224609375 34.67578125,14.78125
    L 34.67578125,27.650390625
    Q 34.67578125,30.20703125 35.9111328125,31.4423828125
    Q 37.146484375,32.677734375 39.6171875,32.677734375
    L 52.63671875,32.677734375
    Q 55.0859375,32.677734375 56.33203125,31.4423828125
    Q 57.578125,30.20703125 57.578125,27.650390625
    L 57.578125,14.78125
    Q 57.578125,12.224609375 56.33203125,11
    Q 55.0859375,9.775390625 52.63671875,9.775390625
    Z
' />
</g>`},calendarBadge:{viewBox:`0 0 81.189 85.895`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-85.89453125)'>
<path fill='currentColor' d='
    M 15.42578125,20.345703125
    Q 11.279296875,20.345703125 9.173828125,22.4189453125
    Q 7.068359375,24.4921875 7.068359375,28.6171875
    L 7.068359375,62.5625
    Q 7.068359375,66.6875 9.173828125,68.7607421875
    Q 11.279296875,70.833984375 15.42578125,70.833984375
    L 53.732421875,70.833984375
    Q 57.900390625,70.833984375 60.005859375,68.75
    Q 62.111328125,66.666015625 62.111328125,62.5625
    L 62.111328125,46.169921875
    Q 61.638671875,46.212890625 61.1767578125,46.2451171875
    Q 60.71484375,46.27734375 60.263671875,46.27734375
    Q 59.76953125,46.27734375 59.3076171875,46.2451171875
    Q 58.845703125,46.212890625 58.287109375,46.1484375
    L 58.287109375,54.076171875
    Q 58.287109375,56.203125 57.169921875,57.2880859375
    Q 56.052734375,58.373046875 54.01171875,58.373046875
    L 15.125,58.373046875
    Q 13.0625,58.373046875 11.966796875,57.2880859375
    Q 10.87109375,56.203125 10.87109375,54.076171875
    L 10.87109375,28.4453125
    Q 10.87109375,26.318359375 11.966796875,25.2333984375
    Q 13.0625,24.1484375 15.125,24.1484375
    L 43.65625,24.1484375
    Q 43.9140625,23.138671875 44.30078125,22.1826171875
    Q 44.6875,21.2265625 45.203125,20.345703125
    Z
    M 29.111328125,48.490234375
    Q 28.423828125,48.490234375 28.1767578125,48.7265625
    Q 27.9296875,48.962890625 27.9296875,49.650390625
    L 27.9296875,51.26171875
    Q 27.9296875,51.94921875 28.1767578125,52.1748046875
    Q 28.423828125,52.400390625 29.111328125,52.400390625
    L 30.744140625,52.400390625
    Q 31.41015625,52.400390625 31.6572265625,52.1748046875
    Q 31.904296875,51.94921875 31.904296875,51.26171875
    L 31.904296875,49.650390625
    Q 31.904296875,48.962890625 31.6572265625,48.7265625
    Q 31.41015625,48.490234375 30.744140625,48.490234375
    Z
    M 38.435546875,48.490234375
    Q 37.748046875,48.490234375 37.5009765625,48.7265625
    Q 37.25390625,48.962890625 37.25390625,49.650390625
    L 37.25390625,51.26171875
    Q 37.25390625,51.94921875 37.5009765625,52.1748046875
    Q 37.748046875,52.400390625 38.435546875,52.400390625
    L 40.068359375,52.400390625
    Q 40.755859375,52.400390625 41.0029296875,52.1748046875
    Q 41.25,51.94921875 41.25,51.26171875
    L 41.25,49.650390625
    Q 41.25,48.962890625 41.0029296875,48.7265625
    Q 40.755859375,48.490234375 40.068359375,48.490234375
    Z
    M 47.759765625,48.490234375
    Q 47.09375,48.490234375 46.8466796875,48.7265625
    Q 46.599609375,48.962890625 46.599609375,49.650390625
    L 46.599609375,51.26171875
    Q 46.599609375,51.94921875 46.8466796875,52.1748046875
    Q 47.09375,52.400390625 47.759765625,52.400390625
    L 49.392578125,52.400390625
    Q 50.080078125,52.400390625 50.3271484375,52.1748046875
    Q 50.57421875,51.94921875 50.57421875,51.26171875
    L 50.57421875,49.650390625
    Q 50.57421875,48.962890625 50.3271484375,48.7265625
    Q 50.080078125,48.490234375 49.392578125,48.490234375
    Z
    M 19.765625,39.31640625
    Q 19.099609375,39.31640625 18.8525390625,39.5419921875
    Q 18.60546875,39.767578125 18.60546875,40.455078125
    L 18.60546875,42.087890625
    Q 18.60546875,42.75390625 18.8525390625,42.990234375
    Q 19.099609375,43.2265625 19.765625,43.2265625
    L 21.3984375,43.2265625
    Q 22.0859375,43.2265625 22.3330078125,42.990234375
    Q 22.580078125,42.75390625 22.580078125,42.087890625
    L 22.580078125,40.455078125
    Q 22.580078125,39.767578125 22.3330078125,39.5419921875
    Q 22.0859375,39.31640625 21.3984375,39.31640625
    Z
    M 29.111328125,39.31640625
    Q 28.423828125,39.31640625 28.1767578125,39.5419921875
    Q 27.9296875,39.767578125 27.9296875,40.455078125
    L 27.9296875,42.087890625
    Q 27.9296875,42.75390625 28.1767578125,42.990234375
    Q 28.423828125,43.2265625 29.111328125,43.2265625
    L 30.744140625,43.2265625
    Q 31.41015625,43.2265625 31.6572265625,42.990234375
    Q 31.904296875,42.75390625 31.904296875,42.087890625
    L 31.904296875,40.455078125
    Q 31.904296875,39.767578125 31.6572265625,39.5419921875
    Q 31.41015625,39.31640625 30.744140625,39.31640625
    Z
    M 38.435546875,39.31640625
    Q 37.748046875,39.31640625 37.5009765625,39.5419921875
    Q 37.25390625,39.767578125 37.25390625,40.455078125
    L 37.25390625,42.087890625
    Q 37.25390625,42.75390625 37.5009765625,42.990234375
    Q 37.748046875,43.2265625 38.435546875,43.2265625
    L 40.068359375,43.2265625
    Q 40.755859375,43.2265625 41.0029296875,42.990234375
    Q 41.25,42.75390625 41.25,42.087890625
    L 41.25,40.455078125
    Q 41.25,39.767578125 41.0029296875,39.5419921875
    Q 40.755859375,39.31640625 40.068359375,39.31640625
    Z
    M 19.765625,30.12109375
    Q 19.099609375,30.12109375 18.8525390625,30.357421875
    Q 18.60546875,30.59375 18.60546875,31.259765625
    L 18.60546875,32.892578125
    Q 18.60546875,33.55859375 18.8525390625,33.794921875
    Q 19.099609375,34.03125 19.765625,34.03125
    L 21.3984375,34.03125
    Q 22.0859375,34.03125 22.3330078125,33.794921875
    Q 22.580078125,33.55859375 22.580078125,32.892578125
    L 22.580078125,31.259765625
    Q 22.580078125,30.59375 22.3330078125,30.357421875
    Q 22.0859375,30.12109375 21.3984375,30.12109375
    Z
    M 29.111328125,30.12109375
    Q 28.423828125,30.12109375 28.1767578125,30.357421875
    Q 27.9296875,30.59375 27.9296875,31.259765625
    L 27.9296875,32.892578125
    Q 27.9296875,33.55859375 28.1767578125,33.794921875
    Q 28.423828125,34.03125 29.111328125,34.03125
    L 30.744140625,34.03125
    Q 31.41015625,34.03125 31.6572265625,33.794921875
    Q 31.904296875,33.55859375 31.904296875,32.892578125
    L 31.904296875,31.259765625
    Q 31.904296875,30.59375 31.6572265625,30.357421875
    Q 31.41015625,30.12109375 30.744140625,30.12109375
    Z
    M 38.435546875,30.12109375
    Q 37.748046875,30.12109375 37.5009765625,30.357421875
    Q 37.25390625,30.59375 37.25390625,31.259765625
    L 37.25390625,32.892578125
    Q 37.25390625,33.55859375 37.5009765625,33.794921875
    Q 37.748046875,34.03125 38.435546875,34.03125
    L 40.068359375,34.03125
    Q 40.755859375,34.03125 41.0029296875,33.794921875
    Q 41.25,33.55859375 41.25,32.892578125
    L 41.25,31.259765625
    Q 41.25,30.59375 41.0029296875,30.357421875
    Q 40.755859375,30.12109375 40.068359375,30.12109375
    Z
    M 60.2421875,15.060546875
    Q 57.384765625,15.060546875 54.87109375,16.134765625
    Q 52.357421875,17.208984375 50.4345703125,19.1318359375
    Q 48.51171875,21.0546875 47.4267578125,23.568359375
    Q 46.341796875,26.08203125 46.341796875,28.939453125
    Q 46.341796875,31.796875 47.4267578125,34.310546875
    Q 48.51171875,36.82421875 50.4345703125,38.7470703125
    Q 52.357421875,40.669921875 54.87109375,41.7548828125
    Q 57.384765625,42.83984375 60.2421875,42.83984375
    Q 63.099609375,42.83984375 65.61328125,41.7548828125
    Q 68.126953125,40.669921875 70.0390625,38.7578125
    Q 71.951171875,36.845703125 73.0361328125,34.3212890625
    Q 74.12109375,31.796875 74.12109375,28.939453125
    Q 74.12109375,26.103515625 73.025390625,23.58984375
    Q 71.9296875,21.076171875 70.0068359375,19.1533203125
    Q 68.083984375,17.23046875 65.5703125,16.1455078125
    Q 63.056640625,15.060546875 60.2421875,15.060546875
    Z
    M 53.58203125,26.85546875
    L 60.349609375,26.85546875
    Q 61.015625,26.85546875 61.466796875,27.306640625
    Q 61.91796875,27.7578125 61.91796875,28.423828125
    L 61.91796875,37.275390625
    Q 61.91796875,37.8984375 61.466796875,38.349609375
    Q 61.015625,38.80078125 60.349609375,38.80078125
    Q 59.705078125,38.80078125 59.2431640625,38.349609375
    Q 58.78125,37.8984375 58.78125,37.275390625
    L 58.78125,29.970703125
    L 53.58203125,29.970703125
    Q 52.9375,29.970703125 52.46484375,29.51953125
    Q 51.9921875,29.068359375 51.9921875,28.423828125
    Q 51.9921875,27.779296875 52.4541015625,27.3173828125
    Q 52.916015625,26.85546875 53.58203125,26.85546875
    Z
' />
</g>`},banknote:{viewBox:`0 0 85.98 58.609`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-58.609375)'>
<path fill='currentColor' d='
    M 7.068359375,8.89453125
    L 7.068359375,49.71484375
    Q 7.068359375,50.6171875 7.6162109375,51.1650390625
    Q 8.1640625,51.712890625 9.06640625,51.712890625
    L 76.892578125,51.712890625
    Q 77.81640625,51.712890625 78.3642578125,51.1650390625
    Q 78.912109375,50.6171875 78.912109375,49.71484375
    L 78.912109375,8.89453125
    Q 78.912109375,7.970703125 78.3642578125,7.43359375
    Q 77.81640625,6.896484375 76.892578125,6.896484375
    L 9.06640625,6.896484375
    Q 8.1640625,6.896484375 7.6162109375,7.43359375
    Q 7.068359375,7.970703125 7.068359375,8.89453125
    Z
    M 10.87109375,11.451171875
    Q 10.87109375,10.69921875 11.623046875,10.69921875
    L 74.357421875,10.69921875
    Q 75.087890625,10.69921875 75.087890625,11.451171875
    L 75.087890625,47.158203125
    Q 75.087890625,47.888671875 74.357421875,47.888671875
    L 11.623046875,47.888671875
    Q 10.87109375,47.888671875 10.87109375,47.158203125
    Z
    M 13.986328125,15.275390625
    L 13.986328125,43.3125
    Q 13.986328125,44.794921875 15.42578125,44.794921875
    L 70.533203125,44.794921875
    Q 71.994140625,44.794921875 71.994140625,43.3125
    L 71.994140625,15.275390625
    Q 71.994140625,13.79296875 70.533203125,13.79296875
    L 15.42578125,13.79296875
    Q 13.986328125,13.79296875 13.986328125,15.275390625
    Z
    M 16.478515625,16.865234375
    Q 16.478515625,16.306640625 17.05859375,16.306640625
    L 68.921875,16.306640625
    Q 69.48046875,16.306640625 69.48046875,16.865234375
    L 69.48046875,41.72265625
    Q 69.48046875,42.28125 68.921875,42.28125
    L 17.05859375,42.28125
    Q 16.478515625,42.28125 16.478515625,41.72265625
    Z
    M 42.904296875,13.79296875
    Q 40.77734375,13.79296875 38.865234375,14.8564453125
    Q 36.953125,15.919921875 35.5029296875,17.939453125
    Q 34.052734375,19.958984375 33.21484375,22.837890625
    Q 32.376953125,25.716796875 32.376953125,29.326171875
    Q 32.376953125,32.935546875 33.21484375,35.79296875
    Q 34.052734375,38.650390625 35.513671875,40.6591796875
    Q 36.974609375,42.66796875 38.8759765625,43.7314453125
    Q 40.77734375,44.794921875 42.904296875,44.794921875
    Q 45.095703125,44.794921875 47.0185546875,43.7314453125
    Q 48.94140625,42.66796875 50.423828125,40.6591796875
    Q 51.90625,38.650390625 52.7548828125,35.79296875
    Q 53.603515625,32.935546875 53.603515625,29.326171875
    Q 53.603515625,25.716796875 52.7548828125,22.837890625
    Q 51.90625,19.958984375 50.423828125,17.939453125
    Q 48.94140625,15.919921875 47.0185546875,14.8564453125
    Q 45.095703125,13.79296875 42.904296875,13.79296875
    Z
    M 42.904296875,16.671875
    Q 44.98828125,16.671875 46.7822265625,18.17578125
    Q 48.576171875,19.6796875 49.693359375,22.515625
    Q 50.810546875,25.3515625 50.810546875,29.326171875
    Q 50.810546875,33.279296875 49.693359375,36.1044921875
    Q 48.576171875,38.9296875 46.7822265625,40.4228515625
    Q 44.98828125,41.916015625 42.904296875,41.916015625
    Q 40.884765625,41.916015625 39.123046875,40.4228515625
    Q 37.361328125,38.9296875 36.2763671875,36.1044921875
    Q 35.19140625,33.279296875 35.19140625,29.326171875
    Q 35.19140625,25.3515625 36.2763671875,22.515625
    Q 37.361328125,19.6796875 39.123046875,18.17578125
    Q 40.884765625,16.671875 42.904296875,16.671875
    Z
' />
</g>`},creditcardFill:{viewBox:`0 0 78.826 62.477`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.4765625)'>
<path fill='currentColor' d='
    M 19.099609375,17.208984375
    Q 17.875,17.208984375 17.123046875,17.9501953125
    Q 16.37109375,18.69140625 16.37109375,19.8515625
    L 16.37109375,25.0078125
    Q 16.37109375,26.16796875 17.123046875,26.9091796875
    Q 17.875,27.650390625 19.099609375,27.650390625
    L 25.888671875,27.650390625
    Q 27.11328125,27.650390625 27.865234375,26.9091796875
    Q 28.6171875,26.16796875 28.6171875,25.0078125
    L 28.6171875,19.8515625
    Q 28.6171875,18.69140625 27.865234375,17.9501953125
    Q 27.11328125,17.208984375 25.888671875,17.208984375
    Z
    M 9.044921875,37.876953125
    L 9.044921875,44.107421875
    L 69.845703125,44.107421875
    L 69.845703125,37.876953125
    Z
    M 15.42578125,7.884765625
    Q 11.279296875,7.884765625 9.173828125,9.96875
    Q 7.068359375,12.052734375 7.068359375,16.177734375
    L 7.068359375,46.298828125
    Q 7.068359375,50.423828125 9.173828125,52.5078125
    Q 11.279296875,54.591796875 15.42578125,54.591796875
    L 63.37890625,54.591796875
    Q 67.546875,54.591796875 69.65234375,52.4970703125
    Q 71.7578125,50.40234375 71.7578125,46.298828125
    L 71.7578125,16.177734375
    Q 71.7578125,12.07421875 69.65234375,9.9794921875
    Q 67.546875,7.884765625 63.37890625,7.884765625
    Z
    M 15.51171875,11.708984375
    L 63.314453125,11.708984375
    Q 65.52734375,11.708984375 66.73046875,12.8798828125
    Q 67.93359375,14.05078125 67.93359375,16.37109375
    L 67.93359375,46.10546875
    Q 67.93359375,48.42578125 66.73046875,49.607421875
    Q 65.52734375,50.7890625 63.314453125,50.7890625
    L 15.51171875,50.7890625
    Q 13.255859375,50.7890625 12.0634765625,49.607421875
    Q 10.87109375,48.42578125 10.87109375,46.10546875
    L 10.87109375,16.37109375
    Q 10.87109375,14.05078125 12.0634765625,12.8798828125
    Q 13.255859375,11.708984375 15.51171875,11.708984375
    Z
' />
</g>`}},Z=(0,x.memo)(function({name:e,size:t=`md`,...n}){let r=Ht[e];if(!r)return null;let i=t===`md`?`icon`:`icon icon--${t}`;return(0,V.jsx)(`svg`,{className:i,viewBox:r.viewBox,fill:`currentColor`,stroke:`none`,"aria-hidden":`true`,...n,dangerouslySetInnerHTML:{__html:r.body}})});function Ut({usd:e,rate:t,size:n=`md`}){let r=O(e);return(0,V.jsxs)(`span`,{className:n===`sm`?`tabular`:`kpi__value`,children:[r,n!==`sm`&&t>0&&(0,V.jsx)(`span`,{className:`kpi__alt`,style:{display:`block`},children:k(e,t)})]})}function Wt({usd:e,rate:t}){return(0,V.jsxs)(`span`,{className:`tabular`,children:[O(e),t>0&&(0,V.jsxs)(`span`,{className:`dim`,children:[` · `,k(e,t)]})]})}function Gt({title:e,hint:t,action:n,children:r,flat:i}){return(0,V.jsxs)(`section`,{className:i?`card card--flat`:`card`,children:[(e||n)&&(0,V.jsxs)(`div`,{className:`card__head`,children:[(0,V.jsxs)(`div`,{children:[e&&(0,V.jsx)(`div`,{className:`card__title`,children:e}),t&&(0,V.jsx)(`div`,{className:`card__hint`,children:t})]}),n]}),r]})}function Kt({title:e,subtitle:t,actions:n}){return(0,V.jsxs)(`div`,{className:`page-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h1`,{children:e}),t&&(0,V.jsx)(`p`,{children:t})]}),n&&(0,V.jsx)(`div`,{className:`actions`,children:n})]})}function qt({title:e,hint:t,action:n}){return(0,V.jsxs)(`div`,{className:`empty`,children:[(0,V.jsx)(`div`,{className:`empty__title`,children:e}),t&&(0,V.jsx)(`p`,{className:`empty__hint`,children:t}),n]})}function Jt({tabs:e,value:t,onChange:n}){return(0,V.jsx)(g,{className:`tabs`,role:`tablist`,children:e.map(e=>(0,V.jsx)(p,{role:`tab`,active:t===e,"aria-selected":t===e,onClick:()=>n(e),children:e},e))})}function Q({label:e,hint:t,children:n,required:r,as:i=`field`}){let a=(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`span`,{className:`field__label`,children:[e,r&&` *`]}),n,t&&(0,V.jsx)(`span`,{className:`field__hint`,children:t})]});return i===`group`?(0,V.jsx)(`div`,{className:`field`,role:`group`,"aria-label":e,children:a}):(0,V.jsx)(`label`,{className:`field`,children:a})}function Yt({title:e,onClose:t,children:n}){return(0,V.jsx)(`div`,{className:`modal-backdrop`,onClick:t,children:(0,V.jsxs)(`div`,{className:`modal`,onClick:e=>e.stopPropagation(),children:[(0,V.jsxs)(`div`,{className:`modal__head`,children:[(0,V.jsx)(`h3`,{style:{fontSize:`1.1rem`},children:e}),(0,V.jsx)(`button`,{className:`modal__close`,onClick:t,"aria-label":`Cerrar`,children:(0,V.jsx)(Z,{name:`close`})})]}),n]})})}function Xt({children:e,tone:t=`neutral`,icon:n}){return(0,V.jsxs)(`span`,{className:t===`accent`||t===`success`?`badge badge--accent`:`badge`,children:[n&&(0,V.jsx)(Z,{name:n}),e]})}var Zt=_();function Qt({value:e,size:t=220,className:n}){let[r,i]=(0,x.useState)(``);return(0,x.useEffect)(()=>{let n=!0;return(0,Zt.toString)(e,{type:`svg`,margin:1,width:t,errorCorrectionLevel:`M`}).then(e=>{n&&i(e)}).catch(()=>{n&&i(``)}),()=>{n=!1}},[e,t]),r?(0,V.jsx)(`div`,{className:`qr`+(n?` ${n}`:``),style:{width:t,height:t,margin:`0 auto`,justifyContent:`center`,alignItems:`center`},dangerouslySetInnerHTML:{__html:r}}):(0,V.jsx)(`div`,{className:`qr qr--loading`,style:{width:t,height:t,margin:`0 auto`,justifyContent:`center`,alignItems:`center`},role:`img`,"aria-label":`Generando código QR`})}var $t=null,en=!1;function tn(){return typeof window>`u`?null:window.AudioContext??window.webkitAudioContext??null}function nn(){if($t)return $t;let e=tn();if(!e)return null;try{$t=new e}catch{$t=null}return $t}function rn(){if(en)return;let e=nn();if(e)try{e.state===`suspended`&&e.resume(),en=!0}catch{}}function an(){on([{f:1180,t:0,d:.085}],.17)}function on(e,t){let n=nn();if(n)try{n.state===`suspended`&&n.resume();let r=n.currentTime;for(let i of e){let e=n.createOscillator(),a=n.createGain(),o=r+i.t,s=o+i.d;e.type=`square`,e.frequency.setValueAtTime(i.f,o),a.gain.setValueAtTime(1e-4,o),a.gain.exponentialRampToValueAtTime(t,o+.008),a.gain.exponentialRampToValueAtTime(1e-4,s),e.connect(a).connect(n.destination),e.start(o),e.stop(s+.02)}}catch{}}var sn=[`ean_13`,`ean_8`,`code_128`,`code_39`,`upc_a`,`upc_e`,`qr_code`,`data_matrix`],cn=1e3;function ln({label:e,onClick:t,block:n}){return(0,V.jsxs)(`button`,{type:`button`,className:`btn btn--primary btn--sm`+(n?` btn--block`:``),onClick:t,children:[(0,V.jsx)(Z,{name:`scan`}),` `,e]})}function un({onScan:e,className:t,continuous:n=!1,continueLabel:r=`Continuar`}){let i=(0,x.useRef)(null),a=(0,x.useRef)(null),[o,s]=(0,x.useState)(`starting`),[c,l]=(0,x.useState)(!1),u=(0,x.useRef)(e);u.current=e;let d=(0,x.useRef)(n);d.current=n;let f=(0,x.useRef)(!1),p=(0,x.useRef)(()=>{});return(0,x.useEffect)(()=>{let e=()=>rn();return window.addEventListener(`pointerdown`,e,{once:!0}),()=>window.removeEventListener(`pointerdown`,e)},[]),(0,x.useEffect)(()=>{let e=null,t=0,n=!1,r=!1,o=``,c=0,m=null;if(typeof window.BarcodeDetector!=`function`){s(`no-sensor`);return}let h=window.BarcodeDetector,g=(async()=>{let e=sn;try{if(typeof h.getSupportedFormats==`function`){let t=await h.getSupportedFormats();Array.isArray(t)&&t.length>0&&(e=e.filter(e=>t.includes(e)))}}catch{}try{m=e.length?new h({formats:e}):new h}catch{try{m=new h}catch{m=null}}})();async function _(){if(!navigator.mediaDevices?.getUserMedia){s(`unsupported`);return}try{e=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:`environment`}},audio:!1})}catch{s(`denied`);return}a.current=e;let h=e.getVideoTracks()[0];h&&typeof h.applyConstraints==`function`&&(async()=>{try{let e=typeof h.getCapabilities==`function`?h.getCapabilities():{},t={};e.focusMode&&Array.isArray(e.focusMode)&&e.focusMode.includes(`continuous`)&&(t.focusMode=`continuous`),e.exposureMode&&Array.isArray(e.exposureMode)&&e.exposureMode.includes(`continuous`)&&(t.exposureMode=`continuous`),e.whiteBalanceMode&&Array.isArray(e.whiteBalanceMode)&&e.whiteBalanceMode.includes(`continuous`)&&(t.whiteBalanceMode=`continuous`),Object.keys(t).length>0&&await h.applyConstraints({advanced:[t]})}catch{}})();let _=i.current;if(!_||n){e.getTracks().forEach(e=>e.stop());return}_.srcObject=e;try{await _.play()}catch{}if(n)return;s(`running`),p.current=(e=cn)=>{window.clearTimeout(t),t=window.setTimeout(()=>{f.current=!1,l(!1),v()},e)};let v=async()=>{if(n||f.current)return;let e=i.current;if(e&&e.readyState>=2&&m&&!r){r=!0;try{let t=(await m.detect(e))[0]?.rawValue?.trim();if(t&&!f.current){let e=Date.now();(t!==o||e-c>1200)&&(o=t,c=e,typeof navigator.vibrate==`function`&&navigator.vibrate(50),an(),u.current(t),d.current?(f.current=!0,l(!0)):p.current(cn))}}catch{}finally{r=!1}}t=window.setTimeout(v,55)};await g,!n&&(m?v():s(`no-sensor`))}return _(),()=>{n=!0,f.current=!1,window.clearTimeout(t),e?.getTracks().forEach(e=>e.stop()),a.current=null}},[]),(0,V.jsxs)(`div`,{className:`cam`+(t?` ${t}`:``),onClick:async()=>{let e=a.current?.getVideoTracks()[0];if(e&&typeof e.applyConstraints==`function`)try{let t=typeof e.getCapabilities==`function`?e.getCapabilities():{};t.focusMode&&Array.isArray(t.focusMode)&&t.focusMode.includes(`continuous`)&&await e.applyConstraints({advanced:[{focusMode:`continuous`}]})}catch{}},title:`Toca para reenfocar`,style:{cursor:`pointer`},children:[(0,V.jsx)(`video`,{ref:i,className:`cam__video`,playsInline:!0,autoPlay:!0,muted:!0}),o===`running`&&(0,V.jsx)(`span`,{className:`cam__frame`,"aria-hidden":!0}),c&&(0,V.jsx)(`div`,{className:`cam__paused`,children:(0,V.jsx)(ln,{label:r,onClick:()=>{f.current=!1,l(!1),p.current(0)},block:!0})}),o===`denied`&&(0,V.jsx)(`p`,{className:`cam__note`,children:`No se pudo abrir la cámara. Da permiso al navegador o usa el lector USB.`}),o===`unsupported`&&(0,V.jsx)(`p`,{className:`cam__note`,children:`Este navegador no permite abrir la cámara. Usa el lector USB o el celular remoto.`}),o===`no-sensor`&&(0,V.jsx)(`p`,{className:`cam__note`,children:`Este navegador no puede decodificar códigos con la cámara. Usa el lector USB o el celular remoto.`})]})}var dn=e=>`blink:scanner:host:${e}`,fn=`blink:scanner:remote`;function pn(e){let t=new Uint8Array(e),n=globalThis.crypto;if(n&&typeof n.getRandomValues==`function`)n.getRandomValues(t);else for(let e=0;e<t.length;e++)t[e]=Math.floor(Math.random()*256);return Array.from(t,e=>e.toString(16).padStart(2,`0`)).join(``)}function mn(e){let t=new Date;return t.setDate(t.getDate()+e),t.toISOString()}function hn(e=``){return{id:`p_${pn(8)}`,token:pn(16),label:e.trim()||`Caja principal`,createdAt:new Date().toISOString(),expiresAt:mn(30)}}function gn(e,t=Date.now()){let n=Date.parse(e.expiresAt);return Number.isFinite(n)&&n<=t}function _n(e){try{let t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}function vn(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function yn(e){if(!e)return null;let t=_n(dn(e));return t&&t.id&&t.token?t:null}function bn(e,t){e&&vn(dn(e),t)}function xn(e){try{localStorage.removeItem(dn(e))}catch{}}function Sn(){let e=_n(fn);return e&&e.id&&e.token?e:null}function Cn(e){vn(fn,e)}function wn(){try{localStorage.removeItem(fn)}catch{}}function Tn(e,t){return`${t??`${window.location.origin}/`}escaner?p=${encodeURIComponent(e.id)}&t=${encodeURIComponent(e.token)}`}function En(){let e=typeof navigator<`u`?navigator.userAgent:``;return/iPhone/i.test(e)?`iPhone`:/iPad/i.test(e)?`iPad`:/Android/i.test(e)?`Android`:/Macintosh/i.test(e)?`Mac`:/Windows/i.test(e)?`Windows`:`Dispositivo móvil`}var Dn=()=>({buffer:``,lastAt:0});function On(e,t,n){let r=n-e.lastAt>70?``:e.buffer;if(t===`Enter`||t===`Tab`){let e=r.trim();return{state:{buffer:``,lastAt:n},code:e.length>=5?e:null}}return t.length===1?{state:{buffer:r+t,lastAt:n},code:null}:{state:{buffer:r,lastAt:n},code:null}}var kn=(0,x.createContext)(null);function An(){let e=(0,x.useContext)(kn);if(!e)throw Error(`useScanner debe usarse dentro de <ScannerProvider>`);return e}function jn(e){let{register:t}=An(),n=(0,x.useRef)(e);n.current=e,(0,x.useEffect)(()=>t((e,t)=>n.current(e,t)),[t])}var Mn=2e4;function Nn({children:e}){let{user:t}=zt(),n=t?.id??``,[r,i]=(0,x.useState)(null),[a,o]=(0,x.useState)(!1),[s,c]=(0,x.useState)(!1),l=(0,x.useRef)([]),u=(0,x.useRef)(0),d=(0,x.useRef)(()=>{}),f=(0,x.useRef)(null),p=(0,x.useRef)(new Map),m=(0,x.useCallback)(e=>(l.current.push(e),()=>{l.current=l.current.filter(t=>t!==e)}),[]),h=(0,x.useCallback)((e,t=`hardware`)=>{let n=e.trim();if(!n)return;an();let r=l.current[l.current.length-1];r&&r(n,t)},[]);d.current=h,(0,x.useEffect)(()=>{let e=()=>rn();return window.addEventListener(`pointerdown`,e,{once:!0}),window.addEventListener(`touchstart`,e,{once:!0}),window.addEventListener(`keydown`,e,{once:!0}),()=>{window.removeEventListener(`pointerdown`,e),window.removeEventListener(`touchstart`,e),window.removeEventListener(`keydown`,e)}},[]),(0,x.useEffect)(()=>{let e=Dn();function t(t){if(t.ctrlKey||t.altKey||t.metaKey)return;let n=On(e,t.key,Date.now());e=n.state,n.code&&(t.preventDefault(),d.current(n.code,`hardware`))}return window.addEventListener(`keydown`,t,!0),()=>window.removeEventListener(`keydown`,t,!0)},[]),(0,x.useEffect)(()=>{if(!n){i(null);return}let e=yn(n);i(e&&!gn(e)?e:null)},[n]);let g=(0,x.useCallback)(()=>{let e=(r&&!gn(r)?r:null)??hn();return n&&bn(n,e),i(e),e},[n,r]),_=(0,x.useCallback)(()=>{let e=hn(r?.label);return n&&bn(n,e),i(e),c(!1),e},[n,r]),v=(0,x.useCallback)(()=>{n&&xn(n),i(null),c(!1),o(!1)},[n]),y=r?.id??``,b=r?.token??``;(0,x.useEffect)(()=>{if(!y||!b){o(!1);return}let e=R.channel(`scanner:${y}`,{config:{broadcast:{self:!1}}});return f.current=e,e.on(`broadcast`,{event:`hello`},t=>{t.payload?.token===b&&(u.current=Date.now(),c(!0),e?.send({type:`broadcast`,event:`pong`,payload:{token:b}}))}),e.on(`broadcast`,{event:`barcode`},e=>{let t=e.payload;t?.token===b&&t.code&&(u.current=Date.now(),c(!0),d.current(t.code,`remote`))}),e.on(`broadcast`,{event:`names`},e=>{let t=e.payload;t&&t.token===b&&(u.current=Date.now(),c(!0),p.current.get(`names`)?.forEach(e=>e(t)))}),e.subscribe(e=>o(e===`SUBSCRIBED`)),()=>{let t=e;e=null,f.current=null,t&&R.removeChannel(t),o(!1)}},[y,b]);let S=(0,x.useCallback)((e,t)=>{let n=p.current.get(e);return n||(n=new Set,p.current.set(e,n)),n.add(t),()=>{n?.delete(t)}},[]),C=(0,x.useCallback)((e,t)=>{let n=f.current;n&&n.send({type:`broadcast`,event:e,payload:t})},[]);(0,x.useEffect)(()=>{let e=window.setInterval(()=>{c(e=>{let t=Date.now()-u.current<Mn;return e===t?e:t})},5e3);return()=>window.clearInterval(e)},[]);let w=(0,x.useMemo)(()=>r?Tn(r):``,[r]),T=(0,x.useMemo)(()=>({pairing:r,pairingUrl:w,remoteActive:s,connected:a,ensurePairing:g,rotatePairing:_,forgetPairing:v,dispatch:h,register:m,subscribeRemote:S,sendToRemote:C}),[r,w,s,a,g,_,v,h,m,S,C]);return(0,V.jsx)(kn.Provider,{value:T,children:e})}function Pn({active:e}){return(0,V.jsxs)(`span`,{className:`row gap-8`,style:{alignItems:`center`},children:[(0,V.jsx)(`span`,{className:`dot`+(e?` dot--on`:``),"aria-hidden":!0}),(0,V.jsx)(`span`,{children:e?`Escáner móvil activo`:`Esperando al celular…`})]})}function Fn({onClose:e}){let{pairing:t,pairingUrl:n,remoteActive:r,connected:i,ensurePairing:a,rotatePairing:o}=An(),s=(0,x.useRef)(a);s.current=a,(0,x.useEffect)(()=>{try{s.current()}catch{}},[]);let c=t?.expiresAt?new Date(t.expiresAt):null;return(0,V.jsxs)(Yt,{title:`Celular como escáner`,onClose:e,children:[(0,V.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.85rem`,marginBottom:`0.75rem`},children:[`Escanea este código con la cámara del celular. Quedará vinculado`,` `,30,` días: no tendrás que volver a escanearlo cada mañana.`]}),n?(0,V.jsxs)(`div`,{className:`scan-pair`,style:{justifyContent:`center`,gap:`1.25rem`,flexWrap:`wrap`},children:[(0,V.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`,width:`100%`},children:(0,V.jsx)(Qt,{value:n,size:208})}),(0,V.jsxs)(`div`,{className:`scan-pair__info stack gap-8`,children:[(0,V.jsx)(Pn,{active:r}),(0,V.jsx)(`span`,{className:`dim`,style:{fontSize:`0.8rem`},children:i?`Caja conectada al canal.`:`Sin conexión con el servidor.`}),c&&(0,V.jsxs)(`span`,{className:`dim`,style:{fontSize:`0.8rem`},children:[`Vence el `,c.toLocaleDateString(),`.`]}),(0,V.jsxs)(`button`,{className:`btn btn--soft btn--sm`,onClick:()=>{o()},children:[(0,V.jsx)(Z,{name:`close`}),` Regenerar código`]})]})]}):(0,V.jsx)(`p`,{className:`muted`,children:`Preparando el código…`}),(0,V.jsx)(`p`,{className:`field__hint`,style:{marginTop:`0.9rem`},children:`El celular debe poder abrir esta misma dirección. “Regenerar” desvincula los teléfonos anteriores.`})]})}function In({onScan:e,onClose:t,continuous:n=!1,hint:r=`Apunta al código de barras. Si tu navegador no puede decodificar, usa el lector USB o vincula un celular.`,footer:i}){return(0,V.jsxs)(Yt,{title:`Escanear con cámara`,onClose:t,children:[(0,V.jsx)(un,{onScan:r=>{e(r),n||t()},continuous:n}),i,(0,V.jsx)(`p`,{className:`field__hint`,style:{marginTop:`0.75rem`},children:r})]})}var Ln=[{to:`/app/inicio`,label:`Inicio`,icon:`home`},{to:`/app/ventas`,label:`Ventas`,icon:`cart`,sub:[{to:`/app/ventas`,label:`Vender`},{to:`/app/ventas/historial`,label:`Historial`}]},{to:`/app/catalogo`,label:`Catálogo`,icon:`tag`},{to:`/app/inventario`,label:`Inventario`,icon:`box`,feature:`inventory`},{to:`/app/contactos`,label:`Contactos`,icon:`users`,feature:`providers`},{to:`/app/finanzas`,label:`Finanzas`,icon:`wallet`,feature:`expenses`},{to:`/app/informes`,label:`Informes`,icon:`chart`,feature:`reports`},{to:`/app/ajustes`,label:`Ajustes`,icon:`settings`}],Rn=[{to:`/app/ventas`,label:`Ventas`,icon:`cart`},{to:`/app/catalogo`,label:`Catálogo`,icon:`tag`},{to:`/app/inventario`,label:`Inventario`,icon:`box`,feature:`inventory`},{to:`/app/contactos`,label:`Contactos`,icon:`users`,feature:`providers`},{to:`/app/finanzas`,label:`Finanzas`,icon:`wallet`,feature:`expenses`}];function zn(){let{remoteActive:e,pairing:t}=An(),[n,r]=(0,x.useState)(!1);return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`button`,{className:`btn btn--soft btn--sm scan-topbtn`+(e?` scan-topbtn--on`:``),onClick:()=>r(!0),title:`Escáner móvil`,children:[(0,V.jsx)(Z,{name:`scan`}),(0,V.jsx)(`span`,{className:`scan-topbtn__label`,children:e?`Escáner activo`:t?`Escáner`:`Vincular`}),e&&(0,V.jsx)(`span`,{className:`dot dot--on`,"aria-hidden":!0})]}),n&&(0,V.jsx)(Fn,{onClose:()=>r(!1)})]})}function Bn({children:e}){let{state:t,user:i,logout:a,openCash:s,closeCash:c}=Vt(),d=y(),[f,p]=(0,x.useState)(!1),[h,g]=(0,x.useState)(!1),[_,v]=(0,x.useState)(`0`),[b,S]=(0,x.useState)(`0`),[C,w]=(0,x.useState)(!1),[T,E]=(0,x.useState)(`0`),[D,ee]=(0,x.useState)(`0`),[k,ne]=(0,x.useState)(``),re=t.business.features,ie=Ln.filter(e=>!e.feature||re[e.feature]),ae=Rn.filter(e=>!e.feature||re[e.feature]),M=n(),N=i&&(i.firstName||i.lastName)?[i.firstName,i.lastName].filter(Boolean).join(` `):i?.email??``,P=t.cashSession,F=P?be(t):{usd:0,bs:0},oe=Number(T)||0,se=Number(D)||0,I=j(oe-F.usd),ce=j(se-F.bs),le=I!==0||ce!==0;return(0,V.jsx)(Nn,{children:(0,V.jsxs)(`div`,{className:`shell`+(h?` shell--nav-open`:``),children:[(0,V.jsxs)(`aside`,{className:`shell__sidebar`,children:[(0,V.jsx)(`div`,{className:`sidenav__brand`,children:(0,V.jsxs)(o,{to:`/app/ventas`,className:`brand brand--lg`,"aria-label":`Ir a ventas`,children:[(0,V.jsx)(`span`,{className:`brand__blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`brand__pos`,children:`POS`})]})}),(0,V.jsx)(`div`,{className:`nav-group`,children:`Principal`}),(0,V.jsx)(`nav`,{className:`nav`,children:ie.map(e=>(0,V.jsxs)(`div`,{children:[(0,V.jsxs)(m,{to:e.to,end:!!e.sub,onClick:()=>g(!1),className:({isActive:t})=>t&&!e.sub?`nav__link active`:`nav__link`,children:[(0,V.jsx)(`span`,{className:`nav__icon`,"aria-hidden":!0,children:(0,V.jsx)(Z,{name:e.icon})}),e.label]}),e.sub&&(0,V.jsx)(`div`,{className:`nav__sub`,children:e.sub.map(e=>(0,V.jsx)(m,{to:e.to,end:e.label===`Vender`,onClick:()=>g(!1),className:({isActive:e})=>e?`nav__link active`:`nav__link`,children:e.label},e.label))})]},e.to))}),(0,V.jsxs)(`button`,{className:`btn btn--ghost btn--sm`,onClick:()=>{g(!1),a(),d(`/app/entrar`)},children:[(0,V.jsx)(Z,{name:`logout`}),`Cerrar sesión`]})]}),h&&(0,V.jsx)(`div`,{className:`shell__scrim`,onClick:()=>g(!1)}),(0,V.jsxs)(`header`,{className:`shell__topbar`,children:[(0,V.jsx)(`button`,{className:`shell__menu`,onClick:()=>g(e=>!e),"aria-label":`Abrir menú`,"aria-expanded":h,children:(0,V.jsx)(Z,{name:h?`close`:`menu`})}),(0,V.jsx)(`strong`,{className:`topbar__name`,children:t.business.name}),(0,V.jsx)(zn,{}),(0,V.jsx)(`span`,{className:`rate-chip rate-chip--live`,title:`Tasa de referencia BCV`,children:t.rate>0?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`strong`,{children:te(t.rate)}),(0,V.jsx)(`span`,{className:`rate-chip__suffix`,children:` / $ · BCV`})]}):(0,V.jsx)(`strong`,{style:{fontSize:`0.8rem`},children:`Sin tasa`})}),(0,V.jsx)(`span`,{className:`grow`}),P?(0,V.jsx)(`button`,{className:`btn btn--ghost btn--sm`,onClick:()=>{E(String(P.openingUsd)),ee(String(P.openingBs)),ne(``),w(!0)},title:`Abierta ${new Date(P.openedAt).toLocaleTimeString()}`,children:`Cerrar caja`}):(0,V.jsx)(`button`,{className:`btn btn--soft btn--sm`,onClick:()=>p(!0),children:`Abrir caja`}),(0,V.jsxs)(`div`,{className:`userchip`,children:[(0,V.jsx)(`span`,{className:`avatar`,children:(N||`?`).slice(0,2).toUpperCase()}),(0,V.jsxs)(`div`,{className:`stack`,style:{lineHeight:1.15},children:[(0,V.jsx)(`strong`,{style:{fontSize:`0.8rem`},children:N||`Sesión activa`}),(0,V.jsx)(`span`,{className:`dim`,style:{fontSize:`0.7rem`},children:`Dueño`})]})]})]}),(0,V.jsx)(`main`,{className:`shell__main`,children:(0,V.jsx)(`div`,{className:`page`,children:e})}),(0,V.jsx)(u,{className:`shell__tabbar-float`,children:(0,V.jsx)(r,{className:`shell__tabbar`,labels:!0,icons:!0,children:ae.map(e=>(0,V.jsx)(l,{component:m,linkProps:{to:e.to},active:M.pathname===e.to||M.pathname.startsWith(e.to+`/`),icon:(0,V.jsx)(Z,{name:e.icon}),label:e.label},e.to))})}),(0,V.jsx)(`div`,{id:`printable-report`,"aria-hidden":`true`}),f&&(0,V.jsxs)(Yt,{title:`Abrir caja`,onClose:()=>p(!1),children:[(0,V.jsx)(Q,{label:`Fondo inicial (USD)`,hint:`Efectivo con el que abre la caja.`,children:(0,V.jsx)(`input`,{className:`input`,type:`number`,value:_,onChange:e=>v(e.target.value)})}),(0,V.jsx)(Q,{label:`Fondo inicial (Bs)`,children:(0,V.jsx)(`input`,{className:`input`,type:`number`,value:b,onChange:e=>S(e.target.value)})}),(0,V.jsx)(`button`,{className:`btn btn--primary btn--block`,onClick:()=>{s(Number(_)||0,Number(b)||0),p(!1)},children:`Confirmar apertura`}),(0,V.jsxs)(`p`,{className:`field__hint`,style:{marginTop:`0.6rem`},children:[`Fondo: `,O(Number(_)||0),` · `,A(Number(b)||0)]})]}),C&&P&&(0,V.jsxs)(Yt,{title:`Cerrar caja (arqueo)`,onClose:()=>w(!1),children:[(0,V.jsx)(`p`,{className:`muted`,style:{fontSize:`0.85rem`,marginBottom:`0.75rem`},children:`Cuenta el efectivo y las bolívares contados para registrar el arqueo y la diferencia.`}),(0,V.jsx)(Q,{label:`Contado (USD)`,children:(0,V.jsx)(`input`,{className:`input`,type:`number`,value:T,onChange:e=>E(e.target.value)})}),(0,V.jsx)(Q,{label:`Contado (Bs)`,children:(0,V.jsx)(`input`,{className:`input`,type:`number`,value:D,onChange:e=>ee(e.target.value)})}),(0,V.jsxs)(`div`,{className:`breakdown`,style:{marginTop:`0.75rem`},children:[(0,V.jsxs)(`div`,{className:`breakdown__row`,children:[(0,V.jsx)(`span`,{children:`Esperado (USD)`}),(0,V.jsx)(`span`,{className:`tabular`,children:O(F.usd)})]}),(0,V.jsxs)(`div`,{className:`breakdown__row`,children:[(0,V.jsx)(`span`,{children:`Contado (USD)`}),(0,V.jsx)(`span`,{className:`tabular`,children:O(oe)})]}),(0,V.jsxs)(`div`,{className:`breakdown__row`,children:[(0,V.jsx)(`span`,{children:`Esperado (Bs)`}),(0,V.jsx)(`span`,{className:`tabular`,children:A(F.bs)})]}),(0,V.jsxs)(`div`,{className:`breakdown__row`,children:[(0,V.jsx)(`span`,{children:`Contado (Bs)`}),(0,V.jsx)(`span`,{className:`tabular`,children:A(se)})]}),(0,V.jsxs)(`div`,{className:`breakdown__row breakdown__row--strong`,children:[(0,V.jsx)(`span`,{children:`Diferencia`}),(0,V.jsxs)(`span`,{className:`tabular`,children:[O(I),` · `,A(ce)]})]})]}),le&&(0,V.jsx)(Q,{label:`Motivo de la diferencia`,hint:`Obligatorio cuando no cuadra.`,children:(0,V.jsx)(`input`,{className:`input`,value:k,onChange:e=>ne(e.target.value),placeholder:`Ej.: vuelto de más en la mañana`})}),(0,V.jsx)(`button`,{className:`btn btn--primary btn--block`,style:{marginTop:`1rem`},disabled:le&&!k.trim(),onClick:()=>{c(oe,se,k.trim()||(le?`Arqueo de cierre · diferencia ${O(I)} / ${A(ce)}`:`Arqueo de cierre sin diferencia`)),w(!1)},children:`Confirmar cierre`})]})]})})}var Vn=[{href:`#caracteristicas`,label:`Características`},{href:`#como-funciona`,label:`Cómo funciona`},{href:`#precios`,label:`Precios`}],Hn=[{icon:`scan`,title:`Usa tu celular como escáner inalámbrico`,body:`Olvídate de pistolas láser costosas. Vincula tu teléfono por QR y escanea productos o busca al instante desde cualquier pasillo.`,tag:`Sin hardware extra`},{icon:`cash`,title:`Multimoneda real (USD/EUR + BCV)`,body:`Calcula vueltos mixtos, maneja pagos fraccionados (efectivo, pago móvil, Zelle) y actualiza la tasa oficial automáticamente sin errores.`,tag:`Tasa BCV automática`},{icon:`box`,title:`Local-First sin interrupciones`,body:`Si el internet falla, el sistema sigue facturando de manera local y sincroniza de forma segura al volver la señal.`,tag:`Siempre vendiendo`}],Un=[`POS ilimitado para todos tus puntos de venta`,`Control de caja y cierres con arqueo`,`App de escaneo móvil enlazada por QR`,`Multimoneda con tasa oficial BCV en vivo`,`Catálogo colaborativo con productos pre-cargados`,`Soporte técnico y actualizaciones automáticas`];function Wn(){let[e,t]=(0,x.useState)(!1);return(0,x.useEffect)(()=>{let e=()=>{window.innerWidth>860&&t(!1)};return window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)},[]),(0,V.jsxs)(`div`,{className:`landing`,children:[(0,V.jsx)(u,{className:`ld-glass`,children:(0,V.jsx)(`header`,{className:`ld-header`,children:(0,V.jsxs)(`div`,{className:`ld-header__inner`,children:[(0,V.jsxs)(o,{to:`/`,className:`ld-logo`,"aria-label":`BLINK POS, inicio`,children:[(0,V.jsx)(`span`,{className:`ld-logo__blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`ld-logo__pos`,children:`POS`})]}),(0,V.jsx)(`nav`,{className:`ld-nav`+(e?` ld-nav--open`:``),"aria-label":`Navegación principal`,children:Vn.map(e=>(0,V.jsx)(`a`,{className:`ld-nav__link`,href:e.href,onClick:()=>t(!1),children:e.label},e.href))}),(0,V.jsxs)(`div`,{className:`ld-header__actions`,children:[(0,V.jsx)(o,{className:`ld-btn ld-btn--ghost`,to:`/app/entrar`,children:`Iniciar Sesión`}),(0,V.jsx)(o,{className:`ld-btn ld-btn--primary`,to:`/app/registro`,children:`Registrar mi comercio`})]}),(0,V.jsx)(`button`,{className:`ld-burger`,onClick:()=>t(e=>!e),"aria-label":e?`Cerrar menú`:`Abrir menú`,"aria-expanded":e,children:(0,V.jsx)(Z,{name:e?`close`:`menu`,size:`lg`})})]})})}),(0,V.jsx)(`section`,{className:`ld-hero`,children:(0,V.jsxs)(`div`,{className:`ld-hero__inner`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsxs)(`span`,{className:`ld-eyebrow`,children:[(0,V.jsx)(Z,{name:`chart`,size:`sm`}),`100% en la nube`]}),(0,V.jsx)(`h1`,{children:`El Punto de Venta más rápido, inteligente y adaptado a Venezuela.`}),(0,V.jsx)(`p`,{className:`ld-hero__sub`,children:`Controla tu caja, calcula al instante en Dólares y Bolívares a tasa BCV, y usa la cámara de tu teléfono como escáner de códigos de barras. Sin equipos costosos y 100% en la nube.`}),(0,V.jsxs)(`div`,{className:`ld-hero__cta`,children:[(0,V.jsxs)(o,{className:`ld-btn ld-btn--primary ld-btn--lg`,to:`/app/registro`,children:[`Empezar Ahora - $25/mes`,(0,V.jsx)(Z,{name:`arrowRight`})]}),(0,V.jsxs)(`span`,{className:`ld-hero__note`,children:[(0,V.jsx)(Z,{name:`check`,size:`sm`}),`Sin costo de instalación`]})]})]}),(0,V.jsxs)(`div`,{className:`ld-mock`,"aria-hidden":!0,children:[(0,V.jsx)(`div`,{className:`ld-mock__pc`,children:(0,V.jsxs)(`div`,{className:`ld-mock__screen`,children:[(0,V.jsx)(`div`,{className:`ld-mock__bar`,children:(0,V.jsxs)(`div`,{className:`ld-mock__search`,children:[(0,V.jsx)(Z,{name:`search`,size:`sm`}),`Buscar o escanear…`]})}),(0,V.jsxs)(`div`,{className:`ld-mock__line`,children:[(0,V.jsx)(`b`,{children:`AZUCAR KONFIT 1kg`}),(0,V.jsx)(`span`,{children:`2 x $2.00`})]}),(0,V.jsxs)(`div`,{className:`ld-mock__line`,children:[(0,V.jsx)(`b`,{children:`MALTA RETORNABLE`}),(0,V.jsx)(`span`,{children:`3 x $1.50`})]}),(0,V.jsxs)(`div`,{className:`ld-mock__line`,children:[(0,V.jsx)(`b`,{children:`PAPEL DE ALUMINIO TUC`}),(0,V.jsx)(`span`,{children:`1 x $0.90`})]}),(0,V.jsxs)(`div`,{className:`ld-mock__total`,children:[(0,V.jsx)(`span`,{children:`Total a pagar`}),(0,V.jsx)(`strong`,{children:`$ 8.40`})]}),(0,V.jsx)(`div`,{className:`ld-mock__bs`,children:`Bs 7.408,80 · Tasa BCV 882.00`})]})}),(0,V.jsx)(`div`,{className:`ld-mock__phone`,children:(0,V.jsxs)(`div`,{className:`ld-mock__phone-screen`,children:[(0,V.jsx)(`div`,{className:`ld-mock__frame`,children:(0,V.jsx)(`div`,{className:`ld-mock__barcode`})}),(0,V.jsx)(`span`,{className:`ld-mock__pill`,children:`Escaneado`})]})})]})]})}),(0,V.jsx)(`section`,{className:`ld-section`,id:`caracteristicas`,children:(0,V.jsxs)(`div`,{className:`ld-section__inner`,children:[(0,V.jsxs)(`div`,{className:`ld-section__head`,children:[(0,V.jsx)(`h2`,{children:`Todo lo que necesitas, nada más`}),(0,V.jsx)(`p`,{children:`Tres capacidades que reemplazan el hardware caro, el cálculo manual y la incertidumbre de la tasa.`})]}),(0,V.jsx)(`div`,{className:`ld-features`,children:Hn.map(e=>(0,V.jsxs)(`article`,{className:`ld-feature`,children:[(0,V.jsx)(`div`,{className:`ld-feature__icon`,children:(0,V.jsx)(Z,{name:e.icon})}),(0,V.jsx)(`h3`,{children:e.title}),(0,V.jsx)(`p`,{children:e.body}),(0,V.jsxs)(`span`,{className:`ld-feature__tag`,children:[(0,V.jsx)(Z,{name:`check`,size:`sm`}),e.tag]})]},e.title))})]})}),(0,V.jsx)(`section`,{className:`ld-section ld-section--dark`,id:`como-funciona`,children:(0,V.jsx)(`div`,{className:`ld-section__inner`,children:(0,V.jsxs)(`div`,{className:`ld-trust`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`p`,{className:`ld-trust__quote`,children:`Diseñado por desarrolladores que entienden la realidad del comercio local.`}),(0,V.jsx)(`p`,{className:`ld-trust__by`,children:`Catálogo inteligente con miles de productos pre-cargados para que configures tu inventario en minutos, no en horas. Cada comercio que se suma mejora el catálogo compartido de toda la red.`})]}),(0,V.jsxs)(`div`,{className:`ld-stats`,children:[(0,V.jsxs)(`div`,{className:`ld-stat`,children:[(0,V.jsx)(`strong`,{children:`USD · EUR`}),(0,V.jsx)(`span`,{children:`Multimoneda con tasa oficial BCV actualizada automáticamente.`})]}),(0,V.jsxs)(`div`,{className:`ld-stat`,children:[(0,V.jsx)(`strong`,{children:`0 ms`}),(0,V.jsx)(`span`,{children:`Escaneo desde el celular: sin instalación ni mantenimiento.`})]}),(0,V.jsxs)(`div`,{className:`ld-stat`,children:[(0,V.jsx)(`strong`,{children:`24/7`}),(0,V.jsx)(`span`,{children:`El POS sigue facturando aunque se caiga la conexión.`})]}),(0,V.jsxs)(`div`,{className:`ld-stat`,children:[(0,V.jsx)(`strong`,{children:`$25`}),(0,V.jsx)(`span`,{children:`Tarifa plana mensual. Sin comisiones ni cobros por venta.`})]})]})]})})}),(0,V.jsx)(`section`,{className:`ld-section`,id:`precios`,children:(0,V.jsxs)(`div`,{className:`ld-section__inner`,children:[(0,V.jsxs)(`div`,{className:`ld-section__head`,children:[(0,V.jsx)(`h2`,{children:`Un precio. Todo incluido.`}),(0,V.jsx)(`p`,{children:`Sin commissions por venta, sin planes ocultos, sin sorpresas en la factura.`})]}),(0,V.jsxs)(`div`,{className:`ld-pricing`,children:[(0,V.jsx)(`span`,{className:`ld-pricing__badge`,children:`Plan Pro Comercial`}),(0,V.jsx)(`h3`,{children:`Todo BLINK POS, para tu comercio`}),(0,V.jsxs)(`div`,{className:`ld-pricing__price`,children:[(0,V.jsx)(`strong`,{children:`$25`}),(0,V.jsx)(`span`,{children:`/ mes`})]}),(0,V.jsx)(`p`,{className:`ld-pricing__hint`,children:`Un solo plan. Todos los módulos activados.`}),(0,V.jsx)(`ul`,{className:`ld-pricing__list`,children:Un.map(e=>(0,V.jsxs)(`li`,{children:[(0,V.jsx)(Z,{name:`check`,size:`sm`}),e]},e))}),(0,V.jsxs)(o,{className:`ld-btn ld-btn--primary ld-btn--lg`,to:`/app/registro`,children:[`Crear mi comercio`,(0,V.jsx)(Z,{name:`arrowRight`})]})]})]})}),(0,V.jsx)(`footer`,{className:`ld-footer`,children:(0,V.jsxs)(`div`,{className:`ld-footer__inner`,children:[(0,V.jsxs)(o,{to:`/`,className:`ld-logo`,"aria-label":`BLINK POS, inicio`,children:[(0,V.jsx)(`span`,{className:`ld-logo__blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`ld-logo__pos`,children:`POS`})]}),(0,V.jsxs)(`nav`,{className:`ld-footer__legal`,"aria-label":`Enlaces legales`,children:[(0,V.jsx)(o,{to:`/app/terminos`,children:`Términos de servicio`}),(0,V.jsx)(o,{to:`/app/privacidad`,children:`Política de privacidad`}),(0,V.jsx)(`a`,{href:`mailto:soporte@blink.com.ve`,children:`Soporte técnico`})]}),(0,V.jsx)(`p`,{className:`ld-footer__copy`,children:`© 2026 Blink POS`})]})})]})}function Gn(){let{login:e,sendDeviceCode:t,logout:n}=Bt(),r=y(),[i,a]=(0,x.useState)(``),[s,c]=(0,x.useState)(``),[l,u]=(0,x.useState)(``),[d,f]=(0,x.useState)(!1),[p,m]=(0,x.useState)(0),[h,g]=(0,x.useState)(`cred`),_=(0,x.useRef)(void 0);(0,x.useEffect)(()=>{if(!(p<=0))return _.current=window.setTimeout(()=>m(e=>e-1),1e3),()=>window.clearTimeout(_.current)},[p]);async function v(t){if(t.preventDefault(),u(``),!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.trim())){u(`Escribe un correo electrónico válido.`);return}if(!s){u(`Escribe tu contraseña.`);return}f(!0);let n=await e(i,s);f(!1),n?u(n):r(`/app/inicio`,{replace:!0})}async function b(){if(u(``),!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.trim())){u(`Escribe tu correo electrónico para enviarte el enlace de acceso.`);return}f(!0);let e=await t(i.trim());f(!1),e?u(e):(g(`link`),m(45))}async function S(){if(p>0)return;f(!0),u(``);let e=await t(i.trim());f(!1),e?u(e):m(45)}async function C(){await n(),c(``),m(0),u(``),g(`cred`)}return(0,V.jsxs)(`main`,{className:`auth`,children:[(0,V.jsxs)(`div`,{className:`auth__pitch`,children:[(0,V.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,V.jsx)(`span`,{className:`blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`pos`,children:`POS`})]}),(0,V.jsx)(`h2`,{children:`Tu punto de venta, rápido y claro.`}),(0,V.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.2rem`,fontWeight:600},children:`Vende, cobra en dólares y bolívares, y controla tu inventario desde un solo lugar.`})]}),(0,V.jsx)(`div`,{className:`auth__panel`,children:(0,V.jsx)(`div`,{className:`auth__card`,children:h===`link`?(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`button`,{type:`button`,className:`btn btn--ghost btn--sm`,onClick:C,style:{marginBottom:`0.75rem`},children:`← Usar otra cuenta`}),(0,V.jsx)(`h1`,{children:`Verifica tu correo`}),(0,V.jsxs)(`p`,{className:`muted`,style:{marginBottom:`1rem`,whiteSpace:`pre-wrap`},children:[`Enviamos un enlace de verificación a `,(0,V.jsx)(`strong`,{children:i.trim()}),`. Ábrelo desde este navegador para completar el inicio de sesión.`]}),(0,V.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.9rem`,marginBottom:`1.25rem`},children:[(0,V.jsx)(Z,{name:`mail`}),` Revisa Spam o Promociones si no lo ves.`]}),l&&(0,V.jsx)(`p`,{className:`field__error`,children:l}),(0,V.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--block`,style:{marginTop:`0.5rem`},onClick:S,disabled:d||p>0,children:[(0,V.jsx)(Z,{name:`mail`}),p>0?`Reenviar en ${p}s`:`Reenviar enlace`]}),(0,V.jsx)(`p`,{className:`muted`,style:{fontSize:`0.75rem`,marginTop:`1rem`,textAlign:`center`},children:`Cada comercio usa un correo único. Al abrir el enlace se iniciará sesión automáticamente.`})]}):(0,V.jsxs)(`form`,{onSubmit:v,children:[(0,V.jsx)(`h1`,{children:`Qué bueno verte por aquí.`}),(0,V.jsx)(`p`,{className:`muted`,style:{marginBottom:`1.5rem`},children:`Entra para abrir tu punto de venta.`}),(0,V.jsx)(Q,{label:`Correo electrónico`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,type:`email`,autoComplete:`email`,value:i,onChange:e=>a(e.target.value),placeholder:`tucorreo@dominio.com`})}),(0,V.jsx)(Q,{label:`Contraseña`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,type:`password`,autoComplete:`current-password`,value:s,onChange:e=>c(e.target.value),placeholder:`Tu contraseña`})}),l&&(0,V.jsx)(`p`,{className:`field__error`,children:l}),(0,V.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:d,children:d?`Entrando…`:`Entrar`}),(0,V.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--sm btn--block`,style:{marginTop:`0.6rem`},onClick:b,disabled:d,children:[(0,V.jsx)(Z,{name:`mail`}),` Entrar con enlace al correo`]}),(0,V.jsx)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`0.9rem`,textAlign:`center`},children:(0,V.jsx)(o,{to:`/app/recuperar`,children:`¿Olvidaste tu contraseña?`})}),(0,V.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`1.25rem`,textAlign:`center`},children:[`¿Nuevo por aquí? `,(0,V.jsx)(o,{to:`/app/registro`,children:`Crear mi comercio`})]})]})})})]})}function Kn(){let{signUp:e,resendCode:t}=Bt(),[n,r]=(0,x.useState)(`datos`),[i,a]=(0,x.useState)(``),[s,c]=(0,x.useState)(``),[l,u]=(0,x.useState)(``),[d,f]=(0,x.useState)(``),[p,m]=(0,x.useState)(``),[h,g]=(0,x.useState)(``),[_,v]=(0,x.useState)(``),[y,b]=(0,x.useState)(``),[S,C]=(0,x.useState)(!1),[w,T]=(0,x.useState)(0),E=(0,x.useRef)(void 0);(0,x.useEffect)(()=>{if(!(w<=0))return E.current=window.setTimeout(()=>T(e=>e-1),1e3),()=>window.clearTimeout(E.current)},[w]);async function D(t){if(t.preventDefault(),v(``),!i.trim()||!s.trim()){v(`Escribe tu nombre y tu apellido.`);return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.trim())){v(`Escribe un correo electrónico válido.`);return}if(!/^[+()\d\s-]{7,}$/.test(l.trim())){v(`Escribe un número de teléfono válido.`);return}if(p.length<6){v(`La contraseña debe tener al menos 6 caracteres.`);return}if(p!==h){v(`Las contraseñas no coinciden.`);return}C(!0);let n=await e({email:d.trim(),password:p,firstName:i.trim(),lastName:s.trim(),phone:l.trim()});C(!1),n?v(n):(r(`link`),T(45),b(`Enviamos un enlace de verificación a ${d.trim()}. Ábrelo desde el mismo equipo o dispositivo para continuar.`))}async function O(){if(w>0)return;C(!0),v(``);let e=await t(d.trim());C(!1),e?v(e):(T(45),b(`Te enviamos un nuevo enlace de verificación.`))}return(0,V.jsxs)(`main`,{className:`auth`,children:[(0,V.jsxs)(`div`,{className:`auth__pitch`,children:[(0,V.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,V.jsx)(`span`,{className:`blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`pos`,children:`POS`})]}),(0,V.jsx)(`h2`,{children:`Empecemos por lo básico.`}),(0,V.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.2rem`,fontWeight:600},children:`Crea tu cuenta, verifica tu correo y arma tu punto de venta a tu medida.`})]}),(0,V.jsx)(`div`,{className:`auth__panel`,children:(0,V.jsxs)(`div`,{className:`auth__card`,children:[(0,V.jsxs)(`div`,{className:`auth__steps`,"aria-hidden":!0,children:[(0,V.jsx)(`span`,{className:n===`datos`?`auth__step auth__step--on`:`auth__step`,children:`1`}),(0,V.jsx)(`span`,{className:`auth__step-line`}),(0,V.jsx)(`span`,{className:n===`link`?`auth__step auth__step--on`:`auth__step`,children:`2`})]}),n===`datos`?(0,V.jsxs)(`form`,{onSubmit:D,children:[(0,V.jsx)(`h1`,{children:`Crea tu cuenta`}),(0,V.jsxs)(`div`,{className:`row gap-12`,children:[(0,V.jsx)(Q,{label:`Nombre`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,value:i,onChange:e=>a(e.target.value),autoComplete:`given-name`})}),(0,V.jsx)(Q,{label:`Apellido`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,value:s,onChange:e=>c(e.target.value),autoComplete:`family-name`})})]}),(0,V.jsx)(Q,{label:`Teléfono`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,value:l,onChange:e=>u(e.target.value),autoComplete:`tel`,placeholder:`+58 412 000 0000`})}),(0,V.jsx)(Q,{label:`Correo electrónico`,required:!0,hint:`Cada comercio debe usar un correo único. Aquí llegará el enlace de verificación.`,children:(0,V.jsx)(`input`,{className:`input`,type:`email`,value:d,onChange:e=>f(e.target.value),autoComplete:`email`,placeholder:`tucorreo@dominio.com`})}),(0,V.jsxs)(`div`,{className:`row gap-12`,children:[(0,V.jsx)(Q,{label:`Contraseña`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,type:`password`,value:p,onChange:e=>m(e.target.value),autoComplete:`new-password`})}),(0,V.jsx)(Q,{label:`Confirmar contraseña`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,type:`password`,value:h,onChange:e=>g(e.target.value),autoComplete:`new-password`})})]}),_&&(0,V.jsx)(`p`,{className:`field__error`,children:_}),(0,V.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:S,children:S?`Enviando enlace…`:`Continuar`}),(0,V.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`1.25rem`,textAlign:`center`},children:[`¿Ya tienes cuenta? `,(0,V.jsx)(o,{to:`/app/entrar`,children:`Entrar`})]})]}):(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`button`,{type:`button`,className:`btn btn--ghost btn--sm`,onClick:()=>{r(`datos`),v(``)},style:{marginBottom:`0.75rem`},children:`← Cambiar datos`}),(0,V.jsx)(`h1`,{children:`Verifica tu correo`}),(0,V.jsx)(`p`,{className:`muted`,style:{marginBottom:`1rem`,whiteSpace:`pre-wrap`},children:y||`Enviamos un enlace de verificación a ${d.trim()}. Ábrelo desde el mismo navegador para continuar.`}),(0,V.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.9rem`,marginBottom:`1.25rem`},children:[(0,V.jsx)(Z,{name:`mail`}),` Revisa también Spam o Promociones si no lo ves.`]}),_&&(0,V.jsx)(`p`,{className:`field__error`,style:{marginBottom:`0.75rem`},children:_}),(0,V.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--block`,style:{marginTop:`0.5rem`},onClick:O,disabled:S||w>0,children:[(0,V.jsx)(Z,{name:`mail`}),w>0?`Reenviar en ${w}s`:`Reenviar enlace`]}),(0,V.jsx)(`p`,{className:`muted`,style:{fontSize:`0.75rem`,marginTop:`1rem`,textAlign:`center`},children:`Cada comercio usa un correo único. Al abrir el enlace se iniciará sesión automáticamente.`})]})]})})]})}function qn(){let{resetPassword:e,updatePassword:t,logout:n}=Bt(),r=It(),i=y(),[a,s]=(0,x.useState)(r?`fijar`:`pedir`),[c,l]=(0,x.useState)(``),[u,d]=(0,x.useState)(``),[f,p]=(0,x.useState)(``),[m,h]=(0,x.useState)(``),[g,_]=(0,x.useState)(``),[v,b]=(0,x.useState)(!1),[S,C]=(0,x.useState)(0),w=(0,x.useRef)(void 0);(0,x.useEffect)(()=>{r&&s(`fijar`)},[r]),(0,x.useEffect)(()=>{if(!(S<=0))return w.current=window.setTimeout(()=>C(e=>e-1),1e3),()=>window.clearTimeout(w.current)},[S]);async function T(t){if(t.preventDefault(),h(``),_(``),!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim())){h(`Escribe un correo electrónico válido.`);return}b(!0);let n=await e(c.trim());b(!1),n?h(n):(_(`Si ese correo tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Ábrelo desde este navegador.`),C(45))}async function E(e){if(e.preventDefault(),h(``),u.length<6){h(`La contraseña debe tener al menos 6 caracteres.`);return}if(u!==f){h(`Las contraseñas no coinciden.`);return}b(!0);let r=await t(u);b(!1),r?h(r):(await n(),i(`/app/entrar`,{replace:!0}))}async function D(){if(S>0)return;b(!0),h(``);let t=await e(c.trim());b(!1),t?h(t):C(45)}async function O(){await n(),d(``),p(``),h(``),_(``),s(`pedir`)}return(0,V.jsxs)(`main`,{className:`auth`,children:[(0,V.jsxs)(`div`,{className:`auth__pitch`,children:[(0,V.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,V.jsx)(`span`,{className:`blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`pos`,children:`POS`})]}),(0,V.jsx)(`h2`,{children:`Recupera el acceso a tu comercio.`}),(0,V.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.2rem`,fontWeight:600},children:`Te enviamos un enlace seguro para crear una nueva contraseña, sin perder tus datos.`})]}),(0,V.jsx)(`div`,{className:`auth__panel`,children:(0,V.jsx)(`div`,{className:`auth__card`,children:a===`fijar`?(0,V.jsxs)(`form`,{onSubmit:E,children:[(0,V.jsx)(`button`,{type:`button`,className:`btn btn--ghost btn--sm`,onClick:O,style:{marginBottom:`0.75rem`},children:`← Usar otra cuenta`}),(0,V.jsx)(`h1`,{children:`Crea tu nueva contraseña.`}),(0,V.jsx)(`p`,{className:`muted`,style:{marginBottom:`1.5rem`},children:`Elige una clave que recuerdes. Al guardar, entrarás con ella.`}),(0,V.jsx)(Q,{label:`Nueva contraseña`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,type:`password`,autoComplete:`new-password`,value:u,onChange:e=>d(e.target.value),placeholder:`Mínimo 6 caracteres`})}),(0,V.jsx)(Q,{label:`Confirmar contraseña`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,type:`password`,autoComplete:`new-password`,value:f,onChange:e=>p(e.target.value),placeholder:`Repítela`})}),m&&(0,V.jsx)(`p`,{className:`field__error`,children:m}),(0,V.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:v,children:v?`Guardando…`:`Guardar contraseña`})]}):(0,V.jsxs)(`form`,{onSubmit:T,children:[(0,V.jsx)(`h1`,{children:`¿Olvidaste tu contraseña?`}),(0,V.jsx)(`p`,{className:`muted`,style:{marginBottom:`1.5rem`},children:`Escribe tu correo y te enviamos un enlace para crear una nueva.`}),(0,V.jsx)(Q,{label:`Correo electrónico`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,type:`email`,autoComplete:`email`,value:c,onChange:e=>l(e.target.value),placeholder:`tucorreo@dominio.com`})}),m&&(0,V.jsx)(`p`,{className:`field__error`,children:m}),g&&(0,V.jsxs)(`p`,{className:`field__hint`,style:{marginBottom:`1rem`,whiteSpace:`pre-wrap`},children:[(0,V.jsx)(Z,{name:`mail`}),` `,g]}),(0,V.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:v||S>0,children:v?`Enviando…`:S>0?`Reenviar en ${S}s`:`Enviar enlace`}),S>0&&(0,V.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--sm btn--block`,style:{marginTop:`0.6rem`},onClick:D,disabled:v,children:[(0,V.jsx)(Z,{name:`mail`}),` Reenviar enlace`]}),(0,V.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`1.25rem`,textAlign:`center`},children:[`¿Ya la recuerdas? `,(0,V.jsx)(o,{to:`/app/entrar`,children:`Volver a entrar`})]})]})})})]})}var Jn=[`Tu comercio`,`Recorrido`,`Cuenta de pagos`,`Categorías`,`Productos`,`Proveedores`],Yn=[`Abarrotes / bodega`,`Panadería / pastelería`,`Restaurante / comida`,`Farmacia`,`Licorería`,`Ropa / calzado`,`Belleza / estética`,`Tecnología / electrónica`,`Servicios`,`Otro`];function Xn(e){switch(e){case`Servicios`:return{inventory:!1,providers:!1,credit:!0,expenses:!0,reports:!0};case`Belleza / estética`:return{inventory:!1,providers:!0,credit:!0,expenses:!0,reports:!0};case`Restaurante / comida`:return{inventory:!0,providers:!0,credit:!1,expenses:!0,reports:!0};case`Panadería / pastelería`:return{inventory:!0,providers:!0,credit:!1,expenses:!0,reports:!0};case`Licorería`:return{inventory:!0,providers:!0,credit:!1,expenses:!0,reports:!0};default:return{...Ze}}}var Zn=[{key:`inventory`,label:`Inventario`,hint:`Controlar existencias, compras y ajustes.`},{key:`providers`,label:`Proveedores`,hint:`Registrar a quién le compras mercancía.`},{key:`credit`,label:`Crédito`,hint:`Vender a crédito y llevar cuentas por cobrar.`},{key:`expenses`,label:`Gastos`,hint:`Registrar gastos y gastos recurrentes.`},{key:`reports`,label:`Informes`,hint:`Ver ventas, utilidad y capital.`}];function Qn(){let{state:e}=zt(),t=Bt(),n=y(),[r,i]=(0,x.useState)(0),[a,o]=(0,x.useState)(e.business.name),[s,c]=(0,x.useState)(e.business.type||``),[l,u]=(0,x.useState)(e.business.rif),[d,f]=(0,x.useState)(e.business.phone),[p,m]=(0,x.useState)(e.business.address),[h,g]=(0,x.useState)(e.business.currency),[_,v]=(0,x.useState)(e.business.baseCurrency??`USD`),[b,S]=(0,x.useState)(e.business.features),[C,w]=(0,x.useState)(``),[T,E]=(0,x.useState)(``),[D,O]=(0,x.useState)(`efectivo`),[ee,k]=(0,x.useState)(e.business.currency),[A,te]=(0,x.useState)(!0),[j,ne]=(0,x.useState)(``),[re,ie]=(0,x.useState)(``),[ae,M]=(0,x.useState)(``),[N,P]=(0,x.useState)(``),[F,oe]=(0,x.useState)(``),[se,I]=(0,x.useState)(``),[ce,le]=(0,x.useState)(``),[L,ue]=(0,x.useState)(``),[de,fe]=(0,x.useState)(``),[pe,me]=(0,x.useState)(``),he=(0,x.useMemo)(()=>e.channels.find(e=>e.isDefault)?.id??e.channels[0]?.id??`ch_principal`,[e.channels]);function ge(e){c(e),S(Xn(e))}function _e(){if(w(``),r===0){if(!a.trim()){w(`Escribe el nombre de tu comercio.`);return}if(!s){w(`Elige el giro de tu comercio.`);return}t.updateBusiness({name:a.trim(),type:s,rif:l.trim(),phone:d.trim(),address:p.trim(),currency:h}),e.business.baseCurrencyLocked||t.setBaseCurrency(_)}r===1&&t.updateBusiness({features:b}),i(e=>Math.min(e+1,Jn.length-1))}function ve(){w(``),i(e=>Math.max(e-1,0))}function ye(){t.completeOnboarding(),n(`/app/inicio`,{replace:!0})}function be(){T.trim()?(t.addAccount({name:T.trim(),type:D,currency:ee,balance:0,commissionIn:0,commissionOut:0,inCashClose:A,active:!0}),E(``),w(``)):w(`Ponle un nombre a la cuenta (por ejemplo, Caja principal).`)}function xe(n){n.preventDefault();let r=j.trim();r&&(e.categories.some(e=>e.name.toLowerCase()===r.toLowerCase())?w(`Ya existe esa categoría.`):(t.addCategory({name:r,active:!0,order:e.categories.length}),ne(``),w(``)))}function Se(e){e.preventDefault();let n=re.trim();if(!n){w(`Escribe el nombre del producto.`);return}let r=Number(ae.replace(`,`,`.`))||0;if(r<=0){w(`El precio de venta debe ser mayor que cero.`);return}let i=Number(N.replace(`,`,`.`))||0,a=Number(F.replace(`,`,`.`))||0;t.addProduct({name:n.toUpperCase(),brand:``,sku:``,barcode:``,presentationQty:1,unit:`unidad`,cost:i,price:r,channelPrices:{[he]:r},category:se,taxRate:.16,active:!0,archived:!1,trackStock:a>0||b.inventory,stock:a,minStock:0}),ie(``),M(``),P(``),oe(``),I(``),w(``)}function Ce(e){e.preventDefault();let n=ce.trim();n?(t.addContact({name:n,document:L.trim(),docType:L.trim().includes(`-`)?L.trim().split(`-`)[0]:``,phone:de.trim(),email:pe.trim(),isClient:!1,isProvider:!0,creditDays:0,address:``,notes:``}),le(``),ue(``),fe(``),me(``),w(``)):w(`Escribe el nombre del proveedor.`)}let we=e.business.name.trim()!==``&&e.accounts.length>0;return(0,V.jsxs)(`main`,{className:`auth wizard`,children:[(0,V.jsxs)(`div`,{className:`auth__pitch`,children:[(0,V.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,V.jsx)(`span`,{className:`blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`pos`,children:`POS`})]}),(0,V.jsx)(`h2`,{children:`Vamos a dejar tu punto de venta listo.`}),(0,V.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.05rem`,fontWeight:600},children:`Cada paso usa tus datos reales. Nada de ejemplos: lo que cargues es lo que verás.`}),(0,V.jsx)(`ol`,{className:`wizard__steps`,children:Jn.map((e,t)=>(0,V.jsxs)(`li`,{className:t===r?`is-current`:t<r?`is-done`:``,children:[(0,V.jsx)(`span`,{className:`wizard__dot`,children:t<r?(0,V.jsx)(Z,{name:`check`}):t+1}),e]},e))})]}),(0,V.jsx)(`div`,{className:`auth__panel`,children:(0,V.jsxs)(`div`,{className:`wizard__panel`,children:[C&&(0,V.jsx)(`p`,{className:`field__error`,style:{marginBottom:`0.75rem`},children:C}),r===0&&(0,V.jsxs)(Gt,{title:`Datos de tu comercio`,hint:`Así aparecerá en BLINK POS y en tus recibos.`,children:[(0,V.jsx)(Q,{label:`Nombre del comercio`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,value:a,onChange:e=>o(e.target.value),placeholder:`Ej.: Abastos La Esquina`,autoFocus:!0})}),(0,V.jsx)(Q,{label:`Giro del comercio`,required:!0,hint:`Define qué módulos te mostramos.`,children:(0,V.jsxs)(`select`,{className:`select`,value:s,onChange:e=>ge(e.target.value),children:[(0,V.jsx)(`option`,{value:``,children:`Elige una opción…`}),Yn.map(e=>(0,V.jsx)(`option`,{value:e,children:e},e))]})}),(0,V.jsxs)(`div`,{className:`row gap-12`,children:[(0,V.jsx)(Q,{label:`RIF`,children:(0,V.jsx)(`input`,{className:`input`,value:l,onChange:e=>u(e.target.value),placeholder:`J-000000000`})}),(0,V.jsx)(Q,{label:`Teléfono`,children:(0,V.jsx)(`input`,{className:`input`,value:d,onChange:e=>f(e.target.value)})})]}),(0,V.jsx)(Q,{label:`Dirección`,children:(0,V.jsx)(`input`,{className:`input`,value:p,onChange:e=>m(e.target.value)})}),(0,V.jsx)(Q,{label:`Moneda principal`,hint:`En la que registras tus precios de venta.`,children:(0,V.jsxs)(`select`,{className:`select`,value:h,onChange:e=>g(e.target.value),children:[(0,V.jsx)(`option`,{value:`USD`,children:`Dólares (USD)`}),(0,V.jsx)(`option`,{value:`VES`,children:`Bolívares (VES)`})]})}),(0,V.jsx)(Q,{label:`Moneda base de operaciones`,hint:`USD o EUR (inmutable tras guardar). Determina la tasa oficial.`,required:!0,children:(0,V.jsxs)(`select`,{className:`select`,value:_,onChange:e=>v(e.target.value),disabled:e.business.baseCurrencyLocked,children:[(0,V.jsx)(`option`,{value:`USD`,children:`Dólares (USD)`}),(0,V.jsx)(`option`,{value:`EUR`,children:`Euro (€)`})]})})]}),r===1&&(0,V.jsxs)(Gt,{title:`Tu recorrido`,hint:`Esto es lo que BLINK puede hacer por ti. Ajusta lo que necesites.`,children:[(0,V.jsxs)(`p`,{className:`muted`,style:{marginBottom:`0.75rem`},children:[`Según el giro que elegiste (`,(0,V.jsx)(`strong`,{children:s||`sin definir`}),`), activamos estos módulos. Puedes cambiarlos ahora o luego en Ajustes.`]}),(0,V.jsx)(`div`,{className:`feature-list`,children:Zn.map(e=>(0,V.jsxs)(`label`,{className:`feature`,children:[(0,V.jsx)(`input`,{type:`checkbox`,checked:b[e.key],onChange:t=>S({...b,[e.key]:t.target.checked})}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`strong`,{children:e.label}),(0,V.jsx)(`span`,{className:`muted`,style:{display:`block`,fontSize:`0.8rem`},children:e.hint})]})]},e.key))})]}),r===2&&(0,V.jsxs)(Gt,{title:`Cuenta para recibir pagos`,hint:`Como una billetera: aquí se registra el dinero que entra.`,children:[(0,V.jsxs)(`div`,{className:`mini-list`,children:[e.accounts.map(e=>(0,V.jsxs)(`div`,{className:`mini-list__row`,children:[(0,V.jsx)(Z,{name:`wallet`}),(0,V.jsxs)(`span`,{children:[e.name,` · `,e.currency,e.inCashClose?` · cierra caja`:``]})]},e.id)),e.accounts.length===0&&(0,V.jsx)(`p`,{className:`muted`,children:`Aún no tienes cuentas. Crea al menos una.`})]}),(0,V.jsx)(Q,{label:`Nombre de la cuenta`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,value:T,onChange:e=>E(e.target.value),placeholder:`Ej.: Caja principal, Banco, Pago móvil`})}),(0,V.jsxs)(`div`,{className:`row gap-12`,children:[(0,V.jsx)(Q,{label:`Tipo`,children:(0,V.jsxs)(`select`,{className:`select`,value:D,onChange:e=>O(e.target.value),children:[(0,V.jsx)(`option`,{value:`efectivo`,children:`Efectivo`}),(0,V.jsx)(`option`,{value:`banco`,children:`Banco`}),(0,V.jsx)(`option`,{value:`pago_movil`,children:`Pago móvil`})]})}),(0,V.jsx)(Q,{label:`Divisa`,children:(0,V.jsxs)(`select`,{className:`select`,value:ee,onChange:e=>k(e.target.value),children:[(0,V.jsx)(`option`,{value:`USD`,children:`Dólares (USD)`}),(0,V.jsx)(`option`,{value:`VES`,children:`Bolívares (VES)`})]})})]}),(0,V.jsxs)(`label`,{className:`feature`,children:[(0,V.jsx)(`input`,{type:`checkbox`,checked:A,onChange:e=>te(e.target.checked)}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`strong`,{children:`Participa en el cierre de caja`}),(0,V.jsx)(`span`,{className:`muted`,style:{display:`block`,fontSize:`0.8rem`},children:`Cuenta su saldo en el arqueo.`})]})]}),(0,V.jsxs)(`button`,{className:`btn btn--soft`,type:`button`,onClick:be,children:[(0,V.jsx)(Z,{name:`plus`}),` Agregar cuenta`]})]}),r===3&&(0,V.jsxs)(Gt,{title:`Categorías`,hint:`Agrupa tu catálogo como tú lo piensas.`,children:[(0,V.jsxs)(`div`,{className:`mini-list`,children:[e.categories.map(e=>(0,V.jsxs)(`div`,{className:`mini-list__row`,children:[(0,V.jsx)(Z,{name:`tag`}),(0,V.jsx)(`span`,{children:e.name}),(0,V.jsx)(`button`,{className:`icon-btn`,onClick:()=>t.removeCategory(e.id),"aria-label":`Quitar`,children:(0,V.jsx)(Z,{name:`trash`})})]},e.id)),e.categories.length===0&&(0,V.jsx)(`p`,{className:`muted`,children:`Aún no hay categorías.`})]}),(0,V.jsxs)(`form`,{className:`row gap-8`,onSubmit:xe,children:[(0,V.jsx)(`input`,{className:`input`,value:j,onChange:e=>ne(e.target.value),placeholder:`Ej.: Bebidas`}),(0,V.jsxs)(`button`,{className:`btn btn--soft`,type:`submit`,children:[(0,V.jsx)(Z,{name:`plus`}),` Añadir`]})]})]}),r===4&&(0,V.jsxs)(Gt,{title:`Productos`,hint:`Lo que vendes, con su precio real.`,children:[(0,V.jsxs)(`div`,{className:`mini-list`,children:[e.products.map(e=>(0,V.jsxs)(`div`,{className:`mini-list__row`,children:[(0,V.jsx)(Z,{name:`box`}),(0,V.jsxs)(`span`,{children:[e.name,` · $`,e.price.toFixed(2),e.category?` · ${e.category}`:``]}),(0,V.jsx)(`button`,{className:`icon-btn`,onClick:()=>t.removeProduct(e.id),"aria-label":`Quitar`,children:(0,V.jsx)(Z,{name:`trash`})})]},e.id)),e.products.length===0&&(0,V.jsx)(`p`,{className:`muted`,children:`Aún no hay productos.`})]}),(0,V.jsxs)(`form`,{onSubmit:Se,children:[(0,V.jsx)(Q,{label:`Nombre del producto`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,value:re,onChange:e=>ie(e.target.value)})}),(0,V.jsxs)(`div`,{className:`row gap-12`,children:[(0,V.jsx)(Q,{label:`Precio de venta (USD)`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,inputMode:`decimal`,value:ae,onChange:e=>M(e.target.value)})}),(0,V.jsx)(Q,{label:`Costo (USD)`,children:(0,V.jsx)(`input`,{className:`input`,inputMode:`decimal`,value:N,onChange:e=>P(e.target.value)})})]}),(0,V.jsxs)(`div`,{className:`row gap-12`,children:[(0,V.jsx)(Q,{label:`Existencia inicial`,children:(0,V.jsx)(`input`,{className:`input`,inputMode:`decimal`,value:F,onChange:e=>oe(e.target.value)})}),(0,V.jsx)(Q,{label:`Categoría`,children:(0,V.jsxs)(`select`,{className:`select`,value:se,onChange:e=>I(e.target.value),children:[(0,V.jsx)(`option`,{value:``,children:`Sin categoría`}),e.categories.map(e=>(0,V.jsx)(`option`,{value:e.name,children:e.name},e.id))]})})]}),(0,V.jsxs)(`button`,{className:`btn btn--soft`,type:`submit`,children:[(0,V.jsx)(Z,{name:`plus`}),` Agregar producto`]})]})]}),r===5&&(0,V.jsxs)(Gt,{title:`Proveedores`,hint:`A quién le compras. Lo usarás en compras y cuentas por pagar.`,children:[(0,V.jsxs)(`div`,{className:`mini-list`,children:[e.contacts.filter(e=>e.isProvider).map(e=>(0,V.jsxs)(`div`,{className:`mini-list__row`,children:[(0,V.jsx)(Z,{name:`users`}),(0,V.jsxs)(`span`,{children:[e.name,e.phone?` · ${e.phone}`:``]}),(0,V.jsx)(`button`,{className:`icon-btn`,onClick:()=>t.removeContact(e.id),"aria-label":`Quitar`,children:(0,V.jsx)(Z,{name:`trash`})})]},e.id)),e.contacts.filter(e=>e.isProvider).length===0&&(0,V.jsx)(`p`,{className:`muted`,children:`Aún no hay proveedores.`})]}),(0,V.jsxs)(`form`,{onSubmit:Ce,children:[(0,V.jsx)(Q,{label:`Nombre o razón social`,required:!0,children:(0,V.jsx)(`input`,{className:`input`,value:ce,onChange:e=>le(e.target.value)})}),(0,V.jsxs)(`div`,{className:`row gap-12`,children:[(0,V.jsx)(Q,{label:`RIF / documento`,children:(0,V.jsx)(`input`,{className:`input`,value:L,onChange:e=>ue(e.target.value),placeholder:`J-000000000`})}),(0,V.jsx)(Q,{label:`Teléfono`,children:(0,V.jsx)(`input`,{className:`input`,value:de,onChange:e=>fe(e.target.value)})})]}),(0,V.jsx)(Q,{label:`Correo`,children:(0,V.jsx)(`input`,{className:`input`,type:`email`,value:pe,onChange:e=>me(e.target.value)})}),(0,V.jsxs)(`button`,{className:`btn btn--soft`,type:`submit`,children:[(0,V.jsx)(Z,{name:`plus`}),` Agregar proveedor`]})]})]}),(0,V.jsxs)(`div`,{className:`wizard__nav`,children:[(0,V.jsx)(`button`,{className:`btn btn--ghost`,onClick:ve,disabled:r===0,children:`Atrás`}),r<Jn.length-1?(0,V.jsxs)(`button`,{className:`btn btn--primary`,onClick:_e,children:[`Continuar`,(0,V.jsx)(Z,{name:`arrowRight`})]}):(0,V.jsxs)(`button`,{className:`btn btn--primary`,onClick:ye,disabled:!we,children:[`Terminar `,(0,V.jsx)(Z,{name:`check`})]})]}),r===Jn.length-1&&!we&&(0,V.jsx)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`0.5rem`,textAlign:`right`},children:`Necesitas el nombre del comercio y al menos una cuenta de pagos.`})]})})]})}var $n={intro:`¡Bienvenido a Blink! Nos alegra mucho que uses nuestra plataforma para gestionar tu negocio. Queremos que tengas la mejor experiencia posible, por lo que hemos redactado estos términos de forma sencilla y transparente. Al registrarte o utilizar nuestros servicios, estás aceptando estas reglas. Tómate un momento para leerlas.`,blocks:[{h:`1. Tu cuenta y tu espacio`,items:[{h:`Tu responsabilidad`,p:`Eres el único responsable de mantener la seguridad de tu contraseña y de todo lo que ocurre dentro de tu cuenta. Si compartes tus datos de acceso o eres descuidado con la seguridad, no podemos hacernos responsables por accesos no autorizados.`},{h:`Tus datos son tuyos`,p:`Toda la información que subas a tu tienda (tu inventario, tus precios, el registro de tus ventas y la información de tus clientes) te pertenece al 100%. Nosotros solo te prestamos la plataforma para que los organices y operes tu negocio.`}]},{h:`2. Pagos, Suscripciones y Política de Reembolsos`,items:[{h:`El costo del servicio`,p:`Blink funciona mediante una suscripción mensual por tienda de $25 USD (o su equivalente en los métodos de pago aceptados).`},{h:`Métodos de pago autorizados`,p:`Los pagos se realizan y se reportan a través de los canales oficiales habilitados en la plataforma (como Pago Móvil o Binance Pay).`},{h:`Vigencia y suspensión`,p:`Cada pago activa tu acceso por 30 días continuos. Si llega la fecha de corte y no se ha verificado tu renovación, el acceso a tu tienda y al sistema de cobro se suspenderá temporalmente hasta que te pongas al día. No borramos tus datos de inmediato, pero no podrás usarlos hasta renovar.`},{h:`Política de No Reembolsos`,p:`Todas las compras y pagos de suscripciones realizados en Blink son definitivos y no son reembolsables. Una vez procesado el pago de tu mensualidad, no se devolverá el dinero total ni parcial, independientemente de si decidiste dejar de usar el servicio antes de que termine el mes o si tu tienda estuvo inactiva.`}]},{h:`3. El funcionamiento del servicio ("Tal cual")`,items:[{h:`Imprevistos fuera de nuestro alcance`,p:`Nos esforzamos muchísimo para que Blink funcione a la perfección todos los días. Sin embargo, el servicio se ofrece "tal cual" y "según disponibilidad". Blink no se hace responsable por interrupciones, retrasos o caídas del servicio causadas por factores externos, tales como fallas en el servicio eléctrico, cortes de internet de tu zona, problemas con los servidores en la nube que utilizamos, o cualquier otra situación de fuerza mayor.`},{h:`No asumimos compensaciones económicas`,p:`No asumimos compensaciones económicas por lucro cesante, ventas perdidas o daños indirectos si la plataforma llegara a fallar temporalmente.`}]},{h:`4. Uso adecuado de la plataforma`,p:`Te comprometes a utilizar Blink de forma honesta y exclusivamente para fines comerciales legales, cumpliendo con las leyes de la República Bolivariana de Venezuela. Queda totalmente prohibido utilizar el sistema para actividades fraudulentas, ilícitas o que pongan en riesgo la seguridad de la plataforma o de otros usuarios.`},{h:`5. Propiedad intelectual de Blink`,p:`Todo el diseño, la imagen visual, los logotipos, el nombre y la tecnología detrás de Blink son propiedad exclusiva de sus creadores. Está totalmente prohibido copiar, modificar, imitar o intentar extraer el código o la estructura de la plataforma sin autorización previa por escrito.`},{h:`6. Privacidad`,p:`Tu información personal y la de tu negocio se manejan con total discreción. No vendemos, alquilamos ni compartimos tus datos internos con terceros. Utilizamos medidas de seguridad estrictas para que la información de cada tienda se mantenga privada y separada de las demás.`},{h:`7. Cambios en los términos`,p:`Podemos actualizar estos Términos y Condiciones de vez en cuando para reflejar mejoras en el servicio. Si hacemos cambios importantes, te avisaremos a través de la plataforma. Si continúas usando Blink después de los cambios, significa que los aceptas.`},{h:`8. Cancelaciones`,p:`Puedes dejar de usar Blink cuando quieras simplemente decidiendo no renovar tu siguiente mes. Si en algún momento deseas cerrar tu cuenta definitivamente y borrar todos tus datos de nuestros registros, puedes solicitarlo directamente a través de nuestro soporte.`}]},er={intro:`Tu información personal y la de tu negocio se manejan con total discreción. En esta página explicamos qué datos tratamos, con qué finalidad y cómo los protegemos.`,blocks:[{h:`1. Datos que tratamos`,p:`Datos de la cuenta (correo electrónico, nombre del comercio, RIF, teléfono y dirección), datos operativos de ventas e inventario, y registros de auditoría de las acciones críticas realizadas en la caja.`},{h:`2. Finalidad`,p:`Usamos los datos exclusivamente para prestar el servicio: procesar ventas, emitir comprobantes, mantener el historial contable, calcular la tasa de cambio de referencia y ofrecer soporte técnico.`},{h:`3. Almacenamiento local y nube`,p:`Los datos de operación se guardan primero en el dispositivo para que el POS siga funcionando sin conexión. Se sincronizan de forma cifrada con la nube cuando la señal regresa. La información de cada tienda se mantiene privada y separada de las demás.`},{h:`4. Terceros`,p:`Solo compartimos información con proveedores estrictamente necesarios para operar el servicio: Supabase (alojamiento de base de datos y sincronización) y la fuente de la tasa oficial de cambio. No vendemos, alquilamos ni compartimos tus datos internos con terceros con fines publicitarios.`},{h:`5. Retención y eliminación`,p:`Conservamos los registros contables durante el tiempo que la normativa aplicable exija. Puedes solicitar la eliminación de tu cuenta y de los datos no sujetos a obligación de conservación desde el correo de soporte.`},{h:`6. Tus derechos`,p:`Puedes acceder, corregir, exportar o eliminar tus datos escribiendo a soporte@blink.com.ve. Responderemos dentro de los plazos previstos por la ley de protección de datos aplicable en Venezuela.`},{h:`7. Cambios`,p:`Esta política puede actualizarse. Publicaremos la versión vigente en esta misma página y, ante cambios sustanciales, avisaremos al correo registrado de la cuenta.`}]},tr={terminos:{title:`Términos y Condiciones de Uso`,subtitle:`Blink · Última actualización: Octubre de 2026`,intro:$n.intro,blocks:$n.blocks},privacidad:{title:`Política de Privacidad`,subtitle:`Blink · Última actualización: Octubre de 2026`,intro:er.intro,blocks:er.blocks}};function nr({kind:e}){let t=tr[e];return(0,V.jsxs)(`div`,{className:`ld-legal`,children:[(0,V.jsxs)(`header`,{className:`ld-legal__bar`,children:[(0,V.jsxs)(o,{to:`/`,className:`ld-logo`,"aria-label":`BLINK POS, inicio`,children:[(0,V.jsx)(`span`,{className:`ld-logo__blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`ld-logo__pos`,children:`POS`})]}),(0,V.jsx)(o,{className:`ld-btn ld-btn--ghost`,to:`/app/entrar`,children:`Iniciar Sesión`})]}),(0,V.jsxs)(`main`,{className:`ld-legal__main`,children:[(0,V.jsx)(`h1`,{children:t.title}),(0,V.jsx)(`p`,{className:`ld-legal__sub`,children:t.subtitle}),(0,V.jsx)(`p`,{className:`ld-legal__intro`,children:t.intro}),t.blocks.map(e=>`items`in e?(0,V.jsxs)(`section`,{children:[(0,V.jsx)(`h2`,{children:e.h}),e.items.map(e=>(0,V.jsxs)(`div`,{className:`ld-legal__item`,children:[(0,V.jsx)(`h3`,{children:e.h}),(0,V.jsx)(`p`,{children:e.p})]},e.h))]},e.h):(0,V.jsxs)(`section`,{children:[(0,V.jsx)(`h2`,{children:e.h}),(0,V.jsx)(`p`,{children:e.p})]},e.h)),(0,V.jsxs)(`p`,{className:`ld-legal__foot`,children:[`¿Dudas?`,` `,(0,V.jsx)(`a`,{href:`mailto:soporte@blink.com.ve`,children:`soporte@blink.com.ve`})]})]})]})}var rr=(0,x.lazy)(()=>i(()=>import(`./Inicio-6CgtA3Su.js`).then(e=>({default:e.Inicio})),__vite__mapDeps([0,1,2]))),ir=(0,x.lazy)(()=>i(()=>import(`./Vender-DupykGwm.js`).then(e=>({default:e.Vender})),__vite__mapDeps([3,1,2,4]))),ar=(0,x.lazy)(()=>i(()=>import(`./Historial-D6-aLezR.js`).then(e=>({default:e.Historial})),__vite__mapDeps([5,1,2,6,4]))),or=(0,x.lazy)(()=>i(()=>import(`./Catalogo-BZG8IjGX.js`).then(e=>({default:e.Catalogo})),__vite__mapDeps([7,1,2,6]))),sr=(0,x.lazy)(()=>i(()=>import(`./Inventario-C9T9pkHJ.js`).then(e=>({default:e.Inventario})),__vite__mapDeps([8,1,2,6]))),cr=(0,x.lazy)(()=>i(()=>import(`./Contactos-CG1mxkaJ.js`).then(e=>({default:e.Contactos})),__vite__mapDeps([9,1,2]))),lr=(0,x.lazy)(()=>i(()=>import(`./Finanzas-CYqsCzPj.js`).then(e=>({default:e.Finanzas})),__vite__mapDeps([10,1,2]))),ur=(0,x.lazy)(()=>i(()=>import(`./Informes-jdjv0onJ.js`).then(e=>({default:e.Informes})),__vite__mapDeps([11,1,2,12]))),dr=(0,x.lazy)(()=>i(()=>import(`./Ajustes-CTKwHlEA.js`).then(e=>({default:e.Ajustes})),__vite__mapDeps([13,1,2,12]))),fr=(0,x.lazy)(()=>i(()=>import(`./Escaner-Czcq0QNm.js`).then(e=>({default:e.Escaner})),__vite__mapDeps([14,1,2])));function pr(){return(0,V.jsx)(`div`,{className:`page-loader`,children:`Cargando…`})}function $({children:e}){let t=It(),n=Rt(),r=Lt(),i=zt().state.onboarding.completed;return r?(0,V.jsx)(pr,{}):!t||!n?(0,V.jsx)(d,{to:`/app/entrar`,replace:!0}):i?(0,V.jsx)(Bn,{children:(0,V.jsx)(x.Suspense,{fallback:(0,V.jsx)(pr,{}),children:e})}):(0,V.jsx)(d,{to:`/app/onboarding`,replace:!0})}function mr({children:e}){let t=It(),n=Rt();return Lt()?(0,V.jsx)(pr,{}):t&&n?(0,V.jsx)(d,{to:`/app/inicio`,replace:!0}):(0,V.jsx)(V.Fragment,{children:e})}function hr({children:e}){let t=It(),n=Rt(),r=Lt(),i=zt().state.onboarding.completed;return r?(0,V.jsx)(pr,{}):!t||!n?(0,V.jsx)(d,{to:`/app/entrar`,replace:!0}):i?(0,V.jsx)(d,{to:`/app/inicio`,replace:!0}):(0,V.jsx)(V.Fragment,{children:e})}function gr(){return(0,V.jsxs)(s,{children:[(0,V.jsx)(c,{path:`/`,element:(0,V.jsx)(Wn,{})}),(0,V.jsx)(c,{path:`/app/terminos`,element:(0,V.jsx)(nr,{kind:`terminos`})}),(0,V.jsx)(c,{path:`/app/privacidad`,element:(0,V.jsx)(nr,{kind:`privacidad`})}),(0,V.jsx)(c,{path:`/app`,element:(0,V.jsx)(d,{to:`/app/inicio`,replace:!0})}),(0,V.jsx)(c,{path:`/app/entrar`,element:(0,V.jsx)(mr,{children:(0,V.jsx)(Gn,{})})}),(0,V.jsx)(c,{path:`/app/registro`,element:(0,V.jsx)(mr,{children:(0,V.jsx)(Kn,{})})}),(0,V.jsx)(c,{path:`/app/recuperar`,element:(0,V.jsx)(qn,{})}),(0,V.jsx)(c,{path:`/app/onboarding`,element:(0,V.jsx)(hr,{children:(0,V.jsx)(Qn,{})})}),(0,V.jsx)(c,{path:`/app/inicio`,element:(0,V.jsx)($,{children:(0,V.jsx)(rr,{})})}),(0,V.jsx)(c,{path:`/app/ventas`,element:(0,V.jsx)($,{children:(0,V.jsx)(ir,{})})}),(0,V.jsx)(c,{path:`/app/ventas/historial`,element:(0,V.jsx)($,{children:(0,V.jsx)(ar,{})})}),(0,V.jsx)(c,{path:`/app/catalogo`,element:(0,V.jsx)($,{children:(0,V.jsx)(or,{})})}),(0,V.jsx)(c,{path:`/app/inventario`,element:(0,V.jsx)($,{children:(0,V.jsx)(sr,{})})}),(0,V.jsx)(c,{path:`/app/contactos`,element:(0,V.jsx)($,{children:(0,V.jsx)(cr,{})})}),(0,V.jsx)(c,{path:`/app/finanzas`,element:(0,V.jsx)($,{children:(0,V.jsx)(lr,{})})}),(0,V.jsx)(c,{path:`/app/informes`,element:(0,V.jsx)($,{children:(0,V.jsx)(ur,{})})}),(0,V.jsx)(c,{path:`/app/ajustes`,element:(0,V.jsx)($,{children:(0,V.jsx)(dr,{})})}),(0,V.jsx)(c,{path:`/escaner`,element:(0,V.jsx)(x.Suspense,{fallback:(0,V.jsx)(pr,{}),children:(0,V.jsx)(fr,{})})}),(0,V.jsx)(c,{path:`*`,element:(0,V.jsx)(d,{to:`/`,replace:!0})})]})}function _r(){return(0,V.jsx)(Pt,{children:(0,V.jsx)(v,{theme:`ios`,iosHoverHighlight:!0,children:(0,V.jsx)(a,{basename:`/`,children:(0,V.jsx)(gr,{})})})})}var vr=class extends x.Component{state={error:null};static getDerivedStateFromError(e){return{error:e}}componentDidCatch(e,t){console.error(`Error no controlado en BLINK POS:`,e,t.componentStack)}reload=()=>{window.location.reload()};goHome=()=>{window.location.assign(`/app/inicio`)};render(){let{error:e}=this.state;return e?(0,V.jsx)(`main`,{className:`auth`,style:{minHeight:`100dvh`,alignItems:`center`},children:(0,V.jsxs)(`div`,{className:`auth__card`,style:{maxWidth:`30rem`},children:[(0,V.jsxs)(`span`,{className:`brand brand--lg`,children:[(0,V.jsx)(`span`,{className:`brand__blink`,children:`BLINK`}),(0,V.jsx)(`span`,{className:`brand__pos`,children:`POS`})]}),(0,V.jsx)(`h1`,{style:{marginTop:`0.5rem`},children:`Algo salió mal.`}),(0,V.jsx)(`p`,{className:`muted`,style:{marginBottom:`1rem`},children:`Tu punto de venta no pudo mostrarse. Tus datos siguen guardados: recarga para continuar donde estabas.`}),(0,V.jsx)(`pre`,{className:`tabular`,style:{whiteSpace:`pre-wrap`,wordBreak:`break-word`,fontSize:`0.72rem`,color:`var(--color-text-secondary)`,background:`var(--color-accent-soft)`,borderRadius:8,padding:`0.6rem 0.75rem`,marginBottom:`1rem`},children:e.message||String(e)}),(0,V.jsx)(`button`,{className:`btn btn--primary btn--block`,onClick:this.reload,children:`Recargar y continuar`}),(0,V.jsx)(`button`,{className:`btn btn--ghost btn--block`,style:{marginTop:`0.5rem`},onClick:this.goHome,children:`Volver al inicio`})]})}):this.props.children}},yr=document.getElementById(`root`);if(!yr)throw Error(`No se encontró #root`);(0,S.createRoot)(yr).render((0,V.jsx)(x.StrictMode,{children:(0,V.jsx)(vr,{children:(0,V.jsx)(_r,{})})}));export{L as A,te as B,zt as C,ge as D,R as E,me as F,j as H,I,le as L,de as M,pe as N,ve as O,he as P,k as R,Ot as S,Ve as T,C as U,O as V,w as W,Kt as _,wn as a,U as b,Cn as c,Gt as d,Wt as f,Ut as g,Yt as h,An as i,ye as j,fe as k,un as l,Q as m,Fn as n,En as o,qt as p,jn as r,Sn as s,In as t,Xt as u,Jt as v,Be as w,Bt as x,Z as y,A as z};