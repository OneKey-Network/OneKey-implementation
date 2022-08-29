import Card, { CardHeader, CardBody } from '../components/Card';
import Tabs from '../components/Tabs';
import { Data as DataComponent } from '../components/Data.stories';

export default {
  title: 'Groups/Data'
};

export const Data = () => Card({
  children: `
    ${CardHeader({
      navigationSelected: 2
    })}
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

        ${Tabs({ tabs: [
          'Your random ID',
          'Your marketing preferences',
          'Sync ID'
        ] })}

        <p class="ok-ui-mb-3">We don't use any of your personal data, we identify you with a string of characters, that's all advertisers see.</p>

        ${DataComponent()}
      `
    })}
  `
});

