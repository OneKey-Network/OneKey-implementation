import Popup from './Popup';
import Button from './Button';
import { Cross } from './Icons';
import { Participants } from '../groups/Participants.stories';

export default {
  title: 'Components/Popup'
};

export const Default = Popup.bind({});
Default.args = {
  open: true,
  children: `
    ${Participants()}
    <div class="ok-ui-popup__footer">
      <h2 class="ok-ui-heading-2">Advert audit</h2>
      ${Button({ style: 'text', icon: Cross(), iconOnly: true })}
    </div>
  `
};