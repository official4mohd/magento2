/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'Magento_Theme/js/model/breadcrumb-list'
], function ($, breadcrumbList) {
    'use strict';

    return function (widget) {
        $.widget('mage.breadcrumbs', widget, {
            options: {
                categoryUrlSuffix: '',
                useCategoryPathInUrl: false,
                product: '',
                menuContainer: '[data-action="navigation"] > ul'
            },

            /** @inheritdoc */
            _init: function () {
                var menu;

                // render breadcrumbs after navigation menu is loaded.
                menu = $(this.options.menuContainer).data('mageMenu');

                if (typeof menu === 'undefined') {
                    $(this.options.menuContainer).on('menucreate', function () {
                        this._super();
                    }.bind(this));
                } else {
                    this._super();
                }
            },

            /** @inheritdoc */
            _render: function () {
                this._appendCatalogCrumbs();
                this._super();
            },

            /**
             * Append category and product crumbs.
             *
             * @private
             */
            _appendCatalogCrumbs: function () {
                var categoryCrumbs = this._resolveCategoryCrumbs();

                categoryCrumbs.forEach(function (crumbInfo) {
                    breadcrumbList.push(crumbInfo);
                });

                if (this.options.product) {
                    breadcrumbList.push(this._getProductCrumb());
                }
            },

            /**
             * Resolve categories crumbs.
             *
             * @return Array
             * @private
             */
            _resolveCategoryCrumbs: function () {
                var menuItem = this._resolveCategoryMenuItem(),
                    categoryCrumbs = [];

                if (menuItem !== null && menuItem.length) {
                    categoryCrumbs.unshift(this._getCategoryCrumb(menuItem));

                    while ((menuItem = this._getParentMenuItem(menuItem)) !== null) {
                        categoryCrumbs.unshift(this._getCategoryCrumb(menuItem));
                    }
                }

                return categoryCrumbs;
            },

            /**
             * Returns crumb data.
             *
             * @param {Object} menuItem
             * @return {Object}
             * @private
             */
            _getCategoryCrumb: function (menuItem) {
                var categoryId,
                    categoryName,
                    categoryUrl;

                categoryId = /(\d+)/i.exec(menuItem.attr('id'))[0];
                categoryName = menuItem.text();
                categoryUrl = menuItem.attr('href');

                return {
                    'name': 'category' + categoryId,
                    'label': categoryName,
                    'link': categoryUrl,
                    'title': ''
                };
            },

            /**
             * Returns product crumb.
             *
             * @return {Object}
             * @private
             */
            _getProductCrumb: function () {
                return {
                    'name': 'product',
                    'label': this.options.product,
                    'link': '',
                    'title': ''
                };
            },

            /**
             * Find parent menu item for current.
             *
             * @param {Object} menuItem
             * @return {Object|null}
             * @private
             */
            _getParentMenuItem: function (menuItem) {
                var classes,
                    classNav,
                    parentClass,
                    parentMenuItem = null;

                if (!menuItem) {
                    return null;
                }

                classes = menuItem.parent().attr('class');
                classNav = classes.match(/(nav\-)[0-9]+(\-[0-9]+)+/gi);

                if (classNav) {
                    classNav = classNav[0];
                    parentClass = classNav.substr(0, classNav.lastIndexOf('-'));

                    if (parentClass.lastIndexOf('-') !== -1) {
                        parentMenuItem = $(this.options.menuContainer).find('.' + parentClass + ' > a');
                        parentMenuItem = parentMenuItem.length ? parentMenuItem : null;
                    }
                }

                return parentMenuItem;
            },

            /**
             * Returns category menu item.
             *
             * Tries to resolve category from url or from referrer as fallback and
             * find menu item from navigation menu by category url.
             *
             * @return {Object|null}
             * @private
             */
            _resolveCategoryMenuItem: function () {
                var categoryUrl,
                    menu,
                    categoryMenuItem = null;

                if (this.options.useCategoryPathInUrl) {
                    // In case category path is used in product url - resolve category url from current url.
                    categoryUrl = window.location.href.split('?')[0];
                    categoryUrl = categoryUrl.substring(0, categoryUrl.lastIndexOf('/')) +
                        this.options.categoryUrlSuffix;
                } else {
                    // In other case - try to resolve it from referrer.
                    categoryUrl = document.referrer;
                }

                menu = $(this.options.menuContainer);

                if (categoryUrl && menu.length) {
                    categoryMenuItem = menu.find('a[href="' + categoryUrl + '"]');
                }

                return categoryMenuItem;
            }
        });
    };
});
