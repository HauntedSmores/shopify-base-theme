# V+V Base Shopify theme

## Setup

To get started using the theme, clone this repository:

`git clone git@github.com:verbalplusvisual/vpv-shopify-base-theme.git`

or if you dont have SSH setup with github:

`git clone https://github.com/verbalplusvisual/vpv-shopify-base-theme.git`

Next, run `npm install` to install required dependencies.

Edit the `config.yml` to use your correct password and theme id's. Your production definition block **must** be called "production" for the `deploy` command to work properly. For the theme commands to work properly, make sure you have a yamel entry named "development" and one named "production". Detailed instructions on setting up `config.yml` can be found [here.](https://shopify.github.io/themekit/configuration)

Finally, update the `proxy` value in the `bs-config.js` file to correctly proxy your live Shopify domain to your local BrowserSync server during development.

```
module.exports = {
  "files": "theme.update",
  "proxy": "https://mynewstore.myshopify.com/"
};
```

## Structure

### dist/
Destination of compiled files from /src directory. Do not edit files in this directory directly.

### src/
This directory contains the files that should be directly editing during store development.

### src/config
Contains `settings_schema.json` used to add options to the theme to be edited in your store's dashboard. Once data is added in the theme settings, a `settings_data.json` file will be generated in your hosted theme containing the data. We chose to ignore this file in our theme's `config.yml` because its dangerously easy to erase all of the hosted CMS data in your theme. If you ever need it, you can get to it in your store's dashboard.

### src/layout
These liquid files contain the outer markup that the rest of our templates will be injected into.

Something like:

```
// Outer layout template
<html>
    <body>
        // Content from other templates
    <body>
</html>
```

### src/locales
Contains JSON files dedicated to controlling localization for different languages.

### src/sections
Reusable pieces of liquid along with CMS capabilities. Similar to using `settings_schema.json`, except the options are only available on pages that contain a given section.

### src/snippets
Reusable pieces of code without any CMS capabilities. Used for simple injections of reusable markup.

### src/assets
Directory for all theme assets. Depending on the type of file, they will be processed and moved to the `dist` directory.

### src/assets/scripts
All javascript files go here and should be imported into `theme.js` to be bundled. You can create and nest folders as needed.

### src/assets/styles
All SCSS files should be placed here and imported into `theme.scss` to be compiled and bundled. You can create and nest folders as needed.

You may use liquid to reference assets from Shopify by wrapping your liquid in SASS interpolations (`#{}`) like so:

```
a {
  colour: #{'{{ settings.link-color }}'};
}
```

The interpolation tags allow the SASS compiler to ignore these declarations and leave the inner string (without any quotes). All scss partials are compiled down into a single `theme.scss.liquid` file so that the remaining liquid will be rendered by Shopify server side.

### /src/templates
All the necessary Shopify templates live here. The `/customers` sub-directory includes all account related templates.

***

## Commands
Listed here are the commands available with this theme. Command syntax: `npm run <command>`.

### build
- Clears the `dist` folder
- Bundles assets
- Migrates template files to directory to `dist`

All assets are bundled for production with minification, no source maps, and less console logging.

### watch
- Runs the build command for development
    - No minification
    - Source maps are included
    - Expanded bundle information logged in the terminal
- Starts watching your project for changes
- Opens a browser window running a local BrowserSync server proxied to your store
- Uploads any changes to your store on the "development" theme and automatically refreshes the browser

### deploy
- Runs the build command
- Removes **EVERYTHING** from the theme labelled "production"
- Uploads your theme files to the theme named "production" in your `config.yml`

You can also deploy to another theme. Just name whichever theme you would like to deploy to, "production". To avoid conflict, make sure all theme's are unique. You can only have 1 theme named "production" at a time.

### update
- Runs the build command
- Updates all changed files on the "development" theme
