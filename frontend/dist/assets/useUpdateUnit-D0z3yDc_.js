import{c as x,r as y}from"./index-BAQHcCZP.js";const b=()=>{const{isLoading:s,error:c,data:i,setError:e,_execute:r}=x(),n=y.useCallback(async(d,o={})=>{try{return await r(`units/project/${d}`,"GET",null,o)}catch(a){throw e(a),a}},[r,e]);return{isLoading:s,error:c,data:i,execute:n,setError:e}},C=()=>{const{isLoading:s,error:c,data:i,setError:e,_execute:r}=x(),n=y.useCallback(async(d,o,a,u,f,v,l,p,h={})=>{try{const t={};return o!==void 0&&(t.project_id=o),a!==void 0&&(t.name=a),u!==void 0&&(t.area=u),f!==void 0&&(t.price=f),v!==void 0&&(t.unit_notes=v),l!==void 0&&(t.status=l),p!==void 0&&(t.sold_date=p),await r(`units/${d}`,"PATCH",t,h)}catch(t){throw e(t),t}},[r,e]);return{isLoading:s,error:c,data:i,execute:n,setError:e}};export{C as a,b as u};
