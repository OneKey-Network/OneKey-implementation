import PopupComponent from './Popup';
import Button from './Button';
import { Cross } from './Icons';
import { Advert } from '../groups/Advert.stories';

export default {
  title: 'Components/Popup'
};

const PopupFooter = () => `
  <div class="ok-ui-popup__footer">
    <h2 class="ok-ui-heading-2">Advert audit</h2>
    ${Button({ style: 'text', icon: Cross(), iconOnly: true })}
  </div>
`;

export const Popup = PopupComponent.bind({});
Popup.args = {
  open: false,
  children: `
    ${Advert()}
    ${PopupFooter()}
  `
};
