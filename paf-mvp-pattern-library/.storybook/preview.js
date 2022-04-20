import pretty from "pretty";
import "../styles/styles.scss";
import "../javascript/ok-ui.js";
import { addDecorator } from '@storybook/html';

export const parameters = {
  layout: 'padded',
  previewTabs: { 
    canvas: { hidden: true } 
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  backgrounds: {
    default: 'background',
    values: [
      {
        name: 'background',
        value: '#F7F9FC',
      }
    ],
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    transformSource: input => pretty(input, { ocd: true })
  }
}

// this is an important piece of code that ensures every component/group is wrapped in the requisite OneKey container
addDecorator(story => `
  <aside class="ok-ui">${story()}</aside>
`);