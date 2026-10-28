# Project Documentation

🌐 Read in: [Português](README-PTBR.md)

An interactive, user-centered web platform (UCD) for **sweet-shop ---
Artisan Confectionery**. The project follows the white and antique-pink
editorial aesthetic (`#C86D88`) of the supplied design reference and
combines it with the prototype's structure, the complete menu (**Sweets,
Savory Items, and Beverages**), a shopping cart, a feedback board,
Google Maps, and CRUD operations backed by PostgreSQL.

## Run the project using VSCode

clone repository: git clone <url>

Install dependencies: npm install

Run the app: npm run dev


## User Review & Key Decisions

> \[!IMPORTANT\]
>
> The plan was updated to incorporate all reference images, the official
> logo, the three pages of the actual menu, social media inspiration,
> and the structural prototype. Click **Proceed** to begin implementing
> the code.

-   **Visual Identity & Design Reference**
    -   A **white and antique-pink palette (`#C86D88` / `#B85A75`)**,
        with soft blush-pink circular backgrounds (`#FCEEF2`) and
        editorial serif typography (`Playfair Display`). Italic emphasis
        is used for the tagline, *"A sweet moment can change your day,"*
        following the supplied visual reference (`image_7652ad12.png`).
    -   The **official logo** (`/assets/aistudio/LOGO_465ec8e3.jpeg`) is
        used in both the header and the circular hero highlight,
        alongside a floating badge with the tagline *"A little
        sweetness, a lot of care."*
-   **Official Menu Preloaded into PostgreSQL**
    -   Items from `CARDAPIO01` (**Sweets**), `CARDAPIO02` (**Savory
        Items**), and `CARDAPIO03` (**Beverages**) are intended to be
        preloaded into the database with their listed prices. Examples
        include dessert cups (R\$ 15.00), cake jars (R\$ 15.00), brownie
        slices (R\$ 18.00), truffles (R\$ 4.50), savory pastries (R\$
        10.00), cold pie (R\$ 15.00), and hot chocolate (R\$ 18.00). A
        dedicated gallery also allows users to view or download the
        three original menu flyers.
-   **Hybrid Structure (Visual Reference + Prototype)**
    -   Smooth navigation covers **Products / Highlights**, **Menu
        (Sweets, Savory Items, Beverages)**, **Our Story / Reviews**,
        **Location (Google Maps)**, **Contact (WhatsApp, Instagram,
        iFood)**, and a section with **Website Creator Information**.
        Personal contact details, profile links, and the precise
        business address have been redacted from this documentation.

------------------------------------------------------------------------

## 1. Overview & Core Concept

-   **What It Does:** The website provides customers with a welcoming,
    interactive experience for browsing sweets, savory items, and
    beverages; viewing photos in three standardized sizes (`500x500`,
    `800x800`, and `700x900 px`); downloading product images; adding
    items to a cart and preparing orders through WhatsApp or iFood;
    rating products with stars and comments; and viewing the store's
    location. For the administrator, it provides a CRUD system connected
    to PostgreSQL to add products, update prices and photos, and
    moderate comments.

-   **Target Audience / Personas**

    -   **Customers:** Want to view real product photos for custom
        orders and ready-to-go items, check current prices, add items to
        the cart, and place orders through WhatsApp or iFood with one
        click.
    -   **Administrator:** Needs to add new products, update prices, and
        correct listings quickly, while choosing the appropriate image
        size.

------------------------------------------------------------------------

## 2. User Experience & Visual Design

### Visual Identity & Theme

-   **Art Direction:** *Editorial Artisan Confectionery*, aligned with
    the reference layout (`image_7652ad12.png`). It combines a pure
    white background (`#FFFFFF`) and pinkish cream (`#FFF9FB`), organic
    circular shapes in pastel pink (`#FCEEF2`), minimal decorative
    sparkles, and **antique-pink / mauve buttons (`#C86D88`)**.

-   **Color Palette (60-30-10)**

    -   **60% Bright Base:** Pure white (`#FFFFFF`) and soft section
        backgrounds (`#FDF8F9`).
    -   **30% Surfaces & Typographic Contrast:** Blush pink (`#FCEEF2`)
        for decorative circles and filter backgrounds, delicate borders
        (`#F3DCE2`), dark coffee-brown headings (`#23191C`), and
        supporting text in warm gray (`#6E5D63`).
    -   **10% Main Accent (Meu Doce Pink):** `#C86D88` (hover:
        `#B55975`) for primary buttons such as **Explore the Menu** and
        **Order via WhatsApp**, active **Sweets / Savory Items /
        Beverages** tabs, and the *"A little sweetness, a lot of care"*
        badge.

