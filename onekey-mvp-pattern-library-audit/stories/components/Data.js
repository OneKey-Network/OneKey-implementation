export const Datum = (args) => `
  <li class="ok-ui-datum">
    <div class="ok-ui-datum__body">
      ${args.icon}
      <h3 class="ok-ui-heading-3 ok-ui-datum__name">${args.name}</h3>
      <p class="ok-ui-meta ok-ui-datum__value">${args.value}</p>
    </div>

    ${args.action ? `
      <div class="ok-ui-mt-2">
        ${args.action}
      </div>
    ` : ''}
  </li>
`;

export default (args) => {
  const children = args.children || '';

  return `
    <ul class="ok-ui-data">
      ${children}
    </ul>
  `;
};