import Card, { CardHeader, CardBody } from '../components/Card';
import { Computer, Mail, Data } from '../components/Icons';
import DownloadData, { DownloadDatum, DownloadAction } from '../components/DownloadData';

export default {
  title: 'Groups/Download'
};

export const Download = () => Card({
  children: `
    ${CardHeader({
      navigationSelected: 4
    })}
    ${CardBody({
      children: `
        <h1 class="ok-ui-heading-1 ok-ui-mb-1">Download this audit's data</h1>
        <p class="ok-ui-mb-1">Venenatis tempus a nunc sit leo, sed. Fermentum tellus quis quam aenean sit. Pulvinar mi proin nulla est libero mauris cras et urna. Molestie diam interdum ut in porta malesuada.</p>

        <hr class="ok-ui-divide">

        ${DownloadData({ children: `
          ${DownloadDatum({
            icon: Computer(),
            title: '3rd party plugins',
            description: 'Nunc lectus vitae posuere cursus. Adipiscing pharetra a enim tellus varius volutpat.'
          })}

          ${DownloadDatum({
            icon: Mail(),
            title: 'Report to authorities',
            description: 'Ut posuere tempus varius hac lacus. Metus commodo tempus arcu praesent volutpat accumsan.'
          })}

          ${DownloadDatum({
            icon: Data(),
            title: '3rd party plugins',
            description: 'Nunc lectus vitae posuere cursus. Adipiscing pharetra a enim tellus varius volutpat.'
          })}
        ` })}

        ${DownloadAction()}
      `
    })}
  `
});

