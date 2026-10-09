/* ==========================================================================
   WELLPATH SITE CONFIGURATION
   --------------------------------------------------------------------------
   This is the ONE place to change the contact number and site-wide settings.
   Every page reads these values, so a change here updates the whole website.
   ========================================================================== */

window.WELLPATH_CONFIG = {

  /* ---------- Contact number ---------- */

  // The number exactly as visitors should see it.
  contactDisplayNumber: "+1-888-MY-HEALTH",

  // The label shown next to the number.
  contactLabel: "Contact Us Toll-Free",

  // IMPORTANT: Keep this false until you have a real, working number.
  // While false, the number is shown as plain text (never a clickable link).
  contactNumberVerified: false,

  // The dialable version of your real number, used only when
  // contactNumberVerified is true. Example: "tel:+18885551234"
  contactTelephoneHref: null,

  /* ---------- Optional contact email ---------- */

  // Leave as null to hide email everywhere. Example: "hello@yourdomain.com"
  contactEmail: null,

  /* ---------- Mobile contact bar ---------- */

  // Shows a slim contact bar fixed to the bottom of the screen on phones.
  showMobileContactBar: true,

  /* ---------- Site details ---------- */

  siteName: "FIT and Well Living",
  tagline: "A Healthier Life Starts Here.",

  // Your production domain, with no trailing slash.
  // NOTE: Canonical tags, sitemap.xml and robots.txt also contain this value.
  // See README.md ("Before you publish") to update them all at once.
  siteUrl: "https://www.yourdomain.com"
};
