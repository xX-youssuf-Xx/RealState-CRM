import{c as oe,r as l,y as m,j as e,L as E}from"./index-BAQHcCZP.js";import{S as le,T as k}from"./ReactToastify-Dt8Kh541.js";import{u as ve,a as fe}from"./useUpdateProject-7LPhNO78.js";import{S as ye,G as be,L as ke}from"./search-Dfyka3uh.js";import{P as ne}from"./plus-2IGcsAYH.js";import{c as A,X as V}from"./x-Br0VJ280.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",ry:"2",key:"76otgf"}],["path",{d:"M9 22v-4h6v4",key:"r93iot"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}]],ie=A("building",Ce);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],ce=A("image",Ie);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]],re=A("upload",Be),qe=()=>{const{isLoading:p,error:u,data:i,setError:o,_execute:h}=oe(),x=l.useCallback(async(y,j={})=>{try{return await h("projects","POST",y,j)}catch(d){throw o(d),d}},[h,o]);return{isLoading:p,error:u,data:i,execute:x,setError:o}},Le=()=>{const{isLoading:p,error:u,data:i,setError:o,_execute:h}=oe(),x=l.useCallback(async(y,j={})=>{try{return await h(`projects/${y}`,"DELETE",null,j)}catch(d){throw o(d),d}},[h,o]);return{isLoading:p,error:u,data:i,execute:x,setError:o}},F={RESIDENTIAL:"سكني",COMMERCIAL:"تجاري",INDUSTRIAL:"صناعي",LAND:"أرض",MIXED_USE:"متعدد الاستخدامات"},we="_projectsPage_1qpkx_1",Se="_header_1qpkx_11",Ge="_title_1qpkx_25",Me="_headerActions_1qpkx_37",Pe="_searchContainer_1qpkx_49",De="_searchIcon_1qpkx_59",Ee="_searchInput_1qpkx_75",Fe="_viewToggle_1qpkx_105",Ue="_viewButton_1qpkx_119",Oe="_activeView_1qpkx_153",ze="_addButton_1qpkx_173",Ve="_emptyState_1qpkx_219",Ae="_projectsGrid_1qpkx_247",Te="_projectsList_1qpkx_261",$e="_projectListItem_1qpkx_273",He="_projectListHeader_1qpkx_301",Re="_projectListContent_1qpkx_315",Qe="_projectListDetails_1qpkx_327",Xe="_projectCard_1qpkx_337",Je="_projectHeader_1qpkx_367",Ke="_projectName_1qpkx_385",We="_actions_1qpkx_397",Ye="_editButton_1qpkx_407",Ze="_deleteButton_1qpkx_409",es="_imageButton_1qpkx_411",ss="_imageCount_1qpkx_443",ts="_projectDetails_1qpkx_503",as="_detailItem_1qpkx_513",ls="_detailLabel_1qpkx_535",ns="_detailValue_1qpkx_545",is="_projectFooter_1qpkx_553",cs="_manageButton_1qpkx_563",rs="_modalOverlay_1qpkx_609",os="_modal_1qpkx_609",ds="_galleryModal_1qpkx_657",ms="_confirmModal_1qpkx_681",ps="_modalHeader_1qpkx_701",us="_closeButton_1qpkx_735",hs="_form_1qpkx_763",xs="_formGroup_1qpkx_771",js="_fileUploadContainer_1qpkx_831",_s="_fileUploadButton_1qpkx_841",gs="_fileInput_1qpkx_877",Ns="_imagesSection_1qpkx_885",vs="_imageGrid_1qpkx_907",fs="_imageContainer_1qpkx_919",ys="_imagePreview_1qpkx_935",bs="_removeImageButton_1qpkx_947",ks="_formActions_1qpkx_989",Cs="_cancelButton_1qpkx_1003",Is="_submitButton_1qpkx_1045",Bs="_deleteConfirmButton_1qpkx_1095",qs="_galleryContent_1qpkx_1147",Ls="_galleryGrid_1qpkx_1159",ws="_galleryImageContainer_1qpkx_1171",Ss="_galleryImage_1qpkx_1171",Gs="_noImages_1qpkx_1211",Ms="_galleryFooter_1qpkx_1223",Ps="_closeGalleryButton_1qpkx_1237",s={projectsPage:we,header:Se,title:Ge,headerActions:Me,searchContainer:Pe,searchIcon:De,searchInput:Ee,viewToggle:Fe,viewButton:Ue,activeView:Oe,addButton:ze,emptyState:Ve,projectsGrid:Ae,projectsList:Te,projectListItem:$e,projectListHeader:He,projectListContent:Re,projectListDetails:Qe,projectCard:Xe,projectHeader:Je,projectName:Ke,actions:We,editButton:Ye,deleteButton:Ze,imageButton:es,imageCount:ss,projectDetails:ts,detailItem:as,detailLabel:ls,detailValue:ns,projectFooter:is,manageButton:cs,modalOverlay:rs,modal:os,galleryModal:ds,confirmModal:ms,modalHeader:ps,closeButton:us,form:hs,formGroup:xs,fileUploadContainer:js,fileUploadButton:_s,fileInput:gs,imagesSection:Ns,imageGrid:vs,imageContainer:fs,imagePreview:ys,removeImageButton:bs,formActions:ks,cancelButton:Cs,submitButton:Is,deleteConfirmButton:Bs,galleryContent:qs,galleryGrid:Ls,galleryImageContainer:ws,galleryImage:Ss,noImages:Gs,galleryFooter:Ms,closeGalleryButton:Ps},Ds=p=>{const u=new Date(p),i={year:"numeric",month:"long",day:"numeric"};return u.toLocaleDateString("ar-EG",i)},Ts=()=>{const[p,u]=l.useState([]),[i,o]=l.useState(""),[h,x]=l.useState(!1),[y,j]=l.useState(!1),[d,T]=l.useState(!1),[de,$]=l.useState(!1),[c,C]=l.useState(null),[U,H]=l.useState("cards"),[_,I]=l.useState(""),[g,B]=l.useState(""),[N,q]=l.useState("RESIDENTIAL"),[v,L]=l.useState(""),[f,w]=l.useState([]),[O,S]=l.useState([]),[R,Q]=l.useState([]),{execute:me,isLoading:X}=ve(),{execute:pe,isLoading:J}=qe(),{execute:ue,isLoading:K}=fe(),{execute:he,isLoading:G}=Le(),M=J||K||G;l.useEffect(()=>{P()},[]),l.useEffect(()=>{const t=[];return f.forEach(a=>{const n=URL.createObjectURL(a);t.push(n)}),Q(t),()=>{t.forEach(a=>URL.revokeObjectURL(a))}},[f]);const P=async()=>{try{const t=await me();u(t)}catch(t){m.error(t.message||"حدث خطأ أثناء تحميل بيانات المشاريع")}},z=l.useMemo(()=>p.filter(a=>a.name.toLowerCase().includes(i.toLowerCase())||a.location.toLowerCase().includes(i.toLowerCase())).sort((a,n)=>{const b=new Date(a.created_at).getTime();return new Date(n.created_at).getTime()-b}),[p,i]),xe=t=>{o(t.target.value)},W=()=>{C(null),I(""),B(""),q("RESIDENTIAL"),L(""),w([]),S([]),Q([]),x(!0)},Y=t=>{if(C(t),I(t.name),B(t.location),q(t.type),L(t.number_of_units.toString()),w([]),t.pics){const a=t.pics.split(",").filter(n=>n.trim().length>0);S(a)}else S([]);j(!0)},Z=t=>{C(t),T(!0)},ee=t=>{C(t),$(!0)},r=()=>{x(!1),j(!1),T(!1),$(!1)},se=t=>{if(t.target.files){const a=Array.from(t.target.files);w(n=>[...n,...a])}},te=t=>{w(a=>a.filter((n,b)=>b!==t))},je=t=>{S(a=>a.filter((n,b)=>b!==t))},_e=async t=>{if(t.preventDefault(),!_||!g||!N||!v){m.error("يرجى ملء جميع الحقول المطلوبة");return}try{const a=new FormData;a.append("name",_),a.append("location",g),a.append("type",N),a.append("number_of_units",v),f.forEach(n=>{a.append("images",n)}),await pe(a),m.success("تم إنشاء المشروع بنجاح"),r(),P()}catch(a){m.error(a.message||"حدث خطأ أثناء إنشاء المشروع")}},ge=async t=>{if(t.preventDefault(),!c||!_||!g||!N||!v){m.error("يرجى ملء جميع الحقول المطلوبة");return}try{const a=new FormData;a.append("name",_),a.append("location",g),a.append("type",N),a.append("number_of_units",v),a.append("pics",O.join(",")),f.forEach(n=>{a.append("newImages",n)}),await ue(Number(c.id),a),m.success("تم تحديث المشروع بنجاح"),r(),P()}catch(a){m.error(a.message||"حدث خطأ أثناء تحديث المشروع")}},Ne=async()=>{if(c)try{await he(Number(c.id)),m.success("تم حذف المشروع بنجاح"),r(),P()}catch(t){m.error(t.message||"حدث خطأ أثناء حذف المشروع")}},D=t=>t?t.split(",").filter(a=>a.trim().length>0).length:0,ae=t=>t?t.split(",").filter(a=>a.trim().length>0):[];return e.jsxs("div",{className:s.projectsPage,children:[e.jsxs("div",{className:s.header,children:[e.jsx("h1",{className:s.title,children:"إدارة المشاريع"}),e.jsxs("div",{className:s.headerActions,children:[e.jsxs("div",{className:s.searchContainer,children:[e.jsx(ye,{size:18,className:s.searchIcon}),e.jsx("input",{type:"text",placeholder:"بحث بالاسم أو الموقع...",value:i,onChange:xe,className:s.searchInput})]}),e.jsxs("div",{className:s.viewToggle,children:[e.jsx("button",{className:`${s.viewButton} ${U==="cards"?s.activeView:""}`,onClick:()=>H("cards"),"aria-label":"عرض البطاقات",children:e.jsx(be,{size:18})}),e.jsx("button",{className:`${s.viewButton} ${U==="list"?s.activeView:""}`,onClick:()=>H("list"),"aria-label":"عرض القائمة",children:e.jsx(ke,{size:18})})]}),e.jsxs("button",{className:s.addButton,onClick:W,disabled:X,children:[e.jsx(ne,{size:18}),e.jsx("span",{children:"إضافة مشروع"})]})]})]}),X?e.jsx(E,{isVisible:!0}):z.length===0?e.jsx("div",{className:s.emptyState,children:i?e.jsx("p",{children:"لا توجد نتائج مطابقة للبحث"}):e.jsxs(e.Fragment,{children:[e.jsx("p",{children:"لا توجد مشاريع حالياً"}),e.jsxs("button",{className:s.addButton,onClick:W,children:[e.jsx(ne,{size:18}),e.jsx("span",{children:"إضافة مشروع"})]})]})}):U==="cards"?e.jsx("div",{className:s.projectsGrid,children:z.map(t=>e.jsxs("div",{className:s.projectCard,children:[e.jsxs("div",{className:s.projectHeader,children:[e.jsx("h3",{className:s.projectName,children:t.name}),e.jsxs("div",{className:s.actions,children:[e.jsxs("button",{className:s.imageButton,onClick:()=>ee(t),"aria-label":"عرض الصور",disabled:D(t.pics)===0,children:[e.jsx(ce,{size:18}),e.jsx("span",{className:s.imageCount,children:D(t.pics)})]}),e.jsx("button",{className:s.editButton,onClick:()=>Y(t),"aria-label":"تعديل",children:e.jsx(le,{size:18})}),e.jsx("button",{className:s.deleteButton,onClick:()=>Z(t),"aria-label":"حذف",children:e.jsx(k,{size:18})})]})]}),e.jsxs("div",{className:s.projectDetails,children:[e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"الموقع:"}),e.jsx("span",{className:s.detailValue,children:t.location})]}),e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"النوع:"}),e.jsx("span",{className:s.detailValue,children:F[t.type]||t.type})]}),e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"عدد الوحدات:"}),e.jsx("span",{className:s.detailValue,children:t.number_of_units})]}),e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"الوحدات المباعة:"}),e.jsx("span",{className:s.detailValue,children:t.number_of_sold_items})]}),e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"تاريخ الإنشاء:"}),e.jsx("span",{className:s.detailValue,children:Ds(t.created_at)})]})]}),e.jsx("div",{className:s.projectFooter,children:e.jsxs("a",{href:`/projects/${t.id}?name=${t.name}`,className:s.manageButton,children:[e.jsx(ie,{size:16}),e.jsx("span",{children:"إدارة المشروع"})]})})]},t.id))}):e.jsx("div",{className:s.projectsList,children:z.map(t=>e.jsxs("div",{className:s.projectListItem,children:[e.jsxs("div",{className:s.projectListHeader,children:[e.jsx("h3",{className:s.projectName,children:t.name}),e.jsxs("div",{className:s.actions,children:[e.jsxs("button",{className:s.imageButton,onClick:()=>ee(t),"aria-label":"عرض الصور",disabled:D(t.pics)===0,children:[e.jsx(ce,{size:18}),e.jsx("span",{className:s.imageCount,children:D(t.pics)})]}),e.jsx("button",{className:s.editButton,onClick:()=>Y(t),"aria-label":"تعديل",children:e.jsx(le,{size:18})}),e.jsx("button",{className:s.deleteButton,onClick:()=>Z(t),"aria-label":"حذف",children:e.jsx(k,{size:18})})]})]}),e.jsxs("div",{className:s.projectListContent,children:[e.jsxs("div",{className:s.projectListDetails,children:[e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"الموقع:"}),e.jsx("span",{className:s.detailValue,children:t.location})]}),e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"النوع:"}),e.jsx("span",{className:s.detailValue,children:F[t.type]||t.type})]}),e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"عدد الوحدات:"}),e.jsx("span",{className:s.detailValue,children:t.number_of_units})]}),e.jsxs("div",{className:s.detailItem,children:[e.jsx("span",{className:s.detailLabel,children:"الوحدات المباعة:"}),e.jsx("span",{className:s.detailValue,children:t.number_of_sold_items})]})]}),e.jsx("div",{children:e.jsxs("a",{href:`/projects/${t.id}?name=${t.name}`,className:s.manageButton,children:[e.jsx(ie,{size:16}),e.jsx("span",{children:"إدارة المشروع"})]})})]})]},t.id))}),h&&e.jsx("div",{className:s.modalOverlay,children:e.jsxs("div",{className:s.modal,children:[e.jsxs("div",{className:s.modalHeader,children:[e.jsx("h2",{children:"إضافة مشروع جديد"}),e.jsx("button",{className:s.closeButton,onClick:r,children:e.jsx(V,{size:20})})]}),e.jsxs("form",{onSubmit:_e,className:s.form,children:[e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"name",children:"اسم المشروع"}),e.jsx("input",{type:"text",id:"name",value:_,onChange:t=>I(t.target.value),required:!0,placeholder:"أدخل اسم المشروع"})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"location",children:"الموقع"}),e.jsx("input",{type:"text",id:"location",value:g,onChange:t=>B(t.target.value),required:!0,placeholder:"أدخل موقع المشروع"})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"type",children:"نوع المشروع"}),e.jsx("select",{id:"type",value:N,onChange:t=>q(t.target.value),required:!0,children:Object.entries(F).map(([t,a])=>e.jsx("option",{value:t,children:a},t))})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"numberOfUnits",children:"عدد الوحدات"}),e.jsx("input",{type:"number",id:"numberOfUnits",value:v,onChange:t=>L(t.target.value),required:!0,min:"1",placeholder:"أدخل عدد الوحدات"})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{children:"صور المشروع"}),e.jsxs("div",{className:s.fileUploadContainer,children:[e.jsxs("label",{htmlFor:"projectImages",className:s.fileUploadButton,children:[e.jsx(re,{size:18}),e.jsx("span",{children:"اختر الصور"})]}),e.jsx("input",{type:"file",id:"projectImages",onChange:se,multiple:!0,accept:"image/*",className:s.fileInput})]})]}),f.length>0&&e.jsxs("div",{className:s.imagesSection,children:[e.jsx("h3",{children:"الصور المختارة"}),e.jsx("div",{className:s.imageGrid,children:R.map((t,a)=>e.jsxs("div",{className:s.imageContainer,children:[e.jsx("img",{src:t||"/placeholder.svg",alt:`صورة ${a+1}`,className:s.imagePreview}),e.jsx("button",{type:"button",className:s.removeImageButton,onClick:()=>te(a),children:e.jsx(k,{size:16})})]},a))})]}),e.jsxs("div",{className:s.formActions,children:[e.jsx("button",{type:"button",className:s.cancelButton,onClick:r,disabled:M,children:"إلغاء"}),e.jsx("button",{type:"submit",className:s.submitButton,disabled:M,children:J?e.jsxs(e.Fragment,{children:[e.jsx(E,{isVisible:!0}),e.jsx("span",{children:"جاري الإنشاء..."})]}):e.jsx("span",{children:"إضافة"})})]})]})]})}),y&&c&&e.jsx("div",{className:s.modalOverlay,children:e.jsxs("div",{className:s.modal,children:[e.jsxs("div",{className:s.modalHeader,children:[e.jsx("h2",{children:"تعديل المشروع"}),e.jsx("button",{className:s.closeButton,onClick:r,children:e.jsx(V,{size:20})})]}),e.jsxs("form",{onSubmit:ge,className:s.form,children:[e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"editName",children:"اسم المشروع"}),e.jsx("input",{type:"text",id:"editName",value:_,onChange:t=>I(t.target.value),required:!0,placeholder:"أدخل اسم المشروع"})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"editLocation",children:"الموقع"}),e.jsx("input",{type:"text",id:"editLocation",value:g,onChange:t=>B(t.target.value),required:!0,placeholder:"أدخل موقع المشروع"})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"editType",children:"نوع المشروع"}),e.jsx("select",{id:"editType",value:N,onChange:t=>q(t.target.value),required:!0,children:Object.entries(F).map(([t,a])=>e.jsx("option",{value:t,children:a},t))})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{htmlFor:"editNumberOfUnits",children:"عدد الوحدات"}),e.jsx("input",{type:"number",id:"editNumberOfUnits",value:v,onChange:t=>L(t.target.value),required:!0,min:"1",placeholder:"أدخل عدد الوحدات"})]}),O.length>0&&e.jsxs("div",{className:s.imagesSection,children:[e.jsx("h3",{children:"الصور الحالية"}),e.jsx("div",{className:s.imageGrid,children:O.map((t,a)=>e.jsxs("div",{className:s.imageContainer,children:[e.jsx("img",{src:`http://localhost:3001${t}`,alt:`صورة ${a+1}`,className:s.imagePreview}),e.jsx("button",{type:"button",className:s.removeImageButton,onClick:()=>je(a),children:e.jsx(k,{size:16})})]},a))})]}),e.jsxs("div",{className:s.formGroup,children:[e.jsx("label",{children:"إضافة صور جديدة"}),e.jsxs("div",{className:s.fileUploadContainer,children:[e.jsxs("label",{htmlFor:"editProjectImages",className:s.fileUploadButton,children:[e.jsx(re,{size:18}),e.jsx("span",{children:"اختر الصور"})]}),e.jsx("input",{type:"file",id:"editProjectImages",onChange:se,multiple:!0,accept:"image/*",className:s.fileInput})]})]}),f.length>0&&e.jsxs("div",{className:s.imagesSection,children:[e.jsx("h3",{children:"الصور الجديدة"}),e.jsx("div",{className:s.imageGrid,children:R.map((t,a)=>e.jsxs("div",{className:s.imageContainer,children:[e.jsx("img",{src:t||"/placeholder.svg",alt:`صورة ${a+1}`,className:s.imagePreview}),e.jsx("button",{type:"button",className:s.removeImageButton,onClick:()=>te(a),children:e.jsx(k,{size:16})})]},a))})]}),e.jsxs("div",{className:s.formActions,children:[e.jsx("button",{type:"button",className:s.cancelButton,onClick:r,disabled:M,children:"إلغاء"}),e.jsx("button",{type:"submit",className:s.submitButton,disabled:M,children:K?e.jsxs(e.Fragment,{children:[e.jsx(E,{isVisible:!0}),e.jsx("span",{children:"جاري التحديث..."})]}):e.jsx("span",{children:"تحديث"})})]})]})]})}),de&&c&&e.jsx("div",{className:s.modalOverlay,children:e.jsxs("div",{className:s.galleryModal,children:[e.jsxs("div",{className:s.modalHeader,children:[e.jsxs("h2",{children:["صور المشروع: ",c.name]}),e.jsx("button",{className:s.closeButton,onClick:r,children:e.jsx(V,{size:20})})]}),e.jsx("div",{className:s.galleryContent,children:ae(c.pics).length>0?e.jsx("div",{className:s.galleryGrid,children:ae(c.pics).map((t,a)=>e.jsx("div",{className:s.galleryImageContainer,children:e.jsx("img",{src:`http://localhost:3001${t}`,alt:`صورة ${a+1}`,className:s.galleryImage,onClick:()=>window.open(`http://localhost:3001${t}`,"_blank")})},a))}):e.jsx("div",{className:s.noImages,children:e.jsx("p",{children:"لا توجد صور لهذا المشروع"})})}),e.jsx("div",{className:s.galleryFooter,children:e.jsx("button",{className:s.closeGalleryButton,onClick:r,children:"إغلاق"})})]})}),d&&c&&e.jsx("div",{className:s.modalOverlay,children:e.jsxs("div",{className:s.confirmModal,children:[e.jsx("h2",{children:"تأكيد الحذف"}),e.jsxs("p",{children:['هل أنت متأكد من رغبتك في حذف المشروع "',c.name,'"؟',e.jsx("br",{}),"هذا الإجراء لا يمكن التراجع عنه."]}),e.jsxs("div",{className:s.confirmActions,children:[e.jsx("button",{className:s.cancelButton,onClick:r,disabled:G,children:"إلغاء"}),e.jsx("button",{className:s.deleteConfirmButton,onClick:Ne,disabled:G,children:G?e.jsxs(e.Fragment,{children:[e.jsx(E,{isVisible:!0}),e.jsx("span",{children:"جاري الحذف..."})]}):e.jsx("span",{children:"تأكيد الحذف"})})]})]})})]})};export{Ts as default};
