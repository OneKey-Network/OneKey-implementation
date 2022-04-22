(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function (d, b) {
        d.__proto__ = b;
      } || function (d, b) {
        for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      };

      return extendStatics(d, b);
    };

    function __extends(d, b) {
      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);

      function __() {
        this.constructor = d;
      }

      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
      __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];

          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }

        return t;
      };

      return __assign.apply(this, arguments);
    };
    function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function (resolve) {
          resolve(value);
        });
      }

      return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }

        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }

        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }

        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    }
    function __generator(thisArg, body) {
      var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      },
          f,
          y,
          t,
          g;
      return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
      }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
        return this;
      }), g;

      function verb(n) {
        return function (v) {
          return step([n, v]);
        };
      }

      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");

        while (_) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];

          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;

            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };

            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;

            case 7:
              op = _.ops.pop();

              _.trys.pop();

              continue;

            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }

              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }

              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }

              if (t && _.label < t[2]) {
                _.label = t[2];

                _.ops.push(op);

                break;
              }

              if (t[2]) _.ops.pop();

              _.trys.pop();

              continue;
          }

          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }

        if (op[0] & 5) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    }

    var data$1 = { introHeading:"Manage your data and cookies (US)",
      introBody:[ "Advertising funds your access to our site.",
        "We've partnered with OneKey to manage whether you prefer standard or personalized marketing when accessing participating websites. OneKey relies on a random digital ID that is an essential part of how our website operates and is used to ensure all recipients understand your preferences.",
        "We and our partners may also use information linked to these IDs to improve our overall service. By opting-into personalized content and ads, we can improve your online experience.",
        "If you choose not to participate, you will receive targeted content that is unrelated to your browsing activity or interactions.",
        "You can learn more or manage your choices at any time by going to 'Privacy settings' at the bottom of any page on our site." ],
      aboutHeading:"Learn more about (US)",
      aboutBody:[ "We believe you should have transparency and control over how, where, and why your data is used.",
        "We partnered with OneKey, a non-profit technology, to manage your marketing preferences when accessing [BrandName].",
        "OneKey relies on digital IDs to understand your activity and sends your preferences to our partner websites in order to customize the ads you see. IDs like these are an essential part of how [BrandName]'s website operates and provides you with a more relevant experience.",
        "You may change your preferences at any time.",
        "Your consent will automatically expire 2 years after you provide it. You have the right to be forgotten, which you can exercise at any time, and on any OneKey partner website simply by resetting your ID. You can also get a temporary ID by using the incognito/private browsing function of your browser.",
        "If you choose not to participate, you will still see ads unrelated to your browsing activity.",
        "You can learn more and manage your choices at any time by going to \"Privacy settings\" at the bottom of any page. See our Privacy Policy and Privacy Notice." ],
      settingsHeading:"Choose your marketing preferences",
      settingsBody:[ "OneKey signals your preferences that can enhance your experience across partner websites, without bothering you with future prompts or directly identifying you.",
        "By saving your preferences, you also agree to our site's privacy policy." ],
      settingsBrowsingId:"Your browsing ID",
      settingsBrowsingIdTip:"<strong>OneKey</strong> links your preferences to a random, pseudonymous ID that lasts 6 months. Use your right to be forgotten at any time by refreshing your browsing ID.",
      settingsPersonalizedLabel:"Turn on personalized marketing",
      settingsPersonalizedBody:"See more relevant content and ads.",
      settingsStandardLabel:"Turn on standard marketing",
      settingsStandardBody:"See generic content and ads.",
      settingsThisSite:"Apply preferences to this site only and re-ask on other OneKey sites",
      settingsThisSitePrivacyPolicy:"View site's privacy policy",
      customizeCurrent:"Your current choice:",
      customizeAll:"Select all / unselect all",
      customizeStandard:"Standard marketing",
      customizePersonalized:"Personalized marketing",
      customizeCustomized:"Customized marketing",
      customizeAccessDeviceLabel:"Select and/or access information on a device",
      customizeBasicAdsLabel:"Select basic ads",
      customizeMarketResearchLabel:"Apply market research to generate audience insights",
      customizeImproveLabel:"Develop & improve products",
      customizeSecurityLabel:"Ensure security, prevent fraud, and debug",
      customizeDeliverLabel:"Technically deliver ads or content",
      customizePersonalizeProfileLabel:"Create a personalized ad profile",
      customizePersonalizedAdsLabel:"Select personalized ads",
      customizePersonalizedContentProfileLabel:"Create a personalized content profile",
      customizePersonalizedContentLabel:"Select personalized content",
      customizeMeasureAdPerformanceLabel:"Measure ad performance",
      customizeMeasureContentPerformanceLabel:"Measure content performance",
      customizeAccessDeviceTip:"Select and/or access information on a device",
      customizeBasicAdsTip:"Select basic ads",
      customizeMarketResearchTip:"Apply market research to generate audience insights",
      customizeImproveTip:"Develop & improve products",
      customizeSecurityTip:"Ensure security, prevent fraud, and debug",
      customizeDeliverTip:"Technically deliver ads or content",
      customizePersonalizeProfileTip:"Create a personalized ad profile",
      customizePersonalizedAdsTip:"Select personalized ads",
      customizePersonalizedContentProfileTip:"Create a personalized content profile",
      customizePersonalizedContentTip:"Select personalized content",
      customizeMeasureAdPerformanceTip:"Measure ad performance",
      customizeMeasureContentPerformanceTip:"Measure content performance",
      snackbarHeadingPersonalized:"You choose to see personalized content and relevant ads on [BrandName]",
      snackbarHeadingStandard:"You choose to see standard marketing on [BrandName]",
      snackbarHeadingCustomized:"You've chosen customized marketing on [BrandName]",
      snackbarBodyPersonalized:"<a href=\"#\" data-card='settings' class=\"ok-ui-link\">Review your preferences</a> at any time.",
      snackbarBodyStandard:"Turn <a href=\"#\" data-card='settings' class=\"ok-ui-link\">personalized marketing</a> on at any time to make your ads more relevant.",
      snackbarBodyCustomized:"Turn <a href=\"#\" data-card='settings' class=\"ok-ui-link\">personalized marketing</a> on at any time to make your ads more relevant.",
      refuseAll:"Refuse All",
      proceed:"Proceed",
      save:"Save",
      customize:"Customize your experience",
      back:"Back",
      cancel:"Cancel" };

    var en_us = data$1;

    var data = { introHeading:"Manage your data and cookies (GB)",
      introBody:[ "Advertising funds your access to our site.",
        "We've partnered with OneKey to manage whether you prefer standard or personalized marketing when accessing participating websites. OneKey relies on a random digital ID that is an essential part of how our website operates and is used to ensure all recipients understand your preferences.",
        "We and our partners may also use information linked to these IDs to improve our overall service. By opting-into personalized content and ads, we can improve your online experience.",
        "If you choose not to participate, you will receive targeted content that is unrelated to your browsing activity or interactions.",
        "You can learn more or manage your choices at any time by going to 'Privacy settings' at the bottom of any page on our site." ],
      aboutHeading:"Learn more about (GB)",
      aboutBody:[ "We believe you should have transparency and control over how, where, and why your data is used.",
        "We partnered with OneKey, a non-profit technology, to manage your marketing preferences when accessing [BrandName].",
        "OneKey relies on digital IDs to understand your activity and sends your preferences to our partner websites in order to customize the ads you see. IDs like these are an essential part of how [BrandName]'s website operates and provides you with a more relevant experience.",
        "You may change your preferences at any time.",
        "Your consent will automatically expire 2 years after you provide it. You have the right to be forgotten, which you can exercise at any time, and on any OneKey partner website simply by resetting your ID. You can also get a temporary ID by using the incognito/private browsing function of your browser.",
        "If you choose not to participate, you will still see ads unrelated to your browsing activity.",
        "You can learn more and manage your choices at any time by going to \"Privacy settings\" at the bottom of any page. See our Privacy Policy and Privacy Notice." ],
      settingsHeading:"Choose your marketing preferences",
      settingsBody:[ "OneKey signals your preferences that can enhance your experience across partner websites, without bothering you with future prompts or directly identifying you.",
        "By saving your preferences, you also agree to our site's privacy policy." ],
      settingsBrowsingId:"Your browsing ID",
      settingsBrowsingIdTip:"<strong>OneKey</strong> links your preferences to a random, pseudonymous ID that lasts 6 months. Use your right to be forgotten at any time by refreshing your browsing ID.",
      settingsPersonalizedLabel:"Turn on personalized marketing",
      settingsPersonalizedBody:"See more relevant content and ads.",
      settingsStandardLabel:"Turn on standard marketing",
      settingsStandardBody:"See generic content and ads.",
      settingsThisSite:"Apply preferences to this site only and re-ask on other OneKey sites",
      settingsThisSitePrivacyPolicy:"View site's privacy policy",
      customizeCurrent:"Your current choice:",
      customizeAll:"Select all / unselect all",
      customizeStandard:"Standard marketing",
      customizePersonalized:"Personalized marketing",
      customizeCustomized:"Customized marketing",
      customizeAccessDeviceLabel:"Select and/or access information on a device",
      customizeBasicAdsLabel:"Select basic ads",
      customizeMarketResearchLabel:"Apply market research to generate audience insights",
      customizeImproveLabel:"Develop & improve products",
      customizeSecurityLabel:"Ensure security, prevent fraud, and debug",
      customizeDeliverLabel:"Technically deliver ads or content",
      customizePersonalizeProfileLabel:"Create a personalized ad profile",
      customizePersonalizedAdsLabel:"Select personalized ads",
      customizePersonalizedContentProfileLabel:"Create a personalized content profile",
      customizePersonalizedContentLabel:"Select personalized content",
      customizeMeasureAdPerformanceLabel:"Measure ad performance",
      customizeMeasureContentPerformanceLabel:"Measure content performance",
      customizeAccessDeviceTip:"Select and/or access information on a device",
      customizeBasicAdsTip:"Select basic ads",
      customizeMarketResearchTip:"Apply market research to generate audience insights",
      customizeImproveTip:"Develop & improve products",
      customizeSecurityTip:"Ensure security, prevent fraud, and debug",
      customizeDeliverTip:"Technically deliver ads or content",
      customizePersonalizeProfileTip:"Create a personalized ad profile",
      customizePersonalizedAdsTip:"Select personalized ads",
      customizePersonalizedContentProfileTip:"Create a personalized content profile",
      customizePersonalizedContentTip:"Select personalized content",
      customizeMeasureAdPerformanceTip:"Measure ad performance",
      customizeMeasureContentPerformanceTip:"Measure content performance",
      snackbarHeadingPersonalized:"You choose to see personalized content and relevant ads on [BrandName]",
      snackbarHeadingStandard:"You choose to see standard marketing on [BrandName]",
      snackbarHeadingCustomized:"You've chosen customized marketing on [BrandName]",
      snackbarBodyPersonalized:"<a href=\"#\" data-card='settings' class=\"ok-ui-link\">Review your preferences</a> at any time.",
      snackbarBodyStandard:"Turn <a href=\"#\" data-card='settings' class=\"ok-ui-link\">personalized marketing</a> on at any time to make your ads more relevant.",
      snackbarBodyCustomized:"Turn <a href=\"#\" data-card='settings' class=\"ok-ui-link\">personalized marketing</a> on at any time to make your ads more relevant.",
      refuseAll:"Refuse All",
      proceed:"Proceed",
      save:"Save",
      customize:"Customize your experience",
      back:"Back",
      cancel:"Cancel" };

    var en_gb = data;

    var Values = /** @class */ (function () {
        function Values() {
            // Intro fields
            this.introHeading = 'NOT SET';
            this.introBody = ['NOT SET'];
            // About fields
            this.aboutHeading = 'NOT SET';
            this.aboutBody = ['NOT SET'];
            // Button labels
            this.refuseAll = 'NOT SET';
            this.proceed = 'NOT SET';
            this.back = 'NOT SET';
            this.save = 'NOT SET';
            this.customize = 'NOT SET';
            // Settings fields
            this.settingsHeading = 'NOT SET';
            this.settingsBody = ['NOT SET'];
            this.settingsBrowsingId = 'NOT SET';
            this.settingsPersonalizedLabel = 'NOT SET';
            this.settingsPersonalizedBody = 'NOT SET';
            this.settingsStandardLabel = 'NOT SET';
            this.settingsStandardBody = 'NOT SET';
            this.settingsThisSite = 'NOT SET';
            // Snackbar fields
            this.snackbarHeadingPersonalized = 'NOT SET';
            this.snackbarHeadingStandard = 'NOT SET';
            this.snackbarHeadingCustomized = 'NOT SET';
            this.snackbarBodyPersonalized = 'NOT SET';
            this.snackbarBodyStandard = 'NOT SET';
            this.snackbarBodyCustomized = 'NOT SET';
            // Customize fields
            this.customizeCurrent = 'NOT SET';
            this.customizeAll = 'NOT SET';
            this.customizeStandard = 'NOT SET';
            this.customizePersonalized = 'NOT SET';
            this.customizeCustomized = 'NOT SET';
            this.customizeAccessDeviceLabel = 'NOT SET';
            this.customizeBasicAdsLabel = 'NOT SET';
            this.customizeMarketResearchLabel = 'NOT SET';
            this.customizeImproveLabel = 'NOT SET';
            this.customizeSecurityLabel = 'NOT SET';
            this.customizeDeliverLabel = 'NOT SET';
            this.customizePersonalizeProfileLabel = 'NOT SET';
            this.customizePersonalizedAdsLabel = 'NOT SET';
            this.customizePersonalizedContentProfileLabel = 'NOT SET';
            this.customizePersonalizedContentLabel = 'NOT SET';
            this.customizeMeasureAdPerformanceLabel = 'NOT SET';
            this.customizeMeasureContentPerformanceLabel = 'NOT SET';
            this.customizeAccessDeviceTip = 'NOT SET';
            this.customizeBasicAdsTip = 'NOT SET';
            this.customizeMarketResearchTip = 'NOT SET';
            this.customizeImproveTip = 'NOT SET';
            this.customizeSecurityTip = 'NOT SET';
            this.customizeDeliverTip = 'NOT SET';
            this.customizePersonalizeProfileTip = 'NOT SET';
            this.customizePersonalizedAdsTip = 'NOT SET';
            this.customizePersonalizedContentProfileTip = 'NOT SET';
            this.customizePersonalizedContentTip = 'NOT SET';
            this.customizeMeasureAdPerformanceTip = 'NOT SET';
            this.customizeMeasureContentPerformanceTip = 'NOT SET';
        }
        return Values;
    }());
    var Locale = /** @class */ (function (_super) {
        __extends(Locale, _super);
        function Locale(languages) {
            var _this = _super.call(this) || this;
            /**
             * Logo to use with the templates.
             */
            _this.Logo = '';
            _this.LogoCenter = '';
            // Use US english as the default locale.
            Object.assign(_this, en_us);
            // Replace any values with the users chosen locale.
            Object.assign(_this, _this.getLocale(languages));
            // Extract the arrays into paragraph HTML element strings.
            _this.introBodyHTML = _this.toHtml(_this.introBody);
            _this.aboutBodyHTML = _this.toHtml(_this.aboutBody);
            _this.settingsBodyHTML = _this.toHtml(_this.settingsBody);
            return _this;
        }
        Locale.prototype.toHtml = function (list) {
            return "<p>".concat(list.join('</p><p>'), "</p>");
        };
        Locale.prototype.getLocale = function (locales) {
            for (var _i = 0, locales_1 = locales; _i < locales_1.length; _i++) {
                var locale = locales_1[_i];
                switch (locale) {
                    case 'en-GB':
                        return en_gb;
                    case 'en-US':
                        return en_us;
                }
            }
            return en_us;
        };
        return Locale;
    }(Values));

    // Wrappers to console.(log | info | warn | error). Takes N arguments, the same as the native methods
    var log = /** @class */ (function () {
        function log() {
        }
        log.Message = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log.apply(console, log.decorateLog('MESSAGE:', args));
        };
        log.Info = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.info.apply(console, log.decorateLog('INFO:', args));
        };
        log.Warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.warn.apply(console, log.decorateLog('WARNING:', args));
        };
        log.Error = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.error.apply(console, log.decorateLog('ERROR:', args));
        };
        log.decorateLog = function (prefix, args) {
            var newArgs = [].slice.call(args);
            prefix && newArgs.unshift(prefix);
            newArgs.unshift(log.label('#18a9e1'));
            newArgs.unshift('%cok-ui');
            return newArgs;
        };
        log.label = function (color) {
            return "display: inline-block; color: #fff; background: ".concat(color, "; padding: 1px 4px; border-radius: 3px;");
        };
        return log;
    }());

    /**
     * UI specific options set via the script tag's attributes.
     */
    var Config = /** @class */ (function () {
        function Config(script) {
            this.script = script;
        }
        Object.defineProperty(Config.prototype, "displayIntro", {
            /**
             * True to display the introduction card, or false to skip straight to the settings card after a possible redirect.
             */
            get: function () {
                var value = this.getValue('data-display-intro', 'True to display the introduction card, or false to skip straight to the settings card after a possible redirect.');
                return Boolean(JSON.parse(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "snackbarTimeoutMs", {
            /**
             * The number of milliseconds to wait for the snackbar to disappear.
             */
            get: function () {
                var value = this.getValue('data-snackbar-timeout-ms', 'The number of milliseconds to wait for the snackbar to disappear.');
                return Number(JSON.parse(value));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "proxyHostName", {
            /**
             * The host name to use when reading and writing data from the global storage.
             */
            get: function () {
                return this.getValue('data-proxy-host-name', 'The host name to use when reading and writing data from the global storage.');
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "brandName", {
            /**
             * The brand name to use throughout the user interface.
             */
            get: function () {
                return this.getValue('data-brand-name', 'The brand name to use throughout the user interface.');
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "brandLogoUrl", {
            /**
             * Gets the brand logo from the script attributes.
             */
            get: function () {
                return this.getValue('data-brand-logo-url', 'This image is used as the logo when the this site only check box is selected.');
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Config.prototype, "brandPrivacyUrl", {
            /**
             * This URL is needed to inform the user about the privacy policy of the brand.
             */
            get: function () {
                return this.getValue('data-brand-privacy-url', 'This URL is needed to inform the user about the privacy policy of the brand.');
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Replaces tokens in the input text with values from the configuration.
         * @param value
         * @returns String value with [] tokens replaced
         */
        Config.prototype.replace = function (value) {
            return value.replace('[BrandName]', this.brandName).replace('[BrandPrivacyUrl]', this.brandPrivacyUrl);
        };
        Config.prototype.getValue = function (name, help) {
            var value = this.script.getAttribute(name);
            if (value == null) {
                return Config.missingAttribute(name, help);
            }
            return value;
        };
        Config.missingAttribute = function (name, help) {
            var message = "Attribute '".concat(name, "' needs to be added as an attribute of the script tag.");
            if (help != null) {
                message += " ".concat(help);
            }
            log.Error(message);
            return message;
        };
        return Config;
    }());

    /**
     * Base class used for all binding classes containing common functionality.
     */
    var BindingBase = /** @class */ (function () {
        /**
         * Constructs a new field binding the field in the model to an HTML element of the id. i.e. "model-field", or
         * "model-preference". The id should be unique within the DOM.
         * @param id of the id of the element to bind to
         */
        function BindingBase(id) {
            this.id = id;
        }
        /**
         * Gets the HTML elements that match the id from the document.
         * @returns first element that matches the id
         */
        BindingBase.prototype.getElement = function () {
            return document.getElementById(this.id);
        };
        return BindingBase;
    }());
    /**
     * Binding used only to display the value of a field and not update it.
     */
    var BindingViewOnly = /** @class */ (function (_super) {
        __extends(BindingViewOnly, _super);
        function BindingViewOnly() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // The field that the binding relates to. Set when the binding is added to the field.
            _this.field = null;
            return _this;
        }
        /**
         * Sets the field that the binding is associated with.
         * @param field to associate with the UI element
         */
        BindingViewOnly.prototype.setField = function (field) {
            this.field = field;
        };
        return BindingViewOnly;
    }(BindingBase));
    /**
     * Binding used only to display the value of a field and provide a feedback mechanism to update it.
     */
    var BindingReadWrite = /** @class */ (function (_super) {
        __extends(BindingReadWrite, _super);
        function BindingReadWrite() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // Binds all the elements to the events that matter for the binding.
        BindingReadWrite.prototype.bind = function () {
            var _this = this;
            var element = this.getElement();
            if (element != undefined) {
                this.events.forEach(function (event) {
                    element.addEventListener(event, function () {
                        if (_this.field != null) {
                            _this.field.value = _this.getValue(element);
                        }
                    });
                });
            }
        };
        return BindingReadWrite;
    }(BindingViewOnly));
    /**
     * A boolean field type that is used with an HTMLInputElement and the checked property. Includes support for radio
     * options not part of a group and check boxes.
     */
    var BindingChecked = /** @class */ (function (_super) {
        __extends(BindingChecked, _super);
        function BindingChecked() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.events = ['change'];
            return _this;
        }
        BindingChecked.prototype.getValue = function (element) {
            return element.checked;
        };
        BindingChecked.prototype.setValue = function (value) {
            var element = _super.prototype.getElement.call(this);
            if (element != undefined) {
                element.checked = value;
            }
        };
        BindingChecked.prototype.bind = function () {
            if (this.field != null) {
                this.setValue(this.field.value);
            }
            _super.prototype.bind.call(this);
        };
        return BindingChecked;
    }(BindingReadWrite));
    var BindingCheckedMap = /** @class */ (function (_super) {
        __extends(BindingCheckedMap, _super);
        /**
         * Constructs a new instance of the BindingCheckMap<T> class.
         * @param id of the id of the element to bind to
         * @param trueValue the value of the field that will result in the element being checked
         * @param falseValue the value of the field that will result in the element being unchecked
         */
        function BindingCheckedMap(id, trueValue, falseValue) {
            var _this = _super.call(this, id) || this;
            _this.events = ['change'];
            _this.trueValue = trueValue;
            _this.falseValue = falseValue;
            return _this;
        }
        /**
         * If the element is checked then returns the trueValue, otherwise falseValue.
         * @param element bound to
         * @returns
         */
        BindingCheckedMap.prototype.getValue = function (element) {
            return element.checked ? this.trueValue : this.falseValue;
        };
        /**
         * Sets the input checked property to true if the value matches the trueValue otherwise unchecked.
         * @remarks
         * JSON string comparison method is needed for non native types where we want to compare the value for equality
         * rather than the reference to the instance.
         *
         * @param value to use when determine the display state
         */
        BindingCheckedMap.prototype.setValue = function (value) {
            var element = _super.prototype.getElement.call(this);
            if (element != undefined) {
                element.checked = JSON.stringify(value) === JSON.stringify(this.trueValue);
            }
        };
        BindingCheckedMap.prototype.bind = function () {
            if (this.field != null) {
                this.setValue(this.field.value);
            }
            _super.prototype.bind.call(this);
        };
        return BindingCheckedMap;
    }(BindingReadWrite));
    /**
     * Binds a field with different values to display HTML. Used to change the contents of div elements and the like based
     * on the current state of fields that can have a known number of values.
     * @remarks
     * The key comparison is performed using JSON.Stringify to compare keys by value.
     */
    var BindingElement = /** @class */ (function (_super) {
        __extends(BindingElement, _super);
        /**
         * Relates any HTML element with the innerHTML property to a map of keys and locale string values.
         * @param id of the id of the element to bind to
         * @param map of field values to locale strings
         */
        function BindingElement(id, map) {
            var _this = _super.call(this, id) || this;
            _this.pairs = Array.from(map);
            return _this;
        }
        BindingElement.prototype.setValue = function (key) {
            var element = _super.prototype.getElement.call(this);
            if (element != undefined) {
                var text = this.getString(key);
                if (text != undefined) {
                    element.innerHTML = text;
                }
                else {
                    element.innerHTML = '';
                }
            }
        };
        BindingElement.prototype.bind = function () {
            if (this.field != null) {
                this.setValue(this.field.value);
            }
        };
        BindingElement.prototype.getString = function (key) {
            var keyJSON = JSON.stringify(key);
            for (var _i = 0, _a = this.pairs; _i < _a.length; _i++) {
                var item = _a[_i];
                if (JSON.stringify(item[0]) == keyJSON) {
                    return item[1];
                }
            }
            return null;
        };
        return BindingElement;
    }(BindingViewOnly));
    var BindingButton = /** @class */ (function (_super) {
        __extends(BindingButton, _super);
        function BindingButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BindingButton.prototype.setValue = function (value) {
            var element = _super.prototype.getElement.call(this);
            if (element != undefined) {
                element.disabled = value != true;
            }
        };
        BindingButton.prototype.bind = function () {
            if (this.field != null) {
                this.setValue(this.field.value);
            }
        };
        return BindingButton;
    }(BindingViewOnly));

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var uaParser = {exports: {}};

    (function (module, exports) {
      /////////////////////////////////////////////////////////////////////////////////

      /* UAParser.js v1.0.2
         Copyright © 2012-2021 Faisal Salman <f@faisalman.com>
         MIT License */

      /*
      Detect Browser, Engine, OS, CPU, and Device type/model from User-Agent data.
      Supports browser & node.js environment. 
      Demo   : https://faisalman.github.io/ua-parser-js
      Source : https://github.com/faisalman/ua-parser-js */
      /////////////////////////////////////////////////////////////////////////////////
      (function (window, undefined$1) {
        // Constants
        /////////////

        var LIBVERSION = '1.0.2',
            EMPTY = '',
            UNKNOWN = '?',
            FUNC_TYPE = 'function',
            UNDEF_TYPE = 'undefined',
            OBJ_TYPE = 'object',
            STR_TYPE = 'string',
            MAJOR = 'major',
            MODEL = 'model',
            NAME = 'name',
            TYPE = 'type',
            VENDOR = 'vendor',
            VERSION = 'version',
            ARCHITECTURE = 'architecture',
            CONSOLE = 'console',
            MOBILE = 'mobile',
            TABLET = 'tablet',
            SMARTTV = 'smarttv',
            WEARABLE = 'wearable',
            EMBEDDED = 'embedded',
            UA_MAX_LENGTH = 255;
        var AMAZON = 'Amazon',
            APPLE = 'Apple',
            ASUS = 'ASUS',
            BLACKBERRY = 'BlackBerry',
            BROWSER = 'Browser',
            CHROME = 'Chrome',
            EDGE = 'Edge',
            FIREFOX = 'Firefox',
            GOOGLE = 'Google',
            HUAWEI = 'Huawei',
            LG = 'LG',
            MICROSOFT = 'Microsoft',
            MOTOROLA = 'Motorola',
            OPERA = 'Opera',
            SAMSUNG = 'Samsung',
            SONY = 'Sony',
            XIAOMI = 'Xiaomi',
            ZEBRA = 'Zebra',
            FACEBOOK = 'Facebook'; ///////////
        // Helper
        //////////

        var extend = function (regexes, extensions) {
          var mergedRegexes = {};

          for (var i in regexes) {
            if (extensions[i] && extensions[i].length % 2 === 0) {
              mergedRegexes[i] = extensions[i].concat(regexes[i]);
            } else {
              mergedRegexes[i] = regexes[i];
            }
          }

          return mergedRegexes;
        },
            enumerize = function (arr) {
          var enums = {};

          for (var i = 0; i < arr.length; i++) {
            enums[arr[i].toUpperCase()] = arr[i];
          }

          return enums;
        },
            has = function (str1, str2) {
          return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
        },
            lowerize = function (str) {
          return str.toLowerCase();
        },
            majorize = function (version) {
          return typeof version === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined$1;
        },
            trim = function (str, len) {
          if (typeof str === STR_TYPE) {
            str = str.replace(/^\s\s*/, EMPTY).replace(/\s\s*$/, EMPTY);
            return typeof len === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
          }
        }; ///////////////
        // Map helper
        //////////////


        var rgxMapper = function (ua, arrays) {
          var i = 0,
              j,
              k,
              p,
              q,
              matches,
              match; // loop through all regexes maps

          while (i < arrays.length && !matches) {
            var regex = arrays[i],
                // even sequence (0,2,4,..)
            props = arrays[i + 1]; // odd sequence (1,3,5,..)

            j = k = 0; // try matching uastring with regexes

            while (j < regex.length && !matches) {
              matches = regex[j++].exec(ua);

              if (!!matches) {
                for (p = 0; p < props.length; p++) {
                  match = matches[++k];
                  q = props[p]; // check if given property is actually array

                  if (typeof q === OBJ_TYPE && q.length > 0) {
                    if (q.length === 2) {
                      if (typeof q[1] == FUNC_TYPE) {
                        // assign modified match
                        this[q[0]] = q[1].call(this, match);
                      } else {
                        // assign given value, ignore regex match
                        this[q[0]] = q[1];
                      }
                    } else if (q.length === 3) {
                      // check whether function or regex
                      if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                        // call function (usually string mapper)
                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined$1;
                      } else {
                        // sanitize match using given regex
                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined$1;
                      }
                    } else if (q.length === 4) {
                      this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined$1;
                    }
                  } else {
                    this[q] = match ? match : undefined$1;
                  }
                }
              }
            }

            i += 2;
          }
        },
            strMapper = function (str, map) {
          for (var i in map) {
            // check if current value is array
            if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
              for (var j = 0; j < map[i].length; j++) {
                if (has(map[i][j], str)) {
                  return i === UNKNOWN ? undefined$1 : i;
                }
              }
            } else if (has(map[i], str)) {
              return i === UNKNOWN ? undefined$1 : i;
            }
          }

          return str;
        }; ///////////////
        // String map
        //////////////
        // Safari < 3.0


        var oldSafariMap = {
          '1.0': '/8',
          '1.2': '/1',
          '1.3': '/3',
          '2.0': '/412',
          '2.0.2': '/416',
          '2.0.3': '/417',
          '2.0.4': '/419',
          '?': '/'
        },
            windowsVersionMap = {
          'ME': '4.90',
          'NT 3.11': 'NT3.51',
          'NT 4.0': 'NT4.0',
          '2000': 'NT 5.0',
          'XP': ['NT 5.1', 'NT 5.2'],
          'Vista': 'NT 6.0',
          '7': 'NT 6.1',
          '8': 'NT 6.2',
          '8.1': 'NT 6.3',
          '10': ['NT 6.4', 'NT 10.0'],
          'RT': 'ARM'
        }; //////////////
        // Regex map
        /////////////

        var regexes = {
          browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i // Chrome for Android/iOS
          ], [VERSION, [NAME, 'Chrome']], [/edg(?:e|ios|a)?\/([\w\.]+)/i // Microsoft Edge
          ], [VERSION, [NAME, 'Edge']], [// Presto based
          /(opera mini)\/([-\w\.]+)/i, // Opera Mini
          /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, // Opera Mobi/Tablet
          /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i // Opera
          ], [NAME, VERSION], [/opios[\/ ]+([\w\.]+)/i // Opera mini on iphone >= 8.0
          ], [VERSION, [NAME, OPERA + ' Mini']], [/\bopr\/([\w\.]+)/i // Opera Webkit
          ], [VERSION, [NAME, OPERA]], [// Mixed
          /(kindle)\/([\w\.]+)/i, // Kindle
          /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, // Lunascape/Maxthon/Netfront/Jasmine/Blazer
          // Trident based
          /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, // Avant/IEMobile/SlimBrowser
          /(ba?idubrowser)[\/ ]?([\w\.]+)/i, // Baidu Browser
          /(?:ms|\()(ie) ([\w\.]+)/i, // Internet Explorer
          // Webkit/KHTML based                                               // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
          /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale|qqbrowserlite|qq)\/([-\w\.]+)/i, // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ, aka ShouQ
          /(weibo)__([\d\.]+)/i // Weibo
          ], [NAME, VERSION], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i // UCBrowser
          ], [VERSION, [NAME, 'UC' + BROWSER]], [/\bqbcore\/([\w\.]+)/i // WeChat Desktop for Windows Built-in Browser
          ], [VERSION, [NAME, 'WeChat(Win) Desktop']], [/micromessenger\/([\w\.]+)/i // WeChat
          ], [VERSION, [NAME, 'WeChat']], [/konqueror\/([\w\.]+)/i // Konqueror
          ], [VERSION, [NAME, 'Konqueror']], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i // IE11
          ], [VERSION, [NAME, 'IE']], [/yabrowser\/([\w\.]+)/i // Yandex
          ], [VERSION, [NAME, 'Yandex']], [/(avast|avg)\/([\w\.]+)/i // Avast/AVG Secure Browser
          ], [[NAME, /(.+)/, '$1 Secure ' + BROWSER], VERSION], [/\bfocus\/([\w\.]+)/i // Firefox Focus
          ], [VERSION, [NAME, FIREFOX + ' Focus']], [/\bopt\/([\w\.]+)/i // Opera Touch
          ], [VERSION, [NAME, OPERA + ' Touch']], [/coc_coc\w+\/([\w\.]+)/i // Coc Coc Browser
          ], [VERSION, [NAME, 'Coc Coc']], [/dolfin\/([\w\.]+)/i // Dolphin
          ], [VERSION, [NAME, 'Dolphin']], [/coast\/([\w\.]+)/i // Opera Coast
          ], [VERSION, [NAME, OPERA + ' Coast']], [/miuibrowser\/([\w\.]+)/i // MIUI Browser
          ], [VERSION, [NAME, 'MIUI ' + BROWSER]], [/fxios\/([-\w\.]+)/i // Firefox for iOS
          ], [VERSION, [NAME, FIREFOX]], [/\bqihu|(qi?ho?o?|360)browser/i // 360
          ], [[NAME, '360 ' + BROWSER]], [/(oculus|samsung|sailfish)browser\/([\w\.]+)/i], [[NAME, /(.+)/, '$1 ' + BROWSER], VERSION], [// Oculus/Samsung/Sailfish Browser
          /(comodo_dragon)\/([\w\.]+)/i // Comodo Dragon
          ], [[NAME, /_/g, ' '], VERSION], [/(electron)\/([\w\.]+) safari/i, // Electron-based App
          /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, // Tesla
          /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i // QQBrowser/Baidu App/2345 Browser
          ], [NAME, VERSION], [/(metasr)[\/ ]?([\w\.]+)/i, // SouGouBrowser
          /(lbbrowser)/i // LieBao Browser
          ], [NAME], [// WebView
          /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i // Facebook App for iOS & Android
          ], [[NAME, FACEBOOK], VERSION], [/safari (line)\/([\w\.]+)/i, // Line App for iOS
          /\b(line)\/([\w\.]+)\/iab/i, // Line App for Android
          /(chromium|instagram)[\/ ]([-\w\.]+)/i // Chromium/Instagram
          ], [NAME, VERSION], [/\bgsa\/([\w\.]+) .*safari\//i // Google Search Appliance on iOS
          ], [VERSION, [NAME, 'GSA']], [/headlesschrome(?:\/([\w\.]+)| )/i // Chrome Headless
          ], [VERSION, [NAME, CHROME + ' Headless']], [/ wv\).+(chrome)\/([\w\.]+)/i // Chrome WebView
          ], [[NAME, CHROME + ' WebView'], VERSION], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i // Android Browser
          ], [VERSION, [NAME, 'Android ' + BROWSER]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i // Chrome/OmniWeb/Arora/Tizen/Nokia
          ], [NAME, VERSION], [/version\/([\w\.]+) .*mobile\/\w+ (safari)/i // Mobile Safari
          ], [VERSION, [NAME, 'Mobile Safari']], [/version\/([\w\.]+) .*(mobile ?safari|safari)/i // Safari & Safari Mobile
          ], [VERSION, NAME], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i // Safari < 3.0
          ], [NAME, [VERSION, strMapper, oldSafariMap]], [/(webkit|khtml)\/([\w\.]+)/i], [NAME, VERSION], [// Gecko based
          /(navigator|netscape\d?)\/([-\w\.]+)/i // Netscape
          ], [[NAME, 'Netscape'], VERSION], [/mobile vr; rv:([\w\.]+)\).+firefox/i // Firefox Reality
          ], [VERSION, [NAME, FIREFOX + ' Reality']], [/ekiohf.+(flow)\/([\w\.]+)/i, // Flow
          /(swiftfox)/i, // Swiftfox
          /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
          /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
          /(firefox)\/([\w\.]+)/i, // Other Firefox-based
          /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, // Mozilla
          // Other
          /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
          /(links) \(([\w\.]+)/i // Links
          ], [NAME, VERSION]],
          cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i // AMD64 (x64)
          ], [[ARCHITECTURE, 'amd64']], [/(ia32(?=;))/i // IA32 (quicktime)
          ], [[ARCHITECTURE, lowerize]], [/((?:i[346]|x)86)[;\)]/i // IA32 (x86)
          ], [[ARCHITECTURE, 'ia32']], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i // ARM64
          ], [[ARCHITECTURE, 'arm64']], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i // ARMHF
          ], [[ARCHITECTURE, 'armhf']], [// PocketPC mistakenly identified as PowerPC
          /windows (ce|mobile); ppc;/i], [[ARCHITECTURE, 'arm']], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i // PowerPC
          ], [[ARCHITECTURE, /ower/, EMPTY, lowerize]], [/(sun4\w)[;\)]/i // SPARC
          ], [[ARCHITECTURE, 'sparc']], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
          ], [[ARCHITECTURE, lowerize]]],
          device: [[//////////////////////////
          // MOBILES & TABLETS
          // Ordered by popularity
          /////////////////////////
          // Samsung
          /\b(sch-i[89]0\d|shw-m380s|sm-[pt]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]], [/\b((?:s[cgp]h|gt|sm)-\w+|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]], [// Apple
          /\((ip(?:hone|od)[\w ]*);/i // iPod/iPhone
          ], [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]], [/\((ipad);[-\w\),; ]+apple/i, // iPad
          /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [MODEL, [VENDOR, APPLE], [TYPE, TABLET]], [// Huawei
          /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}-[atu]?[ln][01259x][012359][an]?)\b(?!.+d\/s)/i], [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]], [// Xiaomi
          /\b(poco[\w ]+)(?: bui|\))/i, // Xiaomi POCO
          /\b; (\w+) build\/hm\1/i, // Xiaomi Hongmi 'numeric' models
          /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, // Xiaomi Hongmi
          /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, // Xiaomi Redmi
          /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i // Xiaomi Mi
          ], [[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, MOBILE]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i // Mi Pad tablets
          ], [[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, TABLET]], [// OPPO
          /; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [// Vivo
          /vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [MODEL, [VENDOR, 'Vivo'], [TYPE, MOBILE]], [// Realme
          /\b(rmx[12]\d{3})(?: bui|;|\))/i], [MODEL, [VENDOR, 'Realme'], [TYPE, MOBILE]], [// Motorola
          /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]], [// LG
          /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [MODEL, [VENDOR, LG], [TYPE, TABLET]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [MODEL, [VENDOR, LG], [TYPE, MOBILE]], [// Lenovo
          /(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [// Nokia
          /(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[MODEL, /_/g, ' '], [VENDOR, 'Nokia'], [TYPE, MOBILE]], [// Google
          /(pixel c)\b/i // Google Pixel C
          ], [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i // Google Pixel
          ], [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]], [// Sony
          /droid.+ ([c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [MODEL, [VENDOR, SONY], [TYPE, MOBILE]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[MODEL, 'Xperia Tablet'], [VENDOR, SONY], [TYPE, TABLET]], [// OnePlus
          / (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [// Amazon
          /(alexa)webm/i, /(kf[a-z]{2}wi)( bui|\))/i, // Kindle Fire without Silk
          /(kf[a-z]+)( bui|\)).+silk\//i // Kindle Fire HD
          ], [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i // Fire Phone
          ], [[MODEL, /(.+)/g, 'Fire Phone $1'], [VENDOR, AMAZON], [TYPE, MOBILE]], [// BlackBerry
          /(playbook);[-\w\),; ]+(rim)/i // BlackBerry PlayBook
          ], [MODEL, VENDOR, [TYPE, TABLET]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i // BlackBerry 10
          ], [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]], [// Asus
          /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [MODEL, [VENDOR, ASUS], [TYPE, TABLET]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]], [// HTC
          /(nexus 9)/i // HTC Nexus 9
          ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, // HTC
          // ZTE
          /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic|sony)[-_ ]?([-\w]*)/i // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
          ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [// Acer
          /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [// Meizu
          /droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [// Sharp
          /\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [MODEL, [VENDOR, 'Sharp'], [TYPE, MOBILE]], [// MIXED
          /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
          /(hp) ([\w ]+\w)/i, // HP iPAQ
          /(asus)-?(\w+)/i, // Asus
          /(microsoft); (lumia[\w ]+)/i, // Microsoft Lumia
          /(lenovo)[-_ ]?([-\w]+)/i, // Lenovo
          /(jolla)/i, // Jolla
          /(oppo) ?([\w ]+) bui/i // OPPO
          ], [VENDOR, MODEL, [TYPE, MOBILE]], [/(archos) (gamepad2?)/i, // Archos
          /(hp).+(touchpad(?!.+tablet)|tablet)/i, // HP TouchPad
          /(kindle)\/([\w\.]+)/i, // Kindle
          /(nook)[\w ]+build\/(\w+)/i, // Nook
          /(dell) (strea[kpr\d ]*[\dko])/i, // Dell Streak
          /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, // Le Pan Tablets
          /(trinity)[- ]*(t\d{3}) bui/i, // Trinity Tablets
          /(gigaset)[- ]+(q\w{1,9}) bui/i, // Gigaset Tablets
          /(vodafone) ([\w ]+)(?:\)| bui)/i // Vodafone
          ], [VENDOR, MODEL, [TYPE, TABLET]], [/(surface duo)/i // Surface Duo
          ], [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i // Fairphone
          ], [MODEL, [VENDOR, 'Fairphone'], [TYPE, MOBILE]], [/(u304aa)/i // AT&T
          ], [MODEL, [VENDOR, 'AT&T'], [TYPE, MOBILE]], [/\bsie-(\w*)/i // Siemens
          ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [/\b(rct\w+) b/i // RCA Tablets
          ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [/\b(venue[\d ]{2,7}) b/i // Dell Venue Tablets
          ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [/\b(q(?:mv|ta)\w+) b/i // Verizon Tablet
          ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i // Barnes & Noble Tablet
          ], [MODEL, [VENDOR, 'Barnes & Noble'], [TYPE, TABLET]], [/\b(tm\d{3}\w+) b/i], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [/\b(k88) b/i // ZTE K Series Tablet
          ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [/\b(nx\d{3}j) b/i // ZTE Nubia
          ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [/\b(gen\d{3}) b.+49h/i // Swiss GEN Mobile
          ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [/\b(zur\d{3}) b/i // Swiss ZUR Tablet
          ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [/\b((zeki)?tb.*\b) b/i // Zeki Tablets
          ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i // Dragon Touch Tablet
          ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [/\b(ns-?\w{0,9}) b/i // Insignia Tablets
          ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [/\b((nxa|next)-?\w{0,9}) b/i // NextBook Tablets
          ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i // Voice Xtreme Phones
          ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [/\b(lvtel\-)?(v1[12]) b/i // LvTel Phones
          ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [/\b(ph-1) /i // Essential PH-1
          ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [/\b(v(100md|700na|7011|917g).*\b) b/i // Envizen Tablets
          ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [/\b(trio[-\w\. ]+) b/i // MachSpeed Tablets
          ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [/\btu_(1491) b/i // Rotor Tablets
          ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [/(shield[\w ]+) b/i // Nvidia Shield Tablets
          ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, TABLET]], [/(sprint) (\w+)/i // Sprint Phones
          ], [VENDOR, MODEL, [TYPE, MOBILE]], [/(kin\.[onetw]{3})/i // Microsoft Kin
          ], [[MODEL, /\./g, ' '], [VENDOR, MICROSOFT], [TYPE, MOBILE]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i // Zebra
          ], [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]], [///////////////////
          // CONSOLES
          ///////////////////
          /(ouya)/i, // Ouya
          /(nintendo) ([wids3utch]+)/i // Nintendo
          ], [VENDOR, MODEL, [TYPE, CONSOLE]], [/droid.+; (shield) bui/i // Nvidia
          ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [/(playstation [345portablevi]+)/i // Playstation
          ], [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i // Microsoft Xbox
          ], [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]], [///////////////////
          // SMARTTVS
          ///////////////////
          /smart-tv.+(samsung)/i // Samsung
          ], [VENDOR, [TYPE, SMARTTV]], [/hbbtv.+maple;(\d+)/i], [[MODEL, /^/, 'SmartTV'], [VENDOR, SAMSUNG], [TYPE, SMARTTV]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i // LG SmartTV
          ], [[VENDOR, LG], [TYPE, SMARTTV]], [/(apple) ?tv/i // Apple TV
          ], [VENDOR, [MODEL, APPLE + ' TV'], [TYPE, SMARTTV]], [/crkey/i // Google Chromecast
          ], [[MODEL, CHROME + 'cast'], [VENDOR, GOOGLE], [TYPE, SMARTTV]], [/droid.+aft(\w)( bui|\))/i // Fire TV
          ], [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]], [/\(dtv[\);].+(aquos)/i // Sharp
          ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, // Roku
          /hbbtv\/\d+\.\d+\.\d+ +\([\w ]*; *(\w[^;]*);([^;]*)/i // HbbTV devices
          ], [[VENDOR, trim], [MODEL, trim], [TYPE, SMARTTV]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i // SmartTV from Unidentified Vendors
          ], [[TYPE, SMARTTV]], [///////////////////
          // WEARABLES
          ///////////////////
          /((pebble))app/i // Pebble
          ], [VENDOR, MODEL, [TYPE, WEARABLE]], [/droid.+; (glass) \d/i // Google Glass
          ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [/droid.+; (wt63?0{2,3})\)/i], [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]], [/(quest( 2)?)/i // Oculus Quest
          ], [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]], [///////////////////
          // EMBEDDED
          ///////////////////
          /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i // Tesla
          ], [VENDOR, [TYPE, EMBEDDED]], [////////////////////
          // MIXED (GENERIC)
          ///////////////////
          /droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i // Android Phones from Unidentified Vendors
          ], [MODEL, [TYPE, MOBILE]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i // Android Tablets from Unidentified Vendors
          ], [MODEL, [TYPE, TABLET]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i // Unidentifiable Tablet
          ], [[TYPE, TABLET]], [/(phone|mobile(?:[;\/]| safari)|pda(?=.+windows ce))/i // Unidentifiable Mobile
          ], [[TYPE, MOBILE]], [/(android[-\w\. ]{0,9});.+buil/i // Generic Android Device
          ], [MODEL, [VENDOR, 'Generic']]],
          engine: [[/windows.+ edge\/([\w\.]+)/i // EdgeHTML
          ], [VERSION, [NAME, EDGE + 'HTML']], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i // Blink
          ], [VERSION, [NAME, 'Blink']], [/(presto)\/([\w\.]+)/i, // Presto
          /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
          /ekioh(flow)\/([\w\.]+)/i, // Flow
          /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, // KHTML/Tasman/Links
          /(icab)[\/ ]([23]\.[\d\.]+)/i // iCab
          ], [NAME, VERSION], [/rv\:([\w\.]{1,9})\b.+(gecko)/i // Gecko
          ], [VERSION, NAME]],
          os: [[// Windows
          /microsoft (windows) (vista|xp)/i // Windows (iTunes)
          ], [NAME, VERSION], [/(windows) nt 6\.2; (arm)/i, // Windows RT
          /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, // Windows Phone
          /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [NAME, [VERSION, strMapper, windowsVersionMap]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[NAME, 'Windows'], [VERSION, strMapper, windowsVersionMap]], [// iOS/macOS
          /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, // iOS
          /cfnetwork\/.+darwin/i], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i // Mac OS
          ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [// Mobile OSes
          /droid ([\w\.]+)\b.+(android[- ]x86)/i // Android-x86
          ], [VERSION, NAME], [// Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
          /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, // Blackberry
          /(tizen|kaios)[\/ ]([\w\.]+)/i, // Tizen/KaiOS
          /\((series40);/i // Series 40
          ], [NAME, VERSION], [/\(bb(10);/i // BlackBerry 10
          ], [VERSION, [NAME, BLACKBERRY]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i // Symbian
          ], [VERSION, [NAME, 'Symbian']], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i // Firefox OS
          ], [VERSION, [NAME, FIREFOX + ' OS']], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i // WebOS
          ], [VERSION, [NAME, 'webOS']], [// Google Chromecast
          /crkey\/([\d\.]+)/i // Google Chromecast
          ], [VERSION, [NAME, CHROME + 'cast']], [/(cros) [\w]+ ([\w\.]+\w)/i // Chromium OS
          ], [[NAME, 'Chromium OS'], VERSION], [// Console
          /(nintendo|playstation) ([wids345portablevuch]+)/i, // Nintendo/Playstation
          /(xbox); +xbox ([^\);]+)/i, // Microsoft Xbox (360, One, X, S, Series X, Series S)
          // Other
          /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, // Joli/Palm
          /(mint)[\/\(\) ]?(\w*)/i, // Mint
          /(mageia|vectorlinux)[; ]/i, // Mageia/VectorLinux
          /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
          /(hurd|linux) ?([\w\.]*)/i, // Hurd/Linux
          /(gnu) ?([\w\.]*)/i, // GNU
          /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
          /(haiku) (\w+)/i // Haiku
          ], [NAME, VERSION], [/(sunos) ?([\w\.\d]*)/i // Solaris
          ], [[NAME, 'Solaris'], VERSION], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, // Solaris
          /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, // AIX
          /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux)/i, // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX
          /(unix) ?([\w\.]*)/i // UNIX
          ], [NAME, VERSION]]
        }; /////////////////
        // Constructor
        ////////////////

        var UAParser = function (ua, extensions) {
          if (typeof ua === OBJ_TYPE) {
            extensions = ua;
            ua = undefined$1;
          }

          if (!(this instanceof UAParser)) {
            return new UAParser(ua, extensions).getResult();
          }

          var _ua = ua || (typeof window !== UNDEF_TYPE && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : EMPTY);

          var _rgxmap = extensions ? extend(regexes, extensions) : regexes;

          this.getBrowser = function () {
            var _browser = {};
            _browser[NAME] = undefined$1;
            _browser[VERSION] = undefined$1;
            rgxMapper.call(_browser, _ua, _rgxmap.browser);
            _browser.major = majorize(_browser.version);
            return _browser;
          };

          this.getCPU = function () {
            var _cpu = {};
            _cpu[ARCHITECTURE] = undefined$1;
            rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
            return _cpu;
          };

          this.getDevice = function () {
            var _device = {};
            _device[VENDOR] = undefined$1;
            _device[MODEL] = undefined$1;
            _device[TYPE] = undefined$1;
            rgxMapper.call(_device, _ua, _rgxmap.device);
            return _device;
          };

          this.getEngine = function () {
            var _engine = {};
            _engine[NAME] = undefined$1;
            _engine[VERSION] = undefined$1;
            rgxMapper.call(_engine, _ua, _rgxmap.engine);
            return _engine;
          };

          this.getOS = function () {
            var _os = {};
            _os[NAME] = undefined$1;
            _os[VERSION] = undefined$1;
            rgxMapper.call(_os, _ua, _rgxmap.os);
            return _os;
          };

          this.getResult = function () {
            return {
              ua: this.getUA(),
              browser: this.getBrowser(),
              engine: this.getEngine(),
              os: this.getOS(),
              device: this.getDevice(),
              cpu: this.getCPU()
            };
          };

          this.getUA = function () {
            return _ua;
          };

          this.setUA = function (ua) {
            _ua = typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH ? trim(ua, UA_MAX_LENGTH) : ua;
            return this;
          };

          this.setUA(_ua);
          return this;
        };

        UAParser.VERSION = LIBVERSION;
        UAParser.BROWSER = enumerize([NAME, VERSION, MAJOR]);
        UAParser.CPU = enumerize([ARCHITECTURE]);
        UAParser.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
        UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]); ///////////
        // Export
        //////////
        // check js environment

        {
          // nodejs env
          if (module.exports) {
            exports = module.exports = UAParser;
          }

          exports.UAParser = UAParser;
        } // jQuery/Zepto specific (optional)
        // Note:
        //   In AMD env the global scope should be kept clean, but jQuery is an exception.
        //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
        //   and we should catch that.


        var $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);

        if ($ && !$.ua) {
          var parser = new UAParser();
          $.ua = parser.getResult();

          $.ua.get = function () {
            return parser.getUA();
          };

          $.ua.set = function (ua) {
            parser.setUA(ua);
            var result = parser.getResult();

            for (var prop in result) {
              $.ua[prop] = result[prop];
            }
          };
        }
      })(typeof window === 'object' ? window : commonjsGlobal);
    })(uaParser, uaParser.exports);

    var UAParser = uaParser.exports;

    var Cookies;
    (function (Cookies) {
        Cookies["identifiers"] = "paf_identifiers";
        Cookies["preferences"] = "paf_preferences";
        Cookies["test_3pc"] = "paf_test_3pc";
        Cookies["lastRefresh"] = "paf_last_refresh";
    })(Cookies || (Cookies = {}));
    // 1st party cookie expiration: 3 month
    var getPrebidDataCacheExpiration = function (date) {
        if (date === void 0) { date = new Date(); }
        var expirationDate = new Date(date);
        var monthsCount = 3;
        expirationDate.setMonth(expirationDate.getMonth() + monthsCount);
        return expirationDate;
    };
    var getPafRefreshExpiration = function () {
        var minutesCount = 1;
        return new Date(Date.now() + 1000 * 60 * minutesCount);
    };
    var typedCookie = function (cookieString) {
        return cookieString === undefined ? undefined : JSON.parse(cookieString);
    };

    // TODO refactor to group by operator / operator proxy
    // Endpoints exposed by the operator API
    var pafPrefix = '/paf';
    var redirectRead = '/v1/redirect/get-ids-prefs';
    var redirectWrite = '/v1/redirect/post-ids-prefs';
    var redirectEndpoints = {
        read: "".concat(pafPrefix).concat(redirectRead),
        write: "".concat(pafPrefix).concat(redirectWrite),
    };
    var jsonRead = '/v1/ids-prefs';
    var jsonWrite = '/v1/ids-prefs';
    var jsonVerify3PC = '/v1/3pc';
    var jsonNewId = '/v1/new-id';
    var jsonSeed = '/v1/seed';
    // Endpoints exposed by the operator proxy
    var proxyPrefix = '/paf-proxy';
    var jsonVerifyRead = '/v1/verify/read';
    var jsonSignWrite = '/v1/sign/write';
    var jsonSignPrefs = '/v1/sign/prefs';
    var jsonProxyEndpoints = {
        verifyRead: "".concat(proxyPrefix).concat(jsonVerifyRead),
        signWrite: "".concat(proxyPrefix).concat(jsonSignWrite),
        signPrefs: "".concat(proxyPrefix).concat(jsonSignPrefs),
        read: "".concat(proxyPrefix).concat(jsonRead),
        write: "".concat(proxyPrefix).concat(jsonWrite),
        verify3PC: "".concat(proxyPrefix).concat(jsonVerify3PC),
        newId: "".concat(proxyPrefix).concat(jsonNewId),
        createSeed: "".concat(proxyPrefix).concat(jsonSeed),
    };
    var redirectProxyEndpoints = {
        read: "".concat(proxyPrefix).concat(redirectEndpoints.read),
        write: "".concat(proxyPrefix).concat(redirectEndpoints.write),
    };
    var proxyUriParams = {
        returnUrl: 'returnUrl',
        message: 'message',
    };

    var isBrowserKnownToSupport3PC = function (browser) {
        return (browser === null || browser === void 0 ? void 0 : browser.name) && !browser.name.includes('Safari');
    };

    var QSParam;
    (function (QSParam) {
        QSParam["paf"] = "paf";
    })(QSParam || (QSParam = {}));

    var PafStatus;
    (function (PafStatus) {
        PafStatus["NOT_PARTICIPATING"] = "NOT_PARTICIPATING";
        PafStatus["REDIRECT_NEEDED"] = "REDIRECT_NEEDED";
        PafStatus["PARTICIPATING"] = "PARTICIPATING";
        PafStatus["UNKNOWN"] = "UNKNOWN";
    })(PafStatus || (PafStatus = {}));
    var getCleanCookieValue = function (cookieValue) {
        return cookieValue === PafStatus.NOT_PARTICIPATING || cookieValue === PafStatus.REDIRECT_NEEDED ? undefined : cookieValue;
    };
    /**
     * Parse string cookie values and build an IdsAndOptionalPreferences accordingly
     * @param idsCookie
     * @param prefsCookie
     */
    var fromClientCookieValues = function (idsCookie, prefsCookie) {
        var _a;
        return {
            identifiers: (_a = typedCookie(getCleanCookieValue(idsCookie))) !== null && _a !== void 0 ? _a : [],
            preferences: typedCookie(getCleanCookieValue(prefsCookie)),
        };
    };
    var getPafStatus = function (idsCookie, prefsCookie) {
        if (idsCookie === PafStatus.REDIRECT_NEEDED || prefsCookie === PafStatus.REDIRECT_NEEDED) {
            return PafStatus.REDIRECT_NEEDED;
        }
        // TODO might need to refine this one
        if (idsCookie === PafStatus.NOT_PARTICIPATING || prefsCookie === PafStatus.NOT_PARTICIPATING) {
            return PafStatus.NOT_PARTICIPATING;
        }
        return PafStatus.PARTICIPATING;
    };

    var getCookieValue = function (name) { var _a; return ((_a = document.cookie.match("(^|;)\\s*".concat(name, "\\s*=\\s*([^;]+)"))) === null || _a === void 0 ? void 0 : _a.pop()) || undefined; };

    var NotificationEnum;
    (function (NotificationEnum) {
        NotificationEnum["personalizedContent"] = "PERSONALIZED";
        NotificationEnum["generalContent"] = "GENERAL";
    })(NotificationEnum || (NotificationEnum = {}));

    // **************************************************************************************************************** LOGS
    var label = function (color) {
        return "display: inline-block; color: #fff; background: ".concat(color, "; padding: 1px 4px; border-radius: 3px;");
    };
    var decorateLog = function (prefix, args) {
        var newArgs = [].slice.call(args);
        prefix && newArgs.unshift(prefix);
        newArgs.unshift(label('#3bb8c3'));
        newArgs.unshift('%cPAF');
        return newArgs;
    };
    /**
     * Wrappers to console.(log | info | warn | error). Takes N arguments, the same as the native methods
     */
    function logDebug() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.debug.apply(console, decorateLog('MESSAGE:', args));
    }
    function logInfo() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, decorateLog('INFO:', args));
    }

    var redirect = function (url) {
        logInfo('Redirecting to:', url);
        location.replace(url);
    };
    // Note: we don't use Content-type JSON to avoid having to trigger OPTIONS pre-flight.
    // See https://stackoverflow.com/questions/37668282/unable-to-fetch-post-without-no-cors-in-header
    var postJson = function (url, input) {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(input),
            credentials: 'include',
        });
    };
    var postText = function (url, input) {
        return fetch(url, {
            method: 'POST',
            body: input,
            credentials: 'include',
        });
    };
    var get = function (url) {
        return fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
    };
    // Remove any "paf data" param from the query string
    // From https://stackoverflow.com/questions/1634748/how-can-i-delete-a-query-string-parameter-in-javascript/25214672#25214672
    // TODO should be able to use a more standard way, but URL class is immutable :-(
    var removeUrlParameters = function (url, parameters) {
        var urlParts = url.split('?');
        if (urlParts.length >= 2) {
            // Get first part, and remove from array
            var urlBase = urlParts.shift();
            // Join it back up
            var queryString = urlParts.join('?');
            var prefixes = parameters.map(function (param) { return "".concat(encodeURIComponent(param), "="); });
            var parts_1 = queryString.split(/[&;]/g);
            // Reverse iteration as may be destructive
            prefixes.forEach(function (prefix) {
                for (var i = parts_1.length; i-- > 0;) {
                    // Idiom for string.startsWith
                    if (parts_1[i].lastIndexOf(prefix, 0) !== -1) {
                        parts_1.splice(i, 1);
                    }
                }
            });
            url = urlBase + (parts_1.length > 0 ? "?".concat(parts_1.join('&')) : '');
        }
        return url;
    };
    var setCookie = function (cookieName, value, expiration) {
        document.cookie = "".concat(cookieName, "=").concat(value, ";expires=").concat(expiration.toUTCString());
    };
    var removeCookie = function (cookieName) {
        setCookie(cookieName, null, new Date(0));
    };
    var showNotificationIfValid = function (consent) {
        if (consent !== undefined) {
            PAFUI.showNotification(consent ? NotificationEnum.personalizedContent : NotificationEnum.generalContent);
        }
    };
    var getProxyUrl = function (proxyHost) {
        return function (endpoint) {
            return "https://".concat(proxyHost).concat(endpoint);
        };
    };
    var saveCookieValue = function (cookieName, cookieValue) {
        var valueToStore = cookieValue === undefined ? PafStatus.NOT_PARTICIPATING : JSON.stringify(cookieValue);
        logDebug("Save cookie ".concat(cookieName, ":"), valueToStore);
        // TODO use different expiration if "not participating"
        setCookie(cookieName, valueToStore, getPrebidDataCacheExpiration());
        setCookie(Cookies.lastRefresh, new Date().toISOString(), getPafRefreshExpiration());
        return valueToStore;
    };
    var thirdPartyCookiesSupported;
    var ShowPromptOption;
    (function (ShowPromptOption) {
        ShowPromptOption["doNotPrompt"] = "doNotPrompt";
        ShowPromptOption["doPrompt"] = "doPrompt";
        ShowPromptOption["promptIfUnknownUser"] = "promptIfUnknownUser";
    })(ShowPromptOption || (ShowPromptOption = {}));
    var defaultsRefreshIdsAndPrefsOptions = {
        proxyHostName: 'MISSING_PROXY_HOST_NAME',
        showPrompt: ShowPromptOption.promptIfUnknownUser,
        triggerRedirectIfNeeded: true,
    };
    /**
     * Sign new optin value and send it with ids to the operator for writing
     * @param proxyHostName
     * @param optIn
     * @param identifiers
     */
    var updateIdsAndPreferences = function (proxyHostName, optIn, identifiers) { return __awaiter(void 0, void 0, void 0, function () {
        var unsignedPreferences, signedPreferences;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    unsignedPreferences = {
                        version: '0.1',
                        data: {
                            use_browsing_for_personalization: optIn,
                        },
                    };
                    return [4 /*yield*/, signPreferences({ proxyHostName: proxyHostName }, {
                            identifiers: identifiers,
                            unsignedPreferences: unsignedPreferences,
                        })];
                case 1:
                    signedPreferences = _a.sent();
                    // 2. write
                    return [4 /*yield*/, writeIdsAndPref({ proxyHostName: proxyHostName }, {
                            identifiers: identifiers,
                            preferences: signedPreferences,
                        })];
                case 2:
                    // 2. write
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     *
     * @param idsAndPreferences
     * @param proxyHostName
     * @param showPrompt
     */
    function updateDataWithPrompt(idsAndPreferences, proxyHostName, showPrompt) {
        return __awaiter(this, void 0, void 0, function () {
            var status, data, optIn, identifiers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        status = idsAndPreferences.status, data = idsAndPreferences.data;
                        logDebug('showPrompt', showPrompt);
                        logDebug('status', status);
                        // If a redirect is needed, nothing more to do
                        if (status === PafStatus.REDIRECT_NEEDED) {
                            return [2 /*return*/];
                        }
                        if (!(showPrompt === ShowPromptOption.doPrompt ||
                            (showPrompt === ShowPromptOption.promptIfUnknownUser && status === PafStatus.UNKNOWN))) return [3 /*break*/, 2];
                        return [4 /*yield*/, PAFUI.promptConsent()];
                    case 1:
                        optIn = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(optIn === undefined)) return [3 /*break*/, 3];
                        // User closed the prompt consent without defining their preferences, or the prompt was not even shown
                        // => either they canceled modification of existing ids and preferences, or they don't want to participate
                        // Was not participating => save this information
                        if (status === PafStatus.UNKNOWN) {
                            saveCookieValue(Cookies.identifiers, undefined);
                            saveCookieValue(Cookies.preferences, undefined);
                        }
                        return [3 /*break*/, 7];
                    case 3:
                        identifiers = data.identifiers;
                        if (!((identifiers === null || identifiers === void 0 ? void 0 : identifiers.length) === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, getNewId({ proxyHostName: proxyHostName })];
                    case 4:
                        // If opening the prompt while the user is unknown, it can happen that we need to query for a new id
                        identifiers = [_a.sent()];
                        _a.label = 5;
                    case 5: return [4 /*yield*/, updateIdsAndPreferences(proxyHostName, optIn, identifiers)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Ensure local cookies for PAF identifiers and preferences are up-to-date.
     * If they aren't, contact the operator to get fresh values.
     * @param options:
     * - proxyHostName: servername of operator proxy. ex: www.myproxy.com
     * - triggerRedirectIfNeeded: `true` if redirect can be triggered immediately, `false` if it should wait
     * - redirectUrl: the redirectUrl that must be called in return when no 3PC are available. Default = current page
     * @return a status and optional data
     */
    var refreshIdsAndPreferences = function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var mergedOptions, proxyHostName, triggerRedirectIfNeeded, redirectUrl, showPrompt, localQSParamShowPrompt, cleanUpUrL, getUrl, redirectToRead, processGetIdsAndPreferences, idsAndPreferences;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mergedOptions = __assign(__assign({}, defaultsRefreshIdsAndPrefsOptions), options);
                    proxyHostName = mergedOptions.proxyHostName, triggerRedirectIfNeeded = mergedOptions.triggerRedirectIfNeeded, redirectUrl = mergedOptions.redirectUrl;
                    showPrompt = mergedOptions.showPrompt;
                    localQSParamShowPrompt = 'paf_show_prompt';
                    cleanUpUrL = function () {
                        var cleanedUrl = removeUrlParameters(location.href, [QSParam.paf, localQSParamShowPrompt]);
                        history.pushState(null, '', cleanedUrl);
                    };
                    getUrl = getProxyUrl(proxyHostName);
                    redirectToRead = function () {
                        logInfo('Redirect to operator');
                        var url = redirectUrl !== null && redirectUrl !== void 0 ? redirectUrl : new URL(getUrl(redirectProxyEndpoints.read));
                        var currentUrl = new URL(location.href);
                        currentUrl.searchParams.set(localQSParamShowPrompt, showPrompt);
                        url.searchParams.set(proxyUriParams.returnUrl, currentUrl.toString());
                        redirect(url.toString());
                    };
                    processGetIdsAndPreferences = function () { return __awaiter(void 0, void 0, void 0, function () {
                        function handleAfterRedirect() {
                            var _a, _b, _c;
                            return __awaiter(this, void 0, void 0, function () {
                                var response, operatorData, persistedIds, hasPersistedId, preferences, hasPreferences;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0: return [4 /*yield*/, postText(getUrl(jsonProxyEndpoints.verifyRead), uriOperatorData)];
                                        case 1:
                                            response = _d.sent();
                                            return [4 /*yield*/, response.json()];
                                        case 2:
                                            operatorData = (_d.sent());
                                            if (!operatorData) {
                                                throw 'Verification failed';
                                            }
                                            logDebug('Operator data after redirect', operatorData);
                                            persistedIds = (_a = operatorData.body.identifiers) === null || _a === void 0 ? void 0 : _a.filter(function (identifier) { return (identifier === null || identifier === void 0 ? void 0 : identifier.persisted) !== false; });
                                            hasPersistedId = persistedIds.length > 0;
                                            preferences = (_b = operatorData === null || operatorData === void 0 ? void 0 : operatorData.body) === null || _b === void 0 ? void 0 : _b.preferences;
                                            hasPreferences = preferences !== undefined;
                                            saveCookieValue(Cookies.identifiers, hasPersistedId ? persistedIds : undefined);
                                            saveCookieValue(Cookies.preferences, preferences);
                                            triggerNotification((_c = preferences === null || preferences === void 0 ? void 0 : preferences.data) === null || _c === void 0 ? void 0 : _c.use_browsing_for_personalization);
                                            return [2 /*return*/, {
                                                    status: hasPersistedId && hasPreferences ? PafStatus.PARTICIPATING : PafStatus.UNKNOWN,
                                                    data: operatorData.body,
                                                }];
                                    }
                                });
                            });
                        }
                        var urlParams, uriOperatorData, uriShowPrompt, strIds, lastRefresh, strPreferences, currentPafData, currentlySelectedConsent, triggerNotification, pafStatus, userAgent, readResponse, operatorData, persistedIds, hasPersistedId, preferences, hasPreferences, verifyResponse, testOk;
                        var _a, _b, _c, _d, _e, _f, _g;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    urlParams = new URLSearchParams(window.location.search);
                                    uriOperatorData = urlParams.get(QSParam.paf);
                                    uriShowPrompt = urlParams.get(localQSParamShowPrompt);
                                    cleanUpUrL();
                                    strIds = getCookieValue(Cookies.identifiers);
                                    lastRefresh = getCookieValue(Cookies.lastRefresh);
                                    strPreferences = getCookieValue(Cookies.preferences);
                                    currentPafData = fromClientCookieValues(strIds, strPreferences);
                                    currentlySelectedConsent = (_b = (_a = currentPafData.preferences) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.use_browsing_for_personalization;
                                    triggerNotification = function (freshConsent) {
                                        var shouldShowNotification = !strPreferences || // there was no value before the refresh
                                            freshConsent !== currentlySelectedConsent; // the new value is different from the previous one
                                        if (shouldShowNotification) {
                                            logDebug("Preferences changes detected (".concat(currentlySelectedConsent, " => ").concat(freshConsent, "), show notification"));
                                            showNotificationIfValid(freshConsent);
                                        }
                                        else {
                                            logDebug("No preferences changes (".concat(currentlySelectedConsent, "), don't show notification"));
                                        }
                                    };
                                    if (!uriOperatorData) return [3 /*break*/, 2];
                                    logInfo('Redirected from operator: YES');
                                    // Consider that if we have been redirected, it means 3PC are not supported
                                    thirdPartyCookiesSupported = false;
                                    // Remember what was asked for prompt, before the redirect
                                    showPrompt = uriShowPrompt;
                                    return [4 /*yield*/, handleAfterRedirect()];
                                case 1: return [2 /*return*/, _h.sent()];
                                case 2:
                                    logInfo('Redirected from operator: NO');
                                    pafStatus = getPafStatus(strIds, strPreferences);
                                    if (pafStatus === PafStatus.REDIRECT_NEEDED) {
                                        logInfo('Redirect previously deferred');
                                        if (triggerRedirectIfNeeded) {
                                            redirectToRead();
                                        }
                                        return [2 /*return*/, {
                                                status: pafStatus,
                                            }];
                                    }
                                    if (lastRefresh) {
                                        logInfo('Cookie found: YES');
                                        if (pafStatus === PafStatus.NOT_PARTICIPATING) {
                                            logInfo('User is not participating');
                                        }
                                        return [2 /*return*/, {
                                                status: pafStatus,
                                                data: currentPafData,
                                            }];
                                    }
                                    logInfo('Cookie found: NO');
                                    userAgent = new UAParser(navigator.userAgent);
                                    if (!isBrowserKnownToSupport3PC(userAgent.getBrowser())) return [3 /*break*/, 7];
                                    logInfo('Browser known to support 3PC: YES');
                                    logInfo('Attempt to read from JSON');
                                    return [4 /*yield*/, get(getUrl(jsonProxyEndpoints.read))];
                                case 3:
                                    readResponse = _h.sent();
                                    return [4 /*yield*/, readResponse.json()];
                                case 4:
                                    operatorData = (_h.sent());
                                    persistedIds = (_c = operatorData.body.identifiers) === null || _c === void 0 ? void 0 : _c.filter(function (identifier) { return (identifier === null || identifier === void 0 ? void 0 : identifier.persisted) !== false; });
                                    hasPersistedId = persistedIds.length > 0;
                                    preferences = (_d = operatorData === null || operatorData === void 0 ? void 0 : operatorData.body) === null || _d === void 0 ? void 0 : _d.preferences;
                                    hasPreferences = preferences !== undefined;
                                    // 3. Received data?
                                    if (hasPersistedId && hasPreferences) {
                                        logDebug('Operator returned id & prefs: YES');
                                        // If we got data, it means 3PC are supported
                                        thirdPartyCookiesSupported = true;
                                        // /!\ Note: we don't need to verify the message here as it is a REST call
                                        saveCookieValue(Cookies.identifiers, persistedIds);
                                        saveCookieValue(Cookies.preferences, operatorData.body.preferences);
                                        triggerNotification((_f = (_e = operatorData.body.preferences) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.use_browsing_for_personalization);
                                        return [2 /*return*/, {
                                                status: PafStatus.PARTICIPATING,
                                                data: operatorData.body,
                                            }];
                                    }
                                    logInfo('Operator returned id & prefs: NO');
                                    logInfo('Verify 3PC on operator');
                                    return [4 /*yield*/, get(getUrl(jsonProxyEndpoints.verify3PC))];
                                case 5:
                                    verifyResponse = _h.sent();
                                    return [4 /*yield*/, verifyResponse.json()];
                                case 6:
                                    testOk = _h.sent();
                                    // 4. 3d party cookie ok?
                                    if ((_g = testOk) === null || _g === void 0 ? void 0 : _g['3pc']) {
                                        logDebug('3PC verification OK: YES');
                                        thirdPartyCookiesSupported = true;
                                        return [2 /*return*/, {
                                                status: PafStatus.UNKNOWN,
                                                data: {
                                                    identifiers: operatorData.body.identifiers,
                                                },
                                            }];
                                    }
                                    logInfo('3PC verification OK: NO');
                                    thirdPartyCookiesSupported = false;
                                    logInfo('Fallback to JS redirect');
                                    return [3 /*break*/, 8];
                                case 7:
                                    logInfo('Browser known to support 3PC: NO');
                                    thirdPartyCookiesSupported = false;
                                    logInfo('JS redirect');
                                    _h.label = 8;
                                case 8:
                                    if (triggerRedirectIfNeeded) {
                                        redirectToRead();
                                    }
                                    else {
                                        logInfo('Deffer redirect to later, in agreement with options');
                                        saveCookieValue(Cookies.identifiers, PafStatus.REDIRECT_NEEDED);
                                        saveCookieValue(Cookies.preferences, PafStatus.REDIRECT_NEEDED);
                                    }
                                    return [2 /*return*/, {
                                            status: PafStatus.REDIRECT_NEEDED,
                                        }];
                            }
                        });
                    }); };
                    return [4 /*yield*/, processGetIdsAndPreferences()];
                case 1:
                    idsAndPreferences = _a.sent();
                    logInfo('Processed refresh', idsAndPreferences);
                    // Now handle prompt, if relevant
                    return [4 /*yield*/, updateDataWithPrompt(idsAndPreferences, proxyHostName, showPrompt)];
                case 2:
                    // Now handle prompt, if relevant
                    _a.sent();
                    return [2 /*return*/, idsAndPreferences];
            }
        });
    }); };
    /**
     * Write update of identifiers and preferences on the PAF domain
     * @param options:
     * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
     * @param input the identifiers and preferences to write
     * @return the written identifiers and preferences
     */
    var writeIdsAndPref = function (_a, input) {
        var proxyHostName = _a.proxyHostName;
        return __awaiter(void 0, void 0, void 0, function () {
            var getUrl, processWriteIdsAndPref, idsAndPreferences;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        getUrl = getProxyUrl(proxyHostName);
                        processWriteIdsAndPref = function () { return __awaiter(void 0, void 0, void 0, function () {
                            var signedResponse, signedData, response, operatorData, persistedIds, hasPersistedId, returnUrl, url;
                            var _a, _b, _c, _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        logInfo('Attempt to write:', input.identifiers, input.preferences);
                                        // First clean up local cookies
                                        removeCookie(Cookies.identifiers);
                                        removeCookie(Cookies.preferences);
                                        if (!thirdPartyCookiesSupported) return [3 /*break*/, 5];
                                        logInfo('3PC supported');
                                        return [4 /*yield*/, postJson(getUrl(jsonProxyEndpoints.signWrite), input)];
                                    case 1:
                                        signedResponse = _f.sent();
                                        return [4 /*yield*/, signedResponse.json()];
                                    case 2:
                                        signedData = (_f.sent());
                                        return [4 /*yield*/, postJson(getUrl(jsonProxyEndpoints.write), signedData)];
                                    case 3:
                                        response = _f.sent();
                                        return [4 /*yield*/, response.json()];
                                    case 4:
                                        operatorData = (_f.sent());
                                        persistedIds = (_b = (_a = operatorData === null || operatorData === void 0 ? void 0 : operatorData.body) === null || _a === void 0 ? void 0 : _a.identifiers) === null || _b === void 0 ? void 0 : _b.filter(function (identifier) { return (identifier === null || identifier === void 0 ? void 0 : identifier.persisted) !== false; });
                                        hasPersistedId = persistedIds.length > 0;
                                        saveCookieValue(Cookies.identifiers, hasPersistedId ? persistedIds : undefined);
                                        saveCookieValue(Cookies.preferences, operatorData.body.preferences);
                                        showNotificationIfValid((_e = (_d = (_c = operatorData === null || operatorData === void 0 ? void 0 : operatorData.body) === null || _c === void 0 ? void 0 : _c.preferences) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.use_browsing_for_personalization);
                                        return [2 /*return*/, operatorData.body];
                                    case 5:
                                        logInfo('3PC not supported: redirect');
                                        returnUrl = new URL(getUrl(redirectProxyEndpoints.write));
                                        returnUrl.searchParams.set(proxyUriParams.returnUrl, location.href);
                                        returnUrl.searchParams.set(proxyUriParams.message, JSON.stringify(input));
                                        url = returnUrl.toString();
                                        redirect(url);
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, processWriteIdsAndPref()];
                    case 1:
                        idsAndPreferences = _b.sent();
                        logInfo('Finished', idsAndPreferences);
                        return [2 /*return*/, idsAndPreferences];
                }
            });
        });
    };
    /**
     * Sign preferences
     * @param options:
     * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
     * @param input the main identifier of the web user, and the optin value
     * @return the signed Preferences
     */
    var signPreferences = function (_a, input) {
        var proxyHostName = _a.proxyHostName;
        return __awaiter(void 0, void 0, void 0, function () {
            var getUrl, signedResponse;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        getUrl = getProxyUrl(proxyHostName);
                        return [4 /*yield*/, postJson(getUrl(jsonProxyEndpoints.signPrefs), input)];
                    case 1:
                        signedResponse = _b.sent();
                        return [4 /*yield*/, signedResponse.json()];
                    case 2: return [2 /*return*/, (_b.sent())];
                }
            });
        });
    };
    /**
     * Get new random identifier
     * @param options:
     * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
     * @return the new Id, signed
     */
    var getNewId = function (_a) {
        var proxyHostName = _a.proxyHostName;
        return __awaiter(void 0, void 0, void 0, function () {
            var getUrl, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        getUrl = getProxyUrl(proxyHostName);
                        return [4 /*yield*/, get(getUrl(jsonProxyEndpoints.newId))];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: 
                    // Assume no error. FIXME should handle potential errors
                    return [2 /*return*/, (_b.sent()).body.identifiers[0]];
                }
            });
        });
    };
    /**
     * If at least one identifier and some preferences are present as a 1P cookie, return them
     * Otherwise, return undefined
     */
    var getIdsAndPreferences = function () {
        if (!getCookieValue(Cookies.lastRefresh)) {
            return undefined;
        }
        // Remove special string values
        var cleanCookieValue = function (rawValue) {
            return rawValue === PafStatus.REDIRECT_NEEDED || rawValue === PafStatus.NOT_PARTICIPATING ? undefined : rawValue;
        };
        var strIds = cleanCookieValue(getCookieValue(Cookies.identifiers));
        var strPreferences = cleanCookieValue(getCookieValue(Cookies.preferences));
        var values = fromClientCookieValues(strIds, strPreferences);
        // If the object is not complete (no identifier or no preferences), then consider no valid data
        if (values.identifiers === undefined || values.identifiers.length === 0 || values.preferences === undefined) {
            return undefined;
        }
        return values;
    };

    var FieldReadOnly = /** @class */ (function () {
        // Sets the default value for the field.
        function FieldReadOnly(model) {
            // List of bindings to HTML elements for the field.
            this.bindings = [];
            this.model = model;
        }
        // Binds the elements that are associated with the field to the field so
        // that when the value changes the HTML elements are updated and vice versa.
        FieldReadOnly.prototype.bind = function () {
            this.bindings.forEach(function (b) { return b.bind(); });
        };
        // Add a new binding for the field and set the correct value. Sets the
        // binding to this field, and then adds the binding to the list for the field.
        FieldReadOnly.prototype.addBinding = function (binding) {
            binding.setField(this);
            this.bindings.push(binding);
        };
        return FieldReadOnly;
    }());
    // Field that can be bound to an HTML element.
    var Field = /** @class */ (function (_super) {
        __extends(Field, _super);
        // The model and default value for the field.
        function Field(model, defaultValue) {
            var _this = _super.call(this, model) || this;
            _this.defaultValue = defaultValue;
            _this._value = defaultValue;
            return _this;
        }
        Object.defineProperty(Field.prototype, "value", {
            // Gets the current value.
            get: function () {
                return this._value;
            },
            // Sets the current value, updating any HTML elements that match the name
            // value, then checks to see if any other fields need to be updated if the
            // model is not already in a setting values operation.
            set: function (value) {
                this._value = value;
                this.bindings.forEach(function (b) { return b.setValue(value); });
                if (this.model.settingValues == false) {
                    this.model.settingValues = true;
                    this.updateOthers();
                    this.model.settingValues = false;
                }
            },
            enumerable: false,
            configurable: true
        });
        // Resets the field to the original value.
        Field.prototype.reset = function () {
            this.value = this.defaultValue;
        };
        // Add a new binding for the field and set the correct value. Sets the
        // binding to this field, sets the value of the HTML element to the current
        // value of the field, and then adds the binding to the list for the field.
        Field.prototype.addBinding = function (binding) {
            _super.prototype.addBinding.call(this, binding);
            binding.setValue(this._value);
        };
        return Field;
    }(FieldReadOnly));

    /**
     * The different states for the marketing preferences field.
     * Can't be an enum as we need the values for the PreferencesData to be comparable.
     */
    var Marketing = /** @class */ (function () {
        function Marketing() {
        }
        /**
         * Determines equality of two different instances of PreferencesData.
         * @remarks
         * Uses the JSON.stringify to compare by value.
         */
        Marketing.equals = function (a, b) {
            return JSON.stringify(a) === JSON.stringify(b);
        };
        /**
         * Personalized marketing.
         */
        Marketing.personalized = {
            use_browsing_for_personalization: true,
        };
        /**
         * Standard marketing.
         */
        Marketing.standard = {
            use_browsing_for_personalization: false,
        };
        /**
         * Customized marketing where there is no data held in this field.
         */
        Marketing.custom = null;
        /**
         * No marketing is yet defined. The user has not made a choice.
         */
        Marketing.notSet = undefined;
        return Marketing;
    }());
    /**
     * A field used to represent an identifier in the model.
     */
    var FieldId = /** @class */ (function (_super) {
        __extends(FieldId, _super);
        /**
         * Constructs a new instance of FieldId.
         * @param model the field is part of
         * @param defaultValue the default value for the empty identifier
         * @param types the type values that are supported for validation
         */
        function FieldId(model, defaultValue, types) {
            var _this = _super.call(this, model, defaultValue) || this;
            _this.types = types;
            return _this;
        }
        Object.defineProperty(FieldId.prototype, "persisted", {
            /**
             * True if the value in the field has been persisted, otherwise false.
             */
            get: function () {
                var _a;
                return ((_a = this.value) === null || _a === void 0 ? void 0 : _a.persisted) == true;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * If the random Id field changes then the save button should become enabled.
         */
        FieldId.prototype.updateOthers = function () {
            this.model.canSave.value = ButtonState.isEnabled(this.model);
        };
        /**
         * Sets the identifier that matches the type for the field validating that it has come from persistent storage.
         * @param identifiers array of identifiers where the first one that matches any of the allowed types is used by the
         * field.
         */
        FieldId.prototype.setPersisted = function (identifiers) {
            Validate.Identifiers(identifiers);
            for (var i = 0; i < identifiers.length; i++) {
                var id = identifiers[i];
                if (id.persisted == true && this.types.includes(id.type)) {
                    this.value = id;
                    return;
                }
            }
            throw "No identifier of type(s) '".concat(this.types, "' found");
        };
        return FieldId;
    }(Field));
    /**
     * A field used to represent preferences in the model.
     */
    var FieldPreferences = /** @class */ (function (_super) {
        __extends(FieldPreferences, _super);
        function FieldPreferences() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._persisted = null;
            return _this;
        }
        Object.defineProperty(FieldPreferences.prototype, "persisted", {
            /**
             * If the value has been provided from a persisted value then returns the original persisted value.
             */
            get: function () {
                return this._persisted;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FieldPreferences.prototype, "hasChanged", {
            /**
             * Returns true if the value has changed from the persisted value, otherwise false.
             */
            get: function () {
                var _a;
                return Marketing.equals((_a = this._persisted) === null || _a === void 0 ? void 0 : _a.data, this.value) == false;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * If the preferences has changed update the other fields in the model.
         */
        FieldPreferences.prototype.updateOthers = function () {
            // Always reset all the custom fields to false. The ones that should be true will be altered.
            this.model.customFields.forEach(function (f) { return (f.value = false); });
            if (Marketing.equals(this.value, Marketing.personalized)) {
                // If personalized is true then standard must be false. Also all the
                // customized options will be true.
                this.model.all.value = true;
                this.model.personalizedFields.forEach(function (f) { return (f.value = true); });
            }
            else if (Marketing.equals(this.value, Marketing.standard)) {
                // If standard is true then personalized must be false. Some of the
                // customized options will also be false.
                this.model.all.value = false;
                this.model.standardFields.forEach(function (f) { return (f.value = true); });
            }
            else {
                // No marketing option is selected so must be customized.
                this.model.all.value = false;
            }
            // The save button state needs to be checked.
            this.model.canSave.value = ButtonState.isEnabled(this.model);
        };
        /**
         * Called when the preferences are coming from persisted storage.
         * @param preferences
         */
        FieldPreferences.prototype.setPersisted = function (preferences) {
            Validate.Preference(preferences);
            this._persisted = preferences;
            this.value = preferences.data;
        };
        return FieldPreferences;
    }(Field));
    /**
     * A field used to represent the "this site only" option.
     */
    var FieldThisSiteOnly = /** @class */ (function (_super) {
        __extends(FieldThisSiteOnly, _super);
        function FieldThisSiteOnly() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * When the this site only option is set to false then all the other values need to be reset. This does not apply when
         * the model is being loaded for the first time.
         */
        FieldThisSiteOnly.prototype.updateOthers = function () {
            if (this.value == false) {
                this.model.reset();
            }
            this.model.canSave.value = ButtonState.isEnabled(this.model);
        };
        return FieldThisSiteOnly;
    }(Field));
    /**
     * Field used to represent custom marketing options shown on the customized card.
     */
    var FieldCustom = /** @class */ (function (_super) {
        __extends(FieldCustom, _super);
        function FieldCustom() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Evaluate marketing preference based on the customized values that have been set.
         */
        FieldCustom.prototype.setMarketing = function () {
            if (this.allTrue(this.model.personalizedFields)) {
                this.model.pref.value = Marketing.personalized;
            }
            else if (this.allTrue(this.model.standardFields)) {
                this.model.pref.value = Marketing.standard;
            }
            else {
                this.model.pref.value = Marketing.custom;
            }
        };
        /**
         * If custom marketing is selected then the preferences are only for this site.
         */
        FieldCustom.prototype.setThisSiteOnly = function () {
            if (this.model.onlyThisSite.value == false && Marketing.equals(this.model.pref.value, Marketing.custom)) {
                this.model.onlyThisSite.value = true;
            }
        };
        /**
         * Returns true if all the fields provided are true.
         * @param fields
         * @returns
         */
        FieldCustom.prototype.allTrue = function (fields) {
            var value = true;
            fields.forEach(function (f) {
                value = value && f.value;
            });
            return value;
        };
        return FieldCustom;
    }(Field));
    /**
     * Field represents a single option within the overall available list of custom options.
     */
    var FieldSingle = /** @class */ (function (_super) {
        __extends(FieldSingle, _super);
        function FieldSingle() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FieldSingle.prototype.updateOthers = function () {
            this.setMarketing();
            this.setThisSiteOnly();
            this.model.canSave.value = ButtonState.isEnabled(this.model);
            this.model.all.value = this.allTrue(this.model.customFields);
        };
        return FieldSingle;
    }(FieldCustom));
    /**
     * Field represents all the options and quickly turns then from true to false.
     */
    var FieldAll = /** @class */ (function (_super) {
        __extends(FieldAll, _super);
        function FieldAll() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FieldAll.prototype.updateOthers = function () {
            var _this = this;
            this.model.customFields.forEach(function (f) { return (f.value = _this.value); });
            _super.prototype.updateOthers.call(this);
        };
        return FieldAll;
    }(FieldSingle));
    /**
     * The model used in the module.
     */
    var Model = /** @class */ (function () {
        function Model() {
            // Set to true when model update operations are occurring. Results in the
            // methods to update other properties being disabled.
            this.settingValues = false;
            // The data fields that relate to the data model.
            this.rid = new FieldId(this, null, ['paf_browser_id', 'site_browser_id']); // The random id
            this.pref = new FieldPreferences(this, Marketing.notSet); // The preferences
            this.onlyThisSite = new FieldThisSiteOnly(this, false);
            this[1] = new FieldSingle(this, false); // Select and/or access information on a device
            this[2] = new FieldSingle(this, false); // Select basic ads
            this[3] = new FieldSingle(this, false); // Apply market research to generate audience insights
            this[4] = new FieldSingle(this, false); // Develop & improve products
            this[5] = new FieldSingle(this, false); // Ensure security, prevent fraud, and debug
            this[6] = new FieldSingle(this, false); // Technically deliver ads or content
            this[7] = new FieldSingle(this, false); // Create a personalized ad profile
            this[8] = new FieldSingle(this, false); // Select personalized ads
            this[9] = new FieldSingle(this, false); // Create a personalized content profile
            this[10] = new FieldSingle(this, false); // Select personalized content
            this[11] = new FieldSingle(this, false); // Measure ad performance
            this[12] = new FieldSingle(this, false); // Measure content performance
            this.all = new FieldAll(this, false);
            this.canSave = new FieldSingle(this, false); // True when the model can be saved
            this.email = null; // Not currently used.
            this.salt = null; // Not currently used.
            this.status = null; // The status following the last fetch.
            // All the fields. Used for the reset and bind methods.
            this.allFields = [
                this.onlyThisSite,
                this[1],
                this[2],
                this[3],
                this[4],
                this[5],
                this[6],
                this[7],
                this[8],
                this[9],
                this[10],
                this[11],
                this[12],
                this.all,
                this.canSave,
                this.rid,
                this.pref,
            ];
            // All the custom boolean fields that appear in the persisted data.
            this.customFields = [
                this[1],
                this[2],
                this[3],
                this[4],
                this[5],
                this[6],
                this[7],
                this[8],
                this[9],
                this[10],
                this[11],
                this[12],
            ];
            // The custom fields that are set to true when standard marketing is enabled.
            this.standardFields = [this[1], this[2], this[3], this[4], this[5], this[6], this[11], this[12]];
            // The custom fields that are set to true when personalized marketing is enabled.
            this.personalizedFields = this.customFields;
        }
        Object.defineProperty(Model.prototype, "allPersisted", {
            /**
             * True if all of the preferences or identifiers have been set from persisted data, otherwise false.
             */
            get: function () {
                return this.pref.persisted != null && this.rid.persisted;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Model.prototype, "nonePersisted", {
            /**
             * True if neither the preferences or the identifiers have been persisted.
             */
            get: function () {
                return this.pref.persisted == null && this.rid.persisted == false;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Calls the bind method on all the fields in the model to connect them to the currently displayed UI.
         */
        Model.prototype.bind = function () {
            this.allFields.forEach(function (f) { return f.bind(); });
        };
        /**
         * Resets all the fields in the model. Sets the setting values flag to ensure the update others method is not called
         * because we don't want to change the value of dependent fields during a reset.
         */
        Model.prototype.reset = function () {
            this.settingValues = true;
            this.allFields.forEach(function (f) { return f.reset(); });
            this.settingValues = false;
        };
        /**
         * Resets the model and then sets the values from the ids and preferences provided.
         * @param data
         */
        Model.prototype.setFromIdsAndPreferences = function (data) {
            this.reset();
            if (data != undefined) {
                if (data.identifiers != undefined && data.identifiers.length > 0) {
                    Validate.Identifiers(data.identifiers);
                    this.rid.setPersisted(data.identifiers);
                }
                if (data.preferences != undefined) {
                    this.pref.setPersisted(data.preferences);
                }
            }
        };
        return Model;
    }());
    /**
     * Static class used to determine if the save button should be enabled.
     */
    var ButtonState = /** @class */ (function () {
        function ButtonState() {
        }
        /**
         * True if the model is in a state where the data can be saved, otherwise false.
         * @param model
         * @returns
         */
        ButtonState.isEnabled = function (model) {
            return model.onlyThisSite.value === true || model.pref.hasChanged === true || model.rid.persisted === false;
        };
        return ButtonState;
    }());
    /**
     * Static class used to validate complex data fields.
     */
    var Validate = /** @class */ (function () {
        function Validate() {
        }
        Validate.Preference = function (p) {
            if (p == undefined) {
                throw 'Preference must be defined';
            }
            Validate.Source(p.source);
            Validate.Version(p.version);
        };
        Validate.Identifiers = function (s) {
            if (s == undefined || s.length == 0) {
                throw 'Identifiers must be defined';
            }
            s.forEach(function (i) { return Validate.Identifier(i); });
        };
        Validate.Identifier = function (i) {
            if (i == undefined) {
                throw 'Identifier must be defined';
            }
            if (i.persisted != true) {
                throw 'Identifier must have been persisted';
            }
            Validate.Source(i.source);
            Validate.Version(i.version);
        };
        Validate.Source = function (s) {
            if (s == undefined ||
                s.domain == undefined ||
                s.signature == undefined ||
                s.timestamp == undefined ||
                s.domain.length == 0 ||
                s.signature.length == 0 ||
                s.timestamp == 0) {
                throw "'".concat(s, "' is an invalid source");
            }
        };
        Validate.Version = function (v) {
            if (Validate.validVersions.includes(v)) {
                return;
            }
            throw "Version '".concat(v, "' invalid");
        };
        // Versions of persisted fields that are valid in the data model.
        Validate.validVersions = ['0.1'];
        return Validate;
    }());

    var logoSvg = "<svg width=\"72\" height=\"16\" viewBox=\"0 0 72 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"ok-ui-card__header-logo\">\r\n  <title>OneKey</title>\r\n  <path d=\"M25.3993 13C24.4813 13 23.6376 12.7867 22.868 12.3602C22.1077 11.9337 21.5003 11.3403 21.046 10.58C20.6009 9.81039 20.3784 8.94808 20.3784 7.99305C20.3784 7.03802 20.6009 6.18034 21.046 5.42003C21.5003 4.65971 22.1077 4.0663 22.868 3.63978C23.6376 3.21326 24.4813 3 25.3993 3C26.3172 3 27.1564 3.21326 27.9167 3.63978C28.6863 4.0663 29.2889 4.65971 29.7247 5.42003C30.1698 6.18034 30.3923 7.03802 30.3923 7.99305C30.3923 8.94808 30.1698 9.81039 29.7247 10.58C29.2797 11.3403 28.677 11.9337 27.9167 12.3602C27.1564 12.7867 26.3172 13 25.3993 13ZM25.3993 10.8303C26.1781 10.8303 26.7994 10.5707 27.263 10.0515C27.7359 9.53222 27.9723 8.84608 27.9723 7.99305C27.9723 7.13074 27.7359 6.4446 27.263 5.93463C26.7994 5.41539 26.1781 5.15577 25.3993 5.15577C24.6111 5.15577 23.9806 5.41075 23.5078 5.92072C23.0442 6.43069 22.8124 7.12147 22.8124 7.99305C22.8124 8.85536 23.0442 9.54613 23.5078 10.0654C23.9806 10.5753 24.6111 10.8303 25.3993 10.8303Z\" fill=\"#011630\"/>\r\n  <path d=\"M40.4498 12.9026H38.0715L34.0938 6.88039V12.9026H31.7155V3.13908H34.0938L38.0715 9.18915V3.13908H40.4498V12.9026Z\" fill=\"#011630\"/>\r\n  <path d=\"M44.5521 5.04451V7.01947H47.7371V8.85536H44.5521V10.9972H48.1543V12.9026H42.1738V3.13908H48.1543V5.04451H44.5521Z\" fill=\"#011630\"/>\r\n  <path d=\"M55.1364 12.9026L50.9223 8.41029V12.9026H49.9487V3.18081H50.9223V7.72879L55.1364 3.18081H56.3743L51.8263 8.03477L56.416 12.9026H55.1364Z\" fill=\"#011630\"/>\r\n  <path d=\"M58.8271 3.97357V7.60362H62.5128V8.41029H58.8271V12.096H62.93V12.9026H57.8535V3.1669H62.93V3.97357H58.8271Z\" fill=\"#011630\"/>\r\n  <path d=\"M71.274 3.18081L68.1585 9.11961V12.9026H67.185V9.11961L64.0417 3.18081H65.1405L67.6718 8.22949L70.1891 3.18081H71.274Z\" fill=\"#011630\"/>\r\n  <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M3.49283 13.7381C3.32679 13.9331 3.03303 13.9575 2.84795 13.7805C1.66063 12.6445 0.848987 11.1674 0.529604 9.54789C0.180236 7.77637 0.440442 5.93876 1.26791 4.33387C2.09537 2.72899 3.44143 1.45123 5.08718 0.708384C6.73294 -0.0344669 8.5816 -0.198718 10.3325 0.242339C12.0835 0.683396 13.6337 1.70382 14.7312 3.13767C15.8286 4.57153 16.4088 6.33448 16.3772 8.13985C16.3456 9.94522 15.7042 11.6868 14.5573 13.0814C13.7748 14.033 12.7883 14.7848 11.6798 15.2871C11.2733 15.4712 10.8299 15.1762 10.7942 14.7314L10.7724 14.4607C10.7482 14.1583 10.9261 13.8789 11.1985 13.7452C12.0126 13.3456 12.738 12.7748 13.3216 12.0651C14.2391 10.9494 14.7522 9.55617 14.7774 8.11188C14.8027 6.66758 14.3386 5.25722 13.4606 4.11014C12.5827 2.96305 11.3425 2.14672 9.94172 1.79387C8.54097 1.44103 7.06204 1.57243 5.74543 2.16671C4.42882 2.76099 3.35198 3.78319 2.69001 5.0671C2.02804 6.351 1.81987 7.82109 2.09937 9.23831C2.34886 10.5034 2.97385 11.66 3.88749 12.5598C4.06997 12.7395 4.09482 13.0311 3.92878 13.2261L3.49283 13.7381ZM12.8919 8.00024C12.8919 10.2307 11.2769 12.084 9.15246 12.4545L9.15246 15.5945L9.08201 15.5945C8.9905 15.8255 8.77551 15.9946 8.50887 15.9993C7.43381 16.018 6.36585 15.8197 5.36913 15.4165C5.0159 15.2736 4.88157 14.8551 5.05438 14.5155L5.15421 14.3194C5.32702 13.9798 5.74146 13.8484 6.09768 13.9836C6.57387 14.1645 7.06912 14.2875 7.57275 14.3507L7.57275 12.4519C5.45574 12.0752 3.84838 10.2255 3.84838 8.00024C3.84838 5.50295 5.87283 3.4785 8.37012 3.4785C10.8674 3.4785 12.8919 5.50295 12.8919 8.00024ZM11.2984 8.00024C11.2984 6.38301 9.98735 5.07198 8.37012 5.07198C6.75289 5.07198 5.44186 6.38301 5.44186 8.00024C5.44186 9.61747 6.75289 10.9285 8.37012 10.9285C9.98735 10.9285 11.2984 9.61747 11.2984 8.00024Z\" fill=\"url(#paint0_linear_402_35552)\"/>\r\n  <defs>\r\n    <linearGradient id=\"paint0_linear_402_35552\" x1=\"1.45534\" y1=\"1.31151\" x2=\"12.1835\" y2=\"16.7662\" gradientUnits=\"userSpaceOnUse\">\r\n      <stop stop-color=\"#09F7FF\"/>\r\n      <stop offset=\"1\" stop-color=\"#0F9AFD\"/>\r\n    </linearGradient>\r\n  </defs>\r\n</svg>";

    var logoCenterSvg = "<svg width=\"72\" height=\"16\" viewBox=\"0 0 72 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"ok-ui-card__header-logo ok-ui-card__header-logo--center\">\r\n  <title>OneKey</title>\r\n  <path d=\"M25.3993 13C24.4813 13 23.6376 12.7867 22.868 12.3602C22.1077 11.9337 21.5003 11.3403 21.046 10.58C20.6009 9.81039 20.3784 8.94808 20.3784 7.99305C20.3784 7.03802 20.6009 6.18034 21.046 5.42003C21.5003 4.65971 22.1077 4.0663 22.868 3.63978C23.6376 3.21326 24.4813 3 25.3993 3C26.3172 3 27.1564 3.21326 27.9167 3.63978C28.6863 4.0663 29.2889 4.65971 29.7247 5.42003C30.1698 6.18034 30.3923 7.03802 30.3923 7.99305C30.3923 8.94808 30.1698 9.81039 29.7247 10.58C29.2797 11.3403 28.677 11.9337 27.9167 12.3602C27.1564 12.7867 26.3172 13 25.3993 13ZM25.3993 10.8303C26.1781 10.8303 26.7994 10.5707 27.263 10.0515C27.7359 9.53222 27.9723 8.84608 27.9723 7.99305C27.9723 7.13074 27.7359 6.4446 27.263 5.93463C26.7994 5.41539 26.1781 5.15577 25.3993 5.15577C24.6111 5.15577 23.9806 5.41075 23.5078 5.92072C23.0442 6.43069 22.8124 7.12147 22.8124 7.99305C22.8124 8.85536 23.0442 9.54613 23.5078 10.0654C23.9806 10.5753 24.6111 10.8303 25.3993 10.8303Z\" fill=\"#011630\"/>\r\n  <path d=\"M40.4498 12.9026H38.0715L34.0938 6.88039V12.9026H31.7155V3.13908H34.0938L38.0715 9.18915V3.13908H40.4498V12.9026Z\" fill=\"#011630\"/>\r\n  <path d=\"M44.5521 5.04451V7.01947H47.7371V8.85536H44.5521V10.9972H48.1543V12.9026H42.1738V3.13908H48.1543V5.04451H44.5521Z\" fill=\"#011630\"/>\r\n  <path d=\"M55.1364 12.9026L50.9223 8.41029V12.9026H49.9487V3.18081H50.9223V7.72879L55.1364 3.18081H56.3743L51.8263 8.03477L56.416 12.9026H55.1364Z\" fill=\"#011630\"/>\r\n  <path d=\"M58.8271 3.97357V7.60362H62.5128V8.41029H58.8271V12.096H62.93V12.9026H57.8535V3.1669H62.93V3.97357H58.8271Z\" fill=\"#011630\"/>\r\n  <path d=\"M71.274 3.18081L68.1585 9.11961V12.9026H67.185V9.11961L64.0417 3.18081H65.1405L67.6718 8.22949L70.1891 3.18081H71.274Z\" fill=\"#011630\"/>\r\n  <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M3.49283 13.7381C3.32679 13.9331 3.03303 13.9575 2.84795 13.7805C1.66063 12.6445 0.848987 11.1674 0.529604 9.54789C0.180236 7.77637 0.440442 5.93876 1.26791 4.33387C2.09537 2.72899 3.44143 1.45123 5.08718 0.708384C6.73294 -0.0344669 8.5816 -0.198718 10.3325 0.242339C12.0835 0.683396 13.6337 1.70382 14.7312 3.13767C15.8286 4.57153 16.4088 6.33448 16.3772 8.13985C16.3456 9.94522 15.7042 11.6868 14.5573 13.0814C13.7748 14.033 12.7883 14.7848 11.6798 15.2871C11.2733 15.4712 10.8299 15.1762 10.7942 14.7314L10.7724 14.4607C10.7482 14.1583 10.9261 13.8789 11.1985 13.7452C12.0126 13.3456 12.738 12.7748 13.3216 12.0651C14.2391 10.9494 14.7522 9.55617 14.7774 8.11188C14.8027 6.66758 14.3386 5.25722 13.4606 4.11014C12.5827 2.96305 11.3425 2.14672 9.94172 1.79387C8.54097 1.44103 7.06204 1.57243 5.74543 2.16671C4.42882 2.76099 3.35198 3.78319 2.69001 5.0671C2.02804 6.351 1.81987 7.82109 2.09937 9.23831C2.34886 10.5034 2.97385 11.66 3.88749 12.5598C4.06997 12.7395 4.09482 13.0311 3.92878 13.2261L3.49283 13.7381ZM12.8919 8.00024C12.8919 10.2307 11.2769 12.084 9.15246 12.4545L9.15246 15.5945L9.08201 15.5945C8.9905 15.8255 8.77551 15.9946 8.50887 15.9993C7.43381 16.018 6.36585 15.8197 5.36913 15.4165C5.0159 15.2736 4.88157 14.8551 5.05438 14.5155L5.15421 14.3194C5.32702 13.9798 5.74146 13.8484 6.09768 13.9836C6.57387 14.1645 7.06912 14.2875 7.57275 14.3507L7.57275 12.4519C5.45574 12.0752 3.84838 10.2255 3.84838 8.00024C3.84838 5.50295 5.87283 3.4785 8.37012 3.4785C10.8674 3.4785 12.8919 5.50295 12.8919 8.00024ZM11.2984 8.00024C11.2984 6.38301 9.98735 5.07198 8.37012 5.07198C6.75289 5.07198 5.44186 6.38301 5.44186 8.00024C5.44186 9.61747 6.75289 10.9285 8.37012 10.9285C9.98735 10.9285 11.2984 9.61747 11.2984 8.00024Z\" fill=\"url(#paint0_linear_402_35552)\"/>\r\n  <defs>\r\n    <linearGradient id=\"paint0_linear_402_35552\" x1=\"1.45534\" y1=\"1.31151\" x2=\"12.1835\" y2=\"16.7662\" gradientUnits=\"userSpaceOnUse\">\r\n      <stop stop-color=\"#09F7FF\"/>\r\n      <stop offset=\"1\" stop-color=\"#0F9AFD\"/>\r\n    </linearGradient>\r\n  </defs>\r\n</svg>";

    var tooltipsJs = "(()=>{\"use strict\";function e(e){if(null==e)return window;if(\"[object Window]\"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function t(t){return t instanceof e(t).Element||t instanceof Element}function n(t){return t instanceof e(t).HTMLElement||t instanceof HTMLElement}function o(t){return\"undefined\"!=typeof ShadowRoot&&(t instanceof e(t).ShadowRoot||t instanceof ShadowRoot)}var r=Math.max,i=Math.min,a=Math.round;function s(e,t){void 0===t&&(t=!1);var o=e.getBoundingClientRect(),r=1,i=1;if(n(e)&&t){var s=e.offsetHeight,f=e.offsetWidth;f>0&&(r=a(o.width)/f||1),s>0&&(i=a(o.height)/s||1)}return{width:o.width/r,height:o.height/i,top:o.top/i,right:o.right/r,bottom:o.bottom/i,left:o.left/r,x:o.left/r,y:o.top/i}}function f(t){var n=e(t);return{scrollLeft:n.pageXOffset,scrollTop:n.pageYOffset}}function c(e){return e?(e.nodeName||\"\").toLowerCase():null}function u(e){return((t(e)?e.ownerDocument:e.document)||window.document).documentElement}function l(e){return s(u(e)).left+f(e).scrollLeft}function p(t){return e(t).getComputedStyle(t)}function d(e){var t=p(e),n=t.overflow,o=t.overflowX,r=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+r+o)}function h(t,o,r){void 0===r&&(r=!1);var i,p,h=n(o),m=n(o)&&function(e){var t=e.getBoundingClientRect(),n=a(t.width)/e.offsetWidth||1,o=a(t.height)/e.offsetHeight||1;return 1!==n||1!==o}(o),v=u(o),g=s(t,m),y={scrollLeft:0,scrollTop:0},b={x:0,y:0};return(h||!h&&!r)&&((\"body\"!==c(o)||d(v))&&(y=(i=o)!==e(i)&&n(i)?{scrollLeft:(p=i).scrollLeft,scrollTop:p.scrollTop}:f(i)),n(o)?((b=s(o,!0)).x+=o.clientLeft,b.y+=o.clientTop):v&&(b.x=l(v))),{x:g.left+y.scrollLeft-b.x,y:g.top+y.scrollTop-b.y,width:g.width,height:g.height}}function m(e){var t=s(e),n=e.offsetWidth,o=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-o)<=1&&(o=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:o}}function v(e){return\"html\"===c(e)?e:e.assignedSlot||e.parentNode||(o(e)?e.host:null)||u(e)}function g(e){return[\"html\",\"body\",\"#document\"].indexOf(c(e))>=0?e.ownerDocument.body:n(e)&&d(e)?e:g(v(e))}function y(t,n){var o;void 0===n&&(n=[]);var r=g(t),i=r===(null==(o=t.ownerDocument)?void 0:o.body),a=e(r),s=i?[a].concat(a.visualViewport||[],d(r)?r:[]):r,f=n.concat(s);return i?f:f.concat(y(v(s)))}function b(e){return[\"table\",\"td\",\"th\"].indexOf(c(e))>=0}function w(e){return n(e)&&\"fixed\"!==p(e).position?e.offsetParent:null}function x(t){for(var o=e(t),r=w(t);r&&b(r)&&\"static\"===p(r).position;)r=w(r);return r&&(\"html\"===c(r)||\"body\"===c(r)&&\"static\"===p(r).position)?o:r||function(e){var t=-1!==navigator.userAgent.toLowerCase().indexOf(\"firefox\");if(-1!==navigator.userAgent.indexOf(\"Trident\")&&n(e)&&\"fixed\"===p(e).position)return null;for(var o=v(e);n(o)&&[\"html\",\"body\"].indexOf(c(o))<0;){var r=p(o);if(\"none\"!==r.transform||\"none\"!==r.perspective||\"paint\"===r.contain||-1!==[\"transform\",\"perspective\"].indexOf(r.willChange)||t&&\"filter\"===r.willChange||t&&r.filter&&\"none\"!==r.filter)return o;o=o.parentNode}return null}(t)||o}var O=\"top\",j=\"bottom\",E=\"right\",A=\"left\",L=\"auto\",k=[O,j,E,A],D=\"start\",M=\"end\",P=\"viewport\",W=\"popper\",B=k.reduce((function(e,t){return e.concat([t+\"-\"+D,t+\"-\"+M])}),[]),H=[].concat(k,[L]).reduce((function(e,t){return e.concat([t,t+\"-\"+D,t+\"-\"+M])}),[]),R=[\"beforeRead\",\"read\",\"afterRead\",\"beforeMain\",\"main\",\"afterMain\",\"beforeWrite\",\"write\",\"afterWrite\"];function T(e){var t=new Map,n=new Set,o=[];function r(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var o=t.get(e);o&&r(o)}})),o.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||r(e)})),o}var S={placement:\"bottom\",modifiers:[],strategy:\"absolute\"};function V(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&\"function\"==typeof e.getBoundingClientRect)}))}var C={passive:!0};function I(e){return e.split(\"-\")[0]}function N(e){return e.split(\"-\")[1]}function q(e){return[\"top\",\"bottom\"].indexOf(e)>=0?\"x\":\"y\"}function _(e){var t,n=e.reference,o=e.element,r=e.placement,i=r?I(r):null,a=r?N(r):null,s=n.x+n.width/2-o.width/2,f=n.y+n.height/2-o.height/2;switch(i){case O:t={x:s,y:n.y-o.height};break;case j:t={x:s,y:n.y+n.height};break;case E:t={x:n.x+n.width,y:f};break;case A:t={x:n.x-o.width,y:f};break;default:t={x:n.x,y:n.y}}var c=i?q(i):null;if(null!=c){var u=\"y\"===c?\"height\":\"width\";switch(a){case D:t[c]=t[c]-(n[u]/2-o[u]/2);break;case M:t[c]=t[c]+(n[u]/2-o[u]/2)}}return t}var F={top:\"auto\",right:\"auto\",bottom:\"auto\",left:\"auto\"};function U(t){var n,o=t.popper,r=t.popperRect,i=t.placement,s=t.variation,f=t.offsets,c=t.position,l=t.gpuAcceleration,d=t.adaptive,h=t.roundOffsets,m=t.isFixed,v=f.x,g=void 0===v?0:v,y=f.y,b=void 0===y?0:y,w=\"function\"==typeof h?h({x:g,y:b}):{x:g,y:b};g=w.x,b=w.y;var L=f.hasOwnProperty(\"x\"),k=f.hasOwnProperty(\"y\"),D=A,P=O,W=window;if(d){var B=x(o),H=\"clientHeight\",R=\"clientWidth\";B===e(o)&&\"static\"!==p(B=u(o)).position&&\"absolute\"===c&&(H=\"scrollHeight\",R=\"scrollWidth\"),B=B,(i===O||(i===A||i===E)&&s===M)&&(P=j,b-=(m&&W.visualViewport?W.visualViewport.height:B[H])-r.height,b*=l?1:-1),i!==A&&(i!==O&&i!==j||s!==M)||(D=E,g-=(m&&W.visualViewport?W.visualViewport.width:B[R])-r.width,g*=l?1:-1)}var T,S=Object.assign({position:c},d&&F),V=!0===h?function(e){var t=e.x,n=e.y,o=window.devicePixelRatio||1;return{x:a(t*o)/o||0,y:a(n*o)/o||0}}({x:g,y:b}):{x:g,y:b};return g=V.x,b=V.y,l?Object.assign({},S,((T={})[P]=k?\"0\":\"\",T[D]=L?\"0\":\"\",T.transform=(W.devicePixelRatio||1)<=1?\"translate(\"+g+\"px, \"+b+\"px)\":\"translate3d(\"+g+\"px, \"+b+\"px, 0)\",T)):Object.assign({},S,((n={})[P]=k?b+\"px\":\"\",n[D]=L?g+\"px\":\"\",n.transform=\"\",n))}var z={left:\"right\",right:\"left\",bottom:\"top\",top:\"bottom\"};function X(e){return e.replace(/left|right|bottom|top/g,(function(e){return z[e]}))}var Y={start:\"end\",end:\"start\"};function G(e){return e.replace(/start|end/g,(function(e){return Y[e]}))}function J(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function K(n,o){return o===P?J(function(t){var n=e(t),o=u(t),r=n.visualViewport,i=o.clientWidth,a=o.clientHeight,s=0,f=0;return r&&(i=r.width,a=r.height,/^((?!chrome|android).)*safari/i.test(navigator.userAgent)||(s=r.offsetLeft,f=r.offsetTop)),{width:i,height:a,x:s+l(t),y:f}}(n)):t(o)?function(e){var t=s(e);return t.top=t.top+e.clientTop,t.left=t.left+e.clientLeft,t.bottom=t.top+e.clientHeight,t.right=t.left+e.clientWidth,t.width=e.clientWidth,t.height=e.clientHeight,t.x=t.left,t.y=t.top,t}(o):J(function(e){var t,n=u(e),o=f(e),i=null==(t=e.ownerDocument)?void 0:t.body,a=r(n.scrollWidth,n.clientWidth,i?i.scrollWidth:0,i?i.clientWidth:0),s=r(n.scrollHeight,n.clientHeight,i?i.scrollHeight:0,i?i.clientHeight:0),c=-o.scrollLeft+l(e),d=-o.scrollTop;return\"rtl\"===p(i||n).direction&&(c+=r(n.clientWidth,i?i.clientWidth:0)-a),{width:a,height:s,x:c,y:d}}(u(n)))}function Q(e,a){void 0===a&&(a={});var f,l=a,d=l.placement,h=void 0===d?e.placement:d,m=l.boundary,g=void 0===m?\"clippingParents\":m,b=l.rootBoundary,w=void 0===b?P:b,A=l.elementContext,L=void 0===A?W:A,D=l.altBoundary,M=void 0!==D&&D,B=l.padding,H=void 0===B?0:B,R=function(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},e)}(\"number\"!=typeof H?H:(f=H,k.reduce((function(e,t){return e[t]=f,e}),{}))),T=L===W?\"reference\":W,S=e.rects.popper,V=e.elements[M?T:L],C=function(e,a,s){var f=\"clippingParents\"===a?function(e){var r=y(v(e)),i=[\"absolute\",\"fixed\"].indexOf(p(e).position)>=0&&n(e)?x(e):e;return t(i)?r.filter((function(e){return t(e)&&function(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&o(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}(e,i)&&\"body\"!==c(e)})):[]}(e):[].concat(a),u=[].concat(f,[s]),l=u[0],d=u.reduce((function(t,n){var o=K(e,n);return t.top=r(o.top,t.top),t.right=i(o.right,t.right),t.bottom=i(o.bottom,t.bottom),t.left=r(o.left,t.left),t}),K(e,l));return d.width=d.right-d.left,d.height=d.bottom-d.top,d.x=d.left,d.y=d.top,d}(t(V)?V:V.contextElement||u(e.elements.popper),g,w),I=s(e.elements.reference),N=_({reference:I,element:S,strategy:\"absolute\",placement:h}),q=J(Object.assign({},S,N)),F=L===W?q:I,U={top:C.top-F.top+R.top,bottom:F.bottom-C.bottom+R.bottom,left:C.left-F.left+R.left,right:F.right-C.right+R.right},z=e.modifiersData.offset;if(L===W&&z){var X=z[h];Object.keys(U).forEach((function(e){var t=[E,j].indexOf(e)>=0?1:-1,n=[O,j].indexOf(e)>=0?\"y\":\"x\";U[e]+=X[n]*t}))}return U}function Z(e,t,n){return r(e,i(t,n))}const $=function(e){void 0===e&&(e={});var n=e,o=n.defaultModifiers,r=void 0===o?[]:o,i=n.defaultOptions,a=void 0===i?S:i;return function(e,n,o){void 0===o&&(o=a);var i,s,f={placement:\"bottom\",orderedModifiers:[],options:Object.assign({},S,a),modifiersData:{},elements:{reference:e,popper:n},attributes:{},styles:{}},c=[],u=!1,l={state:f,setOptions:function(o){var i=\"function\"==typeof o?o(f.options):o;p(),f.options=Object.assign({},a,f.options,i),f.scrollParents={reference:t(e)?y(e):e.contextElement?y(e.contextElement):[],popper:y(n)};var s,u,d=function(e){var t=T(e);return R.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}((s=[].concat(r,f.options.modifiers),u=s.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{}),Object.keys(u).map((function(e){return u[e]}))));return f.orderedModifiers=d.filter((function(e){return e.enabled})),f.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,o=void 0===n?{}:n,r=e.effect;if(\"function\"==typeof r){var i=r({state:f,name:t,instance:l,options:o});c.push(i||function(){})}})),l.update()},forceUpdate:function(){if(!u){var e=f.elements,t=e.reference,n=e.popper;if(V(t,n)){f.rects={reference:h(t,x(n),\"fixed\"===f.options.strategy),popper:m(n)},f.reset=!1,f.placement=f.options.placement,f.orderedModifiers.forEach((function(e){return f.modifiersData[e.name]=Object.assign({},e.data)}));for(var o=0;o<f.orderedModifiers.length;o++)if(!0!==f.reset){var r=f.orderedModifiers[o],i=r.fn,a=r.options,s=void 0===a?{}:a,c=r.name;\"function\"==typeof i&&(f=i({state:f,options:s,name:c,instance:l})||f)}else f.reset=!1,o=-1}}},update:(i=function(){return new Promise((function(e){l.forceUpdate(),e(f)}))},function(){return s||(s=new Promise((function(e){Promise.resolve().then((function(){s=void 0,e(i())}))}))),s}),destroy:function(){p(),u=!0}};if(!V(e,n))return l;function p(){c.forEach((function(e){return e()})),c=[]}return l.setOptions(o).then((function(e){!u&&o.onFirstUpdate&&o.onFirstUpdate(e)})),l}}({strategy:\"fixed\",defaultModifiers:[...[{name:\"eventListeners\",enabled:!0,phase:\"write\",fn:function(){},effect:function(t){var n=t.state,o=t.instance,r=t.options,i=r.scroll,a=void 0===i||i,s=r.resize,f=void 0===s||s,c=e(n.elements.popper),u=[].concat(n.scrollParents.reference,n.scrollParents.popper);return a&&u.forEach((function(e){e.addEventListener(\"scroll\",o.update,C)})),f&&c.addEventListener(\"resize\",o.update,C),function(){a&&u.forEach((function(e){e.removeEventListener(\"scroll\",o.update,C)})),f&&c.removeEventListener(\"resize\",o.update,C)}},data:{}},{name:\"popperOffsets\",enabled:!0,phase:\"read\",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=_({reference:t.rects.reference,element:t.rects.popper,strategy:\"absolute\",placement:t.placement})},data:{}},{name:\"computeStyles\",enabled:!0,phase:\"beforeWrite\",fn:function(e){var t=e.state,n=e.options,o=n.gpuAcceleration,r=void 0===o||o,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,f=void 0===s||s,c={placement:I(t.placement),variation:N(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:r,isFixed:\"fixed\"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,U(Object.assign({},c,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:f})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,U(Object.assign({},c,{offsets:t.modifiersData.arrow,position:\"absolute\",adaptive:!1,roundOffsets:f})))),t.attributes.popper=Object.assign({},t.attributes.popper,{\"data-popper-placement\":t.placement})},data:{}},{name:\"applyStyles\",enabled:!0,phase:\"write\",fn:function(e){var t=e.state;Object.keys(t.elements).forEach((function(e){var o=t.styles[e]||{},r=t.attributes[e]||{},i=t.elements[e];n(i)&&c(i)&&(Object.assign(i.style,o),Object.keys(r).forEach((function(e){var t=r[e];!1===t?i.removeAttribute(e):i.setAttribute(e,!0===t?\"\":t)})))}))},effect:function(e){var t=e.state,o={popper:{position:t.options.strategy,left:\"0\",top:\"0\",margin:\"0\"},arrow:{position:\"absolute\"},reference:{}};return Object.assign(t.elements.popper.style,o.popper),t.styles=o,t.elements.arrow&&Object.assign(t.elements.arrow.style,o.arrow),function(){Object.keys(t.elements).forEach((function(e){var r=t.elements[e],i=t.attributes[e]||{},a=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:o[e]).reduce((function(e,t){return e[t]=\"\",e}),{});n(r)&&c(r)&&(Object.assign(r.style,a),Object.keys(i).forEach((function(e){r.removeAttribute(e)})))}))}},requires:[\"computeStyles\"]}],{name:\"flip\",enabled:!0,phase:\"main\",fn:function(e){var t=e.state,n=e.options,o=e.name;if(!t.modifiersData[o]._skip){for(var r=n.mainAxis,i=void 0===r||r,a=n.altAxis,s=void 0===a||a,f=n.fallbackPlacements,c=n.padding,u=n.boundary,l=n.rootBoundary,p=n.altBoundary,d=n.flipVariations,h=void 0===d||d,m=n.allowedAutoPlacements,v=t.options.placement,g=I(v),y=f||(g!==v&&h?function(e){if(I(e)===L)return[];var t=X(e);return[G(e),t,G(t)]}(v):[X(v)]),b=[v].concat(y).reduce((function(e,n){return e.concat(I(n)===L?function(e,t){void 0===t&&(t={});var n=t,o=n.placement,r=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,f=n.allowedAutoPlacements,c=void 0===f?H:f,u=N(o),l=u?s?B:B.filter((function(e){return N(e)===u})):k,p=l.filter((function(e){return c.indexOf(e)>=0}));0===p.length&&(p=l);var d=p.reduce((function(t,n){return t[n]=Q(e,{placement:n,boundary:r,rootBoundary:i,padding:a})[I(n)],t}),{});return Object.keys(d).sort((function(e,t){return d[e]-d[t]}))}(t,{placement:n,boundary:u,rootBoundary:l,padding:c,flipVariations:h,allowedAutoPlacements:m}):n)}),[]),w=t.rects.reference,x=t.rects.popper,M=new Map,P=!0,W=b[0],R=0;R<b.length;R++){var T=b[R],S=I(T),V=N(T)===D,C=[O,j].indexOf(S)>=0,q=C?\"width\":\"height\",_=Q(t,{placement:T,boundary:u,rootBoundary:l,altBoundary:p,padding:c}),F=C?V?E:A:V?j:O;w[q]>x[q]&&(F=X(F));var U=X(F),z=[];if(i&&z.push(_[S]<=0),s&&z.push(_[F]<=0,_[U]<=0),z.every((function(e){return e}))){W=T,P=!1;break}M.set(T,z)}if(P)for(var Y=function(e){var t=b.find((function(t){var n=M.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return W=t,\"break\"},J=h?3:1;J>0&&\"break\"!==Y(J);J--);t.placement!==W&&(t.modifiersData[o]._skip=!0,t.placement=W,t.reset=!0)}},requiresIfExists:[\"offset\"],data:{_skip:!1}},{name:\"preventOverflow\",enabled:!0,phase:\"main\",fn:function(e){var t=e.state,n=e.options,o=e.name,a=n.mainAxis,s=void 0===a||a,f=n.altAxis,c=void 0!==f&&f,u=n.boundary,l=n.rootBoundary,p=n.altBoundary,d=n.padding,h=n.tether,v=void 0===h||h,g=n.tetherOffset,y=void 0===g?0:g,b=Q(t,{boundary:u,rootBoundary:l,padding:d,altBoundary:p}),w=I(t.placement),L=N(t.placement),k=!L,M=q(w),P=\"x\"===M?\"y\":\"x\",W=t.modifiersData.popperOffsets,B=t.rects.reference,H=t.rects.popper,R=\"function\"==typeof y?y(Object.assign({},t.rects,{placement:t.placement})):y,T=\"number\"==typeof R?{mainAxis:R,altAxis:R}:Object.assign({mainAxis:0,altAxis:0},R),S=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,V={x:0,y:0};if(W){if(s){var C,_=\"y\"===M?O:A,F=\"y\"===M?j:E,U=\"y\"===M?\"height\":\"width\",z=W[M],X=z+b[_],Y=z-b[F],G=v?-H[U]/2:0,J=L===D?B[U]:H[U],K=L===D?-H[U]:-B[U],$=t.elements.arrow,ee=v&&$?m($):{width:0,height:0},te=t.modifiersData[\"arrow#persistent\"]?t.modifiersData[\"arrow#persistent\"].padding:{top:0,right:0,bottom:0,left:0},ne=te[_],oe=te[F],re=Z(0,B[U],ee[U]),ie=k?B[U]/2-G-re-ne-T.mainAxis:J-re-ne-T.mainAxis,ae=k?-B[U]/2+G+re+oe+T.mainAxis:K+re+oe+T.mainAxis,se=t.elements.arrow&&x(t.elements.arrow),fe=se?\"y\"===M?se.clientTop||0:se.clientLeft||0:0,ce=null!=(C=null==S?void 0:S[M])?C:0,ue=z+ae-ce,le=Z(v?i(X,z+ie-ce-fe):X,z,v?r(Y,ue):Y);W[M]=le,V[M]=le-z}if(c){var pe,de=\"x\"===M?O:A,he=\"x\"===M?j:E,me=W[P],ve=\"y\"===P?\"height\":\"width\",ge=me+b[de],ye=me-b[he],be=-1!==[O,A].indexOf(w),we=null!=(pe=null==S?void 0:S[P])?pe:0,xe=be?ge:me-B[ve]-H[ve]-we+T.altAxis,Oe=be?me+B[ve]+H[ve]-we-T.altAxis:ye,je=v&&be?function(e,t,n){var o=Z(e,t,n);return o>n?n:o}(xe,me,Oe):Z(v?xe:ge,me,v?Oe:ye);W[P]=je,V[P]=je-me}t.modifiersData[o]=V}},requiresIfExists:[\"offset\"]}]}),ee=e=>{e.popperInstance?(e.popperInstance.setOptions((e=>({...e,modifiers:[...e.modifiers,{name:\"eventListeners\",enabled:!0}]}))),e.popperInstance.update()):e.popperInstance=$(e,e.querySelector(\".ok-ui-tooltip__message\"),{placement:\"top\"}),e.setAttribute(\"data-show\",\"\")},te=e=>{e.removeAttribute(\"data-show\"),e.popperInstance&&e.popperInstance.setOptions((e=>({...e,modifiers:[...e.modifiers,{name:\"eventListeners\",enabled:!1}]})))},ne=e=>t=>{\"ok-ui-tooltip\"===t.target.className&&e(t.target)};[\"mouseover\",\"focusin\"].forEach((e=>window.addEventListener(e,ne(ee)))),[\"mouseout\",\"focusout\"].forEach((e=>window.addEventListener(e,ne(te))))})();";

    var css = "﻿.ok-ui{font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\";font-size:12px;line-height:1.5;color:#252e38;box-sizing:border-box}.ok-ui *,.ok-ui *::before,.ok-ui *::after{box-sizing:inherit;font-family:inherit;font-size:inherit;line-height:inherit;color:inherit}.ok-ui,.ok-ui *,.ok-ui *::before,.ok-ui *::after{padding:0;margin:0;border:none;outline:none;text-transform:none;transition:none;box-shadow:none;background:transparent}.ok-ui .ok-ui-heading-1{font-family:Verdana,sans-serif;font-size:1.083em;line-height:1.429;font-weight:600}.ok-ui .ok-ui-heading-2{font-family:Verdana,sans-serif;font-size:1em;line-height:1.333;font-weight:600}.ok-ui .ok-ui-browsing-id-wrapper{display:flex;align-items:center;margin-top:.3333333333em;margin-bottom:.6666666667em}.ok-ui .ok-ui-browsing-id-label{font-weight:600}.ok-ui .ok-ui-browsing-id-wrapper .ok-ui-browsing-id{margin-left:auto}.ok-ui .ok-ui-browsing-id{position:relative;display:flex;align-items:center;max-width:10em;padding:.3333333333em .6666666667em;border-radius:8px;font-family:Arial,sans-serif;font-weight:600;color:#18a9e1;overflow:hidden;background-color:rgba(24,169,225,.12);transition:max-width .3s ease-out}.ok-ui .ok-ui-browsing-id:focus{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-browsing-id>svg{fill:currentColor}.ok-ui .ok-ui-browsing-id>*{opacity:1;transition:opacity .3s ease-out}.ok-ui .ok-ui-browsing-id>svg{margin-left:.6666666667em}.ok-ui .ok-ui-browsing-id--loading{max-width:3em}.ok-ui .ok-ui-browsing-id--loading>*{opacity:0}.ok-ui .ok-ui-browsing-id--loading::after{content:\"·..\";position:absolute;top:0;left:.0833333333em;right:0;bottom:0;font-size:1.6666666667em;line-height:1;animation:ok-ui-browsing-id-loading 1s infinite}@keyframes ok-ui-browsing-id-loading{0%{content:\"·..\"}25%{content:\".·.\"}50%{content:\"..·\"}75%{content:\"...\"}}.ok-ui .ok-ui-button{display:flex;justify-content:center;align-items:center;width:100%;padding:.6666666667em 1em;border-radius:999px;text-align:center;line-height:1.333;font-weight:600;cursor:pointer}.ok-ui .ok-ui-button[disabled]{cursor:default}.ok-ui .ok-ui-button--filled{color:#fff;background-color:#18a9e1}.ok-ui .ok-ui-button--filled:focus{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-button--filled:focus,.ok-ui .ok-ui-button--filled:hover{background-color:#127faa}.ok-ui .ok-ui-button--filled:active{background-color:#11759c}.ok-ui .ok-ui-button--filled[disabled]{background-color:#c4c6ca}.ok-ui .ok-ui-button--outlined{color:#18a9e1;border:solid .0833333333em #18a9e1}.ok-ui .ok-ui-button--outlined:focus{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-button--outlined:focus,.ok-ui .ok-ui-button--outlined:hover{color:#127faa;border-color:#127faa}.ok-ui .ok-ui-button--outlined:active{color:#11759c;border-color:#11759c;background-color:rgba(24,169,225,.12)}.ok-ui .ok-ui-button--outlined[disabled]{color:#c4c6ca;border-color:#c4c6ca}.ok-ui .ok-ui-button--text{color:#18a9e1}.ok-ui .ok-ui-button--text:focus{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-button--text:focus,.ok-ui .ok-ui-button--text:hover{color:#127faa}.ok-ui .ok-ui-button--text:active{color:#11759c;background-color:rgba(24,169,225,.12)}.ok-ui .ok-ui-button--text[disabled]{color:#c4c6ca}.ok-ui .ok-ui-button--small{padding:.3333333333em .6666666667em}.ok-ui .ok-ui-button>svg{fill:currentColor;margin-right:.3333333333em}.ok-ui .ok-ui-button--icon-end>.ok-ui-button__label{order:-1}.ok-ui .ok-ui-button--icon-end>svg{margin-right:0;margin-left:.3333333333em}.ok-ui .ok-ui-button--icon-only{display:inline-flex;width:auto;align-items:center;justify-content:center}.ok-ui .ok-ui-button--icon-only>svg{margin-right:0}.ok-ui .ok-ui-button.ok-ui-button--icon-only{padding:.6666666667em;min-width:2.6666666667em;min-height:2.6666666667em}.ok-ui .ok-ui-button--small.ok-ui-button--icon-only{padding:.3333333333em;min-width:2em;min-height:2em}.ok-ui .ok-ui-button+.ok-ui-button,.ok-ui .ok-ui-spacer+.ok-ui-button{margin-left:.6666666667em}.ok-ui .ok-ui-card{display:flex;flex-direction:column;width:40em;max-width:100vw;max-height:100vh;overflow:hidden;border-radius:8px;background-color:#fff}@media(min-width: 40em){.ok-ui .ok-ui-card{padding:1.3333333333em}}@media(min-width: 352px){.ok-ui .ok-ui-card{max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);margin:16px}}.ok-ui .ok-ui-card__header,.ok-ui .ok-ui-card__body,.ok-ui .ok-ui-card__footer{padding:1.3333333333em}.ok-ui .ok-ui-card__header{text-align:center}.ok-ui .ok-ui-card__header-logo{display:block;width:6em}.ok-ui [class*=ok-ui-heading-] .ok-ui-card__header-logo,.ok-ui [class*=ok-ui-heading-]+.ok-ui-card__header-logo{margin-top:.6666666667em;margin-bottom:0em}.ok-ui .ok-ui-card__header-logo--center{margin-left:auto;margin-right:auto}.ok-ui .ok-ui-card__header .ok-ui-heading-2{color:#505253}.ok-ui .ok-ui-card__header>p,.ok-ui .ok-ui-card__body>p,.ok-ui .ok-ui-card__footer>p{color:#828586;text-align:center}.ok-ui .ok-ui-card__header>p{margin-top:.6666666667em}.ok-ui .ok-ui-card__body{overflow:auto;padding-top:0}.ok-ui .ok-ui-card__body>p{margin-bottom:.6666666667em}.ok-ui .ok-ui-card__body>:last-child{margin-bottom:0}.ok-ui .ok-ui-card__actions{display:flex;align-items:center}.ok-ui .ok-ui-card__header .ok-ui-card__actions{justify-content:space-between;margin-bottom:.6666666667em}.ok-ui .ok-ui-card__header .ok-ui-card__actions .ok-ui-button{width:auto}.ok-ui .ok-ui-card__footer .ok-ui-card__actions>*{flex:1}.ok-ui .ok-ui-link{text-decoration:underline;color:#18a9e1}.ok-ui .ok-ui-option{margin-bottom:.6666666667em}.ok-ui .ok-ui-option__input{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border:0}.ok-ui .ok-ui-option__label{display:flex;padding:.6666666667em;border:solid .0833333333em #f7f7f7;border-radius:8px;color:#505253;background-color:#f7f7f7;cursor:pointer}@media(min-width: 40em){.ok-ui .ok-ui-option__label{padding:1.3333333333em}}.ok-ui .ok-ui-option__label:hover{border-color:#c4c6ca;background-color:#fff}.ok-ui .ok-ui-option__label p{color:#828586}.ok-ui .ok-ui-option__input-facade{position:relative;display:block;flex:0 0 1.3333333333em;width:1.3333333333em;height:1.3333333333em;margin-right:.6666666667em;border:solid .0833333333em #c4c6ca;border-radius:999px}.ok-ui .ok-ui-option__input:focus~.ok-ui-option__label .ok-ui-option__input-facade{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-option__input:checked~.ok-ui-option__label{border-color:#18a9e1;background-color:#fff}.ok-ui .ok-ui-option__input:checked~.ok-ui-option__label .ok-ui-option__input-facade{border-color:#828586}.ok-ui .ok-ui-option__input:checked~.ok-ui-option__label .ok-ui-option__input-facade::before{content:\"\";position:absolute;top:.1666666667em;left:.1666666667em;width:.8333333333em;height:.8333333333em;border-radius:999px;background-color:#18a9e1}.ok-ui .ok-ui-popup{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000}.ok-ui .ok-ui-popup--open{display:flex;align-items:center;justify-content:center}.ok-ui .ok-ui-popup__block{position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;background-color:rgba(0,0,0,.25)}.ok-ui .ok-ui-popup__content{z-index:1}.ok-ui .ok-ui-provider{display:flex;align-items:center;padding:.6666666667em 0;border-bottom:solid .0833333333em #e1e3e8}.ok-ui .ok-ui-provider .ok-ui-heading-1{flex:1;margin-left:.6666666667em;margin-right:.6666666667em}.ok-ui .ok-ui-snackbar{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:10000;width:52.75em;max-width:calc(100vw - 32px);border-radius:8px;box-shadow:0 .6666666667em 1em rgba(0,0,0,.12)}.ok-ui .ok-ui-snackbar__body{padding:1.3333333333em;border-radius:8px 8px 0 0;background-color:#fff}.ok-ui .ok-ui-snackbar__body p{margin-top:.3333333333em;color:#505253}.ok-ui .ok-ui-snackbar__icon{flex:0 0 3.3333333333em;width:3.3333333333em;height:3.3333333333em;margin-right:1.3333333333em;border-radius:8px;background-color:rgba(24,169,225,.12)}.ok-ui .ok-ui-snackbar__footer{display:flex;justify-content:flex-end;padding:.6666666667em;border-radius:0 0 8px 8px;color:#828586;background-color:#f7f7f7}.ok-ui .ok-ui-spacer{flex:1}.ok-ui .ok-ui-toggle-wrapper{padding-top:.6666666667em;padding-bottom:.6666666667em;border-bottom:solid .0833333333em #e1e3e8}.ok-ui .ok-ui-toggle{display:flex;align-items:center}.ok-ui .ok-ui-toggle--input-end .ok-ui-toggle__input-facade{order:2;margin-left:auto}.ok-ui .ok-ui-toggle--input-end .ok-ui-toggle__content{margin-left:0;margin-right:.6666666667em}.ok-ui .ok-ui-toggle__input{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);white-space:nowrap;border:0}.ok-ui .ok-ui-toggle__label{color:#505253;cursor:pointer}.ok-ui .ok-ui-toggle__label+.ok-ui-link{margin-left:.3333333333em}.ok-ui .ok-ui-toggle__label--emphasis{font-weight:600}.ok-ui .ok-ui-toggle__content{margin-left:.6666666667em}.ok-ui .ok-ui-toggle__input-facade{position:relative;display:block;flex:0 0 2.6666666667em;width:2.6666666667em;height:1.6666666667em;border:solid .0833333333em #c4c6ca;border-radius:999px;cursor:pointer}.ok-ui .ok-ui-toggle__input-facade::before{content:\"\";position:absolute;top:.25em;left:.25em;width:1em;height:1em;border-radius:999px;transition:left .3s ease-out,background-color .3s ease-out;background-color:#c4c6ca}.ok-ui .ok-ui-toggle:hover .ok-ui-toggle__input:not(:disabled)~.ok-ui-toggle__input-facade{border-color:#828586}.ok-ui .ok-ui-toggle__input:disabled~.ok-ui-toggle__input-facade,.ok-ui .ok-ui-toggle__input:disabled~.ok-ui-toggle__content .ok-ui-toggle__label{cursor:default}.ok-ui .ok-ui-toggle__input:disabled~.ok-ui-toggle__input-facade{background-color:#f7f7f7}.ok-ui .ok-ui-toggle__input:focus~.ok-ui-toggle__input-facade{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-toggle__input:checked~.ok-ui-toggle__input-facade::before{left:1.25em;background-color:#18a9e1}.ok-ui .ok-ui-tooltip{display:inline-flex;align-items:center;width:1.3333333333em;height:1.3333333333em;margin-left:.3333333333em;cursor:pointer}.ok-ui .ok-ui-tooltip>*{pointer-events:none}.ok-ui .ok-ui-tooltip>svg{position:relative;top:.1666666667em}.ok-ui .ok-ui-tooltip:focus>svg{border-radius:999px;box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-tooltip__message{display:none;z-index:1;width:16.6666666667em;padding:.6666666667em;border-radius:8px;color:#fff;text-align:center;background-color:#252e38;box-shadow:0 .6666666667em 1em rgba(0,0,0,.12);cursor:default}.ok-ui .ok-ui-tooltip__message::after{content:\"\";position:absolute;left:50%;transform:translate3d(-0.6666666667em, -0.1666666667em, 0);border-left:.6666666667em solid transparent;border-right:.6666666667em solid transparent}.ok-ui .ok-ui-tooltip__message[data-popper-placement=top]::after{bottom:-.6666666667em;border-top:.5em solid #252e38}.ok-ui .ok-ui-tooltip__message[data-popper-placement=bottom]::after{top:-.3333333333em;border-bottom:.5em solid #252e38}.ok-ui .ok-ui-tooltip[data-show] .ok-ui-tooltip__message{display:block}.ok-ui .ok-ui-mt-0{margin-top:0px}.ok-ui .ok-ui-mb-0{margin-bottom:0px}.ok-ui .ok-ui-mt-1{margin-top:8px}.ok-ui .ok-ui-mb-1{margin-bottom:8px}.ok-ui .ok-ui-mt-2{margin-top:16px}.ok-ui .ok-ui-mb-2{margin-bottom:16px}\r\n";

    var introTemplate = (_) => `<section class="ok-ui-card">
    <header class="ok-ui-card__header">
        <div class="ok-ui-card__actions">
            ${ _.LogoCenter }
        </div>
        <h1 class="ok-ui-heading-1">${ _.introHeading }</h1>
    </header>
    <main class="ok-ui-card__body">
        ${ _.introBodyHTML }
    </main>
    <footer class="ok-ui-card__footer">
        <div class="ok-ui-card__actions">
            <button type="button" class="ok-ui-button ok-ui-button--filled" data-action="refuseAll">
                ${ _.refuseAll }
            </button>
            <button type="button" class="ok-ui-button ok-ui-button--filled" data-action="refresh">
                ${ _.proceed }
            </button>
        </div>
    </footer>
</section>`;

    var aboutTemplate = (_) => `<section class="ok-ui-card">
  <header class="ok-ui-card__header">
    <h1 class="ok-ui-heading-1">
      ${ _.aboutHeading }
      ${ _.LogoCenter }
    </h1>
  </header>
  <main class="ok-ui-card__body">
    ${ _.aboutBodyHTML }
  </main>
  <footer class="ok-ui-card__footer">
    <div class="ok-ui-card__actions">
      <button type="button" class="ok-ui-button ok-ui-button--filled" data-card="settings">
        ${ _.back }
      </button>
    </div>
  </footer>
</section>`;

    var settingsTemplate = (_) => `<form>
  <section class="ok-ui-card">
    <header class="ok-ui-card__header">
      <div class="ok-ui-card__actions">
        <a href="#" data-card="about">${ _.Logo }</a>
        <button type="button" class="ok-ui-button ok-ui-button--text ok-ui-button--icon-end" data-action="refuseAll">
          <svg width="0.667em" height="0.667em" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.39332 0.666748L3.99999 3.06008L1.60666 0.666748L0.666656 1.60675L3.05999 4.00008L0.666656 6.39341L1.60666 7.33341L3.99999 4.94008L6.39332 7.33341L7.33332 6.39341L4.93999 4.00008L7.33332 1.60675L6.39332 0.666748Z" fill="currentColor"></path>
          </svg>
          <span class="ok-ui-button__label">${ _.cancel }</span>
        </button>
      </div>
      <h1 class="ok-ui-heading-1">${ _.settingsHeading }</h1>
      ${ _.settingsBodyHTML }
    </header>
    <main class="ok-ui-card__body">
      <div class="ok-ui-browsing-id-wrapper" id="ok-ui-settings-rid">
        <span>
          <span class="ok-ui-browsing-id-label" aria-describedby="ok-ui-your-browsing-id-tooltip">
            ${ _.settingsBrowsingId }
          </span>
          <button class="ok-ui-tooltip" tabindex="0">
            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
            </svg>
            <span class="ok-ui-tooltip__message-wrapper">
              <span id="ok-ui-your-browsing-id-tooltip" class="ok-ui-tooltip__message">${ _.settingsBrowsingIdTip }</span>
            </span>
          </button>
        </span>
        <button class="ok-ui-browsing-id" data-action="reset">
          <span id="ok-ui-display-rid"></span>
          <svg width="1em" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.666748 11.3334V6.66668H5.33341L3.18875 8.81335C3.92872 9.57003 4.94172 9.99762 6.00008 10C7.69305 9.99751 9.20109 8.92949 9.76541 7.33335H9.77741C9.85378 7.11642 9.91154 6.8934 9.95008 6.66668H11.2914C10.9555 9.33328 8.68776 11.3333 6.00008 11.3334H5.99341C4.57926 11.3376 3.22219 10.7758 2.22475 9.77335L0.666748 11.3334ZM2.04941 5.33335H0.708081C1.04391 2.66775 3.31008 0.668109 5.99675 0.666653H6.00008C7.4145 0.662127 8.77189 1.22391 9.76941 2.22668L11.3334 0.666653V5.33335H6.66675L8.81475 3.18668C8.07401 2.42911 7.05961 2.00144 6.00008 2.00001C4.30712 2.00251 2.79907 3.07054 2.23475 4.66668H2.22275C2.14579 4.88342 2.08801 5.1065 2.05008 5.33335H2.04941Z"></path>
          </svg>
        </button>
      </div>
      <div class="ok-ui-option">
        <input class="ok-ui-option__input" type="radio" name="marketing" value="1" id="ok-ui-marketing-1">
        <label class="ok-ui-option__label" for="ok-ui-marketing-1">
          <span class="ok-ui-option__input-facade"></span>
          <div class="ok-ui-option__content">
            <h2 class="ok-ui-heading-1">${ _.settingsPersonalizedLabel }</h2>
            <p>${ _.settingsPersonalizedBody }</p>
          </div>
        </label>
      </div>
      <div class="ok-ui-option">
        <input class="ok-ui-option__input" type="radio" name="marketing" value="0" id="ok-ui-marketing-0">
        <label class="ok-ui-option__label" for="ok-ui-marketing-0">
          <span class="ok-ui-option__input-facade"></span>
          <div class="ok-ui-option__content">
            <h2 class="ok-ui-heading-1">${ _.settingsStandardLabel }</h2>
            <p>${ _.settingsStandardBody }</p>
          </div>
        </label>
      </div>
      <button type="button" class="ok-ui-button ok-ui-button--text" data-card="customize">
        <span class="ok-ui-button__label">${ _.customize }</span>
      </button>
      <div class="ok-ui-mt-2">
        <div class="ok-ui-toggle ok-ui-toggle--input-start">
          <input class="ok-ui-toggle__input" type="checkbox" name="only-this-site" value="1650376767704" id="ok-ui-only-this-site">
          <label class="ok-ui-toggle__input-facade" for="ok-ui-only-this-site"></label>
          <div class="ok-ui-toggle__content">
            <label class="ok-ui-toggle__label " aria-described-by="ok-ui-only-this-site-tooltip" for="ok-ui-only-this-site">
              ${ _.settingsThisSite }
            </label>
            <a href="[BrandPrivacyUrl]" class="ok-ui-link">${ _.settingsThisSitePrivacyPolicy }</a>
          </div>
        </div>
      </div>
    </main>
    <footer class="ok-ui-card__footer">
      <div class="ok-ui-card__actions">
        <button type="button" class="ok-ui-button ok-ui-button--filled" data-action="refuseAll">
          <span class="ok-ui-button__label">${ _.refuseAll }</span>
        </button>
        <button type="button" class="ok-ui-button ok-ui-button--filled" id="ok-ui-button-save" data-action="save">
          <span class="ok-ui-button__label">${ _.save }</span>
        </button>
      </div>
    </footer>
  </section>
</form>`;

    var customizeTemplate = (_) => `<form>
    <section class="ok-ui-card">
        <header class="ok-ui-card__header">
            <div class="ok-ui-card__actions">
                <a href="#" data-card="about">${ _.Logo }</a>
            </div>
            <p class="ok-ui-heading-2">${ _.customizeCurrent }</p>
            <h1 class="ok-ui-heading-1 ok-ui-mb-2" id="ok-ui-display-marketing"></h1>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="only-this-site" value="1650375977702" id="ok-ui-preference-all">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-all"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label ok-ui-toggle__label--emphasis" aria-described-by="ok-ui-preference-all-tooltip" for="ok-ui-preference-all">
                            ${ _.customizeAll }
                        </label>
                    </div>
                </div>
            </div>
        </header>
        <main class="ok-ui-card__body">
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="1" id="ok-ui-preference-1">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-1"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-1-tooltip" for="ok-ui-preference-1">
                            ${ _.customizeAccessDeviceLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-1-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeAccessDeviceTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="2" id="ok-ui-preference-2">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-2"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-2-tooltip" for="ok-ui-preference-2">
                            ${ _.customizeBasicAdsLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-2-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeBasicAdsTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="3" id="ok-ui-preference-3">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-3"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-3-tooltip" for="ok-ui-preference-3">
                            ${ _.customizeMarketResearchLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-3-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeMarketResearchTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="4" id="ok-ui-preference-4">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-4"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-4-tooltip" for="ok-ui-preference-4">
                            ${ _.customizeImproveLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-4-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeImproveTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="5" id="ok-ui-preference-5">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-5"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-5-tooltip" for="ok-ui-preference-5">
                            ${ _.customizeSecurityLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-5-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeSecurityTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="6" id="ok-ui-preference-6">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-6"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-6-tooltip" for="ok-ui-preference-6">
                            ${ _.customizeDeliverLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-6-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeDeliverTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="7" id="ok-ui-preference-7">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-7"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-7-tooltip" for="ok-ui-preference-7">
                            ${ _.customizePersonalizeProfileLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-7-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizePersonalizeProfileTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="8" id="ok-ui-preference-8">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-8"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-8-tooltip" for="ok-ui-preference-8">
                            ${ _.customizePersonalizedAdsLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-8-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizePersonalizedAdsTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="9" id="ok-ui-preference-9">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-9"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-9-tooltip" for="ok-ui-preference-9">
                            ${ _.customizePersonalizedContentProfileLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-9-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizePersonalizedContentProfileTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="10" id="ok-ui-preference-10">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-10"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-10-tooltip" for="ok-ui-preference-10">
                            ${ _.customizePersonalizedContentLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-10-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizePersonalizedContentTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="11" id="ok-ui-preference-11">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-11"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-11-tooltip" for="ok-ui-preference-11">
                            ${ _.customizeMeasureAdPerformanceLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-11-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeMeasureAdPerformanceTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="ok-ui-toggle-wrapper">
                <div class="ok-ui-toggle ok-ui-toggle--input-end">
                    <input class="ok-ui-toggle__input" type="checkbox" name="preference" value="12" id="ok-ui-preference-12">
                    <label class="ok-ui-toggle__input-facade" for="ok-ui-preference-12"></label>
                    <div class="ok-ui-toggle__content">
                        <label class="ok-ui-toggle__label " aria-described-by="ok-ui-preference-12-tooltip" for="ok-ui-preference-12">
                            ${ _.customizeMeasureContentPerformanceLabel }
                        </label>
                        <button class="ok-ui-tooltip" tabindex="0">
                            <svg width="1.167em" height="1.167em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.33325 3.66659H7.66659V4.99992H6.33325V3.66659ZM6.33325 6.33325H7.66659V10.3333H6.33325V6.33325ZM6.99992 0.333252C3.31992 0.333252 0.333252 3.31992 0.333252 6.99992C0.333252 10.6799 3.31992 13.6666 6.99992 13.6666C10.6799 13.6666 13.6666 10.6799 13.6666 6.99992C13.6666 3.31992 10.6799 0.333252 6.99992 0.333252ZM6.99992 12.3333C4.05992 12.3333 1.66659 9.93992 1.66659 6.99992C1.66659 4.05992 4.05992 1.66659 6.99992 1.66659C9.93992 1.66659 12.3333 4.05992 12.3333 6.99992C12.3333 9.93992 9.93992 12.3333 6.99992 12.3333Z" fill="#B6BCCA"></path>
                            </svg>
                            <span class="ok-ui-tooltip__message-wrapper">
                                <span id="ok-ui-preference-12-tooltip" class="ok-ui-tooltip__message">${
                                    _.customizeMeasureContentPerformanceTip }</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
        <footer class="ok-ui-card__footer">
            <div class="ok-ui-card__actions">
                <button type="button" class="ok-ui-button ok-ui-button--outlined" data-card="settings">
                    <svg width="1em" height="0.667em" viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.22 3.33382L5.60667 0.940488L4.66667 0.000488281L0.666666 4.00049L4.66667 8.00049L5.60667 7.06049L3.22 4.66716H11.3333V3.33382H3.22Z"></path>
                    </svg>
                    <span class="ok-ui-button__label">${ _.back }</span>
                </button>
                <button type="button" class="ok-ui-button ok-ui-button--filled" id="ok-ui-button-save" data-action="save">
                    <span class="ok-ui-button__label">${ _.save }</span>
                </button>
            </div>
        </footer>
    </section>
</form>`;

    var snackbarTemplate = (_) => `<section class="ok-ui-snackbar">
    <main class="ok-ui-snackbar__body">
        <h1 class="ok-ui-heading-1" id="ok-ui-snackbar-heading"></h1>
        <p id="ok-ui-snackbar-body"></p>
    </main>
    <footer class="ok-ui-snackbar__footer">
        <a href="#" data-card="about">${ _.Logo }</a>
    </footer>
</section>`;

    var popupTemplate = (_) => `<div class="ok-ui-popup ok-ui-popup--open">
    <div class="ok-ui-popup__block"></div>
    <div class="ok-ui-popup__content">
        ${ _ }
    </div>
</div>`;

    /**
     * Resources used by the controller for HTML views and CSS.
     * TODO: fix the warning associated with can't find module or type.
     */
    var View = /** @class */ (function () {
        /**
         * Constructs a new instance of Controller.
         * @param locale the language file to use with the UI
         * @param config the configuration for the controller
         */
        function View(locale, config) {
            // The container element for the UI, or null if the UI has not yet been added to the DOM.
            this.container = null;
            this.script = document.currentScript;
            this.config = config;
            // Setup the locale with the text and images to use.
            this.locale = locale;
            this.locale.Logo = logoSvg;
            this.locale.LogoCenter = logoCenterSvg;
        }
        /**
         * Set the card. Common tokens in square brackets [] are replaced with the values from the configuration after the
         * language text has been applied.
         * @remarks
         * If the card is the snackbar then a timer to automatically hide it is provided.
         * @param card the name of the card to display, or null if the default card should be displayed.
         */
        View.prototype.setCard = function (card) {
            var _this = this;
            this.stopSnackbarHide();
            this.setContainerCard(card);
            if ('snackbar' == card) {
                this.countDown = setInterval(function () { return _this.hidePopup(); }, this.config.snackbarTimeoutMs);
                document.body.addEventListener('click', function (e) { return _this.hideSnackbar(e); });
            }
        };
        /**
         * Hides the snackbar if display. Checks that the element provided is not part of this UI before hiding.
         * @param t target that has triggered the event to hide the snackbar
         */
        View.prototype.hideSnackbar = function (t) {
            var p = t.target;
            while (p != undefined) {
                for (var i = 0; i < p.classList.length; i++) {
                    var className = p.classList[i];
                    if (className.startsWith('ok-ui')) {
                        return;
                    }
                }
                p = p.parentElement;
            }
            this.hidePopup();
        };
        /**
         * Hides the popup UI but does not remove it from the DOM.
         */
        View.prototype.hidePopup = function () {
            var _a;
            this.stopSnackbarHide();
            this.getContainer().style.display = 'none';
            (_a = this.getPopUp()) === null || _a === void 0 ? void 0 : _a.classList.remove('ok-ui-popup--open');
        };
        /**
         * Displays the popup UI.
         */
        View.prototype.showPopup = function () {
            var _a;
            this.getContainer().style.display = '';
            (_a = this.getPopUp()) === null || _a === void 0 ? void 0 : _a.classList.add('ok-ui-popup--open');
        };
        /**
         * Used to get an array of action elements from the current view.
         * @returns array of HTMLElements that can have events added to them
         */
        View.prototype.getActionElements = function () {
            var elements = [];
            View.addElements(elements, this.container.getElementsByTagName('button'));
            View.addElements(elements, this.container.getElementsByTagName('a'));
            return elements;
        };
        /**
         * Adds element from the other collection to the array.
         * @param array
         * @param other
         */
        View.addElements = function (array, other) {
            for (var i = 0; i < other.length; i++) {
                array.push(other[i]);
            }
        };
        /**
         * Used to remove the snackbar hide logic if the user wants to interact.
         */
        View.prototype.stopSnackbarHide = function () {
            var _this = this;
            clearInterval(this.countDown);
            document.body.removeEventListener('click', function (t) { return _this.hideSnackbar(t); });
        };
        /**
         * Sets the HTML in the container appropriate for the view card provided.
         * @param card Card to display
         */
        View.prototype.setContainerCard = function (card) {
            var html;
            var template = this.getTemplate(card);
            var container = this.getTemplateContainer(card);
            if (container != null) {
                html = container(template(this.locale));
            }
            else {
                html = template(this.locale);
            }
            this.getContainer().innerHTML = this.config.replace(html);
        };
        /**
         * Gets the template for the card from the enumeration.
         * @param card name of the card which corresponds to the ./views file name
         * @returns the HTML string that represents the card
         */
        View.prototype.getTemplate = function (card) {
            switch (card) {
                case 'about':
                    return aboutTemplate;
                case 'intro':
                    return introTemplate;
                case 'settings':
                    return settingsTemplate;
                case 'customize':
                    return customizeTemplate;
                case 'snackbar':
                    return snackbarTemplate;
                default:
                    if (this.config.displayIntro) {
                        return introTemplate;
                    }
                    return settingsTemplate;
            }
        };
        /**
         * Gets the container, if any, that should be used for the card.
         * @param card to be displayed
         * @returns template that will be the container
         */
        View.prototype.getTemplateContainer = function (card) {
            switch (card) {
                case 'snackbar':
                    return null;
                default:
                    return popupTemplate;
            }
        };
        /**
         * Gets the pop up element within the container.
         * @returns
         */
        View.prototype.getPopUp = function () {
            var popups = this.getContainer().getElementsByClassName('ok-ui-popup');
            if (popups != null && popups.length > 0) {
                return popups[0];
            }
            return null;
        };
        /**
         * Returns the container for the entire UI adding it if it does not already exist.
         * @returns
         */
        View.prototype.getContainer = function () {
            if (this.container == null) {
                this.addContainer();
            }
            return this.container;
        };
        /**
         * Adds the CSS, javascript, and the container div for the UI elements.
         */
        View.prototype.addContainer = function () {
            var parent = this.script.parentElement;
            // Create the CSS style element.
            var style = document.createElement('style');
            // TODO: Fix CSS include to remove the magic character at the beginning of the CSS file.
            style.innerHTML = css.trim();
            // Add a new javascript element for the tooltips.
            var tooltipsScript = document.createElement('script');
            tooltipsScript.type = 'text/javascript';
            tooltipsScript.innerHTML = tooltipsJs;
            // Create the new container with the pop up template.
            this.container = document.createElement('div');
            this.container.classList.add('ok-ui');
            // If the pop up is valid then append the container and store a reference to the pop up element.
            parent.appendChild(style);
            parent.appendChild(tooltipsScript);
            parent.appendChild(this.container);
        };
        return View;
    }());

    /**
     * Controller class used with the model and views. Uses paf-lib for data access services.
     */
    var Controller = /** @class */ (function () {
        /**
         * Constructs a new instance of Controller.
         * @param locale the language file to use with the UI
         * @param config the configuration for the controller
         */
        function Controller(locale, config) {
            var _this = this;
            // The model the controller is manipulating.
            this.model = new Model();
            this.locale = locale;
            this.config = config;
            this.view = new View(locale, config);
            this.mapFieldsToUI(); // Create the relationship between the model fields and the UI elements
            this.load()
                .then(function () { return _this.display(); })
                .catch(function (e) { return log.Error('constructor', e); });
        }
        /**
         * Displays the card most appropriate given the current state of the data model.
         * @remarks
         * If all the data is persisted then show the snackbar.
         * If none of the data is persisted then show the intro card or the settings depending on configuration.
         * If some of the data is persisted and others not then show the settings card.
         */
        Controller.prototype.display = function (card) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (card == null) {
                        if (this.model.status != PafStatus.NOT_PARTICIPATING) {
                            if (this.model.allPersisted == true && this.model.status == PafStatus.PARTICIPATING) {
                                this.setCard('snackbar');
                            }
                            else if (this.model.nonePersisted == true) {
                                if (this.config.displayIntro && this.model.status == PafStatus.REDIRECT_NEEDED) {
                                    this.setCard('intro');
                                }
                                else if (this.model.status != PafStatus.REDIRECT_NEEDED) {
                                    this.setCard('settings');
                                }
                            }
                            else if (this.model.status != PafStatus.REDIRECT_NEEDED) {
                                this.setCard('settings');
                            }
                        }
                    }
                    else {
                        this.setCard(card);
                    }
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Set the card based on the template binding the model fields to the UI elements. Uses the locale provided in the
         * constructor to set the text for the UI. Common tokens in square brackets [] are replaced with the values from the
         * configuration after the language text has been applied.
         * @param card the name of the card to display, or null if the default card should be displayed.
         */
        Controller.prototype.setCard = function (card) {
            this.view.hidePopup();
            this.view.setCard(card);
            this.model.bind();
            this.bindActions();
            this.view.showPopup();
        };
        /**
         * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
         * bind method of the model is called.
         */
        Controller.prototype.mapFieldsToUI = function () {
            this.model.pref.addBinding(new BindingCheckedMap('ok-ui-marketing-1', Marketing.personalized, Marketing.notSet));
            this.model.pref.addBinding(new BindingCheckedMap('ok-ui-marketing-0', Marketing.standard, Marketing.notSet));
            this.model.pref.addBinding(new BindingElement('ok-ui-display-marketing', new Map([
                [Marketing.personalized, this.config.replace(this.locale.customizePersonalized)],
                [Marketing.standard, this.config.replace(this.locale.customizeStandard)],
                [Marketing.custom, this.config.replace(this.locale.customizeCustomized)],
                [Marketing.notSet, this.config.replace(this.locale.customizeCustomized)],
            ])));
            this.model.pref.addBinding(new BindingElement('ok-ui-snackbar-heading', new Map([
                [Marketing.personalized, this.config.replace(this.locale.snackbarHeadingPersonalized)],
                [Marketing.standard, this.config.replace(this.locale.snackbarHeadingStandard)],
                [Marketing.custom, this.config.replace(this.locale.snackbarHeadingCustomized)],
                [Marketing.notSet, this.config.replace(this.locale.snackbarHeadingCustomized)],
            ])));
            this.model.pref.addBinding(new BindingElement('ok-ui-snackbar-body', new Map([
                [Marketing.personalized, this.config.replace(this.locale.snackbarBodyPersonalized)],
                [Marketing.standard, this.config.replace(this.locale.snackbarBodyStandard)],
                [Marketing.custom, this.config.replace(this.locale.snackbarBodyCustomized)],
                [Marketing.notSet, this.config.replace(this.locale.snackbarBodyCustomized)],
            ])));
            this.model.pref.addBinding(new BindingShowRandomId('ok-ui-settings-rid'));
            this.model.onlyThisSite.addBinding(new BindingChecked('ok-ui-only-this-site'));
            this.model[1].addBinding(new BindingChecked('ok-ui-preference-1'));
            this.model[2].addBinding(new BindingChecked('ok-ui-preference-2'));
            this.model[3].addBinding(new BindingChecked('ok-ui-preference-3'));
            this.model[4].addBinding(new BindingChecked('ok-ui-preference-4'));
            this.model[5].addBinding(new BindingChecked('ok-ui-preference-5'));
            this.model[6].addBinding(new BindingChecked('ok-ui-preference-6'));
            this.model[7].addBinding(new BindingChecked('ok-ui-preference-7'));
            this.model[8].addBinding(new BindingChecked('ok-ui-preference-8'));
            this.model[9].addBinding(new BindingChecked('ok-ui-preference-9'));
            this.model[10].addBinding(new BindingChecked('ok-ui-preference-10'));
            this.model[11].addBinding(new BindingChecked('ok-ui-preference-11'));
            this.model[12].addBinding(new BindingChecked('ok-ui-preference-12'));
            this.model.all.addBinding(new BindingChecked('ok-ui-preference-all'));
            this.model.canSave.addBinding(new BindingButton('ok-ui-button-save'));
            this.model.rid.addBinding(new BindingDisplayRandomId('ok-ui-display-rid'));
        };
        /**
         * Loads the data in the following order.
         * 1. Local storage
         * 2. Global storage without using a redirect
         * If config.displayIntro is false then;
         * 3. Global storage using a redirect.
         * If config.displayIntro is true then the intro card is displayed the redirect will only occur if the user selects
         * proceed.
         */
        Controller.prototype.load = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.getIdsAndPreferencesFromLocal()) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.getIdsAndPreferencesFromGlobal(false)];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/];
                            }
                            if (!(this.config.displayIntro == false)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.getIdsAndPreferencesFromGlobal(true)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Gets the Ids and preferences which might involve a redirect completing this instance if the redirect is allowed.
         * If data is returned then the model is updated and the display method called.
         * @param triggerRedirectIfNeeded: `true` if redirect can be triggered immediately, `false` if it should wait
         * @returns true if the data is valid, otherwise false
         */
        Controller.prototype.getIdsAndPreferencesFromGlobal = function (triggerRedirectIfNeeded) {
            return __awaiter(this, void 0, void 0, function () {
                var r;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, refreshIdsAndPreferences({
                                proxyHostName: this.config.proxyHostName,
                                triggerRedirectIfNeeded: triggerRedirectIfNeeded,
                            })];
                        case 1:
                            r = _a.sent();
                            log.Message('global data', r);
                            this.model.status = r.status;
                            if (r.data != null) {
                                this.setPersistedFlag(r.data.identifiers);
                                this.model.setFromIdsAndPreferences(r.data);
                                return [2 /*return*/, true];
                            }
                            return [2 /*return*/, false];
                    }
                });
            });
        };
        /**
         * Gets the Ids and preferences from local domain storage.
         * @returns true if found in local domain storage, otherwise false.
         */
        Controller.prototype.getIdsAndPreferencesFromLocal = function () {
            var data = getIdsAndPreferences();
            log.Message('local data', data);
            if (data != undefined) {
                this.model.status = PafStatus.PARTICIPATING;
                this.setPersistedFlag(data === null || data === void 0 ? void 0 : data.identifiers);
                this.model.setFromIdsAndPreferences(data);
                return true;
            }
            this.model.status = PafStatus.REDIRECT_NEEDED;
            return false;
        };
        /**
         * As the identifiers have come from the storage they have been persisted and the flag can be set.
         * @param identifiers to have the persisted flag set to true
         */
        Controller.prototype.setPersistedFlag = function (identifiers) {
            if (identifiers != undefined) {
                identifiers.forEach(function (i) { return (i.persisted = true); });
            }
        };
        /**
         * Binds HTML element tags to actions in the controller based on the ids assigned in the views and to the bindings.
         */
        Controller.prototype.bindActions = function () {
            this.bindActionElements(this.view.getActionElements(), 'click');
        };
        /**
         * Binds specific HTML elements to the actions.
         * @param elements to have the event provided bound to
         * @param event the name of the event in the addEventListener
         */
        Controller.prototype.bindActionElements = function (elements, event) {
            var _this = this;
            var _loop_1 = function (i) {
                var element = elements[i];
                var card = element.getAttribute('data-card');
                if (card != null) {
                    element.addEventListener(event, function (e) {
                        _this.setCard(card);
                        e.preventDefault();
                    });
                }
                var action = element.getAttribute('data-action');
                if (action != null) {
                    element.addEventListener(event, function (e) {
                        _this.processAction(action);
                        e.preventDefault();
                    });
                }
            };
            for (var i = 0; i < elements.length; i++) {
                _loop_1(i);
            }
        };
        /**
         * Processes the action provided, or outputs a warning of the action is not known.
         * @param action the action to perform
         */
        Controller.prototype.processAction = function (action) {
            switch (action) {
                case 'reset':
                    this.actionReset().catch(function (e) { return log.Error(e); });
                    break;
                case 'refresh':
                    this.getIdsAndPreferencesFromGlobal(true).catch(function (e) { return log.Error(e); });
                    break;
                case 'save':
                    this.actionSave().catch(function (e) { return log.Error(e); });
                    break;
                case 'refuseAll':
                    this.actionRefuseAll().catch(function (e) { return log.Error(e); });
                    break;
                default:
                    log.Warn("Action '".concat(action, "' is not known"));
                    break;
            }
        };
        /**
         * Resets the random identifier associated with the browser.
         */
        Controller.prototype.actionReset = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.model.rid;
                            return [4 /*yield*/, this.resetId()];
                        case 1:
                            _a.value = _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Refuses all data processing, writes a cookie to indicate this to the domain, and closes the UI.
         */
        Controller.prototype.actionRefuseAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.view.hidePopup();
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Gets a new random identifier if one does not already exist, signs the preferences if they have not already been
         * signed, and then writes the identifiers and preferences to browser storage. Closes the UI when complete. May not
         * complete if the storage of the data requires a redirect.
         */
        Controller.prototype.actionSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                var rid, p, w;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getNewIdIfNeeded()];
                        case 1:
                            rid = _a.sent();
                            this.model.rid.value = rid;
                            return [4 /*yield*/, this.signIfNeeded()];
                        case 2:
                            p = _a.sent();
                            this.model.pref.setPersisted(p);
                            return [4 /*yield*/, this.writeIdsAndPref()];
                        case 3:
                            w = _a.sent();
                            this.setPersistedFlag(w === null || w === void 0 ? void 0 : w.identifiers);
                            this.model.setFromIdsAndPreferences(w);
                            // Close the pop up as everything has been confirmed to be okay.
                            this.view.hidePopup();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Writes the identifiers and preferences to with local storage or global storage depending on the user's preference
         * for this site only.
         * @returns a promise that when resolved will provide the values written to the storage
         */
        Controller.prototype.writeIdsAndPref = function () {
            if (this.model.onlyThisSite.value == false) {
                // If the global storage is selected then return a promise from the data layer.
                return this.writeIdsAndPrefGlobal();
            }
            // If local storage is to be used then just write the cookies.
            return this.writeIdsAndPrefLocal();
        };
        /**
         * Writes the current model preferences only to local storage.
         * @remarks
         * TODO: Determine if the bogus identifier is the right way forward.
         * https://github.com/prebid/paf-mvp-implementation/issues/115
         * @returns preferences and bogus identifier written to local storage
         */
        Controller.prototype.writeIdsAndPrefLocal = function () {
            return __awaiter(this, void 0, void 0, function () {
                var s;
                return __generator(this, function (_a) {
                    s = {
                        domain: window.location.hostname,
                        signature: 'NA',
                        timestamp: new Date().getTime(),
                    };
                    saveCookieValue(Cookies.identifiers, [
                        {
                            value: '',
                            type: 'site_browser_id',
                            version: '0.1',
                            source: s,
                        },
                    ]);
                    saveCookieValue(Cookies.preferences, {
                        data: this.model.pref.value,
                        version: '0.1',
                        source: s,
                    });
                    return [2 /*return*/, getIdsAndPreferences()];
                });
            });
        };
        Controller.prototype.writeIdsAndPrefGlobal = function () {
            return writeIdsAndPref({
                proxyHostName: this.config.proxyHostName,
            }, {
                // The identifier has to have been created by an operator add as is.
                identifiers: [this.model.rid.value],
                // The preferences must be signed before the write operation.
                preferences: this.model.pref.persisted,
            });
        };
        /**
         * If there are no identifiers then get a new one.
         * @returns a new random identifier from the Operator
         */
        Controller.prototype.getNewIdIfNeeded = function () {
            if (this.model.rid.value == null ||
                this.model.rid.value.source == null ||
                this.model.rid.value.source.signature == null) {
                return this.resetId();
            }
            return Promise.resolve(this.model.rid.value);
        };
        /**
         * Resets the random identifier by fetching a new one from the Operator.
         * @returns
         */
        Controller.prototype.resetId = function () {
            return getNewId({
                proxyHostName: this.config.proxyHostName,
            });
        };
        /**
         * Signs the preferences with the CMP provider if they have not been signed already.
         * @returns signed preferences, which might be the same as the existing ones
         */
        Controller.prototype.signIfNeeded = function () {
            if (this.model.pref.hasChanged) {
                return signPreferences({ proxyHostName: this.config.proxyHostName }, {
                    identifiers: [this.model.rid.value],
                    unsignedPreferences: {
                        data: this.model.pref.value,
                        version: null,
                    },
                });
            }
            return Promise.resolve(this.model.pref.persisted);
        };
        return Controller;
    }());
    /**
     * Custom UI binding to display the random identifier in the button used to reset it.
     */
    var BindingDisplayRandomId = /** @class */ (function (_super) {
        __extends(BindingDisplayRandomId, _super);
        function BindingDisplayRandomId() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Adds the identifier text to the bound elements inner text.
         * @param value of the identifier
         */
        BindingDisplayRandomId.prototype.setValue = function (value) {
            var element = _super.prototype.getElement.call(this);
            if (element != undefined) {
                if (value != null && value.value != null) {
                    element.innerText = value.value.substring(0, 6);
                }
                else {
                    element.innerText = '';
                }
            }
        };
        BindingDisplayRandomId.prototype.bind = function () {
            if (this.field != null) {
                this.setValue(this.field.value);
            }
        };
        return BindingDisplayRandomId;
    }(BindingViewOnly));
    /**
     * Custom UI binding to hide or show the area that displays the random identifier if preferences have been set.
     */
    var BindingShowRandomId = /** @class */ (function (_super) {
        __extends(BindingShowRandomId, _super);
        function BindingShowRandomId() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * If the preferences are persisted then show the identifier.
         * @param value of the identifier being displayed
         */
        BindingShowRandomId.prototype.setValue = function (value) {
            var element = _super.prototype.getElement.call(this);
            if (element != undefined) {
                var visible = value != null;
                element.style.display = visible ? '' : 'none';
            }
        };
        BindingShowRandomId.prototype.bind = function () {
            if (this.field != null) {
                this.setValue(this.field.value);
            }
        };
        return BindingShowRandomId;
    }(BindingViewOnly));

    var _a;
    var controller = null;
    var promptConsent = function () {
        return new Promise(function (resolve) {
            if (controller != null) {
                controller.display('settings');
            }
            resolve();
        });
    };
    var showNotification = function (type) { return log.Message('showNotification', type); };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is needed because the paf-lib expects a global object called PAFUI. Consider altering paf-lib to
    // become a data layer only without any UI considerations.
    (_a = window.PAFUI) !== null && _a !== void 0 ? _a : (window.PAFUI = { promptConsent: promptConsent, showNotification: showNotification });
    controller = new Controller(new Locale(window.navigator.languages), new Config(document.currentScript));

})();
