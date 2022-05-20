import 'googletag';

declare global {
  interface Window {
    googletag: any;
  }
}

/**
 * @param adUnitCode Google Publisher Tag Ad Unit Code
 * @returns divId associated to the adUnitCode in GPT if exist, undefined otherwise.
 */
export function mapAdUnitCodeToDivId(adUnitCode: string): string | undefined {
  if (!isGptPubadsDefined()) {
    return undefined;
  }

  const slots: googletag.Slot[] = window.googletag.pubads().getSlots();
  const found = slots.find((s) => {
    return s.getAdUnitPath() === adUnitCode || s.getSlotElementId() === adUnitCode;
  });

  if (found === undefined) {
    return undefined;
  }

  return found.getSlotElementId();
}

const isGptPubadsDefined = () => {
  return window.googletag && isFn(window.googletag.pubads) && isFn(window.googletag.pubads().getSlots);
};

const isFn = (object: any): boolean => {
  return isA(object, 'Function');
};

const isA = (object: any, _t: string): boolean => {
  return toString.call(object) === `[object ${_t}]`;
};
