import Button from './Button';

export default (args) => {
  const tabs = args.tabs || [];

  return `
    <div class="ok-ui-tabs-container">
      <div class="ok-ui-tabs-wrapper">
        <nav class="ok-ui-tabs">
          ${tabs.map((tab, i) => Button({ style: (i === 0 ? 'outlined' : 'text'), type: i === 0 ? 'primary' : '', label: tab })).join('\n')}
        </nav>
      </div>
    </div>
  `;
};