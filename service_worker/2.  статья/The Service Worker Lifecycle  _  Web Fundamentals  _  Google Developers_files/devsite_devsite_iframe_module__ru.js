(function(_ds){var window=this;'use strict';var eZ=function(){var a=_ds.ci.call(this)||this;a.h=!1;return a},fZ=function(a){var b,c,d,e,f,h;_ds.Va(function(k){if(1==k.j)return a.h?k.G(0):_ds.A(k,DevsiteApp.whenReady(),3);b=a.querySelector("iframe");if(!b)return console.warn("devsite-iframe is missing an iframe"),k.return();c=b.classList.contains("inherit-locale");b.classList.remove("framebox");b.classList.remove("inherit-locale");b.removeAttribute("style");b.removeAttribute("is-upgraded");if(d=b.dataset.src||b.src)e=new URL(d,
document.location.origin),f=new _ds.Hi(e.href),(h=DevsiteApp.getLocale())&&c&&_ds.Ui(f,"hl",h),e.search=f.h.toString(),b.removeAttribute("data-src"),b.src!==e.href&&b.setAttribute("src",e.href);["height","width"].forEach(function(l){b.hasAttribute(l)&&(a.setAttribute(l,b.getAttribute(l)),b.removeAttribute(l))});a.classList.add.apply(a.classList,_ds.sa(Array.from(b.classList)));b.removeAttribute("class");a.h=!0;_ds.B(k)})};_ds.q(eZ,_ds.ci);eZ.prototype.connectedCallback=function(){fZ(this)};
eZ.prototype.attributeChangedCallback=function(a,b,c){"height"!==a&&"width"!==a||_ds.Rn(this,a,c||"")};_ds.ja.Object.defineProperties(eZ,{observedAttributes:{configurable:!0,enumerable:!0,get:function(){return["height","width"]}}});eZ.prototype.attributeChangedCallback=eZ.prototype.attributeChangedCallback;eZ.prototype.connectedCallback=eZ.prototype.connectedCallback;try{window.customElements.define("devsite-iframe",eZ)}catch(a){console.warn("devsite.app.customElement.DevsiteIframe",a)};})(_ds_www);
