// /!\ for some reason this doesn't work in a beforeAll
// in express-apps.ts, all unsecure requests are redirected to HTTPS, making all tests end up with a 302 status.
// To prevent that, we consider that all requests are secure
jest.mock('@core/express/express-apps', () => {
  const module = jest.requireActual('@core/express/express-apps');
  module.VHostApp.prototype.ensureHttps = () => {
    // No redirect to HTTPS
  };
  return module;
});
