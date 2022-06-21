import DownloadDataComponent, { DownloadDatum } from './DownloadData';
import { Computer, Data, Mail } from './Icons';

export default {
};

export const DownloadData = DownloadDatum.bind({});
DownloadData.args = {
  icon: Computer(),
  title: '3rd party plugins',
  description: 'Nunc lectus vitae posuere cursus. Adipiscing pharetra a enim tellus varius volutpat.'
};

export const DownloadDataList = () => `
  ${DownloadDataComponent({ children: `
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
`;