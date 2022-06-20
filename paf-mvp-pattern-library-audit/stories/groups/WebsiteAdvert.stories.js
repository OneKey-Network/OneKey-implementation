import WebsiteAdvertComponent from '../components/WebsiteAdvert';

export default {
  title: 'Groups/Website Advert'
};

export const WebsiteAdvert = () => WebsiteAdvertComponent({});

export const SquareWebsiteAdvert = () => WebsiteAdvertComponent({ width: 400, height: 400 });

export const LeaderboardWebsiteAdvert = () => WebsiteAdvertComponent({ width: 728, height: 90 });
