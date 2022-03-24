import { h } from 'preact';
import { Done } from '../../components/svg/done/Done';
import { Attention } from '../../components/svg/attention/Attention';
import { ISnackBarProps, SnackBar } from '../../components/snack-bar/SnackBar';
import { useEffect } from 'react';
import { NotificationEnum } from '../../enums/notification.enum';
import { useRef } from 'preact/hooks';

export interface INotificationProps {
  type: NotificationEnum;
  destroy?: () => void;
}

const TIME_TO_DISPLAY = 10_000;

export const Notification = ({ type, destroy }: INotificationProps) => {
  const brandName = window.location.hostname;
  const timerRef = useRef<number>();

  useEffect(() => {
    timerRef.current = window.setTimeout(() => destroy(), TIME_TO_DISPLAY);
  });

  const launchPrompt = (event: MouseEvent) => {
    event.preventDefault();
    // TODO: launch paf-lib function with callback
    window.__promptConsent();
    window.clearTimeout(timerRef.current);
    destroy();
  };

  const onDestroy = () => {
    window.clearTimeout(timerRef.current);
    destroy();
  };

  let notificationData: Pick<ISnackBarProps, 'icon' | 'title' | 'message'>;

  switch (type) {
    case NotificationEnum.personalizedContent:
      notificationData = {
        icon: <Done />,
        title: `You chose to see personalized content and relevant ads on ${brandName}`,
        message: (
          <div>
            Turn on{' '}
            <a href="#" onClick={launchPrompt}>
              personalized marketing
            </a>{' '}
            at any time to make your content and ads more relevant on this website.
          </div>
        ),
      };
      break;
    case NotificationEnum.generalContent:
      notificationData = {
        icon: <Attention />,
        title: `You chose to see standard content and ads on ${brandName}`,
        message: (
          <div>
            Turn on{' '}
            <a href="#" onClick={launchPrompt}>
              personalized marketing
            </a>{' '}
            at any time to make your content and ads more relevant on this website.
          </div>
        ),
      };
      break;
    default:
      console.error('Unexpected function call. The parameter "type" is invalid');
      notificationData = {
        icon: <Attention />,
        title: 'Unexpected function call',
        message: <div />,
      };
  }

  return <SnackBar {...notificationData} onClose={() => onDestroy()} />;
};
