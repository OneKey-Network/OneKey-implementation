import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import Participant, { ParticipantParties } from '../components/Participant';

export default {
  title: 'Groups/Participants'
};

export const Participants = () => Card({
  children: `
    ${CardHeader()}
    ${CardBody({
      children: `
        <h1 class="ok-ui-heading-1 ok-ui-mb-1">Participants</h1>
        <p class="ok-ui-mb-1">Organisations that have participated in the display of the ad Velit fermentum, tortor convallis enim, phasellus adipiscing feugiat. Pretium aliquam faucibus velit quis massa dui.</p>

        
        <hr class="ok-ui-divide">

        <div class="ok-ui-tabs-container">
          <div class="ok-ui-tabs-wrapper">
            <nav class="ok-ui-tabs">
              ${Button({ style: 'outlined', type: 'primary', label: 'This advert' })}
              ${Button({ style: 'text', label: 'All companies' })}
              ${Button({ style: 'text', label: 'Suspicious companies' })}
            </nav>
          </div>
        </div>

        <p class="ok-ui-mb-3">Explanation of “winners” ... Facilisi senectus feugiat dolor, aliquam semper gravida nulla. Turpis ut porta nibh sodales. Velit sit diam vestibulum sit nec.</p>

        ${Participant({ status: 'trusted' })}
        ${Participant({ status: 'suspicious' })}
        ${Participant({ status: 'violation', parties: 2 })}

        ${ParticipantParties({ children: `
          ${Participant({ status: 'violation', parties: 1 })}

          ${ParticipantParties({ children: `
            ${Participant({ status: 'violation' })}
        ` })}
          
          ${Participant({ status: 'violation' })}
        ` })}
      `
    })}
  `
});

