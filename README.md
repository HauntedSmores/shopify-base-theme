# V+V Base Shopify theme

## Setup

To get started using the theme, clone this repository:

`git clone git@github.com:verbalplusvisual/vpv-shopify-base-theme.git`

or if you dont have SSH setup with github:

`git clone https://github.com/verbalplusvisual/vpv-shopify-base-theme.git`

Next, run `npm install` to install required dependencies.

Edit the `config.yml` to use your correct password and theme id's. Your production definition block **must** be called "production" for the `deploy` command to work properly.

Detailed instructions on setting up `config.yml` can be found [here.](https://shopify.github.io/themekit/configuration)

Finally, update the `proxy` value in the `bs-config.js` file to correctly proxy your live Shopify domain to your local BrowserSync server during development. 

Example:

```
module.exports = {
  "files": "theme.update",
  "proxy": "https://mynewstore.myshopify.com/",
  "reloadDelay": 1500
};
```

## Structure

### `assets`
Flattened assets folder that Shopify expects. All files from `src` end up here in one way or another.

### `config`
Contains `settings_schema.json` used to add options to the theme to be edited in your store's dashboard. Once data is added in the theme settings, a `settings_data.json` file will be generated in your hosted theme containing the data. We chose to ignore this file in our theme's `config.yml` because its dangerously easy to erase all of the hosted CMS data in your theme. If you ever need it, you can get to it in your store's dashboard.

### `layout`
These liquid templates contain the outer markup that the rest of our templates will me injected into.

Something like:

```
// outer layout template
<html>
    <body>
        // Content from other templates
    <body>
</html>
```

### `/locales`
Contains JSON files dedicated to controlling localization for different languages.

### `sections`
Reusable pieces of liquid along with CMS capabilities. Similar to using `settings_schema.json`, except the options are only available on pages that contain a given section.

### `snippets`
Reusable pieces of code without any CMS capabilities. Used for simple injections of reusable markup.

### `src`
All source code regarding JS and SCSS as well as theme related images.

#### `src/assets`
Directory for all theme images, fonts, etc. You may nest and create new folders and files as you wish - all directories will be flattened and the files will be placed in the `/assets` folder when using commands (see Commands section see below).

#### `src/scripts`
All javascript files go here and should be imported into `theme.js` to be bundled by webpack.

#### `src/styles`
All SCSS files should be placed here and imported into `theme.scss` to be compiled and bundled by webpack.

You may use liquid to reference assets from Shopify by wrapping your liquid in SASS interpolations (`#{}`) like so:

```
a {
  colour: #{'{{ settings.link-colour }}'};
}
```

The interpolation tags allow the SASS compiler to ignore these declarations and leave the inner string (without any quotes). All scss partials are compiled down into a single `theme.scss.liquid` file so that the remaining liquid will be rendered by Shopify server side.

### `templates`
All the necessary shopify templates live here, where the `/customers` directory includes all account related templates.

## Comands
Listed here are the commands available with this theme. Command syntax: `npm run <command>`.

### build
Builds the `src` directory to `dist`. This includes deleting what is currently in `dist`

### dev
- Clears the `dist` folder
- Opens a browser window running a local BrowserSync server proxied to your store
- Watches your project for changes
- Compiles JS, SCSS and migrates/flattens your images folder
- Uploads any changes to your store and automatically refreshes the browser.

There are a couple of caveats to this one do-all command
1. Themekit will be watching as soon as webpack starts building/watching. This means that themekit will start uploading/updating all the files that webpack manages (`theme.scss.liquid`, `theme.js`, and anything in the assets folder). <br><br>There's nothing explicitly wrong about this, but it might be annoying to wait for all of the uploads before starting to work.<br><br>If you prefer, you can open two terminal windows and use `npm run webpack-watch` in the first, wait for that to idle, and in your second terminal window run `npm run theme-watch`. This way themekit will only start watching **_after_** webpack has run its first build.

2. Deleting a file from `src/assets` **will not** delete that file from the root `/assets` directory during the `watch` command. This is a limitation of the `copy-webpack-plugin` used to copy and flatten files.<br><br>You can either stop your dev command, run `npm run build`, and rerun `npm run dev` or make your deletions in both `src/assets` and `/assets`.

### deploy

Clears the `dist` folder, runs the build, and uploads your theme to your shopify production theme as defined in `config.yml`. This uses themekit's `replace` command, and as such will **COMPLETELY** replace the existing theme in your shopify store.

### webpack-watch
Clears the `dist` folder and runs `webpack --watch` along side BrowserSync.

### theme-watch
Runs themekit's watch command.
