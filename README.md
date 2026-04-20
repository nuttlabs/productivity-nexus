# productivity.nexus (static mirror)

Static snapshot of productivity.nexus, rebuilt from the published Webflow site so it can be hosted on GitHub Pages with no Webflow plan needed.

## Deploy (GitHub Pages, custom domain)

1. Create a new repo and push this folder's contents to the default branch.
2. Settings -> Pages -> Source: that branch, `/` (root).
3. The `CNAME` file already points the custom domain to `productivity.nexus`.
4. Update your DNS to point the apex and/or `www` to GitHub Pages per https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site.

`.nojekyll` is included so GitHub Pages serves files verbatim without Jekyll processing.

## Structure

- `index.html` -- home with subscription form.
- `confirmed/`, `one-more-step/`, `sandbox/` -- utility pages.
- `insights/<slug>/index.html` -- 14 blog posts.
- `newsletters/<slug>/index.html` -- 8 newsletter issues.
- `templates-tools/<slug>/index.html` -- 4 template landing pages.
- `feature/<slug>/index.html` -- 1 feature page.
- `cdn.prod.website-files.com/`, `cdn.jsdelivr.net/`, `d3e54v103j8qbb.cloudfront.net/` -- mirrored static assets.

All 31 URLs in `sitemap.xml` are included.

## Subscription form (placeholder)

The home page form posts JSON (`{"email": "..."}`) to:

    https://REPLACE-WITH-AIRTABLE-WEBHOOK.example.com/subscribe

Edit the `action` attribute on `#subscription-form` in `index.html` when you have your Airtable webhook URL. On 2xx it redirects to `/one-more-step`; on error it shows the existing `.w-form-fail` message. Adjust the inline script at the bottom of `index.html` if your webhook expects a different payload shape.

## External links kept as-is

Links to `get.productivity.nexus`, `lib.productivity.nexus`, `notion-coda.productivity.nexus`, `pro.productivity.nexus`, and `tally.productivity.nexus` point at those live subdomains via `https://` URLs. Images hosted on `lib.productivity.nexus` are loaded from that subdomain directly rather than mirrored.

## Not preserved

- Webflow Forms backend (replaced with the placeholder above).
- Any Webflow server-side features (search, memberships, ecommerce, personalization). None were in use on this site.
- Webflow's tracking/analytics scripts are left untouched in the HTML; delete them from templates if unwanted.
