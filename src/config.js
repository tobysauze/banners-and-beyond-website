/* ─────────────────────────────────────────────────────────────
   BUSINESS & INTEGRATION CONFIG
   This is the ONE place to edit real-world details. Anything marked
   TODO needs the owner to fill in before / soon after launch.
   ───────────────────────────────────────────────────────────── */

export const BUSINESS = {
  name: 'Banners & Beyond Ltd',
  email: 'bannersandbeyondltd@gmail.com',
  phone: '01726 214123',
  phoneHref: 'tel:+441726214123',
  addressLines: ['14 Fore Street', 'Bodmin', 'Cornwall', 'PL31 2HQ'],
  // TODO(owner): add your Companies House registration number (required in the
  // footer of a UK Ltd company's website). Leave '' to hide the line for now.
  companyNo: '',
  // TODO(owner): set to your VAT number if VAT-registered; leave '' if not.
  vatNo: '',
  social: {
    facebook: 'https://www.facebook.com/cornwalldmc/',
    instagram: 'https://www.instagram.com/bannersandbeyondltd/',
    tiktok: 'https://www.tiktok.com/@bannerssndbeyond'
  }
};

// Whether prices are shown VAT-inclusive. Set true (and vatNo above) if registered.
export const VAT_REGISTERED = false;
export const priceNote = VAT_REGISTERED ? 'Prices include VAT' : 'Prices shown are the total you pay';

// Delivery / turnaround. TODO(owner): confirm these match your real service.
export const DELIVERY = {
  collect: 'Free collection from the workshop, 14 Fore Street, Bodmin PL31 2HQ',
  ukPostage: 'UK delivery calculated once your order is confirmed',
  proofDays: '1 working day',
  turnaround: '3–5 working days after you approve your proof'
};

/* Stripe Payment Links.
   Custom-print orders are proof-first: the customer submits their order + artwork
   here, we check the artwork and send a free proof, then take payment. Card payment
   is via Stripe. Create a Payment Link in your Stripe dashboard and paste the URL
   below, keyed by product id, to show a "Pay now" button for that item; otherwise
   the customer is told a secure payment link follows proof approval.
   NOTE: a Payment Link is a single fixed price, so it can't total a mixed basket —
   the reliable path is: order captured here → proof approved → payment link/invoice
   sent for the final amount. */
export const STRIPE_LINKS = {
  // 'work-polo': 'https://buy.stripe.com/xxxxxxxxxxxx',
};
export const stripeLinkFor = id => STRIPE_LINKS[id] || null;
