import Button from './Button';
import { Download } from './Icons';

export const DownloadDatum = (args) => {
  const icon = args.icon || '';
  const title = args.title || '';
  const description = args.description || '';

  return `
    <div class="ok-ui-download-datum">
      <span class="ok-ui-icon--lg ok-ui-icon--primary">${icon}</span>
      <h2 class="ok-ui-heading-2">${title}</h2>
      <p>${description}</p>
    </div>
  `;
};

export const DownloadAction = () => `
  <div class="ok-ui-download-data__action">
    ${Button({ style: 'filled', type: 'primary', width: 'full', label: 'Download data (JSON)', icon: Download(), iconPosition: 'end' })}
  </div>
`;

export default (args) => {
  const children = args.children || '';

  return `
    <div class="ok-ui-download-data">
      ${children}
    </div>
  `;
};