-   **Typography & Hierarchy**

    -   **Headings & Hero (`Playfair Display`):** A classic serif font
        with expressive pink italics for phrases such as *"changes your
        day,"* *"A little sweetness, a lot of care,"* and *"Our Menu."*
    -   **Interface, Subheadings & Menu (`Plus Jakarta Sans`):** A clean
        sans-serif font for navigation, descriptions, and spaced
        uppercase subheadings such as `MADE WITH CARE` and
        `CHOOSE YOUR FAVORITE`.
    -   **Prices & Measurements (`tabular-nums`):** Consistent numeric
        alignment for Brazilian real prices (`R$ 15.00`, `R$ 4.50`) and
        image dimensions (`500×500 px`, `800×800 px`, `700×900 px`).

### Main User Flows & Application Sections

1.  **Header & Quick Menu**
    -   Branding on the left with the official circular logo
        (`/assets/aistudio/LOGO_465ec8e3.jpeg`) and the **Meu Doce**
        title (*ARTISAN CONFECTIONERY*).
    -   Easy-to-access navigation for **Products & Menu**, **Our Story &
        Menu Flyers**, **Reviews**, **Location & Contact**, and the
        **Admin Panel (CRUD)**, plus the **Shopping Cart** and **Order
        via WhatsApp** buttons.
2.  **Hero Section ("A sweet moment *can change your day.*")**
    -   The left column contains a `MADE WITH CARE` badge, the main
        heading, and the subtitle: *"Artisan sweets, cakes, savory
        treats, and lots of love in every recipe. Choose your favorites
        and place your order with us."* It also includes **Explore the
        Menu** and **Order via iFood ↗** buttons, plus an
        order-availability note.
    -   The right column features a circular composition with the
        official logo (`/assets/aistudio/LOGO_465ec8e3.jpeg`), soft
        blush-pink circles, and a tilted circular badge reading *"A
        little sweetness, a lot of care."*
3.  **Product Showcase & Full Menu (Dynamic CRUD)**
    -   Interactive tabs for **Sweets**, **Savory Items**,
        **Beverages**, and **All**, plus a filter by image format:
        -   **Square (small):** `500 x 500 px`
        -   **Square (large):** `800 x 800 px`
        -   **Portrait:** `700 x 900 px`
    -   Each card displays the image in the selected format, **Name**,
        **Price**, **Description**, **Manufacturing Date**, an **Add to
        Cart** button, and a **Download Product Image** button at the
        exact dimensions. When administrator mode is enabled, **Edit**
        and **Delete** buttons are also available.
    -   Clicking a product opens a detailed modal with links to order
        the item through **WhatsApp** or **iFood**.
    -   A viewer for the **three official menu flyers** (`CARDAPIO01`,
        `CARDAPIO02`, `CARDAPIO03`) lets customers view or download the
        original menu artwork.
4.  **Feedback Board & Social Media Showcase**
    -   A section inspired by the confectionery's social media presence
        appears alongside an interactive feedback board where customers
        can leave a rating (1--5 stars) and a comment.
    -   The administrator can **edit** or **delete** any comment
        directly in the interface.
    -   Specific social media handles and account statistics have been
        omitted for privacy.
5.  **Location (Google Maps) & Quick Contact**
    -   An interactive Google Maps view and a button for opening
        directions are included in the design. The precise address and
        direct map link have been redacted.
    -   A highlighted contact bar includes buttons for **WhatsApp**,
        **Instagram**, and **iFood**. Phone numbers, social media
        handles, and direct listing links have been redacted.
6.  **Website Creator Credits**
    -   The original design includes a creator credit section with a
        software developer title and links to GitHub and LinkedIn. The
        creator's name and personal profile URLs have been redacted.

------------------------------------------------------------------------

## 3. Product Decisions & Trade-Offs

