import BrowsingID, { BrowsingIDWrapper } from './BrowsingID';

export default {
  title: 'Components/BrowsingID'
};

export const Default = BrowsingID.bind({});
Default.args = {
  id: 'NNNAZD567',
  loading: false
};

export const Loading = BrowsingID.bind({});
Loading.args = {
  id: 'NNNAZD567',
  loading: true
};

export const WithWrapper = () => BrowsingIDWrapper({ children: BrowsingID({ id: 'NNNAZD567' }) });

export const WithWrapperLoading = () => BrowsingIDWrapper({ children: BrowsingID({ id: 'NNNAZD567', loading: true }) });