(function () {
  'use strict';

  var data$1 = { auditHeading:"Your ad-funded access (US)",
    auditBody:[ "The following OneKey participating providers funded your access to this site's content. These organizations do not directly identify you, but rely instead on your OneKey ID and preferences for this purpose. Your OneKey ID will automatically reset every 6 months or you can reset your ID or preference at any time by clicking&nbsp;<a data-action=\"settings\" class=\"ok-ui-link\">here</a>." ],
    auditFooter:"If you believe an organization didn't honour your preferences, click the email icon to send them this audit for investigation. You may also download the same audit data to send to the appropriate government authority.",
    download:"Download text file",
    cancel:"Cancel",
    open:"Ad audit by OneKey" };

  var en_us = data$1;

  var data = { auditHeading:"Your ad-funded access (GB)",
    auditBody:[ "The following OneKey participating providers funded your access to this site's content. These organizations do not directly identify you, but rely instead on your OneKey ID and preferences for this purpose. Your OneKey ID will automatically reset every 6 months or you can reset your ID or preference at any time by clicking&nbsp;<a data-action=\"settings\" class=\"ok-ui-link\">here</a>." ],
    auditFooter:"If you believe an organization didn't honour your preferences, click the email icon to send them this audit for investigation. You may also download the same audit data to send to the appropriate government authority.",
    download:"Download text file",
    cancel:"Cancel",
    open:"Ad audit by OneKey" };

  var en_gb = data;

  class Values {
      constructor() {
          // Audit text
          this.auditHeading = 'NOT SET';
          this.auditFooter = 'NOT SET';
          // Button text
          this.download = 'NOT SET';
          this.cancel = 'NOT SET';
      }
  }
  class Locale extends Values {
      constructor(languages) {
          super();
          /**
           * Logo to use with the templates.
           */
          this.Logo = '';
          // Use US english as the default locale.
          Object.assign(this, en_us);
          // Replace any values with the users chosen locale.
          Object.assign(this, this.getLocale(languages));
          // Extract the arrays into paragraph HTML element strings.
          this.auditBodyHTML = this.toHtml(this.auditBody);
      }
      toHtml(list) {
          return `<p>${list.join('</p><p>')}</p>`;
      }
      getLocale(locales) {
          for (const locale of locales) {
              switch (locale) {
                  case 'en-GB':
                      return en_gb;
                  case 'en-US':
                      return en_us;
              }
          }
          return en_us;
      }
  }

  class FieldReadOnly {
      /**
       * Constructs a new instance of the readonly field for the model.
       * @param model
       */
      constructor(model) {
          // List of bindings to HTML elements for the field.
          this.bindings = [];
          this.model = model;
      }
      /**
       * Binds the elements that are associated with the field to the field so that when the value changes the HTML elements
       * are updated and vice versa.
       */
      bind() {
          this.bindings.forEach((b) => b.bind());
      }
      /**
       * Add a new binding for the field and set the correct value. Sets the binding to this field, and then adds the
       * binding to the list for the field.
       * @param binding
       */
      addBinding(binding) {
          binding.setField(this);
          this.bindings.push(binding);
      }
  }
  /**
   * Field that can be bound to an HTML element.
   */
  class Field extends FieldReadOnly {
      /**
       * The model and default value for the field.
       * @param model
       * @param defaultValue
       */
      constructor(model, defaultValue) {
          super(model);
          this.defaultValue = defaultValue;
          this._value = defaultValue;
      }
      /**
       * Gets the current value.
       */
      get value() {
          return this._value;
      }
      /**
       * Sets the current value, updating any HTML elements that match the name value, then checks to see if any other
       * fields need to be updated if the model is not already in a setting values operation.
       */
      set value(value) {
          this._value = value;
          this.bindings.forEach((b) => b.setValue(value));
          if (this.model.settingValues === false) {
              this.model.settingValues = true;
              this.updateOthers();
              this.model.settingValues = false;
          }
      }
      /**
       * Resets the field to the original value.
       */
      reset() {
          this.value = this.defaultValue;
      }
      /**
       * Add a new binding for the field and set the correct value. Sets the binding to this field, sets the value of the
       * HTML element to the current value of the field, and then adds the binding to the list for the field.
       */
      addBinding(binding) {
          super.addBinding(binding);
          binding.setValue(this._value);
      }
  }

  /**
   * Field represents the transmission result from the audit log.
   */
  class FieldTransmissionResult extends Field {
      updateOthers() {
          // Do nothing.
      }
  }
  /**
   * The model used in the module.
   */
  class Model {
      /**
       * Constructs the data model from the audit log.
       * @param audit
       */
      constructor(audit) {
          // Set to true when model update operations are occurring. Results in the methods to update other properties being
          // disabled.
          this.settingValues = false;
          this.results = [];
          for (let i = 0; i < audit.transmissions.length; i++) {
              this.results.push(new FieldTransmissionResult(this, audit.transmissions[i]));
          }
          this.allFields = this.results;
      }
      /**
       * Calls the bind method on all the fields in the model to connect them to the currently displayed UI.
       */
      bind() {
          this.allFields.forEach((f) => f.bind());
      }
  }

  var logoSvg = "<svg width=\"72\" height=\"16\" viewBox=\"0 0 72 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"ok-ui-card__header-logo\">\r\n  <title>OneKey</title>\r\n  <path d=\"M25.3993 13C24.4813 13 23.6376 12.7867 22.868 12.3602C22.1077 11.9337 21.5003 11.3403 21.046 10.58C20.6009 9.81039 20.3784 8.94808 20.3784 7.99305C20.3784 7.03802 20.6009 6.18034 21.046 5.42003C21.5003 4.65971 22.1077 4.0663 22.868 3.63978C23.6376 3.21326 24.4813 3 25.3993 3C26.3172 3 27.1564 3.21326 27.9167 3.63978C28.6863 4.0663 29.2889 4.65971 29.7247 5.42003C30.1698 6.18034 30.3923 7.03802 30.3923 7.99305C30.3923 8.94808 30.1698 9.81039 29.7247 10.58C29.2797 11.3403 28.677 11.9337 27.9167 12.3602C27.1564 12.7867 26.3172 13 25.3993 13ZM25.3993 10.8303C26.1781 10.8303 26.7994 10.5707 27.263 10.0515C27.7359 9.53222 27.9723 8.84608 27.9723 7.99305C27.9723 7.13074 27.7359 6.4446 27.263 5.93463C26.7994 5.41539 26.1781 5.15577 25.3993 5.15577C24.6111 5.15577 23.9806 5.41075 23.5078 5.92072C23.0442 6.43069 22.8124 7.12147 22.8124 7.99305C22.8124 8.85536 23.0442 9.54613 23.5078 10.0654C23.9806 10.5753 24.6111 10.8303 25.3993 10.8303Z\" fill=\"#011630\"/>\r\n  <path d=\"M40.4498 12.9026H38.0715L34.0938 6.88039V12.9026H31.7155V3.13908H34.0938L38.0715 9.18915V3.13908H40.4498V12.9026Z\" fill=\"#011630\"/>\r\n  <path d=\"M44.5521 5.04451V7.01947H47.7371V8.85536H44.5521V10.9972H48.1543V12.9026H42.1738V3.13908H48.1543V5.04451H44.5521Z\" fill=\"#011630\"/>\r\n  <path d=\"M55.1364 12.9026L50.9223 8.41029V12.9026H49.9487V3.18081H50.9223V7.72879L55.1364 3.18081H56.3743L51.8263 8.03477L56.416 12.9026H55.1364Z\" fill=\"#011630\"/>\r\n  <path d=\"M58.8271 3.97357V7.60362H62.5128V8.41029H58.8271V12.096H62.93V12.9026H57.8535V3.1669H62.93V3.97357H58.8271Z\" fill=\"#011630\"/>\r\n  <path d=\"M71.274 3.18081L68.1585 9.11961V12.9026H67.185V9.11961L64.0417 3.18081H65.1405L67.6718 8.22949L70.1891 3.18081H71.274Z\" fill=\"#011630\"/>\r\n  <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M3.49283 13.7381C3.32679 13.9331 3.03303 13.9575 2.84795 13.7805C1.66063 12.6445 0.848987 11.1674 0.529604 9.54789C0.180236 7.77637 0.440442 5.93876 1.26791 4.33387C2.09537 2.72899 3.44143 1.45123 5.08718 0.708384C6.73294 -0.0344669 8.5816 -0.198718 10.3325 0.242339C12.0835 0.683396 13.6337 1.70382 14.7312 3.13767C15.8286 4.57153 16.4088 6.33448 16.3772 8.13985C16.3456 9.94522 15.7042 11.6868 14.5573 13.0814C13.7748 14.033 12.7883 14.7848 11.6798 15.2871C11.2733 15.4712 10.8299 15.1762 10.7942 14.7314L10.7724 14.4607C10.7482 14.1583 10.9261 13.8789 11.1985 13.7452C12.0126 13.3456 12.738 12.7748 13.3216 12.0651C14.2391 10.9494 14.7522 9.55617 14.7774 8.11188C14.8027 6.66758 14.3386 5.25722 13.4606 4.11014C12.5827 2.96305 11.3425 2.14672 9.94172 1.79387C8.54097 1.44103 7.06204 1.57243 5.74543 2.16671C4.42882 2.76099 3.35198 3.78319 2.69001 5.0671C2.02804 6.351 1.81987 7.82109 2.09937 9.23831C2.34886 10.5034 2.97385 11.66 3.88749 12.5598C4.06997 12.7395 4.09482 13.0311 3.92878 13.2261L3.49283 13.7381ZM12.8919 8.00024C12.8919 10.2307 11.2769 12.084 9.15246 12.4545L9.15246 15.5945L9.08201 15.5945C8.9905 15.8255 8.77551 15.9946 8.50887 15.9993C7.43381 16.018 6.36585 15.8197 5.36913 15.4165C5.0159 15.2736 4.88157 14.8551 5.05438 14.5155L5.15421 14.3194C5.32702 13.9798 5.74146 13.8484 6.09768 13.9836C6.57387 14.1645 7.06912 14.2875 7.57275 14.3507L7.57275 12.4519C5.45574 12.0752 3.84838 10.2255 3.84838 8.00024C3.84838 5.50295 5.87283 3.4785 8.37012 3.4785C10.8674 3.4785 12.8919 5.50295 12.8919 8.00024ZM11.2984 8.00024C11.2984 6.38301 9.98735 5.07198 8.37012 5.07198C6.75289 5.07198 5.44186 6.38301 5.44186 8.00024C5.44186 9.61747 6.75289 10.9285 8.37012 10.9285C9.98735 10.9285 11.2984 9.61747 11.2984 8.00024Z\" fill=\"url(#paint0_linear_402_35552)\"/>\r\n  <defs>\r\n    <linearGradient id=\"paint0_linear_402_35552\" x1=\"1.45534\" y1=\"1.31151\" x2=\"12.1835\" y2=\"16.7662\" gradientUnits=\"userSpaceOnUse\">\r\n      <stop stop-color=\"#09F7FF\"/>\r\n      <stop offset=\"1\" stop-color=\"#0F9AFD\"/>\r\n    </linearGradient>\r\n  </defs>\r\n</svg>";

  var css = "﻿.ok-ui{font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\";font-size:12px;line-height:1.5;color:#252e38;box-sizing:border-box}.ok-ui *,.ok-ui *::before,.ok-ui *::after{box-sizing:inherit;font-family:inherit;font-size:inherit;line-height:inherit;color:inherit}.ok-ui,.ok-ui *,.ok-ui *::before,.ok-ui *::after{padding:0;margin:0;border:none;outline:none;text-transform:none;transition:none;box-shadow:none;background:transparent}.ok-ui .ok-ui-heading-1{font-family:Verdana,sans-serif;font-size:1.083em;line-height:1.429;font-weight:600}.ok-ui .ok-ui-heading-2{font-family:Verdana,sans-serif;font-size:1em;line-height:1.333;font-weight:600}.ok-ui .ok-ui-button{display:flex;justify-content:center;align-items:center;width:100%;padding:.6666666667em 1em;border-radius:999px;text-align:center;line-height:1.333;font-weight:600;cursor:pointer}.ok-ui .ok-ui-button[disabled]{cursor:default}.ok-ui .ok-ui-button--filled{color:#fff;background-color:#18a9e1}.ok-ui .ok-ui-button--filled:focus{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-button--filled:focus,.ok-ui .ok-ui-button--filled:hover{background-color:#127faa}.ok-ui .ok-ui-button--filled:active{background-color:#11759c}.ok-ui .ok-ui-button--filled[disabled]{background-color:#c4c6ca}.ok-ui .ok-ui-button--outlined{color:#18a9e1;border:solid .0833333333em #18a9e1}.ok-ui .ok-ui-button--outlined:focus{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-button--outlined:focus,.ok-ui .ok-ui-button--outlined:hover{color:#127faa;border-color:#127faa}.ok-ui .ok-ui-button--outlined:active{color:#11759c;border-color:#11759c;background-color:rgba(24,169,225,.12)}.ok-ui .ok-ui-button--outlined[disabled]{color:#c4c6ca;border-color:#c4c6ca}.ok-ui .ok-ui-button--text{color:#18a9e1}.ok-ui .ok-ui-button--text:focus{box-shadow:0 0 0 .3333333333em rgba(24,169,225,.12)}.ok-ui .ok-ui-button--text:focus,.ok-ui .ok-ui-button--text:hover{color:#127faa}.ok-ui .ok-ui-button--text:active{color:#11759c;background-color:rgba(24,169,225,.12)}.ok-ui .ok-ui-button--text[disabled]{color:#c4c6ca}.ok-ui .ok-ui-button--small{padding:.3333333333em .6666666667em}.ok-ui .ok-ui-button>svg{fill:currentColor;margin-right:.3333333333em}.ok-ui .ok-ui-button--icon-end>.ok-ui-button__label{order:-1}.ok-ui .ok-ui-button--icon-end>svg{margin-right:0;margin-left:.3333333333em}.ok-ui .ok-ui-button--icon-only{display:inline-flex;width:auto;align-items:center;justify-content:center}.ok-ui .ok-ui-button--icon-only>svg{margin-right:0}.ok-ui .ok-ui-button.ok-ui-button--icon-only{padding:.6666666667em;min-width:2.6666666667em;min-height:2.6666666667em}.ok-ui .ok-ui-button--small.ok-ui-button--icon-only{padding:.3333333333em;min-width:2em;min-height:2em}.ok-ui .ok-ui-button+.ok-ui-button,.ok-ui .ok-ui-spacer+.ok-ui-button{margin-left:.6666666667em}.ok-ui .ok-ui-card{display:flex;flex-direction:column;width:40em;max-width:100vw;max-height:100vh;overflow:hidden;border-radius:8px;background-color:#fff}@media(min-width: 40em){.ok-ui .ok-ui-card{padding:1.3333333333em}}@media(min-width: 352px){.ok-ui .ok-ui-card{max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);margin:16px}}.ok-ui .ok-ui-card__header,.ok-ui .ok-ui-card__body,.ok-ui .ok-ui-card__footer{padding:1.3333333333em}.ok-ui .ok-ui-card__header{text-align:center}.ok-ui .ok-ui-card__header-logo{display:block;width:6em}.ok-ui [class*=ok-ui-heading-] .ok-ui-card__header-logo,.ok-ui [class*=ok-ui-heading-]+.ok-ui-card__header-logo{margin-top:.6666666667em;margin-bottom:0em}.ok-ui .ok-ui-card__header-logo--center{margin-left:auto;margin-right:auto}.ok-ui .ok-ui-card__header .ok-ui-heading-2{color:#505253}.ok-ui .ok-ui-card__header>p,.ok-ui .ok-ui-card__body>p,.ok-ui .ok-ui-card__footer>p{color:#828586;text-align:center}.ok-ui .ok-ui-card__header>p{margin-top:.6666666667em}.ok-ui .ok-ui-card__body{overflow:auto;padding-top:0}.ok-ui .ok-ui-card__body>p{margin-bottom:.6666666667em}.ok-ui .ok-ui-card__body>:last-child{margin-bottom:0}.ok-ui .ok-ui-card__actions{display:flex;align-items:center}.ok-ui .ok-ui-card__header .ok-ui-card__actions{justify-content:space-between;margin-bottom:.6666666667em}.ok-ui .ok-ui-card__header .ok-ui-card__actions .ok-ui-button{width:auto}.ok-ui .ok-ui-card__footer .ok-ui-card__actions>*{flex:1}.ok-ui .ok-ui-link{text-decoration:underline;color:#18a9e1}.ok-ui .ok-ui-popup{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000}.ok-ui .ok-ui-popup--open{display:flex;align-items:center;justify-content:center}.ok-ui .ok-ui-popup__block{position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;background-color:rgba(0,0,0,.25)}.ok-ui .ok-ui-popup__content{z-index:1}.ok-ui .ok-ui-provider{display:flex;align-items:center;padding:.6666666667em 0;border-bottom:solid .0833333333em #e1e3e8}.ok-ui .ok-ui-provider .ok-ui-heading-1{flex:1;margin-left:.6666666667em;margin-right:.6666666667em}.ok-ui .ok-ui-mt-0{margin-top:0px}.ok-ui .ok-ui-mb-0{margin-bottom:0px}.ok-ui .ok-ui-mt-1{margin-top:8px}.ok-ui .ok-ui-mb-1{margin-bottom:8px}.ok-ui .ok-ui-mt-2{margin-top:16px}.ok-ui .ok-ui-mb-2{margin-bottom:16px}\r\n";

  var auditTemplate = (_) => `<div class="ok-ui-popup ok-ui-popup--open">
  <div class="ok-ui-popup__block"></div>
  <div class="ok-ui-popup__content">
    <form>
      <section class="ok-ui-card">
        <header class="ok-ui-card__header">
          <div class="ok-ui-card__actions">
            ${ _.Logo }
            <button type="button" class="ok-ui-button ok-ui-button--text ok-ui-button--icon-end" data-action="close">
              <svg width="0.667em" height="0.667em" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.39332 0.666748L3.99999 3.06008L1.60666 0.666748L0.666656 1.60675L3.05999 4.00008L0.666656 6.39341L1.60666 7.33341L3.99999 4.94008L6.39332 7.33341L7.33332 6.39341L4.93999 4.00008L7.33332 1.60675L6.39332 0.666748Z" fill="currentColor"></path>
              </svg>
              <span class="ok-ui-button__label">Close</span>
            </button>
          </div>
          <h1 class="ok-ui-heading-1 ok-ui-mb-2">${ _.auditHeading }</h1>
          <p>${ _.auditBodyHTML }</p>
        </header>
        <main class="ok-ui-card__body" id="ok-ui-providers">
        </main>
        <footer class="ok-ui-card__footer">
          <button type="button" class="ok-ui-button ok-ui-button--outlined">
            <span class="ok-ui-button__label">${ _.download }</span>
          </button>
          <p class="ok-ui-mt-2">${ _.auditFooter }</p>
        </footer>
      </section>
    </form>
  </div>
</div>`;

  var buttonTemplate = (_) => `<a id="ok-ui-open" data-action="audit">${ _.open }</a>`;

  /**
   * Resources used by the controller for HTML views and CSS.
   * TODO: fix the warning associated with can't find module or type.
   */
  class View {
      /**
       * Constructs a new instance of Controller.
       * @param advert element the module relates to
       * @param locale the language file to use with the UI
       */
      constructor(advert, locale, log) {
          // The shadow root for the UI.
          this.root = null;
          // The outer container for the UI.
          this.outerContainer = null;
          // The container element for the UI, or null if the UI has not yet been added to the DOM.
          this.auditContainer = null;
          this.advert = advert;
          this.log = log;
          // Setup the locale with the text and images to use.
          this.locale = locale;
          this.locale.Logo = logoSvg;
      }
      /**
       * Displays the audit log card ready for the providers to be added.
       */
      display(card) {
          this.setContainerCard(card);
      }
      /**
       * Used to get an array of action elements from the current view.
       * @returns array of HTMLElements that can have events added to them
       */
      getActionElements() {
          const elements = [];
          View.addElements(elements, this.auditContainer.getElementsByTagName('button'));
          View.addElements(elements, this.auditContainer.getElementsByTagName('a'));
          return elements;
      }
      /**
       * Adds element from the other collection to the array.
       * @param array
       * @param other
       */
      static addElements(array, other) {
          for (let i = 0; i < other.length; i++) {
              array.push(other[i]);
          }
      }
      /**
       * Sets the HTML in the container for the template.
       */
      setContainerCard(card) {
          let template;
          switch (card) {
              case 'audit':
                  template = auditTemplate;
                  break;
              case 'button':
                  template = buttonTemplate;
                  break;
              default:
                  throw `Card '${card}' is not known`;
          }
          this.getContainer().innerHTML = template(this.locale);
      }
      /**
       * Returns the container for the entire UI adding it if it does not already exist.
       * @returns
       */
      getContainer() {
          if (this.auditContainer === null) {
              this.addContainer();
          }
          return this.auditContainer;
      }
      /**
       * Adds the CSS, javascript, and the container div for the UI elements.
       */
      addContainer() {
          // Create an outer container to add the shadow root and UI components to.
          this.outerContainer = this.advert.appendChild(document.createElement('div'));
          // Create the CSS style element.
          const style = document.createElement('style');
          // TODO: Fix CSS include to remove the magic character at the beginning of the CSS file.
          style.innerHTML = css.trim();
          // Create the new container with the pop up template.
          this.auditContainer = document.createElement('div');
          this.auditContainer.classList.add('ok-ui');
          // If the pop up is valid then append the container and store a reference to the pop up element.
          this.root = this.outerContainer.attachShadow({ mode: 'closed' });
          this.root.appendChild(style);
          this.root.appendChild(this.auditContainer);
      }
  }

  /**
   * Base class used for all binding classes containing common functionality.
   */
  class BindingBase {
      /**
       * Constructs a new field binding the field in the model to an HTML element of the id. i.e. "model-field", or
       * "model-preference". The id should be unique within the DOM.
       * @param view that will contain the element with the id
       * @param id of the id of the element to bind to
       */
      constructor(view, id) {
          this.view = view;
          this.id = id;
      }
      /**
       * Gets the HTML elements that match the id from the document.
       * @returns first element that matches the id
       */
      getElement() {
          if (this.view.root !== null) {
              return this.view.root.getElementById(this.id);
          }
          return null;
      }
  }
  /**
   * Binding used only to display the value of a field and not update it.
   */
  class BindingViewOnly extends BindingBase {
      constructor() {
          super(...arguments);
          // The field that the binding relates to. Set when the binding is added to the field.
          this.field = null;
      }
      /**
       * Sets the field that the binding is associated with.
       * @param field to associate with the UI element
       */
      setField(field) {
          this.field = field;
      }
  }

  var providerTemplate = (_) => `${ _.ResultSVG }
<h2 class="ok-ui-heading-1">${ _.Name }</h2>
<button type="button" class="ok-ui-button ok-ui-button--text ok-ui-button--small ok-ui-button--icon-only ok-ui-button--icon-start">
    <svg width="1.167em" height="1em" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.3333 11.3333H1.66668C0.930297 11.3333 0.333344 10.7363 0.333344 9.99996V1.94196C0.364416 1.22832 0.952366 0.665951 1.66668 0.666627H12.3333C13.0697 0.666627 13.6667 1.26358 13.6667 1.99996V9.99996C13.6667 10.7363 13.0697 11.3333 12.3333 11.3333ZM1.66668 3.24529V9.99996H12.3333V3.24529L7.00001 6.79996L1.66668 3.24529ZM2.20001 1.99996L7.00001 5.19996L11.8 1.99996H2.20001Z" fill="currentColor"></path>
    </svg>
</button>
<button type="button" class="ok-ui-button ok-ui-button--text ok-ui-button--small ok-ui-button--icon-only ok-ui-button--icon-start">
    <svg width="1em" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.33402 11.3333H2.00069C1.26431 11.3333 0.667358 10.7363 0.667358 9.99996V2.66663C0.667358 1.93025 1.26431 1.33329 2.00069 1.33329H4.66736V2.66663H2.00069V9.99996H9.33402V7.33329H10.6674V9.99996C10.6674 10.7363 10.0704 11.3333 9.33402 11.3333ZM5.80069 7.13796L4.86069 6.19529L9.05602 1.99996H6.66736V0.666626H11.334V5.33329H10.0007V2.94329L5.80069 7.13796Z" fill="currentColor"></path>
    </svg>
</button>`;

  var iconTick = "<svg width=\"1.5em\" height=\"1.5em\" viewBox=\"0 0 18 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\r\n    <path d=\"M9.00001 17.3333C4.39763 17.3333 0.666672 13.6023 0.666672 8.99996C0.666672 4.39759 4.39763 0.666626 9.00001 0.666626C13.6024 0.666626 17.3333 4.39759 17.3333 8.99996C17.3283 13.6002 13.6003 17.3282 9.00001 17.3333ZM8.98667 15.6666H9.00001C12.6806 15.6629 15.6618 12.6772 15.66 8.99663C15.6582 5.31603 12.6739 2.3333 8.99334 2.3333C5.31274 2.3333 2.32851 5.31603 2.32667 8.99663C2.32483 12.6772 5.30608 15.6629 8.98667 15.6666ZM7.33334 13.1666L4.00001 9.83329L5.17501 8.65829L7.33334 10.8083L12.825 5.31663L14 6.49996L7.33334 13.1666Z\" fill=\"#4AD23E\" />\r\n</svg>";

  /**
   * Controller class used with the model and views. Uses paf-lib for data access services.
   */
  class Controller {
      /**
       * Constructs a new instance of Controller and displays the audit popup.
       * @param locale the language file to use with the UI
       * @param advert to bind the audit viewer to
       * @param okUiCtrl instance to use if the settings need to be displayed
       * @param log
       */
      constructor(locale, advert, okUiCtrl, log) {
          this.locale = locale;
          this.element = advert;
          this.okUiCtrl = okUiCtrl;
          this.log = log;
          // TODO: Replace this with a fetch for the real audit log once available.
          const auditLog = JSON.parse(advert.getAttribute('auditLog'));
          this.model = new Model(auditLog);
          this.view = new View(advert, locale, log);
          this.mapFieldsToUI();
          this.view.display('button');
          this.bindActions();
          log.Info('Audit registered', advert.id);
      }
      /**
       * Maps the fields in the model to the UI elements that will represent or change them. Must be called before the
       * bind method of the model is called.
       */
      mapFieldsToUI() {
          this.model.results.forEach((r) => r.addBinding(new BindingProviders(this.view, 'ok-ui-providers', this.locale)));
      }
      /**
       * Binds HTML element tags to actions in the controller based on the ids assigned in the views and to the bindings.
       */
      bindActions() {
          this.bindActionElements(this.view.getActionElements(), 'click');
      }
      /**
       * Binds specific HTML elements to the actions.
       * @param elements to have the event provided bound to
       * @param event the name of the event in the addEventListener
       */
      bindActionElements(elements, event) {
          for (let i = 0; i < elements.length; i++) {
              const element = elements[i];
              const action = element.getAttribute('data-action');
              if (action !== null) {
                  element.addEventListener(event, (e) => {
                      this.processAction(action);
                      e.preventDefault();
                  });
              }
          }
      }
      /**
       * Processes the action provided, or outputs a warning if the action is not known.
       * @param action the action to perform
       */
      processAction(action) {
          switch (action) {
              case 'settings':
                  this.view.display('button');
                  this.bindActions();
                  this.okUiCtrl.display('settings').catch((e) => this.log.Error(e));
                  break;
              case 'audit':
                  this.view.display('audit');
                  this.model.bind();
                  this.bindActions();
                  break;
              case 'close':
                  this.view.display('button');
                  this.bindActions();
                  break;
              case 'download':
                  // TODO: Code the action to download the audit log.
                  break;
              default:
                  this.log.Warn(`Action '${action}' is not known`);
                  break;
          }
      }
  }
  /**
   * Custom UI binding to display the providers from the audit log.
   */
  class BindingProviders extends BindingViewOnly {
      constructor(view, id, locale) {
          super(view, id);
          this.locale = locale;
      }
      /**
       * Adds the transmission provider's text to the bound element.
       * @param audit of the audit log
       */
      setValue(result) {
          const container = super.getElement();
          if (container !== null) {
              const item = document.createElement('div');
              item.className = 'ok-ui-provider';
              item.innerHTML = providerTemplate({
                  ResultSVG: iconTick,
                  Name: result.source.domain,
              });
              container.appendChild(item);
          }
      }
      bind() {
          if (this.field !== null) {
              this.setValue(this.field.value);
          }
      }
  }

  // Wrappers to console.(log | info | warn | error). Takes N arguments, the same as the native methods
  class Log {
      constructor(id, color) {
          this.id = id;
          this.color = color;
      }
      Debug(...args) {
          console.log(...this.decorateLog('DEBUG:', args));
      }
      Message(...args) {
          console.log(...this.decorateLog('MESSAGE:', args));
      }
      Info(...args) {
          console.info(...this.decorateLog('INFO:', args));
      }
      Warn(...args) {
          console.warn(...this.decorateLog('WARNING:', args));
      }
      Error(...args) {
          console.error(...this.decorateLog('ERROR:', args));
      }
      decorateLog(prefix, args) {
          const newArgs = [].slice.call(args);
          prefix && newArgs.unshift(prefix);
          newArgs.unshift(Log.label(this.color));
          newArgs.unshift(`%c${this.id}`);
          return newArgs;
      }
  }
  Log.label = (color) => `display: inline-block; color: #fff; background: ${color}; padding: 1px 4px; border-radius: 3px;`;

  const log = new Log('audit', '#18a9e1');
  const uiCtrl = window.PAFUI.controller;
  document.querySelectorAll('[auditLog]').forEach((e) => {
      if (e instanceof HTMLDivElement) {
          log.Message('register', e.id);
          const content = e.innerHTML;
          e.timer = setInterval(() => {
              log.Message('check', e.id);
              if (content !== e.innerHTML) {
                  log.Message('adding', e.id);
                  clearInterval(e.timer);
                  new Controller(new Locale(window.navigator.languages), e, uiCtrl, log);
              }
          }, 1000);
      }
  });

})();
//# sourceMappingURL=ok-audit.js.map
