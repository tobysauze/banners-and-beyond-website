/* ─────────────────────────────────────────────────────────────
   Netlify Forms submission for a static SPA.

   Netlify detects forms at build time from static HTML, so the hidden
   detection forms live in index.html (Vite copies it into the build).
   At runtime our JS forms are injected via innerHTML, which Netlify never
   sees — so we submit programmatically by POSTing url-encoded data to "/"
   with a matching `form-name`. Works on the deployed Netlify site; on a
   plain local server the POST 404s, which callers handle gracefully.
   ───────────────────────────────────────────────────────────── */
export async function submitNetlifyForm(formName, data){
  const params = new URLSearchParams();
  params.append('form-name', formName);
  for(const [k, v] of Object.entries(data)){
    if(v != null) params.append(k, typeof v === 'string' ? v : JSON.stringify(v));
  }
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if(!res.ok) throw new Error('Form submission failed: ' + res.status);
  return true;
}
