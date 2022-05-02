import { addClientNodeEndpoints } from '@operator-client/client-node';
import express from 'express';

// This is just an example of the most basic client node configuration
addClientNodeEndpoints(
  express(),
  'crto.onekey.network', // the host name of the PAF operator
  'paf.example-website.com', // the host name of this PAF client
  `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0X8r0PYAm3mq206o
CdMHwZ948ONyVJToeFbLqBDKi7OhRANCAASXTbvyly6lrFR+Kocn0Ab2BUzIg76f
Ts8lo0jba/6zuFHUeRvvUN7o63lngkuhntqPXFiEVxAmxiQWVfFwFZ9F
-----END PRIVATE KEY-----`,
  [
    // Allow calls from any page of my domain, under https, and the backup site
    /^https:\/\/.*\.example-website\.com(\/?$|\/.*$)/,
    /^https:\/\/.*\.example-website-backup-site\.com(\/?$|\/.*$)/,
  ]
);
