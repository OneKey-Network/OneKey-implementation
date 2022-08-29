import AdvertImageComponent, { BlockedAdvertImage as BlockedAdvertImageComponent } from './AdvertImage';

export default {
  argTypes: {
    paused: {
      control: { type: 'boolean' },
    },
  },
};

export const AdvertImage = AdvertImageComponent.bind({});
AdvertImage.args = {
  paused: false,
  width: 224,
  height: 447
};

export const PausedAdvertImage = AdvertImageComponent.bind({});
PausedAdvertImage.args = {
  paused: true
};

export const BlockedAdvertImage = BlockedAdvertImageComponent.bind({});

export const SkyscraperAdvertImage = AdvertImageComponent.bind({});
SkyscraperAdvertImage.args = {
  paused: false,
  width: 120,
  height: 600
};

export const LeaderboardAdvertImage = AdvertImageComponent.bind({});
LeaderboardAdvertImage.args = {
  paused: false,
  width: 728,
  height: 90
};

