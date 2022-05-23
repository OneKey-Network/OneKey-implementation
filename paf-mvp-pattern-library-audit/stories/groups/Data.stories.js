import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import { User, File, Calendar, External } from '../components/Icons';

export default {
  title: 'Groups/Data'
};

export const Data = () => Card({
  children: `
    ${CardHeader()}
    ${CardBody({
      children: `
        <div class="ok-ui-data-header">
          <div>
            <h1 class="ok-ui-heading-1 ok-ui-mb-1">Your data</h1>
            <p class="ok-ui-mb-1">This is your data which was associated with this advert.</p>
          </div>
          
          <a href="#" class="ok-ui-link">Modify settings</a>
        </div>

        <hr class="ok-ui-divide">

        <div class="ok-ui-tabs-container">
          <div class="ok-ui-tabs-wrapper">
            <nav class="ok-ui-tabs">
              ${Button({ style: 'outlined', type: 'primary', label: 'Your random ID' })}
              ${Button({ style: 'text', label: 'Your marketing preferences' })}
              ${Button({ style: 'text', label: 'Sync ID' })}
            </nav>
          </div>
        </div>

        <p>We don't use any of your personal data, we identify you with a string of characters, that's all advertisers see.</p>

        <ul class="ok-ui-data ok-ui-mt-3">
          <li class="ok-ui-datum">
            <div class="ok-ui-datum__body">
              ${User()}
              <h3 class="ok-ui-heading-3 ok-ui-datum__name">Your random ID</h3>
              <p class="ok-ui-meta ok-ui-datum__value">a939bd3f-3b90-4c05-a94f-b4521e685bbe</p>
            </div>
          </li>
          <li class="ok-ui-datum">
            <div class="ok-ui-datum__body">
              ${Calendar()}
              <h3 class="ok-ui-heading-3 ok-ui-datum__name">Setup date</h3>
              <p class="ok-ui-meta ok-ui-datum__value">Set up on 30-03-2022 at 10:35 by OneKey Operator</p>
            </div>
          </li>
          <li class="ok-ui-datum">
            <div class="ok-ui-datum__body ok-ui-mb-2">
              ${File()}
              <h3 class="ok-ui-heading-3 ok-ui-datum__name">Terms used</h3>
              <p class="ok-ui-meta ok-ui-datum__value">Set up on 30-03-2022 at 10:35</p>
            </div>
            ${Button({ style: 'outlined', type: 'primary', label: 'See Terms', icon: External(), iconPosition: 'end' })}
          </li>
        </ul>
      `
    })}
  `
});

