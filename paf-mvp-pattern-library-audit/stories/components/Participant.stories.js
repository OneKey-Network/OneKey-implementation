import ParticipantComponent, { ParticipantParties } from './Participant';

export default {
  argTypes: {
    status: {
      options: ['trusted', 'suspicious', 'violation'],
      control: { type: 'radio' },
    },
    parties: {
      options: [0, 1, 2],
      control: { type: 'radio' },
    }
  }
};

export const Participant = ParticipantComponent.bind({});
Participant.args = {
  status: 'trusted',
  parties: 0,
  winning: false,
  loading: false
};

export const WinningParticipant = ParticipantComponent.bind({});
WinningParticipant.args = {
  status: 'trusted',
  parties: 0,
  winning: true
};

export const LoadingParties = ParticipantComponent.bind({});
LoadingParties.args = {
  status: 'trusted',
  parties: 2,
  show: true,
  loading: true
};

export const ParticipantWithShownParties = () => `
  ${Participant({ status: 'trusted', parties: 2, show: true })}
  ${ParticipantParties({ children: `
    ${Participant({ status: 'trusted', winning: true })}
    ${Participant({ status: 'trusted' })}
  `})}
`;