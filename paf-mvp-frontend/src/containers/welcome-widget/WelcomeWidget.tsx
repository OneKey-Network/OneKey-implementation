import { h } from 'preact';
import { Modal } from '../../components/modal/Modal';
import { useEffect, useState } from 'preact/compat';

import style from './style.scss';
import grid from '../../styles/grid.scss';
import layout from '../../styles/layouts.scss';
import typography from '../../styles/typography.scss';

import { Button } from '../../components/button/Button';
import { Option } from '../../components/forms/option/Option';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { SubPanel } from '../../components/sub-panel/SubPanel';
import { OptionsGroup } from '../../components/forms/options-group/OptionsGroup';
import { globalEventManager } from '../../managers/event-manager';
import { getCookieValue } from '../../utils/cookie';
import { Cookies } from '@core/cookies';
import { fromClientCookieValues } from '@core/operator-client-commons';

interface WelcomeWidgetProps {
  brandName: string;
  brandLogoUrl: string;
}

export const WelcomeWidget = (props: WelcomeWidgetProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

  const pafCookies = fromClientCookieValues(getCookieValue(Cookies.identifiers), getCookieValue(Cookies.preferences));
  const pafIdentifier = pafCookies.identifiers?.at(0)?.value;
  const pafConsent = pafCookies.preferences?.data?.use_browsing_for_personalization;

  const [consent, setConsent] = useState(pafIdentifier && pafConsent);

  const onChooseOption = (consent: boolean) => {
    globalEventManager.emitEvent({
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
  const refresh = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.666626 11.3337V6.66705H5.33329L3.18863 8.81371C3.9286 9.57039 4.9416 9.99798 5.99996 10.0004C7.69292
      9.99788 9.20097 8.92986 9.76529 7.33371H9.77729C9.85365 7.11679 9.91142 6.89376 9.94996 6.66705H11.2913C10.9553
      9.33365 8.68764 11.3336 5.99996 11.3337H5.99329C4.57913 11.3379 3.22207 10.7762 2.22463 9.77371L0.666626
      11.3337ZM2.04929 5.33371H0.707959C1.04379 2.66812 3.30996 0.668475 5.99663 0.667019H5.99996C7.41438 0.662494
       8.77177 1.22427 9.76929 2.22705L11.3333 0.667019V5.33371H6.66663L8.81463 3.18705C8.07389 2.42948 7.05949 2.00181
       5.99996 2.00038C4.30699 2.00288 2.79895 3.0709 2.23463 4.66705H2.22263C2.14566 4.88379 2.08789 5.10686 2.04996
       5.33371H2.04929Z" fill="currentColor"/>
    </svg>
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'visible';
  }, [isOpen]);

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
          {!!pafIdentifier && <div class={`${layout.justifyBetween} ${layout.alignCenter} ${grid['mb-2']}`}>
            <div className={`${layout.alignCenter}`}>
              <Tooltip>
                OneKey links your preferences to a random, pseudonymous ID. Use your right to be forgotten at any time
                by refreshing your Browsing ID.
              </Tooltip>
              <b className={typography.textSmall}>Your browsing ID</b>
            </div>

            <div>
              <button class={style.refreshBtn}>
                {pafIdentifier.split('-').at(0)} {refresh}
              </button>
            </div>
          </div>
          }
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
