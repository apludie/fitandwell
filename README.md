# FIT and Well Living

A static weight-loss and healthy-eating website for US visitors, built with plain HTML, CSS and JavaScript. No server, database, npm or build step is needed, so it runs directly on GitHub Pages.

---

## Before you publish: settings to update

| What | Where | What to do |
|---|---|---|
| **Toll-free number** | `assets/js/config.js` | Change `contactDisplayNumber`. Every page updates automatically. |
| **Enable click-to-call** | `assets/js/config.js` | Only after your real number works: set `contactNumberVerified: true` and `contactTelephoneHref: "tel:+18885551234"` (digits only, with +1). |
| **Contact email (optional)** | `assets/js/config.js` | Set `contactEmail` to show an email in the footer and on the Contact page. Leave `null` to hide it. |
| **Mobile bottom bar** | `assets/js/config.js` | `showMobileContactBar: true` or `false`. |
| **Your domain** | All `.html` files, `sitemap.xml`, `robots.txt`, `assets/js/config.js` | Replace every `https://www.yourdomain.com` with your real domain (see below). |
| **Team & reviewers** | `about.html` (section "Our team and reviewers") | Add real names and verified credentials only. |
| **Legal pages** | `privacy-policy.html`, `terms.html` | Have them reviewed by a legal professional. Update the privacy policy if you add analytics, ads, forms or a newsletter. |
| **Editorial policy** | `editorial-policy.html` | Make sure every statement matches how you actually work. |

### Replacing the domain in one step

In VS Code: press **Ctrl+Shift+H** (Cmd+Shift+H on Mac), search for `https://www.yourdomain.com`, enter your domain (for example `https://www.wellpath.com`, no trailing slash), and select **Replace All**. This updates canonical URLs, social sharing tags, structured data, the sitemap and robots.txt.

### About the placeholder number

`+1-888-MY-HEALTH` is a placeholder. While `contactNumberVerified` is `false`, the number appears as plain text and is never a clickable `tel:` link. Each HTML file also contains the number as fallback text inside `data-contact="number"` placeholders; the script replaces it with the value from `config.js` when the page loads. When you get your real number, you can also find and replace the old number across all files so the fallback text matches.

---

## Where the number appears

The shared script (`assets/js/main.js`) adds these to every page automatically:

- Announcement bar at the very top
- Header, next to the Get Started button (visible without opening the menu on any screen size)
- Footer contact block
- Fixed bottom contact bar on phones (if enabled)

Page-specific placements: homepage hero and "Contact FIT and Well Living" section, a contact banner on every calculator page, a contact card in the sidebar of content pages, and the Contact Us page.

---

## Preview the site on your computer

Open a terminal in this folder and run:

```
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. (On Windows, use `python` instead of `python3`.) You can also double-click `index.html`, but a local server behaves more like the live site.

---

## Publish with GitHub Pages

1. Create a new repository on GitHub (for example `wellpath`).
2. Upload **all files and folders in this folder** to the repository root, including the empty `.nojekyll` file. `index.html` must be at the top level, not inside another folder.
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the **main** branch and the **/ (root)** folder, then select **Save**.
5. After a minute or two, your site will be available at `https://YOUR-USERNAME.github.io/wellpath/`.

All links use relative paths, so the site works both at that address and on a custom domain.

### Connect your custom domain

1. In **Settings → Pages → Custom domain**, enter your domain (for example `www.yourdomain.com`) and select **Save**. GitHub creates a `CNAME` file for you.
2. At your domain registrar, add DNS records:
   - For `www`: a **CNAME** record pointing to `YOUR-USERNAME.github.io`
   - For the root domain (`yourdomain.com`): **A** records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`
3. Wait for DNS to update (this can take up to 24 hours), then turn on **Enforce HTTPS** in Settings → Pages.
4. Check GitHub's current documentation ("Managing a custom domain for your GitHub Pages site") in case these values change.
5. After launch, submit `https://www.yourdomain.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

---

## Project structure

```
index.html                 Homepage
weight-loss.html           Weight loss guide
fat-loss.html              Fat loss guide
belly-fat.html             How to lose belly fat
meal-plans.html            Meal plans
recipes.html               Recipes (6, with estimated nutrition)
blog.html                  Blog listing
protein-and-weight-loss.html, weight-loss-plateau.html, sleep-and-weight.html   Articles
calculators.html           Calculator hub
bmi-calculator.html, calorie-calculator.html, ideal-weight.html, water-calculator.html
about.html, contact.html
privacy-policy.html, terms.html, medical-disclaimer.html, editorial-policy.html
404.html                   Not-found page
robots.txt, sitemap.xml, .nojekyll
assets/css/style.css       All styles (colors and spacing are variables at the top)
assets/js/config.js        Contact number, domain and site settings
assets/js/main.js          Shared top bar, header, menu, footer and mobile bar
assets/js/calculators.js   All four calculators
assets/images/             Illustrations, favicon, social share image
```

## Add a new page

1. Copy an existing page with a similar layout (for example `about.html`) and rename it.
2. Update `<title>`, the meta description, the canonical URL and the `og:` tags in the `<head>`.
3. Replace the content inside `<main>`.
4. Keep `<div id="wp-header"></div>` at the top of `<body>`, `<div id="wp-footer"></div>` at the bottom, and the two scripts in the `<head>`. The new page then automatically gets the announcement bar, header, number, footer and mobile bar.
5. Add the page to `sitemap.xml`. To add it to the menu, edit the `NAV` list in `assets/js/main.js`.

To add a blog article, copy one of the article pages, then add a card for it in `blog.html` (and the homepage "Latest articles" section if you like).

## Images

The site ships with original SVG illustrations so it looks complete from day one. To use photographs, add optimized JPG or WebP files (ideally under 200 KB, about 1600 px wide for large images) to `assets/images/`, update the `src` and descriptive `alt` text, and only use photos you have the rights to use.

## Calculators

| Calculator | Method |
|---|---|
| BMI | 703 × lb ÷ in² (or kg ÷ m²); adult categories 18.5 / 25 / 30 |
| Calories | Mifflin-St Jeor × activity factor (1.2–1.9); targets below 1,200 (female equation) / 1,500 (male equation) are not shown |
| Ideal weight | Weight range for BMI 18.5–24.9, plus Devine, Robinson, Miller and Hamwi formulas (heights 5 ft and above) |
| Water | 0.5 fl oz per lb + 12 fl oz per 30 min exercise + 16 fl oz for hot climates (a general rule of thumb) |

All calculations run in the visitor's browser; nothing is stored or sent.

## Not included yet

- **Newsletter signup:** left out on purpose, since it needs a real email service. If you add one, update the privacy policy.
- **Contact form:** GitHub Pages can't process forms on its own. A third-party form service would be needed, and the privacy policy should be updated.
- **Analytics:** none installed. If you add analytics, update the privacy policy and any cookie notices.
