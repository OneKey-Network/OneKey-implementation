import {
  popperGenerator,
  defaultModifiers,
} from '@popperjs/core/lib/popper-lite';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';

const createPopper = popperGenerator({
  strategy: 'fixed',
  defaultModifiers: [...defaultModifiers, flip, preventOverflow],
});

const showTooltip = tooltip => {
  if (tooltip.popperInstance) {
    tooltip.popperInstance.setOptions((options) => ({
      ...options,
      modifiers: [
        ...options.modifiers,
        { name: 'eventListeners', enabled: true },
      ],
    }));

    tooltip.popperInstance.update();
  } else {
    tooltip.popperInstance = createPopper(tooltip, tooltip.querySelector('.ok-ui-tooltip__message'), {
      placement: 'top'
    });
  }

  tooltip.setAttribute('data-show', '');
};

const hideTooltip = tooltip => {
  tooltip.removeAttribute('data-show');

  if (tooltip.popperInstance) {
    tooltip.popperInstance.setOptions((options) => ({
      ...options,
      modifiers: [
        ...options.modifiers,
        { name: 'eventListeners', enabled: false }
      ],
    }));
  }
};

const ifTooltip = fn => event => {
  if (event.target.className === 'ok-ui-tooltip') {
    fn(event.target);
  }
};

['mouseover', 'focusin'].forEach(eventName => window.addEventListener(eventName, ifTooltip(showTooltip)));
['mouseout', 'focusout'].forEach(eventName => window.addEventListener(eventName, ifTooltip(hideTooltip)));