-   **Decision 1: Seed the Database with the Store's Actual Menu**
    -   **Chosen Approach:** Initially populate PostgreSQL with products
        extracted from `CARDAPIO01`, `CARDAPIO02`, and `CARDAPIO03`,
        including dessert cups, cake jars, mini pudding, traditional and
        filled brownies, brownie slices, dessert pots, small sweets,
        honey cakes, truffle cones, strawberry-filled coxinhas, bonbons,
        cake slices, pavê, truffles, baked savory snacks, savory
        pastries, cold chicken pie, and beverages.
    -   **Why:** This allows the website to use real business data from
        the beginning and makes it possible to test database inserts,
        updates, and deletions immediately.
-   **Decision 2: Canvas Resizing to `500x500`, `800x800`, and
    `700x900 px`**
    -   **Chosen Approach:** During product upload/registration and
        image download, an HTML5 Canvas utility processes photos to
        exactly `500×500`, `800×800`, or `700×900` pixels, using an
        intelligent center crop (`object-fit: cover`).
    -   **Why:** This meets requirement 4.5 of the project documentation
        without distorting photos taken on a mobile phone.

------------------------------------------------------------------------

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

``` text
┌──────────────────────────────────────────────────────────────────────────────┐
│             REACT FRONTEND — "MEU DOCE" IDENTITY (#C86D88 & WHITE)          │
│                                                                              │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌───────────────┐ │
│  │ Header & Quick Menu    │  │ Editorial Hero           │  │ Shopping Cart │ │
│  │ • Official Logo        │  │ • Main tagline           │  │ • Slide-Over  │ │
│  │ • Products / Menu      │  │ • Pink Circular Badge    │  │ • Subtotal    │ │
│  │ • Contact / Admin      │  │ • Menu & iFood CTA        │  │ • WhatsApp    │ │
│  └───────────┬────────────┘  └────────────┬────────────┘  └───────▲───────┘ │
│              │                            │                       │         │
│              ▼                            ▼                       │         │
│  ┌────────────────────────────────────────────────────────────────┴───────┐ │
│  │              Product Showcase & Menu CRUD                              │ │
│  │              (Sweets | Savory Items | Beverages)                        │ │
│  │ • Image Sizes: 500x500 px | 800x800 px | 700x900 px                    │ │
│  │ • Required Fields: Image, Price, Name (+ Description and Date)         │ │
│  │ • Customer Actions: View Details/Redirect, Add to Cart, Download       │ │
│  │ • Admin Actions: Add Item, Edit Listing, Delete Item                   │ │
│  └────────────────────────────────────┬────────────────────────────────────┘ │
│                                       │                                    │
│  ┌────────────────────────────────────┼───────────────────────────────────┐ │
│  │ Feedback Board & Social Media      │ Google Maps, Contact & Creator    │ │
│  │ • Ratings (1–5) + Comments         │ • Map location (redacted)         │ │
│  │ • Admin Moderation (Edit/Delete)   │ • WhatsApp, Instagram, iFood      │ │
│  │ • Social media preview             │ • Creator links (redacted)        │ │
│  └──────────────────┬─────────────────┴─────────────────┬─────────────────┘ │
└─────────────────────┼───────────────────────────────────┼───────────────────┘
                      │ API REST (/api/products, /api/feedbacks)
                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS SERVER + POSTGRESQL DATABASE                   │
│                                                                              │
│ • Table `products`: id, name, price, category ('Sweets'|'Savory Items'|     │
│   'Beverages'), image_url, image_size ('500x500'|'800x800'|'700x900'),      │
│   description, manufactured_date, redirect_url, created_at                  │
│ • Table `feedbacks`: id, author_name, rating (1..5), comment, created_at    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Integrated Local Visual Assets

-   `/assets/aistudio/LOGO_465ec8e3.jpeg`: Official *Meu Doce ---
    Artisan Confectionery* logo used in the navbar, hero, and footer.
-   `/assets/aistudio/CARDAPIO01_1efd2637.jpeg`,
    `/assets/aistudio/CARDAPIO02_e94365ca.jpeg`,
    `/assets/aistudio/CARDAPIO03_9fa23d90.jpeg`: Original menu flyers
    for Sweets, Savory Items, and Beverages, available for full-screen
    viewing and download.
-   `/assets/aistudio/PERFIL-INSTA_feec39bc.jpeg`: Visual reference for
    the social media section.
