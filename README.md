# V+V Base Shopify theme

To get started using the theme, clone this repository:

`git clone git@github.com:verbalplusvisual/vpv-shopify-base-theme.git`

or if you dont have SSH setup with github:

`git clone https://github.com/verbalplusvisual/vpv-shopify-base-theme.git`

Next, run `npm install` to install required dependencies.

Finally, edit the `config.yml` to use your correct password and theme id's. Your production definition block **must** be called "production" for the `deploy` command to work properly.

## Comands
Listed here are the commands available with this theme. Command syntax: `npm run <command>`.

### build
Builds the `src` directory to `dist`. This includes deleting what is currently in `dist`

### dev
Clears the `dist` folder and watches your `src` directory for changes and uploads them to your shopify store.

**Note**: Deleting any file in your `src` directory **will not** delete that file from `dist`.

This is a limitation of the `copy-webpack-plugin` used to copy theme files over from `src` to `dist`. It will not delete files during `webpack --watch`. You can either stop your dev command and run the build or watch command again, or make your deletions in both `src` and `dist`.

### deploy

Clears the `dist` folder, runs the build, and uploads your theme to your shopify production theme as defined in `config.yml`. This uses themekit's `replace` command, and as such will **COMPLETELY** replace the existing theme in your shopify store.
