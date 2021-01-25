// https://raw.githubusercontent.com/angular-eslint/angular-eslint/master/packages/integration-tests/fixtures/angular-cli-workspace/.eslintrc.json

/**
 * -----------------------------------------------------
 * NOTES ON CONFIGURATION STRUCTURE
 * -----------------------------------------------------
 *
 * Out of the box, ESLint does not support TypeScript or HTML. Naturally those are the two
 * main file types we care about in Angular projects, so we have to do a little extra work
 * to configure ESLint exactly how we need to.
 *
 * Fortunately, ESLint gives us an "overrides" configuration option which allows us to set
 * different lint tooling (parser, plugins, rules etc) for different file types, which is
 * critical because our .ts files require a different parser and different rules to our
 * .html (and our inline Component) templates.
 */

module.exports = {
  "root": true,
  "overrides": [
    /**
     * -----------------------------------------------------
     * TYPESCRIPT FILES (COMPONENTS, SERVICES ETC) (.ts)
     * -----------------------------------------------------
     */
    {
      "files": ["projects/**/*.ts"],
      "parserOptions": {
        "project": [
          "projects/**/tsconfig.*?.json"
        ],
        "createDefaultProgram": true
      },
      "extends": [
        "plugin:@angular-eslint/recommended",
        // AirBnB Styleguide rules
        "airbnb-typescript/base",
        // Settings for Prettier
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended"
      ],
      "rules": {
        "@angular-eslint/directive-selector": ["error",{"type": "attribute", "prefix": ["ngDate"], "style": "camelCase"}],
        "@angular-eslint/component-selector": ["error",{"type": "element", "prefix": ["ng-date"], "style": "kebab-case"}],
        "quotes": ["error", "single", {"allowTemplateLiterals": true}],
        // Custom rules
        'import/prefer-default-export': 'off',
        'lines-between-class-members': 'off',
        '@typescript-eslint/lines-between-class-members': ["error", "always", { "exceptAfterSingleLine": true }],
        'class-methods-use-this': 'off',
        '@typescript-eslint/unbound-method': ['error',{ignoreStatic: true}],
        "dot-notation": "off",
        "@typescript-eslint/dot-notation": ["off"],
        "linebreak-style": ["error", "unix"],
        "no-param-reassign": ["warn", { "props": false }],
        "@typescript-eslint/no-inferrable-types": 'off',
        "no-plusplus": 'off',
        "no-underscore-dangle": 'off',
        'no-continue': 'off',
        '@angular-eslint/no-input-rename': 'warn',
        '@typescript-eslint/no-use-before-define': 'off',
        'no-restricted-globals': 'warn',
      }
    },

    /**
     * -----------------------------------------------------
     * COMPONENT TEMPLATES
     * -----------------------------------------------------
     *
     * If you use inline templates, make sure you read the notes on the configuration
     * object after this one to understand how they relate to this configuration directly
     * below.
     */
    {
      "files": ["projects/**/*.component.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {
        /**
         * Any template/HTML related rules you wish to use/reconfigure over and above the
         * recommended set provided by the @angular-eslint project would go here.
         *
         * There is an example below from ESLint core (note, this specific example is not
         * necessarily recommended for all projects):
         */
        "max-len": ["error", {"code": 140}]
      }
    },

    /**
     * -----------------------------------------------------
     * EXTRACT INLINE TEMPLATES (from within .component.ts)
     * -----------------------------------------------------
     *
     * This extra piece of configuration is necessary to extract inline
     * templates from within Component metadata, e.g.:
     *
     * @Component({
     *  template: `<h1>Hello, World!</h1>`
     * })
     * ...
     *
     * It works by extracting the template part of the file and treating it as
     * if it were a full .html file, and it will therefore match the configuration
     * specific for *.component.html above when it comes to actual rules etc.
     *
     * NOTE: This processor will skip a lot of work when it runs if you don't use
     * inline templates in your projects currently, so there is no great benefit
     * in removing it, but you can if you want to.
     *
     * You won't specify any rules here. As noted above, the rules that are relevant
     * to inline templates are the same as the ones defined for *.component.html.
     */
    {
      "files": ["projects/**/*.component.ts"],
      "extends": ["plugin:@angular-eslint/template/process-inline-templates"]
    }
  ]
}
