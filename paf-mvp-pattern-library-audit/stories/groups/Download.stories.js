import Card, { CardHeader, CardBody } from '../components/Card';
import { Computer, Mail, Data, Download as DownloadIcon } from '../components/Icons';
import Button from '../components/Button';

export default {
  title: 'Groups/Download'
};

export const Download = () => Card({
  children: `
    ${CardHeader()}
    ${CardBody({
      children: `
        <h1 class="ok-ui-heading-1 ok-ui-mb-1">Download this audit's data</h1>
        <p class="ok-ui-mb-1">Venenatis tempus a nunc sit leo, sed. Fermentum tellus quis quam aenean sit. Pulvinar mi proin nulla est libero mauris cras et urna. Molestie diam interdum ut in porta malesuada.</p>

        <hr class="ok-ui-divide">

        <div class="ok-ui-download-data">
          <div class="ok-ui-download-datum">
            <span class="ok-ui-icon--lg ok-ui-icon--primary">${Computer()}</span>
            <h2 class="ok-ui-heading-2">3rd party plugins</h2>
            <p>Nunc lectus vitae posuere cursus. Adipiscing pharetra a enim tellus varius volutpat.</p>
          </div>
          <div class="ok-ui-download-datum">
            <span class="ok-ui-icon--lg ok-ui-icon--primary">${Mail()}</span>
            <h2 class="ok-ui-heading-2">Report to authorities</h2>
            <p>Ut posuere tempus varius hac lacus. Metus commodo tempus arcu praesent volutpat accumsan.</p>
          </div>
          <div class="ok-ui-download-datum">
            <span class="ok-ui-icon--lg ok-ui-icon--primary">${Data()}</span>
            <h2 class="ok-ui-heading-2">3rd party plugins</h2>
            <p>Nunc lectus vitae posuere cursus. Adipiscing pharetra a enim tellus varius volutpat.</p>
          </div>
        </div>

        <div class="ok-ui-download-data__action">
          ${Button({ style: 'filled', type: 'primary', width: 'full', label: 'Download data (JSON)', icon: DownloadIcon(), iconPosition: 'end' })}
        </div>
      `
    })}
  `
});

