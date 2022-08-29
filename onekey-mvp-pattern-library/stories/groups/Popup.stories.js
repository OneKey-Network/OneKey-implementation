import PopupComponent from '../components/Popup';
import { Settings } from './Settings.stories.js';

export default {
  title: 'Groups/Popup',
};

export const Popup = () => PopupComponent({ open: true, children: Settings() });

