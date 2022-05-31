import Card, { CardHeader, CardBody } from '../components/Card';
import Tabs from '../components/Tabs';
import Participant, { ParticipantParties } from '../components/Participant';

export default {
  title: 'Groups/Participants'
};

export const Participants = () => Card({
  children: `
    ${CardHeader({
      navigationSelected: 3
    })}
    ${CardBody({
      children: `
        <h1 class="ok-ui-heading-1 ok-ui-mb-1">Participants</h1>
        <p class="ok-ui-mb-1">Organisations that have participated in the display of the ad Velit fermentum, tortor convallis enim, phasellus adipiscing feugiat. Pretium aliquam faucibus velit quis massa dui.</p>

        <hr class="ok-ui-divide">

        ${Tabs({ tabs: [
          'This advert',
          'All companies',
          'Suspicious companies'
        ] })}

        <p class="ok-ui-mb-3">Explanation of “winners” ... Facilisi senectus feugiat dolor, aliquam semper gravida nulla. Turpis ut porta nibh sodales. Velit sit diam vestibulum sit nec.</p>

        ${Participant({ status: 'trusted', winning: true })}
        ${Participant({ status: 'suspicious', parties: 1 })}
        ${Participant({ status: 'violation', parties: 2, show: true })}

        ${ParticipantParties({ children: `
          ${Participant({ status: 'violation', parties: 1, loading: true })}
          
          ${Participant({ status: 'violation' })}
        ` })}
      `
    })}
  `
});

