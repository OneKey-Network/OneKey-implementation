import { h } from 'preact';
import { Done } from '../../components/svg/done/Done';
import { Attention } from '../../components/svg/attention/Attention';
import { ISnackBarProps, SnackBar } from '../../components/snack-bar/SnackBar';
import { useEffect } from 'react';

export interface INotificationProps {
  type: string;
  destroy?: () => void
}

const TIME_TO_DISPLAY = 10_000;

export const Notification = ({ type, destroy }: INotificationProps) => {
  const brandName = window.location.hostname;
  useEffect(() => {
    setTimeout(() => destroy(), TIME_TO_DISPLAY);
  }, []);

  const launchPrompt = (event: MouseEvent) => {
    event.preventDefault();
    // TODO: launch paf-lib function with callback
    window.__promptConsent();
    destroy();
  };

  let notificationData: Pick<ISnackBarProps, 'icon' | 'title' | 'message'> = {
    icon: <i/>,
    title: `You chose to see personalized content and relevant ads on ${brandName}`,
    message: <div/>
  };

  switch (type) {
    case 'personalized':
      notificationData = {
        icon: <Done />,
        title: `You chose to see personalized content and relevant ads on ${brandName}`,
        message: <div>
          Turn on <a href="#" onClick={launchPrompt}>personalized marketing</a> at any time to make your content and
          ads more relevant on this website.
        </div>
      }
      break;
    case 'default':
      notificationData = {
        icon: <Attention/>,
        title: `You chose to see standard content and ads on ${brandName}`,
        message: <div>
          Turn on <a href="#" onClick={launchPrompt}>personalized marketing</a> at any time to make your content and
          ads more relevant on this website.
        </div>
      }
      break;
    default:
      break;
  }

  return (
    <SnackBar
      {...notificationData}
      onClose={() => destroy()}
    />
  );
};
