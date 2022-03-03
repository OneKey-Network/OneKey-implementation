import { h } from 'preact';
import { Modal } from '../../components/modal/Modal';
import { useEffect, useState } from 'preact/compat';

import style from './style.scss';
import grid from '../../styles/grid.scss';
import layout from '../../styles/layouts.scss';

import { Button } from '../../components/button/Button';
import { Option } from '../../components/forms/option/Option';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { SubPanel } from '../../components/sub-panel/SubPanel';
import { OptionsGroup } from '../../components/forms/options-group/OptionsGroup';
import { globalEventService } from '../../main';

interface WelcomeWidgetProps {
  brandName: string;
  brandLogoUrl: string;
}

const STORAGE_KEY = 'PAF.userData';

export const WelcomeWidget = (props: WelcomeWidgetProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const isParticipating = false;

  const widgetStorageData = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const isConsentGranted = widgetStorageData?.consent;
  const [consent, setConsent] = useState(isConsentGranted);

  const onChooseOption = (consent: boolean) => {
    globalEventService.emitEvent({
      type: 'grantConsent',
      payload: consent
    });
    setConsent(consent);
    setIsOpen(false);
  }
  const arrow = (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.78032 4.66667L6.39366 7.06L7.33366 8L11.3337 4L7.33366 0L6.39366 0.94L8.78032 3.33333H0.666992V4.66667H8.78032Z"
        fill="#076F8A"
      />
    </svg>
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'visible';
  }, [isOpen]);
  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    storage.consent = consent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }, [consent]);

  const getConsentValue = () => (consent === true ? 'on' : consent === false ? 'off' : undefined);

  if (!isOpen) {
    return;
  }

  return (
    <div class={style.container}>
      <Modal maxWidth={385} onClose={() => setIsOpen(false)}>
        <h2 class={`${style.textCenter} ${style.widgetHeading}`}>Set up the best marketing preferences for you</h2>

        <p class={`${style.textCenter} ${style.textMuted}`}>
          Personalize your marketing to make content and ads more relevant to you on participating websites.
        </p>

        <div class={grid['my-5']}>
          {isParticipating && <Tooltip>
            OneKey links your preferences to a random, pseudonymous ID. Use your right to be forgotten at any time by refreshing your Browsing ID.
          </Tooltip>}
          <OptionsGroup selected={getConsentValue()} onSelectOption={(value) => onChooseOption(value === 'on')}>
            <Option value="on">
              <div class={style.optionTitle}>
                <h3>Turn on personalized marketing</h3>
                {arrow}
              </div>
              <p class={style.optionDescription}>
                👉 Get relevant content and ads with total control on your settings.
              </p>
            </Option>
            <Option value="off">
              <div className={style.optionTitle}>
                <h3>Turn on standard marketing</h3>
                {arrow}
              </div>
              <p class={style.optionDescription}>👉 See generic content and ads without setting preferences.</p>
            </Option>
          </OptionsGroup>
        </div>

        <p class={`${style.textCenter} ${style.textMuted}`}>
          By choosing one of these options, you agree to our site's terms and conditions.
        </p>
        <div class={`${layout.justifyCenter} ${layout.alignCenter}`}>
          <Button action={() => setIsDetailsPanelOpen(true)} accent outline>
            Learn more about Onekey
          </Button>
        </div>

        <SubPanel isOpen={isDetailsPanelOpen} onClose={() => setIsDetailsPanelOpen(false)}>
          <div class={style.textCenter}>
            <h4>Learn more about Onekey</h4>
            <p class={style.textMuted}>
              We believe you should have transparency and control over how, where, and why your data is used.
            </p>
            <p class={style.textMuted}>
              We partnered with OneKey, a non-profit technology, to manage your standard marketing preferences when
              accessing our website. OneKey relies on digital IDs to study your activity and interactions, send your
              preferences to our participating websites and customize your ads.
            </p>
            <p class={style.textMuted}>
              IDs like these are an essential part of how Brandname's website operates and provides you with a more
              relevant experience. OneKey Network’s participating websites are direct marketing sites and only receive
              your ID and your preferences if using OneKey when accessing them.
            </p>
            <p class={style.textMuted}>
              You may change your preferences at any time. Your consent will automatically expire 2 years after you
              provide it. You have a right to be forgotten, which you can exercise at any time by resetting your ID. You
              can also obtain a temporary ID by using the incognito/private browsing function of your browser.
            </p>
            <p class={style.textMuted}>
              If you choose not to participate, you will still receive targeted content unrelated to your browsing
              activity or interactions.
            </p>
            <p class={style.textMuted}>
              You can learn more and manage your choices at any time by going to "Privacy settings" at the bottom of any
              page.
              See our Privacy Policy and Privacy Notice.
            </p>
          </div>
        </SubPanel>
      </Modal>
    </div>
  );
};
