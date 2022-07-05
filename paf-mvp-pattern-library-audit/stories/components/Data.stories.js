import DataComponent, { Datum } from './Data';
import Button from '../components/Button';
import Details from '../components/Details';
import { User, File, Calendar, External, Device } from '../components/Icons';

export default {
};

export const Data = () => DataComponent({ children: `
  ${Datum({
    icon: User(),
    name: 'Your random ID',
    value: 'a939bd3f-3b90-4c05-a94f-b4521e685bbe'
  })}
  ${Datum({
    icon: Calendar(),
    name: 'Setup date',
    type: 'suspicious',
    value: 'Set up on 30-03-2022 at 10:35 by OneKey Operator'
  })}
  ${Datum({
    icon: File(),
    name: 'Terms used',
    value: 'Set up on 30-03-2022 at 10:35',
    type: 'violation',
    action: Button({ style: 'outlined', type: 'primary', label: 'See Terms', icon: External(), iconPosition: 'end' })
  })}
` });

export const SyncData = () => DataComponent({ children: `
  ${Datum({
    icon: Device(),
    name: 'Your sync ID',
    value: '1047e072e211f4d864eb6544849219945a459ecbf465ad0e2919c1eb3b1d5851',
    action: Details({ label: 'How was this ID generated?', type: 'primary', children: 'We don\'t use any of your personal data, we identify you with a string of characters, that\'s all advertisers see.' })
  })}
` });
