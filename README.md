# Taste of Africa 🍲

A multi-page website celebrating Africa's rich and diverse culinary traditions: its dishes, ingredients, regions and the stories behind them.

**Live site:** https://capitale1.github.io/taste_of_africa_website_project/

Built by **Armstrong Ngororano** 

---

## Pages

| Page | What it includes |
|---|---|
| **Home** (`index.html`) | Hero slideshow with welcome text, intro YouTube video, featured dishes (`<figure>` + `<figcaption>`), links to regions, latest food trends (`<article>`) |
| **Recipes** (`recipes.html`) | All recipes as cards, with region filter buttons and favorites |
| **Recipe pages** (`recipes/`) | Jollof Rice, Chicken Tagine, Injera and Isombe, each with a cultural description, ingredients list, servings scaler, expandable steps (`<details>` + `<summary>`), video tutorial, nutrition table and a map of the dish's origin |
| **Regions** (`regions.html`) | Overview of three culinary regions |
| **Region pages** (`regions/`) | West, North and East Africa: food culture, staple foods, cooking techniques, example dishes and a video |
| **About** (`about.html`) | Mission, a short history of African cuisine and its global influence, and a map of Kimironko Market in Kigali |
| **Contact** (`contact.html`) | Accessible contact form with labels, a country `<datalist>`, a topic `<select>` and a message `<textarea>` |

A newsletter signup form appears in the footer of every page.

## Interactive features (JavaScript)

- **Recipe filter:** filter recipes by region without reloading the page, using `data-region` attributes and a `.hidden` class.
- **Favorites:** save recipes with the ❤️ button. Favorites are stored in `localStorage`, restored on page load, and can be viewed with the "My favorites" filter.
- **Ingredient scaler:** change the number of servings and every ingredient amount updates, shown as friendly fractions (½, ¼).
- **Dark / light mode:** toggle with the 🌙 button. The choice is saved in `localStorage` and applies across all pages.
- **Contact form validation:** the submit is intercepted with `event.preventDefault()`, the message must be more than 20 characters, and a personalised "Thank you, [Name]!" message replaces the form.
- **Live character counter** on the contact message.
- **Hero slideshow:** the home page background rotates between food photos (paused for users who prefer reduced motion).
- **Newsletter feedback:** shows a thank-you message on signup.

## Design

- **Colour palette** inspired by African spices and landscapes: turmeric yellow, chili red, red-earth brown and millet cream, stored as CSS variables.
- **Google Fonts:** *Abril Fatface* for headings and *Nunito* for body text.
- **Responsive layout** with CSS Grid, Flexbox, relative units and `clamp()`, tested on desktop, tablet and phone sizes.
- **Accessibility:** semantic HTML5, alt text on every image, labels on every form field, visible keyboard focus styles, ARIA labels on buttons, and support for `prefers-reduced-motion`.

## Project structure

```
taste_of_africa_website_project/
├── index.html
├── recipes.html
├── regions.html
├── about.html
├── contact.html
├── recipes/
│   ├── jollof.html
│   ├── tagine.html
│   ├── injera.html
│   └── isombe.html
├── regions/
│   ├── west-africa.html
│   ├── north-africa.html
│   └── east-africa.html
├── images/
├── styles.css
├── script.js
└── README.md
```

## Running it locally

1. Clone the repository:
   ```bash
   git clone https://github.com/capitale1/taste_of_africa_website_project.git
   ```
2. Open the folder in VS Code and launch `index.html` with the **Live Server** extension.

Opening the page through a local server (rather than double-clicking the file) is recommended so that the embedded YouTube videos play correctly.

## Technologies

HTML5 · CSS3 · JavaScript (DOM manipulation, `localStorage`) · Google Fonts · YouTube and Google Maps embeds · GitHub Pages

## Credits

- Food photos from [Unsplash](https://unsplash.com) and [Pexels](https://www.pexels.com).
- Videos embedded from YouTube; maps from Google Maps.
- Nutrition values are approximate and for general information only.
