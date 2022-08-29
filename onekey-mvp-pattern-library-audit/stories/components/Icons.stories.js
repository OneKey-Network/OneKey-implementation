import * as AllIcons from './Icons';

export default {
};

const sortedIcons = Object.keys(AllIcons).sort();
const firstIcon = AllIcons[sortedIcons[0]]();

export const Icons = () => {
  return `
    <table>
      <tbody>
        ${sortedIcons.map(icon => `
          <tr>
            <td class="ok-ui-icon--lg">${AllIcons[icon]()}</td>
            <td style="padding-left: 16px">${icon}</td>
          </tr>
        `).join('\n')}
      </tbody>
    </table>
  `;
};

export const PrimaryColorIcon = () => `
  <span class="ok-ui-icon--primary">
    ${firstIcon}
  </span>
`;

export const LargeIcon = () => `
  <span class="ok-ui-icon--lg">
    ${firstIcon}
  </span>
`;

export const XLargeIcon = () => `
  <span class="ok-ui-icon--xl">
    ${firstIcon}
  </span>
`;