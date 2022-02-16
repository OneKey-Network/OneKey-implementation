import { h } from 'preact';
import { Modal } from '../../components/modal/Modal';
import { useEffect, useState } from 'preact/compat';

import style from './style.scss';
import grid from '../../styles/grid.scss';
import layout from '../../styles/layouts.scss';
import mediavineLogo from '../../../assets/images/mediavine_logo.png';

import { Button } from '../../components/button/Button';
import { Option } from '../../components/forms/option/Option';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { SubPanel } from '../../components/sub-panel/SubPanel';
import { OptionsGroup } from '../../components/forms/options-group/OptionsGroup';

interface WelcomeWidgetProps {
  brandName: string;
  brandLogoUrl: string;
}

const STORAGE_KEY = 'PAF.userData';

export const WelcomeWidget = (props: WelcomeWidgetProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  const widgetStorageData = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const isConsentGranted = widgetStorageData?.consent;
  const [consent, setConsent] = useState(isConsentGranted);
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
        <div class={`${style.center} ${style.logo}`}>
          <img src={props.brandLogoUrl} alt={props.brandName} />
        </div>

        <h2 class={`${style.textCenter} ${style.widgetHeading}`}>Get the best of {props.brandName}</h2>

        <p class={`${style.textCenter} ${style.textMuted}`}>
          Enjoy brand-enriched content and make your ads more relevant with personalized marketing.
        </p>

        <div class={grid['my-5']}>
          {/* TODO: Hide this tooltip for not the participant. Currently added only for development purpose */}
          <Tooltip>
            Prebid links your preferences to a random, pseudonymous ID. Use your right to be forgotten at any time by
            refreshing your Browsing ID.
          </Tooltip>
          <OptionsGroup selected={getConsentValue()} onSelectOption={(value) => setConsent(value === 'on')}>
            <Option value="on">
              <div class={style.optionTitle}>
                <h3>Turn on personalized marketing</h3>
                {arrow}
              </div>
              <p class={style.optionDescription}>
                👉 Get targeted content and make your ads more relevant on many websites.
              </p>
            </Option>
            <Option value="off">
              <div className={style.optionTitle}>
                <h3>Keep default ad settings</h3>
                {arrow}
              </div>
              <p class={style.optionDescription}>👉 See random ads without setting preferences on this website.</p>
            </Option>
          </OptionsGroup>
        </div>

        <p class={`${style.textCenter} ${style.textMuted}`}>
          By choosing one of these options, you agree to our site's terms and conditions.
        </p>
        <div class={`${layout.justifyCenter} ${layout.alignCenter} ${grid['mb-5']}`}>
          <Button action={() => setIsDetailsPanelOpen(true)} accent outline>
            How does this work?
          </Button>
        </div>
        <div className={`${layout.justifyCenter} ${layout.alignCenter}}`}>
          <img src={mediavineLogo} alt="Mediavine network" />
        </div>

        <SubPanel isOpen={isDetailsPanelOpen} onClose={() => setIsDetailsPanelOpen(false)}>
          <div class={style.textCenter}>
            <h4>How does this work?</h4>
            <p class={style.textMuted}>
              Prebid’s non-profit SSO technology relies on digital IDs to study your browsing activity and interactions,
              send your preferences to our participating websites and customize your ads. You may still receive targeted
              content unrelated to your browsing activity or interactions.
            </p>
            <p class={style.textMuted}>
              You may change your preferences at any time. Your consent will automatically expire 2 years after you
              provide it. You have a right to be forgotten, which you can exercise at any time by resetting your Secure
              Web ID. You can also obtain a temporary Secure Web ID by using the incognito/private browsing function of
              your browser.
            </p>
            <p class={style.textMuted}>
              These details are shared with the Prebid Network to manage your preferences. See our Privacy Policy and
              Privacy Notice.
            </p>
          </div>
        </SubPanel>
      </Modal>
    </div>
  );
};
