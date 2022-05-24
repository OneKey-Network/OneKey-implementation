import { createPopperLite as createPopper, Instance, preventOverflow, flip } from '@popperjs/core';

// Adds the popperInstance property to the element.
interface IHTMLPopperElement extends HTMLElement {
  popperInstance: Instance;
}

type TooltipEvent = (element: IHTMLPopperElement) => void;

export class Tooltip {
  private static readonly showTooltip = (tooltip: IHTMLPopperElement) => {
    if (tooltip.popperInstance) {
      tooltip.popperInstance.setOptions((options) => ({
        ...options,
        modifiers: [...options.modifiers, { name: 'eventListeners', enabled: true }],
      }));
      tooltip.popperInstance.update();
    } else {
      tooltip.popperInstance = createPopper(tooltip, tooltip.querySelector('.ok-ui-tooltip__message'), {
        placement: 'top',
        modifiers: [preventOverflow, flip],
      });
    }
    tooltip.setAttribute('data-show', '');
  };

  private static readonly hideTooltip = (tooltip: IHTMLPopperElement) => {
    tooltip.removeAttribute('data-show');
    if (tooltip.popperInstance) {
      tooltip.popperInstance.setOptions((options) => ({
        ...options,
        modifiers: [...options.modifiers, { name: 'eventListeners', enabled: false }],
      }));
    }
  };

  /**
   * Binds all the tooltip elements under the shadow root to the show and hide methods.
   * @param root for the card
   */
  public static bind(root: ShadowRoot) {
    root.querySelectorAll('.ok-ui-tooltip').forEach((e) => {
      const element = <IHTMLPopperElement>e;
      ['mouseover', 'focusin'].forEach((eventName) => Tooltip.bindElement(element, eventName, Tooltip.showTooltip));
      ['mouseout', 'focusout'].forEach((eventName) => Tooltip.bindElement(element, eventName, Tooltip.hideTooltip));
      element.addEventListener('click', (e) => e.preventDefault());
    });
  }

  private static bindElement(element: IHTMLPopperElement, eventName: string, method: TooltipEvent) {
    element.addEventListener(eventName, () => method(element));
  }
}
